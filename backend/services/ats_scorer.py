import re
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
import numpy as np

from backend.schemas.assessment import (
    AssessmentResult,
    CategoryScore,
    BulletRewrite,
    IssueDetail,
    SkillValidationDetails,
    JDComparisonDetails
)
from backend.services.skill_extractor import skill_extractor
from backend.services.embedding_service import embedding_service
from backend.utils.matching import fuzzy_match_keywords, normalize_skill
from backend.utils.file_utils import (
    get_default_grammar_results,
    get_default_location_results,
    get_default_skill_validation_results
)
from backend.core.logging import logger

ZIP_CODE_PATTERN = r'\b\d{5}(?:-\d{4})?\b'

STREET_ADDRESS_PATTERN = (
    r'\b\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+'
    r'(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way|Place|Pl)\b'
)

ACTION_VERBS = [
    'architected', 'developed', 'engineered', 'implemented', 'designed', 'built',
    'optimized', 'spearheaded', 'orchestrated', 'automated', 'streamlined', 'reduced',
    'increased', 'deployed', 'scaled', 'refactored', 'managed', 'led', 'analyzed',
    'created', 'executed', 'resolved', 'delivered', 'integrated', 'collaborated'
]

WEAK_VERBS = [
    'worked on', 'helped with', 'assisted in', 'was responsible for', 'handled',
    'participated in', 'did', 'tried to', 'attempted'
]

ROLE_SKILL_BENCHMARKS = {
    "software engineer": ["Python", "JavaScript", "TypeScript", "Git", "SQL", "Docker", "REST API", "Unit Testing"],
    "frontend developer": ["JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "Git", "REST API"],
    "backend developer": ["Python", "Node.js", "PostgreSQL", "Docker", "REST API", "Git", "Redis", "SQL"],
    "full stack developer": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "Git", "Docker", "REST API"],
    "data scientist": ["Python", "SQL", "Machine Learning", "Natural Language Processing", "PyTorch", "Git"],
    "ai engineer": ["Python", "PyTorch", "Machine Learning", "Retrieval-Augmented Generation", "FastAPI", "Docker", "Git"]
}

def _tier_score(n: float, tiers: list) -> float:
    for threshold, pts in tiers:
        if n >= threshold:
            return pts
    return 0.0

# Location & Privacy detection
def detect_location_info(text: str, nlp = None) -> Dict[str, Any]:
    locations = []

    # Method 1: Spacy NER if available
    if nlp is not None:
        try:
            doc = nlp(text)
            for ent in doc.ents:
                if ent.label_ in ['GPE', 'LOC']:
                    locations.append({'text': ent.text, 'type': ent.label_.lower(), 'start': ent.start_char})
        except Exception as e:
            logger.debug(f"Spacy location extraction skipped: {e}")

    # Method 2: Street address regex
    for match in re.finditer(STREET_ADDRESS_PATTERN, text, re.IGNORECASE):
        locations.append({'text': match.group(), 'type': 'address', 'start': match.start()})

    # Method 3: ZIP/Postal code regex
    for match in re.finditer(ZIP_CODE_PATTERN, text):
        locations.append({'text': match.group(), 'type': 'zip', 'start': match.start()})

    has_address = any(loc['type'] == 'address' for loc in locations)
    has_zip = any(loc['type'] == 'zip' for loc in locations)

    if has_address and has_zip:
        privacy_risk, penalty = 'high', 5.0
    elif has_address or has_zip:
        privacy_risk, penalty = 'high', 4.0
    elif len(locations) > 3:
        privacy_risk, penalty = 'medium', 3.0
    elif locations:
        privacy_risk, penalty = 'low', 2.0
    else:
        privacy_risk, penalty = 'none', 0.0

    recommendations = []
    if not locations:
        recommendations.append("No privacy concerns detected.")
    if has_address:
        recommendations.append("Remove full street addresses — ATS systems don't need this and it's a privacy risk.")
    if has_zip:
        recommendations.append("Remove zip codes — this level of location detail is unnecessary.")
    if privacy_risk in ('low', 'medium') and not has_address and not has_zip:
        recommendations.append("Consider reducing location mentions. 'City, State' in the contact header is sufficient.")

    return {
        'location_found': len(locations) > 0,
        'detected_locations': locations,
        'privacy_risk': privacy_risk,
        'recommendations': recommendations,
        'penalty_applied': penalty,
    }

