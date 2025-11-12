from fastapi import FastAPI, Depends
from fastapi.responses import RedirectResponse
from fastapi_pagination import add_pagination
from .schemas import UserCreate, UserRead, UserUpdate
from .users import auth_backend, fastapi_users, AUTH_URL_PATH
from fastapi.middleware.cors import CORSMiddleware
from .utils import simple_generate_unique_route_id
from app.routes.items import router as items_router
from app.routes.chatbot import router as chatbot_router
from app.config import settings
from app.routes import stories as stories_router
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.database import engine, Base
from app import models as app_models
from app import schemas as app_schemas
from typing import List
from .models import *
from . import fetch_stories as planet_stories
import asyncio
from dotenv import load_dotenv


app = FastAPI(
    generate_unique_id_function=simple_generate_unique_route_id,
    openapi_url=settings.OPENAPI_URL,
)

# Middleware for CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication and user management routes
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix=f"/{AUTH_URL_PATH}/jwt",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix=f"/{AUTH_URL_PATH}",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix=f"/{AUTH_URL_PATH}",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix=f"/{AUTH_URL_PATH}",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)
app.include_router(
    stories_router.router, 
    prefix="/api/v1/stories", 
    tags=["stories"]
)

# Include items routes
app.include_router(items_router, prefix="/items")

# Include chatbot routes
app.include_router(chatbot_router, prefix="/chatbot", tags=["chatbot"])

add_pagination(app)

# Provide a friendly root route that redirects to the interactive docs
@app.get("/", tags = ["root"], response_model=List[app_schemas.Story], summary="Get all stories")
async def root_get_stories(db: AsyncSession = Depends(get_async_session)):
    """Return all stories currently in Supabase."""
    try:
        response = planet_stories.supabase.table(planet_stories.TABLE_NAME).select("*").execute()
        return response.data or []
    except Exception as e:
        print(f"Error fetching stories from Supabase: {e}")
        return []


def load_stories():
    """Helper to call fetch_stories.py functions synchronously."""
    stories = planet_stories.fetch_stories(limit=20)
    if stories:
        planet_stories.store_stories(stories)

@app.on_event("startup")
async def on_startup():
    print("🔄 Fetching Planet stories on startup...")

    # Run in a background thread since Supabase + requests are sync
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, load_stories)

    print("✅ Planet stories fetched and stored.")