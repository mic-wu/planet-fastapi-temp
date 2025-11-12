from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from pydantic import BaseModel, Field
from uuid import uuid4


class Base(DeclarativeBase):
    pass

class OpeningPageResponse(BaseModel):
    """
    Model for the response returned by the root endpoint '/'.
    This response simply contains a welcome message for the user.
    """
    Message: str = Field(..., description="Welcome message from the app.")

class User(SQLAlchemyBaseUserTableUUID, Base):
    items = relationship("Item", back_populates="user", cascade="all, delete-orphan")


class Item(Base):
    __tablename__ = "items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    quantity = Column(Integer, nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)

    user = relationship("User", back_populates="items")


class Story(Base):
    __tablename__ = "planet_stories"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=True)
    format = Column(String, nullable=False)
    created = Column(DateTime(timezone=True), nullable=False)
    updated = Column(DateTime(timezone=True), nullable=False)
    center_long = Column(String, nullable=True)  # Using String to match Numeric from Supabase
    center_lat = Column(String, nullable=True)
    view_link = Column(String, nullable=True)

    def __repr__(self) -> str:  # pragma: no cover - convenience
        return f"<Story id={self.id} title={self.title!r}>"