def _calculate_semantic_similarity(skill: str, text: str, embedder = None) -> float:
    if not skill or not text:
        return 0.0
    try:
        if embedder and hasattr(embedder, 'encode'):
            skill_vec = embedder.encode(skill, convert_to_tensor=False)
            text_vec = embedder.encode(text, convert_to_tensor=False)
            norm_s = np.linalg.norm(skill_vec)
            norm_t = np.linalg.norm(text_vec)
            if norm_s > 0 and norm_t > 0:
                similarity = np.dot(skill_vec, text_vec) / (norm_s * norm_t)
                return float(max(0.0, min(1.0, similarity)))
        else:
            s_vec = embedding_service.encode(skill)[0]
            t_vec = embedding_service.encode(text[:1500])[0]
            sim = embedding_service.cosine_similarity(s_vec, t_vec)
            return float(max(0.0, min(1.0, sim)))
    except Exception as e:
        logger.debug(f"Similarity calculation fallback for '{skill}': {e}")
        return 0.0

def _skill_matches(skill: str, text: str, embedder = None, threshold: float = 0.6) -> Tuple[bool, float]:
    # Fast O(N) substring match (case-insensitive)
    if skill.lower() in text.lower():
        return True, 1.0

    # Semantic similarity check using embeddings
    sim = _calculate_semantic_similarity(skill, text, embedder)
    return sim >= threshold, sim

# Skill validation against projects and experience
def validate_skills_with_projects(
    skills: List[str],
    projects: List[Dict[str, Any]],
    experience_entries: List[Dict[str, Any]],
    embedder = None,
    threshold: float = 0.6,
) -> Dict[str, Any]:
    if not skills:
        return {
            'validated_skills': [],
            'unvalidated_skills': [],
            'validation_percentage': 0.0,
            'skill_project_mapping': {},
            'validation_score': 0.0,
        }

    experience_text = ' '.join(
        f"{e.get('job_title', '')} {e.get('company', '')} {e.get('description', '')}"
        for e in experience_entries
        if isinstance(e, dict)
    ).strip()

    validated_skills = []
    unvalidated_skills = []
    skill_project_mapping = {}

    for skill in skills:
        matching_projects = []
        max_similarity = 0.0

        for project in projects:
            project_text = f"{project.get('title', '')} {project.get('description', '')}"
            matched, sim = _skill_matches(skill, project_text, embedder, threshold)
            max_similarity = max(max_similarity, sim)

            if matched:
                matching_projects.append(project.get('title', 'Untitled Project'))

        if experience_text:
            matched, sim = _skill_matches(skill, experience_text, embedder, threshold)
            max_similarity = max(max_similarity, sim)
            if matched and 'Experience Section' not in matching_projects:
                matching_projects.append('Experience Section')

        if matching_projects:
            validated_skills.append({
                'skill': skill,
                'projects': matching_projects,
                'similarity': round(float(max_similarity), 3)
            })
            skill_project_mapping[skill] = matching_projects
        else:
            unvalidated_skills.append(skill)
            skill_project_mapping[skill] = []

    validation_percentage = len(validated_skills) / len(skills) if skills else 0.0
    validation_score = validation_percentage * 15.0

    return {
        'validated_skills': validated_skills,
        'unvalidated_skills': unvalidated_skills,
        'validation_percentage': round(validation_percentage, 3),
        'skill_project_mapping': skill_project_mapping,
        'validation_score': round(validation_score, 1),
    }

