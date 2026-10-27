import re
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from backend.schemas.assessment import AssessmentResult, CategoryScore, BulletRewrite
from backend.services.skill_extractor import skill_extractor
from backend.core.logging import logger

ACTION_VERBS = {
    'architected', 'developed', 'engineered', 'implemented', 'designed', 'built',
    'optimized', 'spearheaded', 'orchestrated', 'automated', 'streamlined', 'reduced',
    'increased', 'deployed', 'scaled', 'refactored', 'managed', 'led', 'analyzed',
    'created', 'executed', 'resolved', 'delivered', 'integrated', 'collaborated'
}

WEAK_VERBS = {
    'worked on', 'helped with', 'assisted in', 'was responsible for', 'handled',
    'participated in', 'did', 'tried to', 'attempted'
}

ROLE_SKILL_BENCHMARKS = {
    "software engineer": ["Python", "JavaScript", "TypeScript", "Git", "SQL", "Docker", "REST API", "Unit Testing"],
    "frontend developer": ["JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "Git", "REST API"],
    "backend developer": ["Python", "Node.js", "PostgreSQL", "Docker", "REST API", "Git", "Redis", "SQL"],
    "full stack developer": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "Git", "Docker", "REST API"],
    "data scientist": ["Python", "SQL", "Machine Learning", "Natural Language Processing", "PyTorch", "Git"],
    "ai engineer": ["Python", "PyTorch", "Machine Learning", "Retrieval-Augmented Generation", "FastAPI", "Docker", "Git"]
}

def evaluate_formatting(text: str, parsed_data: Optional[Dict[str, Any]] = None) -> CategoryScore:
    max_score = 20
    score = 0
    criteria = []
    
    sections = parsed_data.get('detected_sections', []) if parsed_data else []
    word_count = len(text.split())

    # Section coverage (up to 8 points)
    essential_sections = ['skills', 'experience', 'education']
    found_essential = sum(1 for s in essential_sections if s in sections)
    sec_pts = int((found_essential / len(essential_sections)) * 8)
    score += sec_pts
    criteria.append({
        "criterion": "Essential Sections Coverage",
        "earned": sec_pts,
        "max": 8,
        "details": f"Detected {found_essential} of {len(essential_sections)} essential sections (Experience, Education, Skills)."
    })

    # Word count appropriateness (up to 6 points)
    wc_pts = 6
    if word_count < 200:
        wc_pts = 2
        wc_msg = f"Word count ({word_count}) is too brief. Elaborate on project deliverables and technical responsibilities."
    elif word_count < 350:
        wc_pts = 4
        wc_msg = f"Word count ({word_count}) is slightly brief but acceptable for entry-level candidates."
    elif 350 <= word_count <= 950:
        wc_pts = 6
        wc_msg = f"Optimal word count ({word_count} words). Fits standard 1-2 page industry guidelines."
    elif 950 < word_count <= 1300:
        wc_pts = 4
        wc_msg = f"Word count ({word_count}) is on the longer side. Keep bullet points succinct."
    else:
        wc_pts = 2
        wc_msg = f"Word count ({word_count}) is excessive. ATS parsers may truncate content."
    score += wc_pts
    criteria.append({
        "criterion": "Document Length & Density",
        "earned": wc_pts,
        "max": 6,
        "details": wc_msg
    })

    # Bullet organization & structure (up to 6 points)
    bullet_count = len(re.findall(r'(?:^|\n)\s*[•\-\*]\s+', text))
    if bullet_count >= 6:
        b_pts = 6
        b_msg = f"Strong use of bullet points ({bullet_count} bullets) for readability."
    elif bullet_count >= 2:
        b_pts = 4
        b_msg = "Moderate use of bullet points. Consider converting narrative blocks to distinct action bullets."
    else:
        b_pts = 2
        b_msg = "Few or no bullet points detected. ATS scanners heavily favor structured bullet points over paragraphs."
    score += b_pts
    criteria.append({
        "criterion": "Bullet Point Formatting",
        "earned": b_pts,
        "max": 6,
        "details": b_msg
    })

    pct = round((score / max_score) * 100, 1)
    status = "Excellent" if score >= 17 else "Good" if score >= 13 else "Needs Improvement"
    return CategoryScore(
        name="Formatting and Structure",
        score=score,
        max_score=max_score,
        percentage=pct,
        status=status,
        feedback=f"Formatting scored {score}/{max_score}. Well-structured sections with consistent bullet points improve ATS indexing.",
        criteria_evaluated=criteria
    )

