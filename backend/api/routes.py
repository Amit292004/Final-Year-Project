from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status, Request, Response
from fastapi.responses import HTMLResponse
from typing import Optional, List, Dict, Any

from backend.core.security import verify_service_token
from backend.core.logging import logger
from backend.api.auth import get_current_user
from backend.services.resume_parser import parse_resume_bytes, parse_resume_file
from backend.services.ats_scorer import calculate_ats_readiness_score
from backend.services.skill_extractor import skill_extractor
from backend.services.jd_matcher import match_resume_to_jd
from backend.services.feedback_engine import feedback_engine
from backend.services.report_generator import render_assessment_report_html, generate_html_reports
from backend.services.pdf_export import generate_combined_pdf
from backend.services.evaluation_service import run_ai_evaluations
from backend.services.resume_analyzer import analyze_full_resume
from backend.database.supabase_db import save_analysis, get_user_history, delete_analysis
from backend.models.schemas import (
    AnalysisResponse, ComponentScores, JDComparison, SkillValidationDetails, IssueDetail
)
from backend.schemas.assessment import AssessmentRequest, AssessmentResult
from backend.schemas.matching import JobMatchRequest, JobMatchResult
from backend.schemas.resume import ParsedResume

router = APIRouter(tags=["Core AI/ML & ATS Scorer"])

# -------------------------------------------------------------
# SHRADHA KHAPRA EXACT ATS SCORER & REPORT ENDPOINTS
# -------------------------------------------------------------

def _to_issue_detail(fb) -> IssueDetail:
    if isinstance(fb, IssueDetail):
        return fb
    if hasattr(fb, 'model_dump'):
        return IssueDetail(**fb.model_dump())
    if hasattr(fb, '__dict__'):
        return IssueDetail(**fb.__dict__)
    if isinstance(fb, dict):
        return IssueDetail(**fb)
    return IssueDetail(
        issue_title=str(fb),
        severity_level="low",
        ats_impact="",
        explanation="",
        where_it_appears="",
        how_to_fix=""
    )

@router.post("/analyze-resume", response_model=AnalysisResponse)
async def analyze_resume_endpoint(
    request: Request,
    resume: UploadFile = File(..., description="Resume file — PDF, DOCX, or TXT (max 5 MB)"),
    job_description: str = Form("", description="Optional Job Description text"),
    user_id: str = Depends(get_current_user),
):
    """
    Exact end-to-end resume ATS analysis pipeline:
    1. Parse resume file bytes (PDF hyperlink extraction, DOCX relations, TXT).
    2. Extract skills, projects, metrics, action verbs.
    3. Validate skills against projects and experience.
    4. Optional JD comparison with fuzzy alias matching & semantic embeddings.
    5. Calculate 5 component scores (Formatting, Keywords, Content, Skill Validation, ATS Compatibility).
    6. Analyze 10 deep diagnostic issues with action items & examples.
    7. Save analysis to history.
    """
    nlp = getattr(request.app.state, 'nlp', None)
    embedder = getattr(request.app.state, 'embedder', None)

    filename = resume.filename or "resume.pdf"
    file_bytes = await resume.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum 5 MB limit"
        )

    try:
        resume_text, metadata = parse_resume_file(file_bytes, filename)
    except Exception as exc:
        logger.error(f"File parsing failed for {filename}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not read or parse the resume: {exc}"
        )

    try:
        result = analyze_full_resume(
            resume_text=resume_text,
            nlp=nlp,
            embedder=embedder,
            job_description=job_description
        )
    except Exception as exc:
        logger.error(f"Resume analysis failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis pipeline failed: {exc}"
        )

    jd_comparison_result = None
    if result.get("jd_comparison"):
        jd_comp = result["jd_comparison"]
        jd_comparison_result = JDComparison(
            match_percentage=round(float(jd_comp.get("match_percentage", 0.0)), 1),
            semantic_similarity=round(float(jd_comp.get("semantic_similarity", 0.0)), 3),
            matched_keywords=jd_comp.get("matched_keywords", [])[:20],
            missing_keywords=jd_comp.get("missing_keywords", [])[:15],
            skills_gap=jd_comp.get("skills_gap", [])[:10],
        )

    svd_raw = result.get("skill_validation_details") or {}
    skill_val_details = SkillValidationDetails(
        validated=svd_raw.get("validated", []),
        unvalidated=svd_raw.get("unvalidated", []),
        total=svd_raw.get("total", 0),
        validated_count=svd_raw.get("validated_count", 0),
        validation_pct=svd_raw.get("validation_pct", 0.0),
    )

    response = AnalysisResponse(
        ATS_score=result["ats_score"],
        component_scores=ComponentScores(**result["component_scores"]),
        issues_summary=result.get("issues_summary", []),
        detailed_feedback=[
            _to_issue_detail(fb)
            for fb in result.get("detailed_feedback", [])
        ],
        jd_match_analysis=jd_comparison_result,
        skill_validation_details=skill_val_details,
        ats_score=result["ats_score"],
        keyword_match=jd_comparison_result.match_percentage if jd_comparison_result else 0.0,
        missing_keywords=result.get("missing_keywords", []),
        matched_keywords=result.get("matched_keywords", []),
        skills=list(result.get("skills", [])[:20]),
        jd_comparison=jd_comparison_result,
        strengths=result.get("strengths", []),
        critical_issues=result.get("critical_issues", []),
        suggestions=result.get("suggestions", []),
        warnings=result.get("warnings", []),
        interpretation=result.get("interpretation", "")
    )

    try:
        await save_analysis(user_id, filename, result)
    except Exception as exc:
        logger.warning(f"History save note: {exc}")

    return response

