import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
# Load .env from backend directory and project root
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")

UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class Settings:
    PROJECT_NAME: str = "CrisisAI - Multi-Agent Crisis Command Centre"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/crisisai.db")
    
    # Gemini API Settings (Loaded securely from .env)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_PRIMARY_MODEL: str = os.getenv("GEMINI_PRIMARY_MODEL", "gemini-3.5-flash-lite")
    GEMINI_FALLBACK_MODELS: list = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.5-flash"]
    
    # AI Fallback Mode flag (ensures graceful handling if quota or network fails)
    AI_FALLBACK_MODE: bool = True
    
    # Demo coordinate baseline (Metro Region)
    DEFAULT_LAT: float = 37.7749
    DEFAULT_LNG: float = -122.4194

settings = Settings()