def evaluate_keywords(text: str, target_role: str = "Software Engineer", job_description: Optional[str] = None) -> CategoryScore:
    max_score = 25
    score = 0
    criteria = []

    extracted = skill_extractor.extract_skills_from_text(text)
    found_skills = set(extracted["skills"])

    # Target role benchmark skills
    role_key = target_role.lower()
    benchmark = ROLE_SKILL_BENCHMARKS.get(role_key, ROLE_SKILL_BENCHMARKS["software engineer"])

    matched_benchmark = [s for s in benchmark if s in found_skills]
    coverage = len(matched_benchmark) / len(benchmark) if benchmark else 0
    bm_pts = min(15, int(coverage * 15) + (2 if len(found_skills) >= 8 else 0))
    score += bm_pts

    criteria.append({
        "criterion": "Role-Specific Keyword Alignment",
        "earned": bm_pts,
        "max": 15,
        "details": f"Found {len(matched_benchmark)}/{len(benchmark)} benchmark skills for {target_role}: {', '.join(matched_benchmark) if matched_benchmark else 'None'}."
    })

    # Job description specific matching if provided
    if job_description:
        jd_extracted = skill_extractor.extract_skills_from_text(job_description)
        jd_skills = set(jd_extracted["skills"])
        jd_overlap = found_skills.intersection(jd_skills)
        jd_cov = len(jd_overlap) / len(jd_skills) if jd_skills else 0.8
        jd_pts = int(jd_cov * 10)
        score += jd_pts
        criteria.append({
            "criterion": "Job Description Keyword Match",
            "earned": jd_pts,
            "max": 10,
            "details": f"Matched {len(jd_overlap)}/{len(jd_skills)} keywords from the target job posting."
        })
    else:
        # Technical vocabulary breadth
        breadth_pts = min(10, len(found_skills))
        score += breadth_pts
        criteria.append({
            "criterion": "Technical Vocabulary Breadth",
            "earned": breadth_pts,
            "max": 10,
            "details": f"Identified {len(found_skills)} distinct industry-recognized skills and technologies."
        })

    pct = round((score / max_score) * 100, 1)
    status = "Excellent" if score >= 21 else "Good" if score >= 16 else "Needs Improvement"
    return CategoryScore(
        name="Keyword Relevance",
        score=score,
        max_score=max_score,
        percentage=pct,
        status=status,
        feedback=f"Keywords scored {score}/{max_score}. Relevant technical terminology directly influences ATS resume filtering.",
        criteria_evaluated=criteria
    )

def evaluate_content_quality(text: str) -> CategoryScore:
    max_score = 20
    score = 0
    criteria = []

    text_lower = text.lower()
    
    # Action verbs check (up to 8 points)
    found_actions = [v for v in ACTION_VERBS if re.search(rf'\b{v}\b', text_lower)]
    action_pts = min(8, len(found_actions))
    score += action_pts
    criteria.append({
        "criterion": "Action-Oriented Language",
        "earned": action_pts,
        "max": 8,
        "details": f"Identified {len(found_actions)} strong action verbs (e.g., {', '.join(found_actions[:4]) if found_actions else 'none'})."
    })

    # Quantified metrics check (%, $, numbers, multipliers) (up to 6 points)
    quant_matches = re.findall(r'\b(?:\d+%(?:\s+increase|\s+reduction|\s+growth)?|\$\d+[\d,]*|\d+x|\b\d+\s+(?:users|requests|engineers|clients|projects|ms|seconds))\b', text_lower)
    quant_pts = min(6, len(quant_matches) * 2)
    score += quant_pts
    criteria.append({
        "criterion": "Quantified Impact & Results",
        "earned": quant_pts,
        "max": 6,
        "details": f"Found {len(quant_matches)} quantified achievements or metric citations."
    })

    # Avoid weak/passive phrases (up to 6 points)
    found_weak = [w for w in WEAK_VERBS if w in text_lower]
    weak_pts = max(1, 6 - (len(found_weak) * 2))
    score += weak_pts
    criteria.append({
        "criterion": "Active Voice vs Passive Fillers",
        "earned": weak_pts,
        "max": 6,
        "details": f"Identified {len(found_weak)} passive phrases ({', '.join(found_weak) if found_weak else 'none found'})."
    })

    pct = round((score / max_score) * 100, 1)
    status = "Excellent" if score >= 16 else "Good" if score >= 12 else "Needs Improvement"
    return CategoryScore(
        name="Content Quality and Impact",
        score=score,
        max_score=max_score,
        percentage=pct,
        status=status,
        feedback=f"Content quality scored {score}/{max_score}. Action verbs and measurable results distinguish top-tier candidates.",
        criteria_evaluated=criteria
    )

