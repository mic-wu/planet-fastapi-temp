from pydantic import BaseModel
from typing import Optional, Any


class StoryRead(BaseModel):
    """Schema for reading a story, matching the frontend StoryRead type."""
    story_id: str
    id: str
    title: str
    format: str
    author: Optional[str] = None
    created_at: str
    updated_at: str
    center_long: Optional[float] = None
    center_lat: Optional[float] = None
    view_link: Optional[str] = None
    # Client-generated fields (always null from backend)
    category: Optional[str] = None
    thumbnail_url: Optional[str] = None
    image_url: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    user_id: Optional[str] = None
    story_metadata: Optional[dict[str, Any]] = None

    model_config = {"from_attributes": True}


class PaginatedStoriesResponse(BaseModel):
    """Paginated response for stories list endpoint."""
    data: list[StoryRead]
    total: int
    page: int
    limit: int
    has_more: bool


class ChatRequest(BaseModel):
    """Request model for chat messages."""
    message: str
    context: dict[str, Any] | None = None


class ChatResponse(BaseModel):
    """Response model for chat messages."""
    response: str
    tool_used: str | None = None
    metadata: dict[str, Any] | None = None
