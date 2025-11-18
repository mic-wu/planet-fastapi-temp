from typing import Set
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str

    # CORS - Allow all origins for public API, or specify domains
    # For public API: use ["*"]
    # For restricted: use ["https://your-frontend.vercel.app", "http://localhost:3000"]
    CORS_ORIGINS: Set[str] | list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
