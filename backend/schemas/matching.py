from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class MatchedSkill(BaseModel):
    skill: str
    category: str = "technical"
    importance: str = "required"  # required, preferred, bonus
    match_type: str = "exact"  # exact, alias, semantic
    evidence_text: Optional[str] = None
    similarity_score: float = 1.0

class MissingSkill(BaseModel):
    skill: str
    category: str = "technical"
    importance: str = "required"  # required, preferred
    recommendation: Optional[str] = None

class JobMatchRequest(BaseModel):
    resume_text: str
    parsed_resume: Optional[Dict[str, Any]] = None
    job_title: str
    company: Optional[str] = None
    job_description: str

class JobMatchResult(BaseModel):
    overall_score: int
    required_skill_coverage: float
    preferred_skill_coverage: float
    semantic_similarity: float
    experience_alignment: float
    matched_skills: List[MatchedSkill] = []
    partial_matches: List[MatchedSkill] = []
    missing_skills: List[MissingSkill] = []
    supporting_passages: List[Dict[str, Any]] = []
    recommendations: List[str] = []
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    skills_gap: List[str] = []
    confidence: float = 0.95