# 1. Formatting Score (Max 20.0)
def _calc_formatting_score(parsed_resume: Dict[str, Any], text: str) -> Tuple[float, List[Dict[str, Any]]]:
    score = 0.0
    criteria = []

    exp_entries = [e for e in parsed_resume.get('experience', []) if isinstance(e, dict)]
    edu_entries = [e for e in parsed_resume.get('education', []) if isinstance(e, dict)]
    skills = parsed_resume.get('skills', [])
    summary = parsed_resume.get('professional_summary', '')
    proj_entries = [p for p in parsed_resume.get('projects', []) if isinstance(p, dict)]

    exp_pts = 3.0 if (exp_entries and any(e.get('job_title') or e.get('description') for e in exp_entries)) else 0.0
    edu_pts = 2.0 if edu_entries else 0.0
    skills_pts = 2.0 if len(skills) >= 3 else 0.0
    summary_pts = 1.5 if len(summary.strip()) > 30 else 0.0
    proj_pts = 1.5 if proj_entries else 0.0

    section_earned = exp_pts + edu_pts + skills_pts + summary_pts + proj_pts
    score += section_earned
    criteria.append({
        "criterion": "Essential Structural Sections",
        "earned": round(section_earned, 1),
        "max": 10.0,
        "details": f"Detected: Experience ({exp_pts} pts), Education ({edu_pts} pts), Skills ({skills_pts} pts), Summary ({summary_pts} pts), Projects ({proj_pts} pts)."
    })

    # Bullet point distribution
    bullet_count = sum(
        1 for line in text.split('\n')
        if re.match(r'^\s*[•\-\*\◦]', line) or re.match(r'^\s*\d+\.', line)
    )
    bullet_pts = _tier_score(bullet_count, [(15, 5.0), (10, 4.0), (5, 3.0), (3, 2.0), (1, 1.0)])
    score += bullet_pts
    criteria.append({
        "criterion": "Bullet Point Structure",
        "earned": bullet_pts,
        "max": 5.0,
        "details": f"Identified {bullet_count} structured bullet points for optimal readability and ATS parsing."
    })

    # Filled section completeness
    filled = sum(1 for has_it in [
        bool(exp_entries), bool(edu_entries), bool(skills),
        bool(summary.strip()), bool(proj_entries),
    ] if has_it)
    filled_pts = _tier_score(filled, [(4, 5.0), (3, 4.0), (2, 3.0), (1, 2.0)])
    score += filled_pts
    criteria.append({
        "criterion": "Content Completeness",
        "earned": filled_pts,
        "max": 5.0,
        "details": f"{filled}/5 standard resume sections contain rich descriptive content."
    })

    final_score = min(20.0, max(0.0, score))
    return final_score, criteria

# 2. Keywords Score (Max 25.0)
def _calc_keywords_score(
    resume_keywords: List[str],
    skills: List[str],
    jd_keywords: Optional[List[str]] = None,
) -> Tuple[float, List[Dict[str, Any]]]:
    score = 0.0
    criteria = []

    kw_pts = _tier_score(len(resume_keywords), [(20, 10.0), (15, 8.0), (10, 6.0), (5, 4.0), (3, 2.0)])
    score += kw_pts
    criteria.append({
        "criterion": "Keyword Breadth",
        "earned": kw_pts,
        "max": 10.0,
        "details": f"Identified {len(resume_keywords)} domain-specific technical keywords."
    })

    skills_pts = _tier_score(len(skills), [(15, 10.0), (10, 8.0), (7, 6.0), (5, 4.0), (3, 2.0)])
    score += skills_pts
    criteria.append({
        "criterion": "Skills Density",
        "earned": skills_pts,
        "max": 10.0,
        "details": f"Detected {len(skills)} discrete technical and soft skills."
    })

    if jd_keywords:
        all_resume_terms = list(set(resume_keywords + skills))
        fuzzy_result = fuzzy_match_keywords(all_resume_terms, jd_keywords, threshold=80)
        match_pct = len(fuzzy_result['matched']) / len(jd_keywords) if jd_keywords else 0.0
        jd_pts = _tier_score(match_pct, [(0.7, 5.0), (0.5, 4.0), (0.3, 3.0), (0.2, 2.0), (0.1, 1.0)])
        score += jd_pts
        criteria.append({
            "criterion": "Job Description Keyword Match",
            "earned": jd_pts,
            "max": 5.0,
            "details": f"Fuzzy matched {len(fuzzy_result['matched'])}/{len(jd_keywords)} JD keywords ({round(match_pct * 100, 1)}% match)."
        })
    elif len(resume_keywords) >= 10:
        score += 3.0
        criteria.append({
            "criterion": "Standalone Keyword Strength",
            "earned": 3.0,
            "max": 5.0,
            "details": "Strong baseline keyword coverage for general ATS screening."
        })
    else:
        criteria.append({
            "criterion": "Standalone Keyword Strength",
            "earned": 1.0,
            "max": 5.0,
            "details": "Moderate baseline keyword coverage."
        })

    final_score = min(25.0, max(0.0, score))
    return final_score, criteria

