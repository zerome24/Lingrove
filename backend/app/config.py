import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
# Load .env file from backend directory if present
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")

UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def normalize_database_url(url: str, base_dir: Path) -> str:
    if not url:
        return f"sqlite:///{base_dir / 'lingrove.db'}"
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    if url.startswith("sqlite:///"):
        path_str = url[10:]
        p = Path(path_str)
        if not p.is_absolute():
            if (path_str.startswith("backend/") or path_str.startswith("backend\\")) and base_dir.name == "backend":
                p = base_dir.parent / path_str
            else:
                p = base_dir / path_str
            return f"sqlite:///{p.resolve()}"
    return url

class Settings(BaseModel):
    APP_NAME: str = "LINGROVE API"
    APP_SUBTITLE: str = "Lingala Bamboo Products at CMRTC"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database URL: Supports MySQL (e.g., mysql+pymysql://user:pass@localhost:3306/lingrove)
    # Defaults to local SQLite lingrove.db for reliable local development
    FALLBACK_SQLITE_URL: str = f"sqlite:///{BASE_DIR / 'lingrove.db'}"
    DATABASE_URL: str = normalize_database_url(os.getenv("DATABASE_URL", ""), BASE_DIR)
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "lingrove-super-secret-cmrtc-bamboo-jwt-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # YouTube Data API v3 configuration
    YOUTUBE_API_KEY: str = os.getenv("YOUTUBE_API_KEY", "")
    
    # Gemini AI configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # Legacy / external AI fallback
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gpt-4o-mini")
    
    # CORS Origins (Explicit origins, never wildcard '*' with allow_credentials=True)
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
        ).split(",")
        if origin.strip() and origin.strip() != "*"
    ]
    
    # Business WhatsApp Configuration (Default: Lingrove CMRTC 919059076675)
    WHATSAPP_NUMBER: str = os.getenv("WHATSAPP_NUMBER", "919059076675")

settings = Settings()

# Validate production security
if settings.ENVIRONMENT.lower() == "production":
    if settings.JWT_SECRET == "lingrove-super-secret-cmrtc-bamboo-jwt-key-2026":
        raise ValueError("CRITICAL SECURITY ERROR: Default JWT_SECRET cannot be used in production. Set a unique JWT_SECRET in environment.")
