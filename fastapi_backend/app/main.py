from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import stories as stories_router
from app.routes import chatbot as chatbot_router


app = FastAPI(
    title="Planet Story Explorer API",
    description="API for exploring Planet satellite imagery stories with chatbot assistance",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(
    stories_router.router,
    prefix="/api/v1/stories",
    tags=["stories"]
)
app.include_router(
    chatbot_router.router,
    prefix="/api/v1/chatbot",
    tags=["chatbot"]
)


@app.get("/", tags=["root"])
async def root():
    """API root endpoint."""
    return {
        "message": "Planet Story Explorer API",
        "version": "1.0.0",
        "endpoints": {
            "stories": "/api/v1/stories",
            "chatbot": "/api/v1/chatbot",
            "docs": "/docs"
        }
    }
 

@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "planet-story-explorer"}
