import os
import uuid
import base64
import time
import shutil
import cv2
import numpy as np
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import User, Detection
from ..schemas import (
    RecognitionResponse,
    VideoRecognitionResponse,
    VideoFrameDetection,
    WebcamFramePayload,
    DetectionSaveRequest,
    DetectionRecordResponse
)
from ..auth import get_optional_user, get_current_user
from ..detector import detector_engine

router = APIRouter(prefix="/recognize", tags=["Recognition"])

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}

@router.get("/samples")
def get_sample_images():
    """Returns sample vehicle images available for instant demo testing."""
    samples = []
    if os.path.exists(settings.SAMPLES_DIR):
        for f in os.listdir(settings.SAMPLES_DIR):
            ext = os.path.splitext(f)[1].lower()
            if ext in ALLOWED_IMAGE_EXTENSIONS:
                samples.append({
                    "filename": f,
                    "name": f.replace("_", " ").split(".")[0].title(),
                    "url": f"/uploads/samples/{f}"
                })
    return samples

@router.post("/image", response_model=RecognitionResponse)
async def recognize_image(
    file: Optional[UploadFile] = File(None),
    sample_filename: Optional[str] = Form(None),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Validate file, process image, run plate detection & OCR pipeline,
    return original/annotated image URLs, bounding boxes, and recognized numbers.
    """
    input_bytes = None
    original_rel_path = None

    if file and file.filename:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported image format: {ext}. Allowed: JPG, JPEG, PNG, WEBP, BMP"
            )

        content = await file.read()
        if len(content) > 15 * 1024 * 1024: # 15MB limit
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image file exceeds 15MB upload limit."
            )
        input_bytes = content

        # Save original file
        orig_fname = f"orig_{uuid.uuid4().hex[:10]}{ext}"
        orig_dest = os.path.join(settings.ORIGINALS_DIR, orig_fname)
        with open(orig_dest, "wb") as f_out:
            f_out.write(content)
        original_rel_path = f"/uploads/originals/{orig_fname}"

    elif sample_filename:
        # Load from samples directory
        sample_path = os.path.join(settings.SAMPLES_DIR, sample_filename)
        if not os.path.exists(sample_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sample vehicle image not found."
            )
        with open(sample_path, "rb") as sf:
            input_bytes = sf.read()
        original_rel_path = f"/uploads/samples/{sample_filename}"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide an image file or choose a sample image."
        )

    try:
        result = detector_engine.process_image(input_bytes, save_annotated=True)
        result["original_image_url"] = original_rel_path
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image processing failed: {str(e)}"
        )

@router.post("/webcam-frame")
async def recognize_webcam_frame(payload: WebcamFramePayload):
    """
    Processes a live frame sent from the webcam in base64 format.
    Optimized for low-latency near-real-time live detection.
    """
    raw_data = payload.image_base64
    if "," in raw_data:
        raw_data = raw_data.split(",")[1]

    try:
        img_bytes = base64.b64decode(raw_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Invalid frame image")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not decode webcam frame")

    # Fast processing without disk file overhead for the whole annotated frame
    result = detector_engine.process_image(frame, save_annotated=False)
    result["source_type"] = "webcam"
    return result

@router.post("/video", response_model=VideoRecognitionResponse)
async def recognize_video(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Process video file, sample keyframes, detect license plates,
    deduplicate consecutive occurrences, and return temporal detection timeline.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported video format: {ext}. Allowed: MP4, AVI, MOV, WEBM, MKV"
        )

    # Save temp video
    temp_video_name = f"video_{uuid.uuid4().hex[:10]}{ext}"
    temp_video_path = os.path.join(settings.UPLOAD_DIR, temp_video_name)
    try:
        with open(temp_video_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to write uploaded video file")

    start_time = time.time()
    cap = cv2.VideoCapture(temp_video_path)
    if not cap.isOpened():
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        raise HTTPException(status_code=400, detail="Could not read video stream.")

    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration_sec = total_frames / fps if fps > 0 else 0.0

    # Sample ~ 1 to 2 frames per second to ensure fast and responsive processing
    frame_step = max(1, int(fps / 1.5))
    
    frame_idx = 0
    analyzed_count = 0
    detections: List[VideoFrameDetection] = []
    seen_plates = {} # plate_number -> last_seen_time

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % frame_step == 0:
            analyzed_count += 1
            timestamp = round(frame_idx / fps, 2)

            res = detector_engine.process_image(frame, save_annotated=False)
            for det in res["detections"]:
                plate_num = det["registration_number"]
                
                # Deduplication logic: prevent consecutive duplicates within 3.0 seconds
                last_time = seen_plates.get(plate_num)
                if last_time is not None and (timestamp - last_time < 3.0):
                    continue

                seen_plates[plate_num] = timestamp

                # Save preview frame for this occurrence
                frame_thumb_name = f"vframe_{uuid.uuid4().hex[:8]}_{frame_idx}.jpg"
                frame_thumb_path = os.path.join(settings.ORIGINALS_DIR, frame_thumb_name)
                cv2.imwrite(frame_thumb_path, frame)

                detections.append(VideoFrameDetection(
                    timestamp_seconds=timestamp,
                    frame_number=frame_idx,
                    registration_number=plate_num,
                    detection_confidence=det["detection_confidence"],
                    ocr_confidence=det["ocr_confidence"],
                    overall_confidence=det["overall_confidence"],
                    bounding_box=det["bounding_box"],
                    plate_crop_url=det["plate_crop_url"],
                    frame_preview_url=f"/uploads/originals/{frame_thumb_name}"
                ))

        frame_idx += 1
        # Limit processing to first 120 analyzed frames for safety
        if analyzed_count >= 120:
            break

    cap.release()
    # Clean temp video file
    if os.path.exists(temp_video_path):
        os.remove(temp_video_path)

    elapsed_ms = round((time.time() - start_time) * 1000, 1)
    unique_plates = sorted(list(set(d.registration_number for d in detections)))

    return VideoRecognitionResponse(
        success=True,
        status_message=f"Analyzed {analyzed_count} frames, identified {len(unique_plates)} unique vehicle(s)",
        video_filename=file.filename,
        total_frames_analyzed=analyzed_count,
        duration_seconds=round(duration_sec, 2),
        fps=round(fps, 1),
        detections=detections,
        unique_plates=unique_plates,
        processing_time_ms=elapsed_ms
    )

@router.post("/save", response_model=DetectionRecordResponse)
def save_detection(
    data: DetectionSaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save detection result to user's private history. Requires authentication.
    """
    record = Detection(
        user_id=current_user.id,
        registration_number=data.registration_number.strip().upper(),
        normalized_number=data.normalized_number or data.registration_number.strip().upper(),
        raw_ocr_text=data.raw_ocr_text,
        detection_confidence=data.detection_confidence,
        ocr_confidence=data.ocr_confidence,
        overall_confidence=data.overall_confidence,
        source_type=data.source_type,
        original_image_path=data.original_image_url,
        annotated_image_path=data.annotated_image_url,
        plate_crop_path=data.plate_crop_url,
        bounding_box=data.bounding_box,
        metadata_info=data.metadata_info,
        is_uncertain=1 if data.is_uncertain else 0
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
