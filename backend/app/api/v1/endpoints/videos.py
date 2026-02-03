"""Video management API endpoints."""
import asyncio
import os
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.models import User, Video
from app.schemas import VideoResponse, VideoProcessingStatus
from app.services import get_video_processor
from app.utils import (
    is_valid_video,
    save_upload_file,
    get_video_metadata,
    delete_file,
    delete_directory,
    get_file_size_mb,
)

router = APIRouter()

# Store for WebSocket connections (simple in-memory for demo)
processing_status: dict[int, VideoProcessingStatus] = {}


@router.post("/upload", response_model=VideoResponse)
async def upload_video(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Video:
    """
    Upload a video file for processing.

    Args:
        file: Video file to upload
        db: Database session
        current_user: Current authenticated user

    Returns:
        Created video record
    """
    # Validate file type
    if not file.filename or not is_valid_video(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid video format. Allowed: mp4, avi, mov, mkv, wmv, flv",
        )

    # Save file
    videos_dir = os.path.join(settings.UPLOAD_DIR, "videos")
    file_path = await save_upload_file(file, videos_dir)

    # Check file size
    file_size = get_file_size_mb(file_path)
    if file_size > settings.MAX_UPLOAD_SIZE_MB:
        delete_file(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    try:
        # Extract video metadata
        metadata = get_video_metadata(file_path)

        # Create video record
        video = Video(
            filename=file.filename,
            file_path=file_path,
            duration_seconds=metadata["duration_seconds"],
            fps=metadata["fps"],
            resolution=metadata["resolution"],
            total_frames=metadata["total_frames"],
            processing_status="uploaded",
            uploaded_by=current_user.user_id,
        )
        db.add(video)
        db.commit()
        db.refresh(video)

        return video

    except Exception as e:
        delete_file(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing video: {str(e)}",
        )


@router.post("/{video_id}/process", response_model=dict[str, Any])
async def process_video(
    video_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Start processing a video for person detection.

    Args:
        video_id: Video ID to process
        background_tasks: FastAPI background tasks
        db: Database session
        current_user: Current authenticated user

    Returns:
        Processing status
    """
    video = db.query(Video).filter(Video.video_id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )

    if video.processing_status == "processing":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Video is already being processed",
        )

    # Initialize processing status
    processing_status[video_id] = VideoProcessingStatus(
        video_id=video_id,
        status="processing",
        progress=0,
        total_frames=video.total_frames,
    )

    # Start processing in background
    def update_status(status_data: dict[str, Any]) -> None:
        processing_status[video_id] = VideoProcessingStatus(**status_data)

    async def run_processing() -> None:
        processor = get_video_processor(db)
        await processor.process_video(video_id, progress_callback=update_status)

    background_tasks.add_task(asyncio.create_task, run_processing())

    return {
        "message": "Processing started",
        "video_id": video_id,
        "status": "processing",
    }


@router.get("/{video_id}/status", response_model=VideoProcessingStatus)
def get_processing_status(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VideoProcessingStatus:
    """
    Get current processing status for a video.

    Args:
        video_id: Video ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Processing status
    """
    video = db.query(Video).filter(Video.video_id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )

    if video_id in processing_status:
        return processing_status[video_id]

    # Return status from database
    return VideoProcessingStatus(
        video_id=video_id,
        status=video.processing_status,
        progress=100 if video.processing_status == "completed" else 0,
        total_frames=video.total_frames,
    )


@router.get("/{video_id}", response_model=VideoResponse)
def get_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Video:
    """
    Get video details by ID.

    Args:
        video_id: Video ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Video details
    """
    video = db.query(Video).filter(Video.video_id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )
    return video


@router.get("", response_model=list[VideoResponse])
def list_videos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50,
    status_filter: str | None = None,
) -> list[Video]:
    """
    List all videos with optional filtering.

    Args:
        db: Database session
        current_user: Current authenticated user
        skip: Number of records to skip
        limit: Maximum number of records
        status_filter: Optional status filter

    Returns:
        List of videos
    """
    query = db.query(Video)

    if status_filter:
        query = query.filter(Video.processing_status == status_filter)

    videos = query.order_by(Video.upload_timestamp.desc()).offset(skip).limit(limit).all()
    return videos


@router.delete("/{video_id}")
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """
    Delete a video and its associated data.

    Args:
        video_id: Video ID to delete
        db: Database session
        current_user: Current authenticated user

    Returns:
        Deletion confirmation
    """
    video = db.query(Video).filter(Video.video_id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )

    # Delete video file
    if video.file_path:
        delete_file(video.file_path)

    # Delete crops directory
    crops_dir = os.path.join(settings.UPLOAD_DIR, "crops", str(video_id))
    delete_directory(crops_dir)

    # Delete from database (cascades to detections and attributes)
    db.delete(video)
    db.commit()

    # Remove from processing status if present
    if video_id in processing_status:
        del processing_status[video_id]

    return {"message": "Video deleted successfully"}
