"""
ACT Gen-1 MVP - FastAPI Backend
Complete financial tracking application with motivation and learning features
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from config import settings
from db import engine, Base
from seed_data import seed_all, AsyncSessionLocal

# Import all routers
from routers import auth as auth_router
from routers import users as users_router
from routers import categories as categories_router
from routers import entries as entries_router
from routers import dashboard as dashboard_router
from routers import motivation as motivation_router
from routers import books as books_router
from routers import export as export_router
from routers import backup as backup_router

# Import backup service
from backup_service import daily_backup_task


# Background tasks
background_tasks = set()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    print("🚀 Starting ACT Gen-1 API...")
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Database tables created")
    
    # Seed default data
    async with AsyncSessionLocal() as db:
        await seed_all(db)
    print("✓ Default data seeded")
    
    # Start daily backup task
    task = asyncio.create_task(daily_backup_task())
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)
    print("✓ Daily backup task started")
    
    print("✅ ACT Gen-1 API is ready!")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down ACT Gen-1 API...")
    
    # Cancel background tasks
    for task in background_tasks:
        task.cancel()
    
    print("✅ Shutdown complete")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="ACT Gen-1 MVP - Financial Tracking with Motivation & Learning",
    version="1.0.0",
    lifespan=lifespan
)


# CORS Configuration
ALLOWED_ORIGINS = [
    "https://nine-turtles-serve.loca.lt",
    "https://*.exp.direct",
    "http://localhost:19006",
    "http://127.0.0.1:19006",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "exp://192.168.*",  # Expo Go on local network
]

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.exp\.direct|exp://.*|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": "1.0.0"
    }


@app.get("/")
async def root():
    return {
        "message": "ACT Gen-1 MVP API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


# Include all routers
app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(categories_router.router)
app.include_router(entries_router.router)
app.include_router(dashboard_router.router)
app.include_router(motivation_router.router)
app.include_router(books_router.router)
app.include_router(export_router.router)
app.include_router(backup_router.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_new:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )