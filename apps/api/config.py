from pydantic_settings import BaseSettings
from typing import Optional

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
