"""Performance metrics API endpoints."""
from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, get_db
from app.models import Attribute, Detection, PerformanceMetric, User, Video
from app.schemas import (
    ColorDistribution,
    GenderDistribution,
    MetricsDetail,
    MetricsSummary,
    VideoMetrics,
)

router = APIRouter()


@router.get("/summary", response_model=MetricsSummary)
def get_metrics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MetricsSummary:
    """
    Get overall system metrics summary.

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        Aggregated metrics summary
    """
    # Total videos
    total_videos = db.query(func.count(Video.video_id)).scalar() or 0

    # Total detections
    total_detections = db.query(func.count(Detection.detection_id)).scalar() or 0

    # Average FPS and processing time from performance metrics
    metrics_stats = db.query(
        func.avg(PerformanceMetric.avg_fps),
        func.avg(PerformanceMetric.area_reduction_percentage),
        func.sum(PerformanceMetric.processing_time_seconds),
    ).first()

    average_fps = metrics_stats[0] or 0.0
    average_area_reduction = metrics_stats[1] or 0.0
    total_processing_time = metrics_stats[2] or 0.0

    return MetricsSummary(
        total_videos=total_videos,
        total_detections=total_detections,
        average_fps=round(average_fps, 2),
        average_area_reduction=round(average_area_reduction, 2),
        total_processing_time=round(total_processing_time, 2),
    )


@router.get("/videos", response_model=list[VideoMetrics])
def get_video_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 20,
) -> list[VideoMetrics]:
    """
    Get performance metrics per video.

    Args:
        db: Database session
        current_user: Current authenticated user
        limit: Maximum number of records

    Returns:
        List of video metrics
    """
    # Query videos with their metrics
    results = (
        db.query(Video, PerformanceMetric)
        .outerjoin(PerformanceMetric, Video.video_id == PerformanceMetric.video_id)
        .order_by(Video.upload_timestamp.desc())
        .limit(limit)
        .all()
    )

    video_metrics = []
    for video, metric in results:
        # Count detections for this video
        detection_count = (
            db.query(func.count(Detection.detection_id))
            .filter(Detection.video_id == video.video_id)
            .scalar() or 0
        )

        video_metrics.append(VideoMetrics(
            video_id=video.video_id,
            filename=video.filename,
            avg_fps=metric.avg_fps if metric else None,
            total_detections=detection_count,
            processing_time_seconds=metric.processing_time_seconds if metric else None,
            area_reduction_percentage=metric.area_reduction_percentage if metric else None,
            recorded_at=metric.recorded_at if metric else video.upload_timestamp,
        ))

    return video_metrics


@router.get("/attributes", response_model=MetricsDetail)
def get_attribute_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MetricsDetail:
    """
    Get attribute distribution metrics.

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        Detailed metrics with attribute distributions
    """
    # Get summary first
    summary = get_metrics_summary(db, current_user)

    # Gender distribution
    gender_counts = (
        db.query(Attribute.gender, func.count(Attribute.attribute_id))
        .filter(Attribute.gender.isnot(None))
        .group_by(Attribute.gender)
        .all()
    )

    gender_dist = {"male": 0, "female": 0, "unknown": 0}
    for gender, count in gender_counts:
        if gender in gender_dist:
            gender_dist[gender] = count

    # Upper color distribution (top 10)
    upper_colors = (
        db.query(Attribute.upper_color, func.count(Attribute.attribute_id))
        .filter(Attribute.upper_color.isnot(None))
        .group_by(Attribute.upper_color)
        .order_by(func.count(Attribute.attribute_id).desc())
        .limit(10)
        .all()
    )

    upper_color_dist = [
        ColorDistribution(color=color, count=count)
        for color, count in upper_colors
    ]

    # Lower color distribution (top 10)
    lower_colors = (
        db.query(Attribute.lower_color, func.count(Attribute.attribute_id))
        .filter(Attribute.lower_color.isnot(None))
        .group_by(Attribute.lower_color)
        .order_by(func.count(Attribute.attribute_id).desc())
        .limit(10)
        .all()
    )

    lower_color_dist = [
        ColorDistribution(color=color, count=count)
        for color, count in lower_colors
    ]

    return MetricsDetail(
        summary=summary,
        gender_distribution=GenderDistribution(**gender_dist),
        upper_color_distribution=upper_color_dist,
        lower_color_distribution=lower_color_dist,
    )


@router.get("/recent-activity")
def get_recent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 10,
) -> list[dict]:
    """
    Get recent processing activity.

    Args:
        db: Database session
        current_user: Current authenticated user
        limit: Maximum number of records

    Returns:
        List of recent activity items
    """
    # Get recently processed videos
    recent_videos = (
        db.query(Video)
        .filter(Video.processing_status.in_(["completed", "processing", "failed"]))
        .order_by(Video.upload_timestamp.desc())
        .limit(limit)
        .all()
    )

    activities = []
    for video in recent_videos:
        # Get detection count
        detection_count = (
            db.query(func.count(Detection.detection_id))
            .filter(Detection.video_id == video.video_id)
            .scalar() or 0
        )

        # Get performance metric if available
        metric = (
            db.query(PerformanceMetric)
            .filter(PerformanceMetric.video_id == video.video_id)
            .first()
        )

        activities.append({
            "video_id": video.video_id,
            "filename": video.filename,
            "status": video.processing_status,
            "timestamp": video.upload_timestamp.isoformat(),
            "detection_count": detection_count,
            "processing_time": metric.processing_time_seconds if metric else None,
            "duration": video.duration_seconds,
        })

    return activities
