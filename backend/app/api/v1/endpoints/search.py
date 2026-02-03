"""Search API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import SearchHistory, User
from app.schemas import (
    AdvancedSearchQuery,
    NaturalLanguageQuery,
    ParsedQuery,
    SearchHistoryItem,
    SearchResponse,
)
from app.services import get_nlp_parser, get_search_engine

router = APIRouter()


@router.post("/query", response_model=SearchResponse)
def natural_language_search(
    query: NaturalLanguageQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SearchResponse:
    """
    Search detections using natural language query.

    Args:
        query: Natural language query
        db: Database session
        current_user: Current authenticated user

    Returns:
        Search results
    """
    # Parse the query
    parser = get_nlp_parser()
    parsed = parser.parse_query(query.query)

    parsed_query = ParsedQuery(
        gender=parsed.get("gender"),
        upper_color=parsed.get("upper_color"),
        lower_color=parsed.get("lower_color"),
        raw_query=query.query,
    )

    # Execute search
    search_engine = get_search_engine(db)
    results, total_count = search_engine.search(
        gender=parsed.get("gender"),
        upper_color=parsed.get("upper_color"),
        lower_color=parsed.get("lower_color"),
        min_confidence=query.min_confidence,
        limit=query.limit,
        offset=query.offset,
    )

    # Save to search history
    history_entry = SearchHistory(
        user_id=current_user.user_id,
        query_text=query.query,
        parsed_attributes=parsed,
        result_count=total_count,
    )
    db.add(history_entry)
    db.commit()

    return SearchResponse(
        query=query.query,
        parsed_attributes=parsed_query,
        total_count=total_count,
        results=results,
    )


@router.post("/advanced", response_model=SearchResponse)
def advanced_search(
    query: AdvancedSearchQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SearchResponse:
    """
    Search detections using structured attribute filters.

    Args:
        query: Advanced search query with filters
        db: Database session
        current_user: Current authenticated user

    Returns:
        Search results
    """
    # Execute search
    search_engine = get_search_engine(db)
    results, total_count = search_engine.search_advanced(query)

    # Build query description for history
    query_parts = []
    if query.gender:
        query_parts.append(f"gender={query.gender}")
    if query.upper_color:
        query_parts.append(f"upper={query.upper_color}")
    if query.lower_color:
        query_parts.append(f"lower={query.lower_color}")
    query_text = ", ".join(query_parts) if query_parts else "all"

    parsed_query = ParsedQuery(
        gender=query.gender,
        upper_color=query.upper_color,
        lower_color=query.lower_color,
        raw_query=query_text,
    )

    # Save to search history
    history_entry = SearchHistory(
        user_id=current_user.user_id,
        query_text=query_text,
        parsed_attributes={
            "gender": query.gender,
            "upper_color": query.upper_color,
            "lower_color": query.lower_color,
            "min_confidence": query.min_confidence,
        },
        result_count=total_count,
    )
    db.add(history_entry)
    db.commit()

    return SearchResponse(
        query=query_text,
        parsed_attributes=parsed_query,
        total_count=total_count,
        results=results,
    )


@router.get("/history", response_model=list[SearchHistoryItem])
def get_search_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 20,
) -> list[SearchHistory]:
    """
    Get user's search history.

    Args:
        db: Database session
        current_user: Current authenticated user
        limit: Maximum number of records

    Returns:
        List of search history items
    """
    history = (
        db.query(SearchHistory)
        .filter(SearchHistory.user_id == current_user.user_id)
        .order_by(SearchHistory.search_timestamp.desc())
        .limit(limit)
        .all()
    )

    return history


@router.delete("/history/{search_id}")
def delete_search_history_item(
    search_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """
    Delete a search history item.

    Args:
        search_id: Search history ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Deletion confirmation
    """
    history_item = (
        db.query(SearchHistory)
        .filter(
            SearchHistory.search_id == search_id,
            SearchHistory.user_id == current_user.user_id,
        )
        .first()
    )

    if not history_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Search history item not found",
        )

    db.delete(history_item)
    db.commit()

    return {"message": "Search history item deleted"}


@router.delete("/history")
def clear_search_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """
    Clear all search history for current user.

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        Deletion confirmation
    """
    db.query(SearchHistory).filter(
        SearchHistory.user_id == current_user.user_id
    ).delete()
    db.commit()

    return {"message": "Search history cleared"}
