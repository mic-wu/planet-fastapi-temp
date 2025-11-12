import uuid

from fastapi_users import schemas
from pydantic import BaseModel
from uuid import UUID
from typing import Optional, Any
from datetime import datetime


class UserRead(schemas.BaseUser[uuid.UUID]):
    pass


class UserCreate(schemas.BaseUserCreate):
    pass


class UserUpdate(schemas.BaseUserUpdate):
    pass


class ItemBase(BaseModel):
    name: str
    description: str | None = None
    quantity: int | None = None


class ItemCreate(ItemBase):
    pass


class ItemRead(ItemBase):
    id: UUID
    user_id: UUID

    model_config = {"from_attributes": True}


# Story schemas for the API (matching frontend expectations)
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


# Legacy Story schemas (kept for compatibility with ORM model)
class StoryBase(BaseModel):
    title: str
    description: Optional[str] = None

class StoryCreate(StoryBase):
    pass

class StoryOut(StoryBase):
    id: int
    created_at: Optional[datetime]
    # pydantic v2 compatible: allow model validation from ORM objects
    model_config = {"from_attributes": True}

class Story(BaseModel):
    id: str
    title: Optional[str]
    author: Optional[str]
    format: Optional[str]
    created: Optional[str]
    updated: Optional[str]
    center_long: Optional[float]
    center_lat: Optional[float]
    embed_link: Optional[str]
    view_link: Optional[str]