# 3. Content Quality Score (Max 25.0)
def _calc_content_score(
    text: str,
    action_verbs: List[str],
    grammar_results: Dict[str, Any],
) -> Tuple[float, List[Dict[str, Any]]]:
    score = 0.0
    criteria = []

    verbs_pts = _tier_score(len(action_verbs), [(15, 10.0), (10, 8.0), (7, 6.0), (5, 4.0), (3, 2.0)])
    score += verbs_pts
    criteria.append({
        "criterion": "Strong Action Verbs",
        "earned": verbs_pts,
        "max": 10.0,
        "details": f"Identified {len(action_verbs)} impactful action verbs at bullet point openings."
    })

    number_patterns = [
        r'\d+%',
        r'\$\d+',
        r'\d+[kKmMbB]',
        r'\d+\s*(?:users|customers|clients|projects|hours|days|months|years|requests)',
        r'(?:increased|decreased|improved|reduced|grew|saved)\s+(?:by\s+)?\d+',
    ]
    achievement_count = sum(len(re.findall(p, text, re.IGNORECASE)) for p in number_patterns)
    achieve_pts = _tier_score(achievement_count, [(10, 5.0), (7, 4.0), (5, 3.0), (3, 2.0), (1, 1.0)])
    score += achieve_pts
    criteria.append({
        "criterion": "Quantified Achievements",
        "earned": achieve_pts,
        "max": 5.0,
        "details": f"Found {achievement_count} quantifiable outcome metrics (percentages, financials, scale counts)."
    })

    grammar_penalty = grammar_results.get('penalty_applied', 0.0)
    grammar_score = max(0.0, 10.0 - grammar_penalty / 2.0)
    score += grammar_score
    criteria.append({
        "criterion": "Grammar & Communication Quality",
        "earned": round(grammar_score, 1),
        "max": 10.0,
        "details": f"Grammar check applied penalty: {grammar_penalty} pts."
    })

    final_score = min(25.0, max(0.0, score))
    return final_score, criteria

# 4. Skill Validation Score (Max 15.0)
def _calc_skill_validation_score(validation_results: Dict[str, Any]) -> Tuple[float, List[Dict[str, Any]]]:
    score = min(15.0, max(0.0, validation_results.get('validation_score', 0.0)))
    val_pct = validation_results.get('validation_percentage', 0.0) * 100
    criteria = [{
        "criterion": "Evidence-Backed Skill Proficiency",
        "earned": round(score, 1),
        "max": 15.0,
        "details": f"{val_pct:.0f}% of listed skills ({len(validation_results.get('validated_skills', []))} skills) validated in projects or experience."
    }]
    return score, criteria

# 5. ATS Compatibility Score (Max 15.0)
def _calc_ats_compatibility_score(
    text: str,
    location_results: Dict[str, Any],
    parsed_resume: Dict[str, Any],
) -> Tuple[float, List[Dict[str, Any]]]:
    score = 15.0
    criteria = []

    # Deduction 1: Location privacy penalty
    loc_penalty = location_results.get('penalty_applied', 0.0)
    score -= loc_penalty
    criteria.append({
        "criterion": "Location Privacy & Compliance",
        "earned": round(5.0 - min(5.0, loc_penalty), 1),
        "max": 5.0,
        "details": f"Privacy risk: {location_results.get('privacy_risk', 'none')}. Penalty applied: {loc_penalty} pts."
    })

    # Deduction 2: Non-standard box-drawing or special characters
    special_chars = len(re.findall(r'[│┤├┼┴┬╔╗╚╝═║╠╣╦╩╬]', text))
    spec_penalty = 0.0
    if special_chars > 20:
        spec_penalty = 2.0
    elif special_chars > 10:
        spec_penalty = 1.0
    score -= spec_penalty
    criteria.append({
        "criterion": "Standard Text Encoding",
        "earned": 5.0 - spec_penalty,
        "max": 5.0,
        "details": f"Special characters count: {special_chars}. Penalty: {spec_penalty} pts."
    })

    # Deduction 3: Short sections
    exp_entries = [e for e in parsed_resume.get('experience', []) if isinstance(e, dict)]
    edu_entries = [e for e in parsed_resume.get('education', []) if isinstance(e, dict)]
    skills_count = len(parsed_resume.get('skills', []))

    exp_desc_len = sum(len(e.get('description', '')) for e in exp_entries)
    edu_desc_len = sum(len((e.get('degree') or '') + (e.get('institution') or '')) for e in edu_entries)

    short_sections = sum([
        bool(exp_entries) and exp_desc_len < 20,
        bool(edu_entries) and edu_desc_len < 20,
        bool(parsed_resume.get('skills')) and skills_count < 2,
    ])
    short_penalty = 2.0 if short_sections >= 2 else (1.0 if short_sections >= 1 else 0.0)
    score -= short_penalty

    # Completeness bonus
    if exp_entries and skills_count > 5:
        score += 1.0

    final_score = min(15.0, max(0.0, score))
    criteria.append({
        "criterion": "Section Content Depth & Format Cleanliness",
        "earned": round(max(0.0, final_score - (5.0 - min(5.0, loc_penalty)) - (5.0 - spec_penalty)), 1),
        "max": 5.0,
        "details": f"Evaluated section lengths and depth. Penalties: {short_penalty} pts."
    })

    return final_score, criteria

