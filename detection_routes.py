import io
import csv
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models import User, Detection
from ..schemas import DetectionRecordResponse, PaginatedDetections
from ..auth import get_current_user

router = APIRouter(prefix="/detections", tags=["Detections History"])

@router.get("", response_model=PaginatedDetections)
def get_user_detections(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    source_type: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search and filter detection records owned by the authenticated user.
    """
    query = db.query(Detection).filter(Detection.user_id == current_user.id)

    if search:
        search_term = f"%{search.strip().upper()}%"
        query = query.filter(Detection.registration_number.ilike(search_term))

    if source_type and source_type.lower() != "all":
        query = query.filter(Detection.source_type == source_type.lower())

    if start_date:
        try:
            sd = datetime.fromisoformat(start_date)
            query = query.filter(Detection.created_at >= sd)
        except Exception:
            pass

    if end_date:
        try:
            ed = datetime.fromisoformat(end_date)
            query = query.filter(Detection.created_at <= ed)
        except Exception:
            pass

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    offset = (page - 1) * page_size

    items = query.order_by(desc(Detection.created_at)).offset(offset).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "items": items
    }

@router.get("/export/csv")
def export_detections_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export current user's detection history as a downloadable CSV.
    """
    records = db.query(Detection).filter(
        Detection.user_id == current_user.id
    ).order_by(desc(Detection.created_at)).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID",
        "Registration Number",
        "Normalized Plate",
        "Raw OCR Text",
        "Detection Confidence",
        "OCR Confidence",
        "Overall Confidence",
        "Source Type",
        "Status",
        "Created At"
    ])

    for r in records:
        status_label = "Uncertain" if r.is_uncertain else "Verified"
        writer.writerow([
            r.id,
            r.registration_number,
            r.normalized_number or "",
            r.raw_ocr_text or "",
            f"{int(r.detection_confidence * 100)}%",
            f"{int(r.ocr_confidence * 100)}%",
            f"{int(r.overall_confidence * 100)}%",
            r.source_type,
            status_label,
            r.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ])

    output.seek(0)
    filename = f"smartplate_history_{current_user.username}_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/{detection_id}", response_model=DetectionRecordResponse)
def get_detection_by_id(
    detection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(Detection).filter(
        Detection.id == detection_id,
        Detection.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Detection record not found.")
    return record

@router.delete("/{detection_id}")
def delete_detection(
    detection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(Detection).filter(
        Detection.id == detection_id,
        Detection.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Detection record not found or access denied.")

    db.delete(record)
    db.commit()
    return {"success": True, "message": "Detection record deleted successfully."}