def evaluate_skill_depth(text: str, parsed_data: Optional[Dict[str, Any]] = None) -> CategoryScore:
    max_score = 20
    score = 0
    criteria = []

    extracted = skill_extractor.extract_skills_from_text(text)
    skills = extracted["skills"]
    categorized = extracted["categorized"]

    # Category balance (languages, frameworks, databases, tools) (up to 10 points)
    cat_count = len(categorized)
    balance_pts = min(10, cat_count * 2.5)
    score += int(balance_pts)
    criteria.append({
        "criterion": "Technical Stack Diversity",
        "earned": int(balance_pts),
        "max": 10,
        "details": f"Skills span {cat_count} distinct categories ({', '.join(categorized.keys())})."
    })

    # Contextual evidence (skills in experience/projects bullets vs bare lists) (up to 10 points)
    exp_text = ""
    if parsed_data and parsed_data.get('experience'):
        for exp in parsed_data['experience']:
            exp_text += " " + " ".join(exp.get('bullets', []))
    
    in_context_count = sum(1 for s in skills if s.lower() in exp_text.lower())
    depth_pts = min(10, int((in_context_count / max(1, len(skills))) * 12)) if skills else 5
    score += depth_pts
    criteria.append({
        "criterion": "Evidence-Backed Skill Proficiency",
        "earned": depth_pts,
        "max": 10,
        "details": f"{in_context_count} of {len(skills)} skills demonstrated within practical project or job experience contexts."
    })

    pct = round((score / max_score) * 100, 1)
    status = "Excellent" if score >= 16 else "Good" if score >= 12 else "Needs Improvement"
    return CategoryScore(
        name="Skill Depth",
        score=score,
        max_score=max_score,
        percentage=pct,
        status=status,
        feedback=f"Skill depth scored {score}/{max_score}. Contextual proof of skills in project bullets is favored over plain lists.",
        criteria_evaluated=criteria
    )

def evaluate_compatibility(text: str, parsed_data: Optional[Dict[str, Any]] = None) -> CategoryScore:
    max_score = 15
    score = 0
    criteria = []

    contact = parsed_data.get('contact', {}) if parsed_data else {}
    
    # Contact info parseability (up to 7 points)
    contact_pts = 0
    if contact.get('email'):
        contact_pts += 3
    if contact.get('phone'):
        contact_pts += 2
    if contact.get('name'):
        contact_pts += 2
    score += contact_pts
    criteria.append({
        "criterion": "Header & Contact Parseability",
        "earned": contact_pts,
        "max": 7,
        "details": "Successfully extracted name, professional email, and phone contact details."
    })

    # Layout simplicity & character consistency (up to 8 points)
    non_ascii = len(re.findall(r'[^\x00-\x7F]', text))
    clean_pts = 8
    if non_ascii > 50:
        clean_pts = 4
        c_msg = "Contains unusual non-standard symbols or complex typography that may degrade ATS text extraction."
    else:
        c_msg = "Clean standard character encoding, optimal for automated applicant parsers."
    score += clean_pts
    criteria.append({
        "criterion": "ATS Text Encoding Safety",
        "earned": clean_pts,
        "max": 8,
        "details": c_msg
    })

    pct = round((score / max_score) * 100, 1)
    status = "Excellent" if score >= 13 else "Good" if score >= 10 else "Needs Improvement"
    return CategoryScore(
        name="ATS File Compatibility",
        score=score,
        max_score=max_score,
        percentage=pct,
        status=status,
        feedback=f"ATS compatibility scored {score}/{max_score}. Clear contact details and clean text flow ensure high parsing accuracy.",
        criteria_evaluated=criteria
    )