# Score aggregation and final interpretation
def calculate_overall_score(
    text: str,
    parsed_resume: Dict[str, Any],
    skills: List[str],
    keywords: List[str],
    action_verbs: List[str],
    skill_validation_results: Dict[str, Any],
    grammar_results: Dict[str, Any],
    location_results: Dict[str, Any],
    jd_keywords: Optional[List[str]] = None,
    experience_months: int = 0,
) -> Dict[str, Any]:
    formatting_score, formatting_crit = _calc_formatting_score(parsed_resume, text)
    keywords_score, keywords_crit = _calc_keywords_score(keywords, skills, jd_keywords)
    content_score, content_crit = _calc_content_score(text, action_verbs, grammar_results)
    skill_validation_score, skill_val_crit = _calc_skill_validation_score(skill_validation_results)
    ats_compatibility_score, ats_compat_crit = _calc_ats_compatibility_score(text, location_results, parsed_resume)

    COMPONENT_MAX = {
        'formatting': 20.0,
        'keywords': 25.0,
        'content': 25.0,
        'skill_validation': 15.0,
        'ats_compatibility': 15.0,
    }

    formatting_pct = (formatting_score / COMPONENT_MAX['formatting']) * 100.0
    keywords_pct = (keywords_score / COMPONENT_MAX['keywords']) * 100.0
    content_pct = (content_score / COMPONENT_MAX['content']) * 100.0
    skill_validation_pct = (skill_validation_score / COMPONENT_MAX['skill_validation']) * 100.0
    ats_compatibility_pct = (ats_compatibility_score / COMPONENT_MAX['ats_compatibility']) * 100.0

    skills_keywords_pct = (keywords_pct * 0.6) + (skill_validation_pct * 0.4)

    base_score = (
        skills_keywords_pct * 0.40 +
        content_pct * 0.30 +
        formatting_pct * 0.15 +
        ats_compatibility_pct * 0.15
    )

    penalties: Dict[str, float] = {}
    bonuses: Dict[str, float] = {}
    score = base_score

    if grammar_results.get('penalty_applied', 0.0) > 0:
        penalties['grammar'] = grammar_results['penalty_applied']

    if location_results.get('penalty_applied', 0.0) > 0:
        penalties['location_privacy'] = location_results['penalty_applied']

    validation_pct = skill_validation_results.get('validation_percentage', 0.0)
    if validation_pct >= 0.9:
        bonuses['excellent_skill_validation'] = 2.0
        score += 2.0
    elif validation_pct >= 0.8:
        bonuses['good_skill_validation'] = 1.0
        score += 1.0

    if grammar_results.get('total_errors', 0) == 0:
        bonuses['perfect_grammar'] = 1.0
        score += 1.0

    if jd_keywords and len(jd_keywords) > 0:
        all_resume_terms = list(set((keywords or []) + (skills or [])))
        fuzzy_result = fuzzy_match_keywords(all_resume_terms, jd_keywords, threshold=80)
        missing_pct = len(fuzzy_result['missing']) / len(jd_keywords)

        if missing_pct > 0.7:
            penalties['missing_jd_keywords'] = 15.0
            score -= 15.0
        elif missing_pct > 0.5:
            penalties['missing_jd_keywords'] = 10.0
            score -= 10.0
        elif missing_pct > 0.3:
            penalties['missing_jd_keywords'] = 5.0
            score -= 5.0

    overall_score = min(100.0, max(0.0, score))
    interpretation = _generate_score_interpretation(overall_score)

    return {
        'overall_score': round(overall_score, 1),
        'formatting_score': round(formatting_score, 1),
        'keywords_score': round(keywords_score, 1),
        'content_score': round(content_score, 1),
        'skill_validation_score': round(skill_validation_score, 1),
        'ats_compatibility_score': round(ats_compatibility_score, 1),
        'overall_interpretation': interpretation,
        'penalties': penalties,
        'bonuses': bonuses,
        'criteria': {
            'formatting': formatting_crit,
            'keywords': keywords_crit,
            'content': content_crit,
            'skill_validation': skill_val_crit,
            'ats_compatibility': ats_compat_crit,
        }
    }

