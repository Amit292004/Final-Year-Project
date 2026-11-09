import re
from typing import Dict, Any, List, Optional
import numpy as np
from rapidfuzz import fuzz

from backend.schemas.matching import (
    JobMatchResult, MatchedSkill, MissingSkill
)
from backend.services.skill_extractor import skill_extractor
from backend.services.embedding_service import embedding_service
from backend.utils.matching import fuzzy_match_keywords, normalize_skill
from backend.core.logging import logger

def calculate_semantic_similarity(
    resume_text: str, jd_text: str, embedder = None
) -> float:
    if not resume_text or not jd_text:
        return 0.0
    try:
        if embedder and hasattr(embedder, 'encode'):
            resume_emb = embedder.encode(resume_text[:5000], convert_to_tensor=False)
            jd_emb = embedder.encode(jd_text[:5000], convert_to_tensor=False)
            norm_r = np.linalg.norm(resume_emb)
            norm_j = np.linalg.norm(jd_emb)
            if norm_r > 0 and norm_j > 0:
                sim = np.dot(resume_emb, jd_emb) / (norm_r * norm_j)
                return float(np.clip(sim, 0.0, 1.0))
        # Fallback to embedding_service
        r_emb = embedding_service.encode(resume_text[:2000])[0]
        j_emb = embedding_service.encode(jd_text[:2000])[0]
        sim = embedding_service.cosine_similarity(r_emb, j_emb)
        return float(np.clip(sim, 0.0, 1.0))
    except Exception as e:
        logger.warning(f"Error calculating JD semantic similarity: {e}")
        return 0.0

def identify_matched_keywords(
    resume_keywords: List[str], jd_keywords: List[str]
) -> List[str]:
    result = fuzzy_match_keywords(resume_keywords, jd_keywords, threshold=80)
    return result['matched']

def identify_missing_keywords(
    resume_keywords: List[str], jd_keywords: List[str], top_n: int = 15
) -> List[str]:
    result = fuzzy_match_keywords(resume_keywords, jd_keywords, threshold=80)
    return result['missing'][:top_n]

def analyze_skills_gap(
    resume_skills: List[str], jd_text: str, nlp = None
) -> List[str]:
    jd_skills = set()
    if nlp:
        try:
            doc = nlp(jd_text[:5000])
            for ent in doc.ents:
                if ent.label_ in ['PRODUCT', 'ORG', 'LANGUAGE']:
                    jd_skills.add(ent.text.lower())
            for chunk in doc.noun_chunks:
                ct = chunk.text.lower().strip()
                if 1 <= len(ct.split()) <= 4:
                    jd_skills.add(ct)
        except Exception as e:
            logger.debug(f"Spacy noun chunk error: {e}")

    # Also extract via regex / skill extractor
    jd_extracted = skill_extractor.extract_skills_from_text(jd_text)
    for s in jd_extracted["skills"]:
        jd_skills.add(s.lower())

    resume_normalized = {normalize_skill(s) for s in resume_skills}
    gap = []
    for jd_skill in jd_skills:
        jd_norm = normalize_skill(jd_skill)
        if jd_norm in resume_normalized:
            continue
        best_score = max(
            (fuzz.token_sort_ratio(jd_norm, rs) for rs in resume_normalized),
            default=0,
        )
        if best_score < 75:
            gap.append(jd_skill)

    return sorted(list(set(gap)))[:20]

def calculate_match_percentage(
    resume_keywords: List[str],
    jd_keywords: List[str],
    semantic_similarity: float,
) -> float:
    if not jd_keywords:
        return 0.0
    matched = identify_matched_keywords(resume_keywords, jd_keywords)
    keyword_overlap = len(matched) / len(jd_keywords)
    match_pct = (keyword_overlap * 0.6 + semantic_similarity * 0.4) * 100
    return float(np.clip(match_pct, 0.0, 100.0))

def compare_resume_with_jd(
    resume_text: str,
    resume_keywords: List[str],
    resume_skills: List[str],
    jd_text: str,
    jd_keywords: List[str],
    embedder = None,
    nlp = None,
) -> Dict[str, Any]:
    semantic_similarity = calculate_semantic_similarity(resume_text, jd_text, embedder)
    matched_keywords = identify_matched_keywords(resume_keywords, jd_keywords)
    missing_keywords = identify_missing_keywords(resume_keywords, jd_keywords)
    skills_gap = analyze_skills_gap(resume_skills, jd_text, nlp)
    match_percentage = calculate_match_percentage(
        resume_keywords, jd_keywords, semantic_similarity
    )

    return {
        'match_percentage': round(match_percentage, 1),
        'semantic_similarity': round(semantic_similarity, 3),
        'matched_keywords': matched_keywords,
        'missing_keywords': missing_keywords,
        'skills_gap': skills_gap,
    }

def parse_jd_requirements(jd_text: str) -> Dict[str, Any]:
    """
    Splits JD into required vs preferred skills/qualifications.
    """
    extracted = skill_extractor.extract_skills_from_text(jd_text)
    all_skills = extracted["skills"]

    required_skills = []
    preferred_skills = []

    lines = jd_text.split('\n')
    current_mode = "required"

    for line in lines:
        lower = line.lower()
        if any(h in lower for h in ['preferred', 'nice to have', 'bonus', 'plus', 'good to have']):
            current_mode = "preferred"
        elif any(h in lower for h in ['requirement', 'qualification', 'must have', 'required', 'skills required']):
            current_mode = "required"

        for s in all_skills:
            if s.lower() in lower:
                if current_mode == "preferred" and s not in preferred_skills:
                    preferred_skills.append(s)
                elif current_mode == "required" and s not in required_skills and s not in preferred_skills:
                    required_skills.append(s)

    for s in all_skills:
        if s not in required_skills and s not in preferred_skills:
            required_skills.append(s)

    return {
        "required_skills": required_skills,
        "preferred_skills": preferred_skills,
        "all_skills": all_skills
    }

