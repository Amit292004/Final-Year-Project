from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from typing import Optional
from backend.core.security import verify_service_token
from backend.services.resume_parser import parse_resume_bytes
from backend.services.ats_scorer import calculate_ats_readiness_score
from backend.services.skill_extractor import skill_extractor
from backend.services.jd_matcher import match_resume_to_jd
from backend.services.feedback_engine import feedback_engine
from backend.services.report_generator import render_assessment_report_html
from backend.services.evaluation_service import run_ai_evaluations
from backend.schemas.assessment import AssessmentRequest, AssessmentResult
from backend.schemas.matching import JobMatchRequest, JobMatchResult
from backend.schemas.resume import ParsedResume

router = APIRouter(tags=["Core AI/ML"], dependencies=[Depends(verify_service_token)])

@router.post("/parse-resume", response_model=ParsedResume)
async def parse_resume_endpoint(file: UploadFile = File(...)):
    filename = file.filename or "resume.pdf"
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum 5 MB limit"
        )
    try:
        parsed = parse_resume_bytes(content, filename)
        # Augment with skill extraction
        skills_info = skill_extractor.extract_skills_from_text(parsed.raw_text)
        parsed.skills = skills_info["skills"]
        parsed.categorized_skills = skills_info["categorized"]
        return parsed
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

@router.post("/score-resume", response_model=AssessmentResult)
async def score_resume_endpoint(req: AssessmentRequest):
    try:
        result = calculate_ats_readiness_score(
            resume_text=req.resume_text,
            parsed_data=req.parsed_data,
            target_role=req.target_role or "Software Engineer",
            job_description=req.job_description
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/extract-skills")
async def extract_skills_endpoint(payload: dict):
    text = payload.get("text", "")
    return skill_extractor.extract_skills_from_text(text)

@router.post("/match-jd", response_model=JobMatchResult)
async def match_jd_endpoint(req: JobMatchRequest):
    try:
        result = match_resume_to_jd(
            resume_text=req.resume_text,
            job_description=req.job_description,
            parsed_resume=req.parsed_resume,
            job_title=req.job_title
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/generate-feedback")
async def generate_feedback_endpoint(payload: dict):
    resume_text = payload.get("resume_text", "")
    target_role = payload.get("target_role", "Software Engineer")
    job_description = payload.get("job_description")
    
    return await feedback_engine.generate_llm_feedback(
        resume_text=resume_text,
        target_role=target_role,
        job_description=job_description
    )

@router.post("/generate-report", response_class=HTMLResponse)
async def generate_report_endpoint(payload: dict):
    assessment_data = payload.get("assessment_data", {})
    candidate_name = payload.get("candidate_name", "Candidate")
    target_role = payload.get("target_role", "Software Engineer")
    
    html = render_assessment_report_html(assessment_data, candidate_name, target_role)
    return HTMLResponse(content=html)

@router.get("/evaluations")
async def get_evaluations_endpoint():
    return run_ai_evaluations()
