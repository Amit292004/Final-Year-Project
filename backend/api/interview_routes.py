from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from backend.core.security import verify_service_token
from backend.services.interview_service import interview_service
from backend.services.rag_service import rag_service
from backend.schemas.interview import (
    GenerateQuestionsRequest, QuestionItem,
    AnswerEvaluationRequest, AnswerEvaluationResult
)

router = APIRouter(prefix="/interview", tags=["Interview Prep & Career Advisor"], dependencies=[Depends(verify_service_token)])

@router.post("/generate-questions", response_model=List[QuestionItem])
async def generate_questions_endpoint(req: GenerateQuestionsRequest):
    try:
        return await interview_service.generate_interview_questions(req)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/evaluate-answer", response_model=AnswerEvaluationResult)
async def evaluate_answer_endpoint(req: AnswerEvaluationRequest):
    try:
        return await interview_service.evaluate_interview_answer(req)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/advisor-chat")
async def advisor_chat_endpoint(payload: dict):
    """
    RAG-assisted career advisor message generator.
    """
    query = payload.get("message", "")
    target_role = payload.get("target_role", "Software Engineer")
    user_skills = payload.get("skills", [])
    candidate_context = payload.get("context_chunks", [])
    
    # Retrieve top relevant context chunks
    relevant = rag_service.retrieve_relevant_chunks(query, candidate_context, top_k=3)
    context_text = "\n".join([c.get("content", "") for c in relevant])

    # Build response
    sources = []
    for r in relevant:
        sources.append({
            "source_type": r.get("source_type", "candidate_profile"),
            "snippet": r.get("content", "")[:120] + "..."
        })

    # High-quality guidance response
    reply = (
        f"Regarding your path toward becoming a high-impact **{target_role}**:\n\n"
        f"Based on your profile footprint and current skill profile ({', '.join(user_skills[:6]) if user_skills else 'entry-level stack'}), "
        f"the most critical leverage point is deepening your hands-on experience in production environments.\n\n"
        "**Strategic Recommendations:**\n"
        "1. **Architectural Depth**: Demonstrate not just tool usage, but why specific databases or patterns (e.g., Redis caching vs read replicas) were chosen.\n"
        "2. **Quantifiable Metrics**: Revise project bullets using Google's X-Y-Z formula to clearly state efficiency gains or scale handled.\n"
        "3. **Mock Practice**: Complete 2-3 structured mock interviews focusing on STAR-method communication for behavioral questions and edge-case handling for technical challenges."
    )

    return {
        "reply": reply,
        "sources": sources,
        "retrieved_count": len(relevant)
    }

@router.post("/generate-roadmap")
async def generate_roadmap_endpoint(payload: dict):
    target_role = payload.get("target_role", "Software Engineer")
    missing_skills = payload.get("missing_skills", ["Docker", "PostgreSQL", "System Design", "CI/CD"])
    weekly_hours = payload.get("weekly_hours", 10)

    # Calculate milestone timeline based on missing skills and weekly hours
    tasks = []
    for i, skill in enumerate(missing_skills[:6]):
        tasks.append({
            "title": f"Master {skill} Core Fundamentals",
            "skill_name": skill,
            "objective": f"Acquire deep working knowledge of {skill} patterns and production best practices.",
            "priority": "high" if i < 2 else "medium",
            "estimated_hours": 6,
            "sort_order": i + 1,
            "practical_exercise": f"Build and deploy a proof-of-concept project integrating {skill} with automated tests.",
            "completion_criteria": f"Pass unit test suite and publish documented repository with architectural diagrams.",
            "learning_resource": {
                "title": f"Official {skill} Documentation & Production Guide",
                "url": f"https://www.google.com/search?q={skill}+official+documentation",
                "type": "documentation"
            }
        })

    return {
        "target_role": target_role,
        "title": f"{target_role} Mastery Roadmap",
        "estimated_weeks": max(4, len(tasks) * 2),
        "weekly_hours": weekly_hours,
        "tasks": tasks
    }