def generate_rewrites_and_recommendations(text: str, target_role: str = "Software Engineer") -> Tuple[List[str], List[str], List[str], List[BulletRewrite], List[str]]:
    strengths = []
    critical_issues = []
    missing_keywords = []
    recommendations = []
    rewrites = []

    text_lower = text.lower()
    extracted = skill_extractor.extract_skills_from_text(text)
    found_skills = set(extracted["skills"])
    benchmark = ROLE_SKILL_BENCHMARKS.get(target_role.lower(), ROLE_SKILL_BENCHMARKS["software engineer"])

    # Determine missing keywords
    for b_skill in benchmark:
        if b_skill not in found_skills:
            missing_keywords.append(b_skill)

    # Strengths
    if len(found_skills) >= 6:
        strengths.append(f"Strong technical footprint: showcases key technologies ({', '.join(list(found_skills)[:5])}).")
    if any(re.search(rf'\b{v}\b', text_lower) for v in ACTION_VERBS):
        strengths.append("Effective use of active verbs across project descriptions.")
    if re.search(r'\b\d+%\b', text):
        strengths.append("Incorporates quantified performance metrics demonstrating measurable outcomes.")

    # Critical issues
    if len(missing_keywords) >= 3:
        critical_issues.append(f"Missing core competencies typically expected for {target_role}: {', '.join(missing_keywords[:4])}.")
    if not re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text):
        critical_issues.append("Missing or unparseable email address in contact information.")
    if len(text.split()) < 250:
        critical_issues.append("Resume content is sparse. Insufficient technical details for competitive ATS ranking.")

    # Recommendations
    recommendations.append(f"Align resume terminology with job postings for {target_role} by integrating relevant skills.")
    recommendations.append("Adopt Google's X-Y-Z accomplishment structure: 'Accomplished [X] as measured by [Y] by doing [Z]'.")
    recommendations.append("Ensure every skill listed in your technical summary is supported by real usage in experience or project bullets.")

    # Generate rule-based bullet rewrites based on weak patterns in text
    lines = [l.strip() for l in text.split('\n') if l.strip().startswith(('•', '-', '*')) or len(l.strip()) > 30]
    for line in lines[:3]:
        cleaned_bullet = re.sub(r'^[•\-\*]\s*', '', line).strip()
        if len(cleaned_bullet) > 20 and len(cleaned_bullet) < 160:
            rewrites.append(BulletRewrite(
                original=cleaned_bullet,
                improved=f"Architected and deployed {cleaned_bullet.lower().rstrip('.')}, improving execution efficiency by 25% and ensuring system reliability.",
                reason="Restructured using Google's X-Y-Z formula: strong action verb ('Architected and deployed'), specific deliverable, and quantified impact metric.",
                requires_confirmation=True
            ))

    return strengths, critical_issues, missing_keywords, rewrites, recommendations

def calculate_ats_readiness_score(
    resume_text: str,
    parsed_data: Optional[Dict[str, Any]] = None,
    target_role: str = "Software Engineer",
    job_description: Optional[str] = None
) -> AssessmentResult:
    """
    Computes deterministic 100-point ATS readiness score according to 5 categories.
    """
    c1 = evaluate_formatting(resume_text, parsed_data)
    c2 = evaluate_keywords(resume_text, target_role, job_description)
    c3 = evaluate_content_quality(resume_text)
    c4 = evaluate_skill_depth(resume_text, parsed_data)
    c5 = evaluate_compatibility(resume_text, parsed_data)

    overall_score = c1.score + c2.score + c3.score + c4.score + c5.score

    if overall_score >= 80:
        readiness_level = "Strong Readiness"
    elif overall_score >= 60:
        readiness_level = "Improvement Recommended"
    else:
        readiness_level = "Significant Improvements Needed"

    strengths, critical_issues, missing_keywords, rewrites, recs = generate_rewrites_and_recommendations(resume_text, target_role)

    privacy_flags = parsed_data.get('privacy_flags', []) if parsed_data else []

    word_count = len(resume_text.split())

    return AssessmentResult(
        overall_score=overall_score,
        readiness_level=readiness_level,
        category_scores={
            "formatting": c1,
            "keywords": c2,
            "content_quality": c3,
            "skill_depth": c4,
            "compatibility": c5
        },
        strengths=strengths,
        critical_issues=critical_issues,
        missing_keywords=missing_keywords,
        bullet_point_rewrites=rewrites,
        recommendations=recs,
        privacy_flags=privacy_flags,
        word_count_analysis={
            "total_words": word_count,
            "status": "optimal" if 400 <= word_count <= 900 else "brief" if word_count < 400 else "lengthy"
        },
        scoring_version="1.0.0",
        timestamp=datetime.now(timezone.utc).isoformat()
    )
