from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from app import schemas
from app.fetch_stories import supabase, TABLE_NAME

router = APIRouter()


def transform_story(row: dict) -> dict:
    """Transform Supabase row to StoryRead format."""
    # Parse center coordinates
    center_long = None
    center_lat = None
    if row.get("center_long"):
        try:
            center_long = float(row["center_long"])
        except (ValueError, TypeError):
            pass
    if row.get("center_lat"):
        try:
            center_lat = float(row["center_lat"])
        except (ValueError, TypeError):
            pass
    
    # Build story_metadata if we have any relevant data
    story_metadata = None
    if any([row.get("author"), center_long is not None, row.get("view_link")]):
        story_metadata = {
            "author": row.get("author"),
            "format": row["format"],
            "center": [center_long, center_lat],
            "view_link": row.get("view_link")
        }
    
    return {
        "story_id": row["id"],
        "id": row["id"],
        "title": row["title"],
        "format": row["format"],
        "author": row.get("author"),
        "created_at": row["created"] if isinstance(row.get("created"), str) else (row["created"].isoformat() if row.get("created") else None),
        "updated_at": row["updated"] if isinstance(row.get("updated"), str) else (row["updated"].isoformat() if row.get("updated") else None),
        "center_long": center_long,
        "center_lat": center_lat,
        "view_link": row.get("view_link"),
        # Client-generated fields (always null from backend)
        "category": None,
        "thumbnail_url": None,
        "image_url": None,
        "location": None,
        "description": None,
        "user_id": None,
        "story_metadata": story_metadata
    }


@router.get("/", response_model=schemas.PaginatedStoriesResponse, summary="List stories")
async def list_stories(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(12, ge=1, le=48, description="Number of stories per page"),
    category: Optional[str] = Query(None, description="Filter by category: 'image' or 'video'"),
    search: Optional[str] = Query(None, description="Search by title")
):
    """
    List stories with pagination and optional filtering.
    
    - **page**: Page number (starting from 1)
    - **limit**: Number of stories per page (max 48)
    - **category**: Filter by 'image' (format=raw) or 'video' (format=mp4)
    - **search**: Search stories by title (case-insensitive)
    """
    try:
        # Start building the query
        query = supabase.table(TABLE_NAME).select("*", count="exact")
        
        # Apply category filter by mapping to format field
        if category == "video":
            query = query.eq("format", "mp4")
        elif category == "image":
            query = query.eq("format", "raw")
        
        # Apply search filter
        if search:
            query = query.ilike("title", f"%{search}%")
        
        # Calculate offset for pagination
        offset = (page - 1) * limit
        
        # Apply pagination
        query = query.order("created", desc=True).range(offset, offset + limit - 1)
        
        # Execute query
        response = query.execute()
        
        # Get total count
        total_count = response.count if hasattr(response, 'count') and response.count is not None else 0
        
        # Transform stories
        stories = [transform_story(row) for row in (response.data or [])]
        
        # Calculate has_more
        has_more = (page * limit) < total_count
        
        return {
            "data": stories,
            "total": total_count,
            "page": page,
            "limit": limit,
            "has_more": has_more
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching stories: {str(e)}"
        )


@router.get("/{story_id}", response_model=schemas.StoryRead, summary="Get a story by ID")
async def get_story(story_id: str):
    """
    Get a single story by its ID.
    
    - **story_id**: The unique identifier of the story (string)
    """
    try:
        response = supabase.table(TABLE_NAME).select("*").eq("id", story_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Story not found"
            )
        
        story = transform_story(response.data[0])
        return story
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching story: {str(e)}"
        )
