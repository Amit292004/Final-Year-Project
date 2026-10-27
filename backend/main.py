from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.core.logging import logger
from backend.api.health_routes import router as health_router
from backend.api.routes import router as core_router
from backend.api.interview_routes import router as interview_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CareerFit AI dedicated AI/ML service handling NLP, ATS scoring, semantic matching, and interview prep.",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health_router)
app.include_router(core_router, prefix="/api/v1")
app.include_router(interview_router, prefix="/api/v1")

@app.on_event("startup")
async def on_startup():
    logger.info(f"Starting {settings.PROJECT_NAME} on port {settings.PORT}...")
    logger.info(f"Embedding model configured with dimension: {settings.EMBEDDING_DIMENSION}")
    if settings.GROQ_API_KEY:
        logger.info(f"Groq LLM active with model: {settings.GROQ_MODEL}")
    else:
        logger.info("GROQ_API_KEY not set — using deterministic rule-based AI engine fallback.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
