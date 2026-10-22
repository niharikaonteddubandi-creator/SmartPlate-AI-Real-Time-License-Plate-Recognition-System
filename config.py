import os

class Settings:
    PROJECT_NAME: str = "SmartPlate AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smartplate_ai_super_secret_jwt_key_2026_change_in_production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartplate.db")
    
    # Upload directories
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    ORIGINALS_DIR: str = os.path.join(UPLOAD_DIR, "originals")
    PLATES_DIR: str = os.path.join(UPLOAD_DIR, "plates")
    SAMPLES_DIR: str = os.path.join(UPLOAD_DIR, "samples")
    
    # AI and Detection Settings
    DETECTION_CONFIDENCE_THRESHOLD: float = float(os.getenv("DETECTION_CONFIDENCE_THRESHOLD", "0.40"))
    OCR_CONFIDENCE_THRESHOLD: float = float(os.getenv("OCR_CONFIDENCE_THRESHOLD", "0.35"))
    YOLO_MODEL_PATH: str = os.getenv("YOLO_MODEL_PATH", os.path.join(BASE_DIR, "models", "license_plate_yolo.pt"))

    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()

# Ensure directories exist
for folder in [settings.UPLOAD_DIR, settings.ORIGINALS_DIR, settings.PLATES_DIR, settings.SAMPLES_DIR]:
    os.makedirs(folder, exist_ok=True)
