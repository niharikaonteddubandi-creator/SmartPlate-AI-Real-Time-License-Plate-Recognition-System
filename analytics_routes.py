from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from ..database import get_db
from ..models import User, Detection
from ..schemas import AnalyticsSummary
from ..auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsSummary)
def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes real analytics and trend data for the authenticated user from the database.
    """
    user_id = current_user.id
    
    # Total detections
    total_detections = db.query(Detection).filter(Detection.user_id == user_id).count()

    # Unique registration numbers
    unique_plates = db.query(func.count(func.distinct(Detection.registration_number))).filter(
        Detection.user_id == user_id
    ).scalar() or 0

    # Average confidence
    avg_conf = db.query(func.avg(Detection.overall_confidence)).filter(
        Detection.user_id == user_id
    ).scalar() or 0.0

    # Today's detections
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    detections_today = db.query(Detection).filter(
        Detection.user_id == user_id,
        Detection.created_at >= today_start
    ).count()

    # Source breakdown (image vs video vs webcam)
    sources = db.query(
        Detection.source_type, func.count(Detection.id)
    ).filter(Detection.user_id == user_id).group_by(Detection.source_type).all()
    
    source_breakdown = {"image": 0, "video": 0, "webcam": 0}
    for s_type, cnt in sources:
        if s_type in source_breakdown:
            source_breakdown[s_type] = cnt
        else:
            source_breakdown[s_type] = cnt

    # Daily trends (last 7 days)
    daily_trends = []
    now = datetime.utcnow()
    for i in range(6, -1, -1):
        day_date = now - timedelta(days=i)
        day_start = day_date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        day_label = day_start.strftime("%a (%b %d)")
        
        count = db.query(Detection).filter(
            Detection.user_id == user_id,
            Detection.created_at >= day_start,
            Detection.created_at <= day_end
        ).count()
        
        daily_trends.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "label": day_label,
            "count": count
        })

    # Confidence distribution: High (>=85%), Medium (65%-84%), Uncertain (<65%)
    high_conf = db.query(Detection).filter(Detection.user_id == user_id, Detection.overall_confidence >= 0.85).count()
    med_conf = db.query(Detection).filter(
        Detection.user_id == user_id,
        Detection.overall_confidence >= 0.65,
        Detection.overall_confidence < 0.85
    ).count()
    uncertain_conf = db.query(Detection).filter(Detection.user_id == user_id, Detection.overall_confidence < 0.65).count()

    confidence_dist = {
        "High (>=85%)": high_conf,
        "Moderate (65-84%)": med_conf,
        "Uncertain (<65%)": uncertain_conf
    }

    # Recent activity stream (last 8)
    recent = db.query(Detection).filter(
        Detection.user_id == user_id
    ).order_by(desc(Detection.created_at)).limit(8).all()

    return {
        "total_detections": total_detections,
        "unique_plates": unique_plates,
        "avg_confidence": round(float(avg_conf), 2),
        "detections_today": detections_today,
        "source_breakdown": source_breakdown,
        "daily_trends": daily_trends,
        "confidence_distribution": confidence_dist,
        "recent_activity": recent
    }
