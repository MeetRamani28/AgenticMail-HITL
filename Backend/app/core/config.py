import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "AgenticMail-HITL"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    
    DEFAULT_MODEL: str = "llama-3.3-70b-versatile"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()