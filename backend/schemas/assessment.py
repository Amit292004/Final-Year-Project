from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CategoryScore(BaseModel):
    name: str
    score: float
    max_score: float
    percentage: float
    status: str  # e.g. "Excellent", "Good", "Needs Improvement"
    feedback: str
    criteria_evaluated: List[Dict[str, Any]] = []

class BulletRewrite(BaseModel):
    original: str
    improved: str
    reason: str
    requires_confirmation: bool = False

class IssueDetail(BaseModel):
    issue_title: str
    severity_level: str
    ats_impact: str
    explanation: str
    where_it_appears: str
    how_to_fix: str
    action_items: List[str] = []
    example_improvement: str = ""

class SkillValidationDetails(BaseModel):
    validated: List[Dict[str, Any]] = []       # [{'skill': str, 'projects': [str], 'similarity': float}]
    unvalidated: List[str] = []                # ['Flask', 'A/B Testing', ...]
    total: int = 0
    validated_count: int = 0
    validation_pct: float = 0.0

class JDComparisonDetails(BaseModel):
    match_percentage: float = 0.0
    semantic_similarity: float = 0.0
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    skills_gap: List[str] = []

class AssessmentResult(BaseModel):
    overall_score: float
    readiness_level: str  # "Strong Readiness", "Improvement Recommended", "Significant Improvements Needed"
    category_scores: Dict[str, CategoryScore]
    strengths: List[str] = []
    critical_issues: List[str] = []
    missing_keywords: List[str] = []
    matched_keywords: List[str] = []
    bullet_point_rewrites: List[BulletRewrite] = []
    recommendations: List[str] = []
    privacy_flags: List[str] = []
    detailed_feedback: List[IssueDetail] = []
    issues_summary: List[str] = []
    skill_validation_details: Optional[SkillValidationDetails] = None
    jd_comparison: Optional[JDComparisonDetails] = None
    interpretation: str = ""
    penalties: Dict[str, float] = {}
    bonuses: Dict[str, float] = {}
    word_count_analysis: Dict[str, Any] = Field(default_factory=dict)
    scoring_version: str = "2.0.0"
    timestamp: str

class AssessmentRequest(BaseModel):
    resume_text: str
    parsed_data: Optional[Dict[str, Any]] = None
    target_role: Optional[str] = "Software Engineer"
    job_description: Optional[str] = None
