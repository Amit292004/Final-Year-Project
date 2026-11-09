import io
import pytest
from fastapi.testclient import TestClient
from backend.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

SAMPLE_RESUME = b"""
John Doe
Software Engineer
john.doe@example.com | (555) 123-4567 | San Francisco, CA
https://linkedin.com/in/johndoe | https://github.com/johndoe

PROFESSIONAL SUMMARY
Dynamic software engineer with 4+ years experience designing robust distributed systems, high throughput microservices, and React web apps.

EXPERIENCE
Senior Software Engineer - Tech Corp (Jan 2022 - Present)
* Architected event-driven microservices using Python, FastAPI, and Docker, reducing API latency by 35%.
* Developed real-time telemetry dashboard using React and TypeScript, increasing daily active user engagement by 22%.
* Spearheaded automated CI/CD pipeline deployment to AWS ECS, saving 15 engineering hours weekly.

Software Engineer - Startup Labs (Jun 2020 - Dec 2021)
* Built responsive REST APIs with Node.js and PostgreSQL, serving 500k monthly requests with 99.9% uptime.
* Optimized database queries and Redis caching, cutting average load times by 40%.

PROJECTS
CareerFit AI Platform
* Created an intelligent career readiness engine utilizing Python, spaCy, and scikit-learn.
* Deployed scalable microservices containerized with Docker on AWS.

SKILLS
Programming: Python, TypeScript, JavaScript, SQL
Frameworks & Tools: FastAPI, React, Docker, AWS, Git, Redis, PostgreSQL

EDUCATION
BS in Computer Science, UC Berkeley, 2020
"""

SAMPLE_JD = """
We are seeking a Senior Software Engineer to join our team.
Required Skills: Python, FastAPI, Docker, AWS, React, SQL.
Preferred Qualifications: Microservices architecture, Redis caching, CI/CD pipeline automation.
"""

def test_root_endpoint(client):
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "CareerFit AI - ATS Resume Analyzer API"
    assert "POST   /api/v1/analyze-resume" in data["endpoints"]

def test_analyze_resume_endpoint_general_mode(client):
    files = {
        "resume": ("resume.txt", io.BytesIO(SAMPLE_RESUME), "text/plain")
    }
    data = {
        "job_description": ""
    }
    res = client.post("/api/v1/analyze-resume", files=files, data=data)
    assert res.status_code == 200, res.text
    result = res.json()

    assert "ATS_score" in result
    assert "component_scores" in result
    cs = result["component_scores"]
    assert cs["formatting"] <= 20
    assert cs["keywords"] <= 25
    assert cs["content"] <= 25
    assert cs["skill_validation"] <= 15
    assert cs["ats_compatibility"] <= 15

    assert "skill_validation_details" in result
    svd = result["skill_validation_details"]
    assert svd["total"] > 0
    assert svd["validated_count"] > 0

    assert "detailed_feedback" in result
    assert isinstance(result["detailed_feedback"], list)

def test_analyze_resume_with_jd_comparison(client):
    files = {
        "resume": ("resume.txt", io.BytesIO(SAMPLE_RESUME), "text/plain")
    }
    data = {
        "job_description": SAMPLE_JD
    }
    res = client.post("/api/v1/analyze-resume", files=files, data=data)
    assert res.status_code == 200, res.text
    result = res.json()

    assert result["jd_comparison"] is not None
    jd_comp = result["jd_comparison"]
    assert jd_comp["match_percentage"] > 0
    assert "Python" in " ".join(jd_comp["matched_keywords"]) or "FastAPI" in " ".join(jd_comp["matched_keywords"])
    assert "semantic_similarity" in jd_comp

def test_history_workflow(client):
    # Ensure an analysis exists
    files = {
        "resume": ("resume.txt", io.BytesIO(SAMPLE_RESUME), "text/plain")
    }
    client.post("/api/v1/analyze-resume", files=files, data={"job_description": ""})

    # Fetch history
    res = client.get("/api/v1/history")
    assert res.status_code == 200
    history = res.json()
    assert isinstance(history, list)
    assert len(history) > 0

    first_entry = history[0]
    entry_id = first_entry["id"]

    # Download history pdf/html report
    res_pdf = client.get(f"/api/v1/history/{entry_id}/pdf")
    assert res_pdf.status_code == 200
    assert len(res_pdf.content) > 100

    # Delete history entry
    res_del = client.delete(f"/api/v1/history/{entry_id}")
    assert res_del.status_code == 200
    assert res_del.json()["status"] == "deleted"

def test_generate_pdf_endpoint(client):
    files = {
        "resume": ("resume.txt", io.BytesIO(SAMPLE_RESUME), "text/plain")
    }
    res = client.post("/api/v1/analyze-resume", files=files, data={"job_description": ""})
    analysis_data = res.json()

    res_pdf = client.post("/api/v1/generate-pdf", json=analysis_data)
    assert res_pdf.status_code == 200
    assert len(res_pdf.content) > 100
