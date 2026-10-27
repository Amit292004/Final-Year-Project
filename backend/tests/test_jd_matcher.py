import pytest
from backend.services.jd_matcher import match_resume_to_jd

def test_jd_matching_coverage():
    resume = (
        "Experienced Engineer\n"
        "Skills: Python, React, PostgreSQL, Docker, Git\n"
        "Experience: Built cloud applications with Docker and PostgreSQL."
    )
    jd = (
        "Senior Backend Developer\n"
        "Requirements:\n"
        "- Strong experience with Python and PostgreSQL\n"
        "- Experience with Docker and containerization\n"
        "Preferred:\n"
        "- Experience with Kubernetes and Go"
    )

    result = match_resume_to_jd(resume, jd, job_title="Backend Developer")
    assert 0 <= result.overall_score <= 100
    assert result.required_skill_coverage > 50.0
    matched_names = [m.skill for m in result.matched_skills]
    assert "Python" in matched_names or "PostgreSQL" in matched_names
    missing_names = [m.skill for m in result.missing_skills]
    assert "Go" in missing_names or "Kubernetes" in missing_names
