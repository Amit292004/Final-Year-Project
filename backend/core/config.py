import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerFit AI - AI/ML Service"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    AI_SERVICE_TOKEN: str = "careerfit_ai_internal_secret_token_2026"
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    SPACY_MODEL: str = "en_core_web_md"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
