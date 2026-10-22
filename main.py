import os
import cv2
import numpy as np
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import engine, Base, SessionLocal
from .models import User, Detection
from .auth import get_password_hash
from .routes import auth_routes, recognition_routes, detection_routes, analytics_routes
from .detector import detector_engine

def seed_database():
    sample_files = [
        ("MH 12 DE 1433", "sedan_white_plate.jpg", (50, 60, 140)),
        ("KA 05 NB 8820", "suv_blue_plate.jpg", (130, 50, 40)),
        ("DL 01 AB 4912", "hatchback_silver.jpg", (120, 120, 120)),
        ("TX 789 KLP", "coupe_red_plate.jpg", (30, 30, 180)),
    ]
    for text, fname, color in sample_files:
        fpath = os.path.join(settings.SAMPLES_DIR, fname)
        if not os.path.exists(fpath):
            create_synthetic_sample_vehicle(text, fname, color)

    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            demo_user = User(
                username="demouser",
                email="demo@smartplate.ai",
                hashed_password=get_password_hash("Demo123!"),
                full_name="Demo Operator"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            sample_detections = [
                Detection(
                    user_id=demo_user.id,
                    registration_number="MH 12 DE 1433",
                    normalized_number="MH 12 DE 1433",
                    raw_ocr_text="MH12DE1433",
                    detection_confidence=0.96,
                    ocr_confidence=0.94,
                    overall_confidence=0.95,
                    source_type="image",
                    original_image_path="/uploads/samples/sedan_white_plate.jpg",
                    annotated_image_path="/uploads/samples/sedan_white_plate.jpg",
                    plate_crop_path="/uploads/samples/sedan_white_plate.jpg",
                    bounding_box={"x": 240, "y": 230, "width": 240, "height": 70, "confidence": 0.96},
                    is_uncertain=0
                ),
                Detection(
                    user_id=demo_user.id,
                    registration_number="KA 05 NB 8820",
                    normalized_number="KA 05 NB 8820",
                    raw_ocr_text="KA05NB8820",
                    detection_confidence=0.92,
                    ocr_confidence=0.91,
                    overall_confidence=0.91,
                    source_type="video",
                    original_image_path="/uploads/samples/suv_blue_plate.jpg",
                    annotated_image_path="/uploads/samples/suv_blue_plate.jpg",
                    plate_crop_path="/uploads/samples/suv_blue_plate.jpg",
                    bounding_box={"x": 240, "y": 230, "width": 240, "height": 70, "confidence": 0.92},
                    is_uncertain=0
                ),
                Detection(
                    user_id=demo_user.id,
                    registration_number="DL 01 AB 4912",
                    normalized_number="DL 01 AB 4912",
                    raw_ocr_text="DL 01 AB 4912",
                    detection_confidence=0.88,
                    ocr_confidence=0.85,
                    overall_confidence=0.86,
                    source_type="webcam",
                    original_image_path="/uploads/samples/hatchback_silver.jpg",
                    annotated_image_path="/uploads/samples/hatchback_silver.jpg",
                    plate_crop_path="/uploads/samples/hatchback_silver.jpg",
                    bounding_box={"x": 240, "y": 230, "width": 240, "height": 70, "confidence": 0.88},
                    is_uncertain=0
                )
            ]
            for sd in sample_detections:
                db.add(sd)
            db.commit()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title="SmartPlate AI API",
    description="Real-Time Automatic License Plate Recognition System API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend web application
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files to serve uploaded images, plate crops, and samples
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routes
app.include_router(auth_routes.router, prefix="/api")
app.include_router(recognition_routes.router, prefix="/api")
app.include_router(detection_routes.router, prefix="/api")
app.include_router(analytics_routes.router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": "SmartPlate AI – Real-Time License Plate Recognition System",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "status": "operational"
    }

@app.get("/api/health")
def health_check():
    model_status = detector_engine.get_model_status()
    return {
        "status": "healthy",
        "model_status": model_status,
        "database": "connected"
    }

def create_synthetic_sample_vehicle(plate_text: str, filename: str, car_color=(45, 45, 55)):
    """Creates a high quality vehicle rear plate graphic for demo testing."""
    h, w = 480, 720
    img = np.zeros((h, w, 3), dtype=np.uint8)
    
    # Background road & garage gradient
    for y in range(h):
        grad = int(30 + (y / float(h)) * 40)
        img[y, :] = (grad, grad, grad + 10)
        
    # Car rear body
    cv2.rectangle(img, (100, 120), (620, 420), car_color, -1)
    # Car window tint
    cv2.rectangle(img, (160, 60), (560, 120), (25, 25, 25), -1)
    # Taillights (Red)
    cv2.rectangle(img, (110, 160), (190, 200), (30, 30, 220), -1)
    cv2.rectangle(img, (530, 160), (610, 200), (30, 30, 220), -1)
    # Bumper line
    cv2.line(img, (100, 360), (620, 360), (15, 15, 20), 4)
    # Exhaust pipes
    cv2.circle(img, (170, 395), 18, (80, 80, 90), -1)
    cv2.circle(img, (550, 395), 18, (80, 80, 90), -1)

    # License plate recess (dark gray indent)
    recess_x, recess_y, recess_w, recess_h = 240, 230, 240, 70
    cv2.rectangle(img, (recess_x - 10, recess_y - 8), (recess_x + recess_w + 10, recess_y + recess_h + 8), (20, 20, 25), -1)

    # Actual License Plate (White background with crisp black border)
    cv2.rectangle(img, (recess_x, recess_y), (recess_x + recess_w, recess_y + recess_h), (250, 250, 252), -1)
    cv2.rectangle(img, (recess_x, recess_y), (recess_x + recess_w, recess_y + recess_h), (10, 10, 10), 3)

    # Blue Euro/State strip on left
    strip_w = 26
    cv2.rectangle(img, (recess_x, recess_y), (recess_x + strip_w, recess_y + recess_h), (190, 80, 20), -1)
    cv2.putText(img, "IND", (recess_x + 3, recess_y + 42), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (255, 255, 255), 1, cv2.LINE_AA)

    # License Plate Text (Bold clear black letters)
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.95
    thickness = 3
    (tw, th), _ = cv2.getTextSize(plate_text, font, font_scale, thickness)
    text_x = recess_x + strip_w + int((recess_w - strip_w - tw) / 2)
    text_y = recess_y + int((recess_h + th) / 2)
    cv2.putText(img, plate_text, (text_x, text_y), font, font_scale, (15, 15, 15), thickness, cv2.LINE_AA)

    out_path = os.path.join(settings.SAMPLES_DIR, filename)
    cv2.imwrite(out_path, img)

@app.on_event("startup")
def on_startup():
    # 1. Initialize DB tables
    Base.metadata.create_all(bind=engine)
    
    # 2. Seed realistic vehicle samples if empty
    sample_files = [
        ("MH 12 DE 1433", "sedan_white_plate.jpg", (50, 60, 140)),
        ("KA 05 NB 8820", "suv_blue_plate.jpg", (130, 50, 40)),
        ("DL 01 AB 4912", "hatchback_silver.jpg", (120, 120, 120)),
        ("TX 789 KLP", "coupe_red_plate.jpg", (30, 30, 180)),
    ]
    for text, fname, color in sample_files:
        fpath = os.path.join(settings.SAMPLES_DIR, fname)
        if not os.path.exists(fpath):
            create_synthetic_sample_vehicle(text, fname, color)

    # 3. Seed demo user if no users exist
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            demo_user = User(
                username="demouser",
                email="demo@smartplate.ai",
                hashed_password=get_password_hash("Demo123!"),
                full_name="Demo Operator"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            # Seed realistic initial records
            sample_detections = [
                Detection(
                    user_id=demo_user.id,
                    registration_number="MH 12 DE 1433",
                    normalized_number="MH 12 DE 1433",
                    raw_ocr_text="MH12DE1433",
                    detection_confidence=0.96,
                    ocr_confidence=0.94,
                    overall_confidence=0.95,
                    source_type="image",
                    original_image_path="/uploads/samples/sedan_white_plate.jpg",
                    annotated_image_path="/uploads/samples/sedan_white_plate.jpg",
                    plate_crop_path="/uploads/samples/sedan_white_plate.jpg",
                    bounding_box={"x": 240, "y": 230, "width": 240, "height": 70, "confidence": 0.96},
                    is_uncertain=0
                ),
                Detection(
                    user_id=demo_user.id,
                    registration_number="KA 05 NB 8820",
                    normalized_number="KA 05 NB 8820",
                    raw_ocr_text="KA05NB8820",
                    detection_confidence=0.92,
                    ocr_confidence=0.91,
                    overall_confidence=0.91,
                    source_type="video",
                    original_image_path="/uploads/samples/suv_blue_plate.jpg",
                    annotated_image_path="/uploads/samples/suv_blue_plate.jpg",
                    plate_crop_path="/uploads/samples/suv_blue_plate.jpg",
                    bounding_box={"x": 240, "y": 230, "width": 240, "height": 70, "confidence": 0.92},
                    is_uncertain=0
                ),
                Detection(
                    user_id=demo_user.id,
                    registration_number="DL 01 AB 4912",
                    normalized_number="DL 01 AB 4912",
                    raw_ocr_text="DL 01 AB 4912",
                    detection_confidence=0.88,
                    ocr_confidence=0.85,
                    overall_confidence=0.86,
                    source_type="webcam",
                    original_image_path="/uploads/samples/hatchback_silver.jpg",
                    annotated_image_path="/uploads/samples/hatchback_silver.jpg",
                    plate_crop_path="/uploads/samples/hatchback_silver.jpg",
                    bounding_box={"x": 240, "y": 230, "width": 240, "height": 70, "confidence": 0.88},
                    is_uncertain=0
                )
            ]
            for sd in sample_detections:
                db.add(sd)
            db.commit()
    finally:
        db.close()
