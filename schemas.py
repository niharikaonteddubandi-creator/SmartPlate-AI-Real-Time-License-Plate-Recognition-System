from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int
    confidence: float

class PlateDetectionResult(BaseModel):
    registration_number: str
    normalized_number: Optional[str] = None
    raw_ocr_text: Optional[str] = None
    detection_confidence: float
    ocr_confidence: float
    overall_confidence: float
    bounding_box: Optional[BoundingBox] = None
    plate_crop_url: Optional[str] = None
    is_uncertain: bool = False

class RecognitionResponse(BaseModel):
    success: bool
    status_message: str
    source_type: str
    original_image_url: Optional[str] = None
    annotated_image_url: Optional[str] = None
    detections: List[PlateDetectionResult] = []
    processing_time_ms: float
    model_info: Dict[str, Any] = {}

class VideoFrameDetection(BaseModel):
    timestamp_seconds: float
    frame_number: int
    registration_number: str
    detection_confidence: float
    ocr_confidence: float
    overall_confidence: float
    bounding_box: Optional[BoundingBox] = None
    plate_crop_url: Optional[str] = None
    frame_preview_url: Optional[str] = None

class VideoRecognitionResponse(BaseModel):
    success: bool
    status_message: str
    video_filename: str
    total_frames_analyzed: int
    duration_seconds: float
    fps: float
    detections: List[VideoFrameDetection] = []
    unique_plates: List[str] = []
    processing_time_ms: float

class WebcamFramePayload(BaseModel):
    image_base64: str

class DetectionSaveRequest(BaseModel):
    registration_number: str
    normalized_number: Optional[str] = None
    raw_ocr_text: Optional[str] = None
    detection_confidence: float
    ocr_confidence: float
    overall_confidence: float
    source_type: str
    original_image_url: Optional[str] = None
    annotated_image_url: Optional[str] = None
    plate_crop_url: Optional[str] = None
    bounding_box: Optional[Dict[str, Any]] = None
    metadata_info: Optional[Dict[str, Any]] = None
    is_uncertain: bool = False

class DetectionRecordResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    registration_number: str
    normalized_number: Optional[str] = None
    raw_ocr_text: Optional[str] = None
    detection_confidence: float
    ocr_confidence: float
    overall_confidence: float
    source_type: str
    original_image_path: Optional[str] = None
    annotated_image_path: Optional[str] = None
    plate_crop_path: Optional[str] = None
    bounding_box: Optional[Dict[str, Any]] = None
    metadata_info: Optional[Dict[str, Any]] = None
    is_uncertain: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PaginatedDetections(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[DetectionRecordResponse]

class AnalyticsSummary(BaseModel):
    total_detections: int
    unique_plates: int
    avg_confidence: float
    detections_today: int
    source_breakdown: Dict[str, int]
    daily_trends: List[Dict[str, Any]]
    confidence_distribution: Dict[str, int]
    recent_activity: List[DetectionRecordResponse]
