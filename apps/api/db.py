from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

from config import settings

# Async engine (SQLite dev)
engine = create_async_engine(
    settings.DATABASE_URL,           # e.g. "sqlite+aiosqlite:///./dev.db"
    echo=False,
    future=True,
    poolclass=NullPool,              # avoids SQLite pool/thread issues in dev
    connect_args={"check_same_thread": False}
)

# Session factory
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

# Declarative base for models
Base = declarative_base()

# Dependency for FastAPI routes
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session