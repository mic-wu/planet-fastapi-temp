from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app import schemas, models
from app.database import get_async_session

router = APIRouter()


def transform_stories(items):
    return [schemas.StoryOut.model_validate(item) for item in items]


@router.get("/", response_model=List[schemas.StoryOut], summary="List stories")
async def list_stories(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_async_session)):
    stmt = select(models.Story).offset(skip).limit(limit)
    result = await db.execute(stmt)
    stories = result.scalars().all()
    return transform_stories(stories)


@router.get("/{story_id}", response_model=schemas.StoryOut, summary="Get a story by ID")
async def get_story(story_id: int, db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(models.Story).filter(models.Story.id == story_id))
    story = result.scalars().first()
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    return schemas.StoryOut.model_validate(story)


@router.post("/", response_model=schemas.StoryOut, status_code=status.HTTP_201_CREATED)
async def create_story(payload: schemas.StoryCreate, db: AsyncSession = Depends(get_async_session)):
    story = models.Story(**payload.model_dump())
    db.add(story)
    await db.commit()
    await db.refresh(story)
    return schemas.StoryOut.model_validate(story)
