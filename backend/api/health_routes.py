from fastapi import APIRouter
from backend.core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "embedding_dimension": settings.EMBEDDING_DIMENSION,
        "llm_provider": "groq" if settings.GROQ_API_KEY else "rule_based_fallback"
    }

@router.get("/ready")
def readiness_check():
    return {
        "status": "ready",
        "service": settings.PROJECT_NAME
    }
