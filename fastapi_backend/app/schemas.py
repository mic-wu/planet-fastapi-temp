import uuid

from fastapi_users import schemas
from pydantic import BaseModel
from uuid import UUID
from typing import Optional
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