def generate_strengths(
    score_results: Dict[str, Any],
    skill_validation_results: Dict[str, Any],
    grammar_results: Dict[str, Any],
) -> List[str]:
    strengths = []
    if score_results['formatting_score'] >= 16:
        strengths.append('Well-structured with clear sections and consistent bullet points')
    if score_results['keywords_score'] >= 20:
        strengths.append('Strong keyword optimization and technical skill presence')
    if score_results['content_score'] >= 20:
        strengths.append('Excellent use of action verbs and quantifiable achievements')
    if score_results['skill_validation_score'] >= 12:
        pct = skill_validation_results.get('validation_percentage', 0) * 100
        strengths.append(f'{pct:.0f}% of listed skills are demonstrated by practical project or experience evidence')
    if score_results['ats_compatibility_score'] >= 13:
        strengths.append('Excellent ATS compatibility with clean single-column formatting')
    if grammar_results.get('total_errors', 0) == 0:
        strengths.append('Clean, error-free grammar and spelling')

    if not strengths:
        strengths.append('Your resume has strong potential — focus on the recommendations below')
    return strengths

def generate_critical_issues(
    score_results: Dict[str, Any],
    grammar_results: Dict[str, Any],
    location_results: Dict[str, Any],
) -> List[str]:
    issues = []
    critical_errors = len(grammar_results.get('critical_errors', []))
    if critical_errors > 0:
        issues.append(f'{critical_errors} critical grammar or spelling error(s) detected')
    if location_results.get('privacy_risk') == 'high':
        issues.append('High privacy risk: Remove street address and detailed zip codes')
    if score_results['formatting_score'] < 10:
        issues.append('Poor formatting: Add standard section headers and bullet points')
    if score_results['keywords_score'] < 12:
        issues.append('Insufficient keywords and technical skills aligned with the role')
    if score_results['skill_validation_score'] < 7:
        issues.append('Most skills lack supporting project or employment evidence')

    return issues

def generate_improvements(
    score_results: Dict[str, Any],
    skill_validation_results: Dict[str, Any],
) -> List[str]:
    improvements = []
    if 12 <= score_results['formatting_score'] < 16:
        improvements.append('Add more bullet points and improve section organization')
    if 14 <= score_results['keywords_score'] < 20:
        improvements.append('Include more relevant keywords and technical tools')
    if 14 <= score_results['content_score'] < 20:
        improvements.append('Add more quantifiable achievements and active action verbs')
    if 7 <= score_results['skill_validation_score'] < 12:
        unvalidated_count = len(skill_validation_results.get('unvalidated_skills', []))
        improvements.append(f'Validate {unvalidated_count} skill(s) by adding relevant project details')
    if 9 <= score_results['ats_compatibility_score'] < 13:
        improvements.append('Simplify formatting for better automated ATS compatibility')

    return improvements

def _generate_score_interpretation(overall_score: float) -> str:
    if overall_score >= 90:
        return 'Excellent! Your resume is highly optimized for ATS systems.'
    elif overall_score >= 80:
        return 'Great! Your resume should perform well with most ATS systems.'
    elif overall_score >= 70:
        return 'Good! Your resume is ATS-friendly with room for minor improvements.'
    elif overall_score >= 60:
        return 'Fair. Your resume needs some improvements to be fully ATS-compatible.'
    elif overall_score >= 50:
        return 'Below Average. Significant improvements needed for ATS compatibility.'
    else:
        return 'Poor. Your resume requires major revisions to pass ATS screening.'