def find_supporting_passages(resume_text: str, skill: str) -> Optional[str]:
    lines = resume_text.split('\n')
    for line in lines:
        cleaned = line.strip().lstrip('•-* ')
        if skill.lower() in cleaned.lower() and len(cleaned) > 20:
            return cleaned
    return None

def match_resume_to_jd(
    resume_text: str,
    job_description: str,
    parsed_resume: Optional[Dict[str, Any]] = None,
    job_title: str = "Target Role"
) -> JobMatchResult:
    resume_skills_info = skill_extractor.extract_skills_from_text(resume_text)
    resume_skills = set(resume_skills_info["skills"])

    jd_info = parse_jd_requirements(job_description)
    required = jd_info["required_skills"]
    preferred = jd_info["preferred_skills"]

    matched_skills = []
    partial_matches = []
    missing_skills = []
    supporting_passages = []

    # 1. Match Required Skills
    matched_req_count = 0
    for req in required:
        req_norm = normalize_skill(req)
        # Exact or canonical match
        is_matched = False
        for r_skill in resume_skills:
            if req_norm == normalize_skill(r_skill) or req.lower() == r_skill.lower():
                matched_req_count += 1
                passage = find_supporting_passages(resume_text, req) or find_supporting_passages(resume_text, r_skill)
                matched_skills.append(MatchedSkill(
                    skill=req,
                    importance="required",
                    match_type="exact",
                    evidence_text=passage,
                    similarity_score=1.0
                ))
                if passage:
                    supporting_passages.append({
                        "skill": req,
                        "passage": passage,
                        "confidence": 0.95
                    })
                is_matched = True
                break

        if not is_matched:
            # Fuzzy match
            best_fuzzy = 0
            best_cand = None
            for r_skill in resume_skills:
                score = fuzz.token_sort_ratio(req_norm, normalize_skill(r_skill))
                if score > best_fuzzy:
                    best_fuzzy = score
                    best_cand = r_skill

            if best_fuzzy >= 80 and best_cand:
                matched_req_count += 0.8
                partial_matches.append(MatchedSkill(
                    skill=req,
                    importance="required",
                    match_type="alias",
                    evidence_text=f"Related skill found on resume: {best_cand}",
                    similarity_score=round(best_fuzzy / 100.0, 2)
                ))
            else:
                missing_skills.append(MissingSkill(
                    skill=req,
                    importance="required",
                    recommendation=f"Add demonstrated experience with {req} to bridge critical requirements for {job_title}."
                ))

    # 2. Match Preferred Skills
    matched_pref_count = 0
    for pref in preferred:
        pref_norm = normalize_skill(pref)
        is_pref_matched = False
        for r_skill in resume_skills:
            if pref_norm == normalize_skill(r_skill) or pref.lower() == r_skill.lower():
                matched_pref_count += 1
                passage = find_supporting_passages(resume_text, pref) or find_supporting_passages(resume_text, r_skill)
                matched_skills.append(MatchedSkill(
                    skill=pref,
                    importance="preferred",
                    match_type="exact",
                    evidence_text=passage,
                    similarity_score=1.0
                ))
                is_pref_matched = True
                break

        if not is_pref_matched:
            missing_skills.append(MissingSkill(
                skill=pref,
                importance="preferred",
                recommendation=f"Preferred bonus skill: consider exploring {pref} through a targeted project or tutorial."
            ))

    # 3. Compute Embeddings & Cosine Semantic Similarity
    semantic_sim_score = calculate_semantic_similarity(resume_text, job_description)

    # 4. Coverage percentages
    req_coverage = round((matched_req_count / max(1, len(required))) * 100, 1) if required else 85.0
    pref_coverage = round((matched_pref_count / max(1, len(preferred))) * 100, 1) if preferred else 70.0
    experience_alignment = 85.0 if len(matched_skills) >= 4 else 65.0

    # Composite overall score
    overall = int(
        (req_coverage * 0.40) +
        (pref_coverage * 0.20) +
        ((semantic_sim_score * 100) * 0.25) +
        (experience_alignment * 0.15)
    )
    overall_score = max(10, min(98, overall))

    fuzzy_matched = identify_matched_keywords(list(resume_skills), jd_info["all_skills"])
    fuzzy_missing = identify_missing_keywords(list(resume_skills), jd_info["all_skills"])
    skills_gap = analyze_skills_gap(list(resume_skills), job_description)

    recommendations = []
    if missing_skills:
        critical_missing = [m.skill for m in missing_skills if m.importance == "required"]
        if critical_missing:
            recommendations.append(f"Prioritize acquiring or documenting experience in: {', '.join(critical_missing[:3])}.")
    if req_coverage >= 80:
        recommendations.append("High required skill alignment! Emphasize leadership and architectural impact during interviews.")
    else:
        recommendations.append("Tailor your professional summary to highlight transferable experience relating to the core job requirements.")

    return JobMatchResult(
        overall_score=overall_score,
        required_skill_coverage=req_coverage,
        preferred_skill_coverage=pref_coverage,
        semantic_similarity=round(semantic_sim_score * 100, 1),
        experience_alignment=experience_alignment,
        matched_skills=matched_skills,
        partial_matches=partial_matches,
        missing_skills=missing_skills,
        supporting_passages=supporting_passages,
        recommendations=recommendations,
        matched_keywords=fuzzy_matched,
        missing_keywords=fuzzy_missing,
        skills_gap=skills_gap,
        confidence=0.92
    )
