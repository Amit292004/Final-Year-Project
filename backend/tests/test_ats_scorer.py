import pytest
from backend.services.ats_scorer import (
    calculate_ats_readiness_score,
    validate_skills_with_projects,
    detect_location_info,
    calculate_overall_score
)
from backend.services.feedback_engine import analyze_issues, generate_issues_summary
from backend.services.report_generator import generate_html_reports
from backend.utils.matching import fuzzy_match_keywords, normalize_skill

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
    assert "content_quality" in result_1.category_scores
    assert "skill_depth" in result_1.category_scores
    assert "compatibility" in result_1.category_scores
    assert len(result_1.strengths) > 0
    assert result_1.interpretation != ""
    assert result_1.skill_validation_details is not None

def test_skill_validation_with_projects():
    skills = ["Python", "React", "Rust"]
    projects = [
        {"title": "Web App", "description": "Built using React and TypeScript for frontend."}
    ]
    experience = [
        {"job_title": "Backend Dev", "company": "Acme", "description": "Developed backend APIs using Python and FastAPI."}
    ]

    val_res = validate_skills_with_projects(skills, projects, experience)
    assert val_res["validation_percentage"] > 0.5
    validated_names = [v["skill"] for v in val_res["validated_skills"]]
    assert "Python" in validated_names
    assert "React" in validated_names
    assert "Rust" in val_res["unvalidated_skills"]

def test_location_and_privacy_detection():
    clean_text = "Jane Doe\nSeattle, WA\njane@example.com"
    clean_loc = detect_location_info(clean_text)
    assert clean_loc["privacy_risk"] == "none"
    assert clean_loc["penalty_applied"] == 0.0

    exposed_text = "John Smith\n123 Elm Street, Springfield, IL 62701\njohn@example.com"
    exposed_loc = detect_location_info(exposed_text)
    assert exposed_loc["privacy_risk"] == "high"
    assert exposed_loc["penalty_applied"] >= 4.0
    assert any("street" in r.lower() for r in exposed_loc["recommendations"])

def test_fuzzy_keyword_matching_aliases():
    resume_kw = ["React.js", "Node", "K8s", "Postgres"]
    jd_kw = ["React", "Node.js", "Kubernetes", "PostgreSQL", "Go"]

    match_res = fuzzy_match_keywords(resume_kw, jd_kw, threshold=80)
    assert "React" in match_res["matched"]
    assert "Node.js" in match_res["matched"]
    assert "Kubernetes" in match_res["matched"]
    assert "PostgreSQL" in match_res["matched"]
    assert "Go" in match_res["missing"]

def test_issue_diagnostics_and_summary():
    poor_resume_text = "I am looking for a job.\nI know computers."
    issues = analyze_issues(
        resume_text=poor_resume_text,
        parsed_resume={},
        skills=[],
        projects=[],
        action_verbs=[],
        skill_validation={"validated_skills": [], "unvalidated_skills": []},
        scores={"formatting_score": 5.0},
        contact_info={}
    )
    summary = generate_issues_summary(issues)
    assert len(issues) >= 3
    assert "Missing Projects Section" in summary or "Missing Work Experience Section" in summary
    assert any(iss.action_items for iss in issues)

def test_modular_html_reports():
    analysis_data = {
        "overall_score": 85.0,
        "interpretation": "Great! Your resume is ATS-friendly.",
        "component_scores": {
            "formatting": 18.0,
            "keywords": 22.0,
            "content": 21.0,
            "skill_validation": 13.0,
            "ats_compatibility": 14.0
        },
        "strengths": ["Clear format", "Good keywords"],
        "detailed_feedback": [],
        "skill_validation_details": {
            "validated": [{"skill": "Python", "projects": ["API Service"]}],
            "unvalidated": ["Rust"],
            "total": 2,
            "validated_count": 1,
            "validation_pct": 50.0
        }
    }
    reports = generate_html_reports(analysis_data)
    assert "summary" in reports
    assert "skill_report" in reports
    assert "85" in reports["summary"]
