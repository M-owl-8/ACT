import os
import base64
import json
import tempfile
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=".env",
        extra="ignore"
    )
    
    APP_NAME: str = "ACT Gen1 API"

    # JWT
    JWT_SECRET: str = "CHANGE_ME_SUPER_SECRET"
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    # DB - Read from environment variable, with SQLite default for local dev
    # On Railway, this will be set to PostgreSQL connection string
    DATABASE_URL: str = "sqlite+aiosqlite:///./dev.db?check_same_thread=False"

    # Firebase
    FIREBASE_CREDENTIALS_PATH: str = ""
    FIREBASE_CREDENTIALS_JSON: str = ""  # Base64 encoded credentials (production)

settings = Settings()

# Strip whitespace from all environment variables (critical for Railway)
# Remove both leading/trailing AND embedded whitespace/newlines
if settings.DATABASE_URL:
    settings.DATABASE_URL = settings.DATABASE_URL.strip()
    # Also remove any embedded newlines and extra whitespace
    settings.DATABASE_URL = ''.join(settings.DATABASE_URL.split())
    # Re-add the connection string separator if it was removed
    settings.DATABASE_URL = settings.DATABASE_URL.replace(':///', '://').replace('://', '://')

if settings.JWT_SECRET:
    settings.JWT_SECRET = settings.JWT_SECRET.strip()

if settings.FIREBASE_CREDENTIALS_JSON:
    settings.FIREBASE_CREDENTIALS_JSON = settings.FIREBASE_CREDENTIALS_JSON.strip()

# Handle Firebase credentials - convert Base64 if needed (for production)
if settings.FIREBASE_CREDENTIALS_JSON and not settings.FIREBASE_CREDENTIALS_PATH:
    try:
        # Decode Base64 and write to temp file
        decoded = base64.b64decode(settings.FIREBASE_CREDENTIALS_JSON)
        credentials_path = os.path.join(tempfile.gettempdir(), "firebase-credentials.json")
        with open(credentials_path, 'w') as f:
            f.write(decoded.decode('utf-8'))
        settings.FIREBASE_CREDENTIALS_PATH = credentials_path
        print("[Firebase] ✓ Credentials loaded from Base64 environment variable")
    except Exception as e:
        print(f"[Firebase] ⚠️ Failed to decode Base64 credentials: {e}")

# Debug: Log what DATABASE_URL we're using
print(f"[DB] Initial DATABASE_URL: {settings.DATABASE_URL[:60] if settings.DATABASE_URL else 'NOT SET'}...")
print(f"[DB] Environment DATABASE_URL exists: {'DATABASE_URL' in os.environ}")

# Convert standard PostgreSQL URL to async format if needed
if settings.DATABASE_URL.startswith("postgresql://"):
    print("[DB] Converting postgresql:// to postgresql+asyncpg://")
    # Railway provides standard postgresql:// URL, convert to asyncpg format
    settings.DATABASE_URL = settings.DATABASE_URL.replace(
        "postgresql://", "postgresql+asyncpg://", 1
    )
    print("[DB] Using internal Railway connection (SSL disabled)")
elif settings.DATABASE_URL.startswith("postgres://"):
    print("[DB] Converting postgres:// to postgresql+asyncpg://")
    # Handle old postgres:// format as well
    settings.DATABASE_URL = settings.DATABASE_URL.replace(
        "postgres://", "postgresql+asyncpg://", 1
    )
    print("[DB] Using internal Railway connection (SSL disabled)")

print(f"[DB] Final DATABASE_URL: {settings.DATABASE_URL[:60]}...")
