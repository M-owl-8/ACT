from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

try:
    # Try to import AsyncAdaptedQueuePool (SQLAlchemy 2.0+)
    from sqlalchemy.ext.asyncio import AsyncAdaptedQueuePool
    ASYNC_POOL_AVAILABLE = True
except ImportError:
    # Fallback for older SQLAlchemy versions
    ASYNC_POOL_AVAILABLE = False
    print("⚠️ AsyncAdaptedQueuePool not available, using NullPool instead")

from config import settings

# Determine pool class and connection args based on database type
db_url = settings.DATABASE_URL
print(f"📊 Database URL (first 60 chars): {db_url[:60]}...")

if "sqlite" in db_url:
    # SQLite configuration for local development
    pool_config = {
        "poolclass": NullPool,              # avoids SQLite pool/thread issues
        "connect_args": {"check_same_thread": False}
    }
    print("✓ Using SQLite connection pool")
elif "postgresql" in db_url or "asyncpg" in db_url:
    # PostgreSQL configuration for production
    if ASYNC_POOL_AVAILABLE:
        pool_class = AsyncAdaptedQueuePool
        pool_name = "AsyncAdaptedQueuePool"
    else:
        pool_class = NullPool
        pool_name = "NullPool"
    
    pool_config = {
        "poolclass": pool_class,             # async-compatible connection pooling
    }
    if ASYNC_POOL_AVAILABLE:
        pool_config.update({
            "pool_size": 20,                 # number of connections to keep in pool
            "max_overflow": 10,              # number of connections to create on demand
            "pool_pre_ping": True,           # verify connection health before using
            "pool_recycle": 3600,            # recycle connections after 1 hour
        })
    
    pool_config.update({
        "connect_args": {
            "ssl": True,                     # Enable SSL for asyncpg
            "server_settings": {
                "application_name": "act_api"
            }
        }
    })
    print(f"✓ Using {pool_name} for PostgreSQL with SSL")
else:
    # Default configuration - use NullPool for safety with async
    pool_config = {
        "poolclass": NullPool
    }
    print("✓ Using NullPool for default async configuration")

# Async engine - with error handling
engine = None
try:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True,
        **pool_config
    )
    print("✓ Async engine created successfully")
except Exception as e:
    print(f"❌ ERROR creating async engine: {str(e)}")
    print(f"❌ This will cause database operations to fail, but app will still start")
    # Create a dummy engine that won't crash on import
    import asyncio
    from sqlalchemy.engine import Engine
    
    # Fallback: use in-memory SQLite if all else fails
    try:
        engine = create_async_engine(
            "sqlite+aiosqlite:///:memory:",
            echo=False,
            future=True,
            poolclass=NullPool,
            connect_args={"check_same_thread": False}
        )
        print("✓ Using in-memory SQLite fallback")
    except Exception as fallback_error:
        print(f"❌ CRITICAL: Even fallback engine failed: {str(fallback_error)}")
        raise

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