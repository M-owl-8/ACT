"""
Database configuration and session management for ACT Gen-1 API.
Uses SQLAlchemy async ORM with proper async pool configuration.
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

from config import settings

print("\n" + "="*60)
print("DATABASE INITIALIZATION")
print("="*60)

# Get database URL from config
db_url = settings.DATABASE_URL
print(f"[DB] Database URL (first 60 chars): {db_url[:60]}...")

# Configure connection pool based on database type
# CRITICAL: Use NullPool for async engines - QueuePool causes crashes!
if "sqlite" in db_url.lower():
    print("[DB] SQLite detected - using NullPool")
    pool_config = {
        "poolclass": NullPool,
        "connect_args": {"check_same_thread": False}
    }
elif "postgresql" in db_url.lower() or "asyncpg" in db_url.lower():
    print("[DB] PostgreSQL detected - using NullPool (async-safe)")
    # For async engines, we must use NullPool to avoid blocking issues
    # Connection pooling is handled by the database driver (asyncpg)
    # SSL configuration is handled in config.py
    pool_config = {
        "poolclass": NullPool,
        "connect_args": {
            "server_settings": {
                "application_name": "act_api"
            }
        }
    }
else:
    print("[DB] Unknown database - using NullPool (safe default)")
    pool_config = {
        "poolclass": NullPool
    }

# Create async engine
engine = None
try:
    print("\n[DB] Creating async engine...")
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True,
        **pool_config
    )
    print("[DB] Async engine created successfully!")
    print("[DB] Ready to connect to database")
    print("="*60 + "\n")
except Exception as e:
    print(f"\n[DB] CRITICAL ERROR: {str(e)}")
    print(f"[DB] Failed to create async engine")
    print("[DB] Falling back to in-memory SQLite")
    print("="*60 + "\n")
    
    # Fallback engine for resilience
    try:
        engine = create_async_engine(
            "sqlite+aiosqlite:///:memory:",
            echo=False,
            future=True,
            poolclass=NullPool,
            connect_args={"check_same_thread": False}
        )
        print("[DB] Using in-memory SQLite (DATA WILL NOT PERSIST)")
    except Exception as fallback_error:
        print(f"[DB] FATAL: Even fallback failed: {str(fallback_error)}")
        raise

# Create async session factory
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

# Declarative base for SQLAlchemy ORM models
Base = declarative_base()

# Dependency function for FastAPI routes
async def get_db():
    """
    Get database session for FastAPI dependency injection.
    Usage: async def my_route(db: AsyncSession = Depends(get_db))
    """
    async with AsyncSessionLocal() as session:
        yield session