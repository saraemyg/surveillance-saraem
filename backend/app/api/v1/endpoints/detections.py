"""Detection API endpoints."""
import os

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, get_db
from app.models import Detection, User, Video
from app.schemas import DetectionResponse

router = APIRouter()


@router.get("/video/{video_id}", response_model=list[DetectionResponse])
def get_video_detections(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    min_confidence: float = 0.0,
) -> list[Detection]:
    """
    Get all detections for a specific video.

    Args:
        video_id: Video ID
        db: Database session
        current_user: Current authenticated user
        skip: Number of records to skip
        limit: Maximum number of records
        min_confidence: Minimum detection confidence

    Returns:
        List of detections
    """
    # Verify video exists
    video = db.query(Video).filter(Video.video_id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )

    # Query detections with attributes
    detections = (
        db.query(Detection)
        .options(joinedload(Detection.attributes))
        .filter(Detection.video_id == video_id)
        .filter(Detection.detection_confidence >= min_confidence)
        .order_by(Detection.frame_number)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return detections


@router.get("/{detection_id}", response_model=DetectionResponse)
def get_detection(
    detection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Detection:
    """
    Get a specific detection by ID.

    Args:
        detection_id: Detection ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Detection details
    """
    detection = (
        db.query(Detection)
        .options(joinedload(Detection.attributes))
        .filter(Detection.detection_id == detection_id)
        .first()
    )

    if not detection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection not found",
        )

    return detection


@router.get("/{detection_id}/image")
def get_detection_image(
    detection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FileResponse:
    """
    Get the cropped person image for a detection.

    Args:
        detection_id: Detection ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Image file response
    """
    detection = db.query(Detection).filter(Detection.detection_id == detection_id).first()

    if not detection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection not found",
        )

    if not detection.person_crop_path or not os.path.exists(detection.person_crop_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection image not found",
        )

    return FileResponse(
        detection.person_crop_path,
        media_type="image/jpeg",
        filename=f"detection_{detection_id}.jpg",
    )


@router.get("/video/{video_id}/summary")
def get_video_detection_summary(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Get summary statistics for detections in a video.

    Args:
        video_id: Video ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Detection summary statistics
    """
    # Verify video exists
    video = db.query(Video).filter(Video.video_id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )

    # Get all detections with attributes
    detections = (
        db.query(Detection)
        .options(joinedload(Detection.attributes))
        .filter(Detection.video_id == video_id)
        .all()
    )

    # Calculate summary
    total = len(detections)
    gender_counts = {"male": 0, "female": 0, "unknown": 0}
    upper_color_counts: dict[str, int] = {}
    lower_color_counts: dict[str, int] = {}

    for det in detections:
        for attr in det.attributes:
            if attr.gender:
                gender_counts[attr.gender] = gender_counts.get(attr.gender, 0) + 1

            if attr.upper_color:
                upper_color_counts[attr.upper_color] = (
                    upper_color_counts.get(attr.upper_color, 0) + 1
                )

            if attr.lower_color:
                lower_color_counts[attr.lower_color] = (
                    lower_color_counts.get(attr.lower_color, 0) + 1
                )

    return {
        "video_id": video_id,
        "total_detections": total,
        "gender_distribution": gender_counts,
        "upper_color_distribution": upper_color_counts,
        "lower_color_distribution": lower_color_counts,
    }
