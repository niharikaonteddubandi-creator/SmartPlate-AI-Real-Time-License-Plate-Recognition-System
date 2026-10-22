import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    detections = relationship("Detection", back_populates="owner", cascade="all, delete-orphan")

class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Recognition outputs
    registration_number = Column(String(64), index=True, nullable=False)
    normalized_number = Column(String(64), index=True, nullable=True)
    raw_ocr_text = Column(String(255), nullable=True)
    
    # Confidence metrics (separated detection vs OCR)
    detection_confidence = Column(Float, nullable=False, default=0.0)
    ocr_confidence = Column(Float, nullable=False, default=0.0)
    overall_confidence = Column(Float, nullable=False, default=0.0)
    
    # Source & asset paths
    source_type = Column(String(20), nullable=False, default="image") # 'image', 'video', 'webcam'
    original_image_path = Column(String(255), nullable=True)
    annotated_image_path = Column(String(255), nullable=True)
    plate_crop_path = Column(String(255), nullable=True)
    
    # Coordinates & extra info
    bounding_box = Column(JSON, nullable=True) # {x, y, width, height}
    metadata_info = Column(JSON, nullable=True)
    is_uncertain = Column(Integer, default=0) # 1 if confidence below threshold
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    owner = relationship("User", back_populates="detections")