@router.get("/history")
async def get_history_endpoint(user_id: str = Depends(get_current_user)):
    """Fetch user's past ATS analyses."""
    try:
        return await get_user_history(user_id)
    except Exception as exc:
        logger.error(f"History load failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Could not load history: {exc}")

@router.delete("/history/{analysis_id}")
async def delete_history_endpoint(analysis_id: str, user_id: str = Depends(get_current_user)):
    """Delete an analysis entry from user history."""
    try:
        success = await delete_analysis(analysis_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Analysis not found or not owned by user.")
        return {"status": "deleted", "id": analysis_id}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"History delete failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Could not delete analysis: {exc}")

@router.post("/generate-pdf")
async def generate_pdf_endpoint(data: AnalysisResponse, user_id: str = Depends(get_current_user)):
    """Generate HTML or PDF report from analysis data."""
    try:
        html_docs = generate_html_reports(data.model_dump())
        pdf_bytes = generate_combined_pdf(html_docs)
        is_pdf = pdf_bytes.startswith(b"%PDF")
        media_type = "application/pdf" if is_pdf else "text/html"
        filename = "ats_resume_report.pdf" if is_pdf else "ats_resume_report.html"
        return Response(
            content=pdf_bytes,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as exc:
        logger.error(f"Failed to generate report: {exc}")
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {exc}")

@router.get("/history/{analysis_id}/pdf")
async def generate_history_pdf_endpoint(analysis_id: str, user_id: str = Depends(get_current_user)):
    """Download report from a past history analysis."""
    history = await get_user_history(user_id)
    entry = next((item for item in history if item["id"] == analysis_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail="Analysis history record not found")

    analysis_data = entry.get("analysis_result") or {}
    try:
        html_docs = generate_html_reports(analysis_data)
        pdf_bytes = generate_combined_pdf(html_docs)
        is_pdf = pdf_bytes.startswith(b"%PDF")
        media_type = "application/pdf" if is_pdf else "text/html"
        filename = f"ats_report_{analysis_id}.pdf" if is_pdf else f"ats_report_{analysis_id}.html"
        return Response(
            content=pdf_bytes,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as exc:
        logger.error(f"Failed to generate history report: {exc}")
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {exc}")

# -------------------------------------------------------------
# INTERNAL MICROSERVICE ENDPOINTS (FOR EXPRESS GATEWAY)
# -------------------------------------------------------------

@router.post("/parse-resume", response_model=ParsedResume, dependencies=[Depends(verify_service_token)])
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
        skills_info = skill_extractor.extract_skills_from_text(parsed.raw_text)
        parsed.skills = skills_info["skills"]
        parsed.categorized_skills = skills_info["categorized"]
        return parsed
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

@router.post("/score-resume", response_model=AssessmentResult, dependencies=[Depends(verify_service_token)])
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

@router.post("/extract-skills", dependencies=[Depends(verify_service_token)])
async def extract_skills_endpoint(payload: dict):
    text = payload.get("text", "")
    return skill_extractor.extract_skills_from_text(text)

@router.post("/match-jd", response_model=JobMatchResult, dependencies=[Depends(verify_service_token)])
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

@router.post("/generate-feedback", dependencies=[Depends(verify_service_token)])
async def generate_feedback_endpoint(payload: dict):
    resume_text = payload.get("resume_text", "")
    target_role = payload.get("target_role", "Software Engineer")
    job_description = payload.get("job_description")
    
    return await feedback_engine.generate_llm_feedback(
        resume_text=resume_text,
        target_role=target_role,
        job_description=job_description
    )

@router.post("/generate-report", response_class=HTMLResponse, dependencies=[Depends(verify_service_token)])
async def generate_report_endpoint(payload: dict):
    assessment_data = payload.get("assessment_data", {})
    candidate_name = payload.get("candidate_name", "Candidate")
    target_role = payload.get("target_role", "Software Engineer")
    
    html = render_assessment_report_html(assessment_data, candidate_name, target_role)
    return HTMLResponse(content=html)

@router.get("/evaluations", dependencies=[Depends(verify_service_token)])
async def get_evaluations_endpoint():
    return run_ai_evaluations()
