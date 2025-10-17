import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ACT Gen1 API"

    # JWT
    JWT_SECRET: str = "CHANGE_ME_SUPER_SECRET"
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    # DB - Read from environment variable, with SQLite default for local dev
    # On Railway, this will be set to PostgreSQL connection string
    DATABASE_URL: str = "sqlite+aiosqlite:///./dev.db?check_same_thread=False"

    class Config:
        env_file = ".env"

settings = Settings()

# Debug: Log what DATABASE_URL we're using
print(f"📊 Initial DATABASE_URL: {settings.DATABASE_URL[:60] if settings.DATABASE_URL else 'NOT SET'}...")
print(f"📊 Environment DATABASE_URL exists: {'DATABASE_URL' in os.environ}")

# Convert standard PostgreSQL URL to async format if needed
if settings.DATABASE_URL.startswith("postgresql://"):
    print("🔄 Converting postgresql:// to postgresql+asyncpg://")
    # Railway provides standard postgresql:// URL, convert to asyncpg format
    settings.DATABASE_URL = settings.DATABASE_URL.replace(
        "postgresql://", "postgresql+asyncpg://", 1
    )
    # Add SSL parameters for Railway PostgreSQL - disable ALPN negotiation
    if "?" not in settings.DATABASE_URL:
        settings.DATABASE_URL += "?ssl=require"
    elif "ssl=" not in settings.DATABASE_URL:
        settings.DATABASE_URL += "&ssl=require"
    print("🔒 Added SSL parameter for Railway PostgreSQL")
elif settings.DATABASE_URL.startswith("postgres://"):
    print("🔄 Converting postgres:// to postgresql+asyncpg://")
    # Handle old postgres:// format as well
    settings.DATABASE_URL = settings.DATABASE_URL.replace(
        "postgres://", "postgresql+asyncpg://", 1
    )
    # Add SSL parameters for Railway PostgreSQL
    if "?" not in settings.DATABASE_URL:
        settings.DATABASE_URL += "?ssl=require"
    elif "ssl=" not in settings.DATABASE_URL:
        settings.DATABASE_URL += "&ssl=require"
    print("🔒 Added SSL parameter for Railway PostgreSQL")

print(f"✓ Final DATABASE_URL: {settings.DATABASE_URL[:60]}...")
