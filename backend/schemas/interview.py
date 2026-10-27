from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class QuestionItem(BaseModel):
    order: int
    question: str
    type: str  # background, technical, skill_gap, behavioral
    difficulty: str  # entry, intermediate, senior
    target_skill: Optional[str] = None
    expected_topics: List[str] = []
    hint: Optional[str] = None

class GenerateQuestionsRequest(BaseModel):
    target_role: str
    difficulty: str = "intermediate"
    question_count: int = 5
    resume_text: Optional[str] = None
    job_description: Optional[str] = None
    focus_areas: List[str] = []

class StarAlignment(BaseModel):
    situation: bool = False
    task: bool = False
    action: bool = False
    result: bool = False
    feedback: Optional[str] = None

class AnswerEvaluationRequest(BaseModel):
    question: str
    question_type: str
    difficulty: str
    user_answer: str
    target_role: Optional[str] = "Software Engineer"
    expected_topics: List[str] = []

class AnswerEvaluationResult(BaseModel):
    technical_depth: float  # 0 - 10
    communication_clarity: float  # 0 - 10
    relevance: float  # 0 - 10
    structure: float  # 0 - 10
    star_alignment: Optional[StarAlignment] = None
    key_strengths: List[str] = []
    areas_for_improvement: List[str] = []
    model_answer_suggestion: str
    summary_feedback: str
