import re
from typing import Dict, Any, List, Optional
from rapidfuzz import fuzz
from backend.schemas.matching import (
    JobMatchResult, MatchedSkill, MissingSkill
)
from backend.services.skill_extractor import skill_extractor
from backend.services.embedding_service import embedding_service
from backend.core.logging import logger

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

    # Distribute remainder to required by default
    for s in all_skills:
        if s not in required_skills and s not in preferred_skills:
            required_skills.append(s)

    return {
        "required_skills": required_skills,
        "preferred_skills": preferred_skills,
        "all_skills": all_skills
    }

def find_supporting_passages(resume_text: str, skill: str) -> Optional[str]:
    """
    Finds sentence or bullet point in resume providing evidence for this skill.
    """
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
    """
    Semantic and skill-coverage matching between candidate resume and job description.
    """
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
        if req in resume_skills:
            matched_req_count += 1
            passage = find_supporting_passages(resume_text, req)
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
        else:
            # Check fuzzy/alias match
            best_fuzzy = 0
            best_cand = None
            for r_skill in resume_skills:
                score = fuzz.ratio(req.lower(), r_skill.lower())
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
        if pref in resume_skills:
            matched_pref_count += 1
            passage = find_supporting_passages(resume_text, pref)
            matched_skills.append(MatchedSkill(
                skill=pref,
                importance="preferred",
                match_type="exact",
                evidence_text=passage,
                similarity_score=1.0
            ))
        else:
            missing_skills.append(MissingSkill(
                skill=pref,
                importance="preferred",
                recommendation=f"Preferred bonus skill: consider exploring {pref} through a targeted project or tutorial."
            ))

    # 3. Compute Embeddings & Cosine Semantic Similarity
    # Take summary chunks of resume & JD
    resume_embed = embedding_service.encode(resume_text[:2000])[0]
    jd_embed = embedding_service.encode(job_description[:2000])[0]
    semantic_sim = embedding_service.cosine_similarity(resume_embed, jd_embed)
    semantic_sim_score = max(0.0, min(1.0, semantic_sim))

    # 4. Coverage percentages
    req_coverage = round((matched_req_count / max(1, len(required))) * 100, 1) if required else 85.0
    pref_coverage = round((matched_pref_count / max(1, len(preferred))) * 100, 1) if preferred else 70.0
    
    # Experience alignment heuristic (years or roles)
    experience_alignment = 85.0 if len(matched_skills) >= 4 else 65.0

    # Composite overall score
    # 40% required skills, 20% preferred skills, 25% semantic embedding similarity, 15% experience alignment
    overall = int(
        (req_coverage * 0.40) +
        (pref_coverage * 0.20) +
        ((semantic_sim_score * 100) * 0.25) +
        (experience_alignment * 0.15)
    )
    overall_score = max(10, min(98, overall))

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
        confidence=0.92
    )