# Main Unified ATS Readiness Scorer
def calculate_ats_readiness_score(
    resume_text: str,
    parsed_data: Optional[Dict[str, Any]] = None,
    target_role: str = "Software Engineer",
    job_description: Optional[str] = None
) -> AssessmentResult:
    """
    Computes comprehensive 100-point ATS readiness score using Shradha Khapra repository logic:
    - 5 Component Scoring: Formatting (20), Keywords (25), Content (25), Skill Validation (15), ATS Compatibility (15)
    - Evidence cross-validation between skills and projects/experience
    - Privacy & location exposure check
    - Fuzzy keyword match against Job Description
    - 10-issue deep diagnostics (feedback_engine.analyze_issues)
    - Google X-Y-Z bullet rewrites
    """
    # 1. Normalize parsed resume data
    if parsed_data is None:
        parsed_data = {}

    extracted_skills_info = skill_extractor.extract_skills_from_text(resume_text)
    skills = parsed_data.get('skills') or extracted_skills_info["skills"]

    # Projects
    projects = parsed_data.get('projects') or []
    if not projects:
        # Detect simple project blocks if not structured
        p_matches = re.findall(r'(?:Project|PROJECT)[\s\:\-]+([^\n]+)\n([^\n]+)', resume_text)
        for title, desc in p_matches:
            projects.append({'title': title.strip(), 'description': desc.strip(), 'technologies': []})

    # Experience entries
    experience = parsed_data.get('experience') or []
    if not experience and 'experience' in parsed_data.get('detected_sections', []):
        exp_text = resume_text
        experience = [{'job_title': target_role, 'company': 'Employer', 'description': exp_text}]

    # Education entries
    education = parsed_data.get('education') or []

    # Summary
    summary = parsed_data.get('professional_summary') or parsed_data.get('summary') or ''
    if not summary:
        # Look for summary section text
        sum_match = re.search(r'(?:SUMMARY|PROFILE|ABOUT ME)\s*\n([^\n]+(?:\n[^\n]+){1,3})', resume_text, re.IGNORECASE)
        if sum_match:
            summary = sum_match.group(1).strip()

    # Action verbs
    text_lower = resume_text.lower()
    action_verbs = [v for v in ACTION_VERBS if re.search(rf'\b{v}\b', text_lower)]

    # Keywords (noun phrases and benchmark terms)
    benchmark_skills = ROLE_SKILL_BENCHMARKS.get(target_role.lower(), ROLE_SKILL_BENCHMARKS["software engineer"])
    keywords = list(set(skills + [b for b in benchmark_skills if b.lower() in text_lower]))

    # Contact info
    contact_dict = parsed_data.get('contact') or {}
    if not contact_dict:
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', resume_text)
        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', resume_text)
        contact_dict = {
            'email': email_match.group(0) if email_match else None,
            'phone': phone_match.group(0) if phone_match else None,
            'linkedin': 'linkedin' in text_lower,
            'github': 'github' in text_lower
        }

    # Location & privacy results
    location_results = detect_location_info(resume_text)
    grammar_results = get_default_grammar_results()

    # Skill validation with projects
    skill_validation = validate_skills_with_projects(
        skills=skills,
        projects=projects,
        experience_entries=experience,
        embedder=None
    )

    # Job description keywords & comparison if provided
    jd_keywords = None
    jd_comparison_obj = None
    if job_description and job_description.strip():
        jd_extracted = skill_extractor.extract_skills_from_text(job_description)
        jd_keywords = list(set(jd_extracted["skills"]))
        from backend.services.jd_matcher import compare_resume_with_jd
        jd_raw = compare_resume_with_jd(
            resume_text=resume_text,
            resume_keywords=keywords,
            resume_skills=skills,
            jd_text=job_description.strip(),
            jd_keywords=jd_keywords,
        )
        jd_comparison_obj = JDComparisonDetails(
            match_percentage=round(float(jd_raw.get('match_percentage', 0.0)), 1),
            semantic_similarity=round(float(jd_raw.get('semantic_similarity', 0.0)), 3),
            matched_keywords=jd_raw.get('matched_keywords', [])[:20],
            missing_keywords=jd_raw.get('missing_keywords', [])[:15],
            skills_gap=jd_raw.get('skills_gap', [])[:10],
        )

    # Calculate scores
    scores = calculate_overall_score(
        text=resume_text,
        parsed_resume={
            'experience': experience,
            'education': education,
            'skills': skills,
            'professional_summary': summary,
            'projects': projects
        },
        skills=skills,
        keywords=keywords,
        action_verbs=action_verbs,
        skill_validation_results=skill_validation,
        grammar_results=grammar_results,
        location_results=location_results,
        jd_keywords=jd_keywords
    )

    # Detailed issues analysis from feedback_engine
    from backend.services.feedback_engine import analyze_issues, generate_issues_summary
    detailed_feedback = analyze_issues(
        resume_text=resume_text,
        parsed_resume={
            'experience': experience,
            'education': education,
            'skills': skills,
            'professional_summary': summary,
            'projects': projects
        },
        skills=skills,
        projects=projects,
        action_verbs=action_verbs,
        skill_validation=skill_validation,
        scores=scores,
        contact_info=contact_dict
    )
    issues_summary = generate_issues_summary(detailed_feedback)

    # Build CategoryScore models
    def build_cat_score(name: str, score: float, max_score: float, feedback_msg: str, crit: List[Dict[str, Any]]) -> CategoryScore:
        pct = round((score / max_score) * 100, 1)
        status = "Excellent" if pct >= 80 else "Good" if pct >= 60 else "Needs Improvement"
        return CategoryScore(
            name=name,
            score=round(score, 1),
            max_score=max_score,
            percentage=pct,
            status=status,
            feedback=feedback_msg,
            criteria_evaluated=crit
        )

    cat_formatting = build_cat_score(
        "Formatting and Structure",
        scores['formatting_score'],
        20.0,
        f"Formatting scored {scores['formatting_score']}/20. Standard headers, clean layout, and bulleted organization enhance ATS extraction.",
        scores['criteria']['formatting']
    )

    cat_keywords = build_cat_score(
        "Keyword Relevance",
        scores['keywords_score'],
        25.0,
        f"Keywords scored {scores['keywords_score']}/25. Keyword frequency and role-aligned skills directly govern ATS resume filtering.",
        scores['criteria']['keywords']
    )

    cat_content = build_cat_score(
        "Content Quality and Impact",
        scores['content_score'],
        25.0,
        f"Content scored {scores['content_score']}/25. Strong action verbs and measurable metrics demonstrate proven achievement.",
        scores['criteria']['content']
    )

    cat_skill_val = build_cat_score(
        "Skill Depth & Validation",
        scores['skill_validation_score'],
        15.0,
        f"Skill validation scored {scores['skill_validation_score']}/15. Cross-referencing listed skills with projects provides verification.",
        scores['criteria']['skill_validation']
    )

    cat_compat = build_cat_score(
        "ATS File Compatibility",
        scores['ats_compatibility_score'],
        15.0,
        f"Compatibility scored {scores['ats_compatibility_score']}/15. Parsable contact details, standard characters, and privacy compliance.",
        scores['criteria']['ats_compatibility']
    )

    # Strengths and critical issues
    strengths = generate_strengths(scores, skill_validation, grammar_results)
    critical_issues = generate_critical_issues(scores, grammar_results, location_results)

    # If critical issues is empty, add any high-severity issues from detailed feedback
    if not critical_issues:
        for fb in detailed_feedback:
            if fb.severity_level == "High":
                critical_issues.append(fb.issue_title)

    # Missing keywords
    missing_keywords = []
    if jd_comparison_obj and jd_comparison_obj.missing_keywords:
        missing_keywords = jd_comparison_obj.missing_keywords
    else:
        for b_skill in benchmark_skills:
            if b_skill not in skills:
                missing_keywords.append(b_skill)

    # Matched keywords
    matched_keywords = jd_comparison_obj.matched_keywords if jd_comparison_obj else [s for s in skills if s in benchmark_skills]

    # Google X-Y-Z bullet rewrites
    rewrites: List[BulletRewrite] = []
    bullet_lines = [l.strip().lstrip('•-* ') for l in resume_text.split('\n') if len(l.strip()) > 30]
    for bullet in bullet_lines[:3]:
        rewrites.append(BulletRewrite(
            original=bullet,
            improved=f"Architected and deployed {bullet.lower().rstrip('.')}, achieving a 25% efficiency improvement through optimized architectural workflows.",
            reason="Structured with Google's X-Y-Z formula: strong action verb, specific technical deliverable, and quantified impact metric.",
            requires_confirmation=True
        ))

    # Recommendations
    recommendations = generate_improvements(scores, skill_validation)
    if not recommendations:
        recommendations.append("Continue maintaining quantitative project metrics and aligned keyword depth.")

    # Privacy flags
    privacy_flags = location_results.get('recommendations', [])

    # Skill validation details
    skill_val_details = SkillValidationDetails(
        validated=skill_validation.get('validated_skills', []),
        unvalidated=skill_validation.get('unvalidated_skills', []),
        total=len(skills),
        validated_count=len(skill_validation.get('validated_skills', [])),
        validation_pct=skill_validation.get('validation_percentage', 0.0) * 100
    )

    overall_score = scores['overall_score']
    if overall_score >= 80:
        readiness_level = "Strong Readiness"
    elif overall_score >= 60:
        readiness_level = "Improvement Recommended"
    else:
        readiness_level = "Significant Improvements Needed"

    word_count = len(resume_text.split())

    return AssessmentResult(
        overall_score=overall_score,
        readiness_level=readiness_level,
        category_scores={
            "formatting": cat_formatting,
            "keywords": cat_keywords,
            "content_quality": cat_content,
            "skill_depth": cat_skill_val,
            "compatibility": cat_compat
        },
        strengths=strengths,
        critical_issues=critical_issues,
        missing_keywords=missing_keywords,
        matched_keywords=matched_keywords,
        bullet_point_rewrites=rewrites,
        recommendations=recommendations,
        privacy_flags=privacy_flags,
        detailed_feedback=detailed_feedback,
        issues_summary=issues_summary,
        skill_validation_details=skill_val_details,
        jd_comparison=jd_comparison_obj,
        interpretation=scores['overall_interpretation'],
        penalties=scores['penalties'],
        bonuses=scores['bonuses'],
        word_count_analysis={
            "total_words": word_count,
            "status": "optimal" if 400 <= word_count <= 900 else "brief" if word_count < 400 else "lengthy"
        },
        scoring_version="2.0.0",
        timestamp=datetime.now(timezone.utc).isoformat()
    )
