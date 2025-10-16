from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool, QueuePool

from config import settings

# Determine pool class and connection args based on database type
db_url = settings.DATABASE_URL
if "sqlite" in db_url:
    # SQLite configuration for local development
    pool_config = {
        "poolclass": NullPool,              # avoids SQLite pool/thread issues
        "connect_args": {"check_same_thread": False}
    }
elif "postgresql" in db_url or "asyncpg" in db_url:
    # PostgreSQL configuration for production
    pool_config = {
        "poolclass": QueuePool,             # use connection pooling for PostgreSQL
        "pool_size": 20,                    # number of connections to keep in pool
        "max_overflow": 10,                 # number of connections to create on demand
        "pool_pre_ping": True,              # verify connection health before using
        "pool_recycle": 3600                # recycle connections after 1 hour
    }
else:
    # Default configuration
    pool_config = {
        "poolclass": QueuePool,
        "pool_size": 5,
        "max_overflow": 5
    }

# Async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    **pool_config
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