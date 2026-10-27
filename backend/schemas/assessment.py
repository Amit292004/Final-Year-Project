from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CategoryScore(BaseModel):
    name: str
    score: int
    max_score: int
    percentage: float
    status: str  # e.g. "Excellent", "Good", "Needs Improvement"
    feedback: str
    criteria_evaluated: List[Dict[str, Any]] = []

class BulletRewrite(BaseModel):
    original: str
    improved: str
    reason: str
    requires_confirmation: bool = False

class AssessmentResult(BaseModel):
    overall_score: int
    readiness_level: str  # "Strong Readiness", "Improvement Recommended", "Significant Improvements Needed"
    category_scores: Dict[str, CategoryScore]
    strengths: List[str] = []
    critical_issues: List[str] = []
    missing_keywords: List[str] = []
    bullet_point_rewrites: List[BulletRewrite] = []
    recommendations: List[str] = []
    privacy_flags: List[str] = []
    word_count_analysis: Dict[str, Any] = Field(default_factory=dict)
    scoring_version: str = "1.0.0"
    timestamp: str

class AssessmentRequest(BaseModel):
    resume_text: str
    parsed_data: Optional[Dict[str, Any]] = None
    target_role: Optional[str] = "Software Engineer"
    job_description: Optional[str] = None
