from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ContactInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    location: Optional[str] = None

class ExperienceEntry(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    bullets: List[str] = []
    technologies: List[str] = []

class EducationEntry(BaseModel):
    degree: str
    institution: str
    field_of_study: Optional[str] = None
    graduation_year: Optional[str] = None
    gpa: Optional[str] = None
    honors: Optional[str] = None

class ProjectEntry(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: List[str] = []
    link: Optional[str] = None
    bullets: List[str] = []

class CertificationEntry(BaseModel):
    name: str
    issuer: Optional[str] = None
    issue_date: Optional[str] = None
    credential_id: Optional[str] = None

class ParsedResume(BaseModel):
    raw_text: str
    contact: ContactInfo = Field(default_factory=ContactInfo)
    summary: Optional[str] = None
    skills: List[str] = []
    categorized_skills: Dict[str, List[str]] = Field(default_factory=dict)
    experience: List[ExperienceEntry] = []
    education: List[EducationEntry] = []
    projects: List[ProjectEntry] = []
    certifications: List[CertificationEntry] = []
    achievements: List[str] = []
    word_count: int = 0
    section_count: int = 0
    detected_sections: List[str] = []
    warnings: List[str] = []
    privacy_flags: List[str] = []
    extraction_confidence: float = 1.0
