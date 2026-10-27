import pytest
from backend.services.ats_scorer import calculate_ats_readiness_score

def test_ats_scoring_determinism():
    resume_text = (
        "John Doe\njohn@example.com\n"
        "PROFESSIONAL SUMMARY\nExperienced Software Engineer with a track record of building web apps.\n"
        "TECHNICAL SKILLS\nPython, JavaScript, TypeScript, Docker, SQL, Git, React, REST API\n"
        "EXPERIENCE\nSoftware Engineer - Tech Corp\n"
        "• Architected distributed microservices in Python and Docker, reducing API latency by 35%.\n"
        "• Engineered React user interfaces serving over 50,000 active monthly users.\n"
        "• Automated CI/CD deployment pipelines using GitHub Actions.\n"
        "EDUCATION\nBachelor of Science in Computer Science, University of Technology, 2023"
    )
    result_1 = calculate_ats_readiness_score(resume_text, target_role="Software Engineer")
    result_2 = calculate_ats_readiness_score(resume_text, target_role="Software Engineer")

    # Determinism test
    assert result_1.overall_score == result_2.overall_score
    assert result_1.readiness_level == result_2.readiness_level
    assert 0 <= result_1.overall_score <= 100
    assert "formatting" in result_1.category_scores
    assert "keywords" in result_1.category_scores
    assert len(result_1.strengths) > 0
