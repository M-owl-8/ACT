from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from config import settings
from db import engine, Base, AsyncSessionLocal
from routers import auth as auth_router
from routers import users as users_router
from routers import categories as categories_router
from routers import entries as entries_router
from routers import dashboard as dashboard_router
from routers import motivation as motivation_router
from routers import books as books_router
from routers import export as export_router
from routers import backup as backup_router
from routers import reports as reports_router
from routers import reminders as reminders_router
from backup_service import daily_backup_task
from seed_data import seed_default_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("🚀 Starting ACT Gen-1 API...")
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Database tables ready")
    
    # Seed default data (categories and books)
    async with AsyncSessionLocal() as session:
        await seed_default_data(session)
    print("✓ Default data seeded")
    
    # Start daily backup task
    backup_task = asyncio.create_task(daily_backup_task())
    print("✓ Daily backup task started")
    
    print("✅ ACT Gen-1 API is ready!\n")
    
    yield
    
    # Shutdown
    print("\n🛑 Shutting down ACT Gen-1 API...")
    backup_task.cancel()
    await engine.dispose()
    print("✓ Cleanup complete")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="ACT Gen-1 MVP - Personal Finance Tracker",
    lifespan=lifespan
)

# CORS for mobile app
ALLOWED = [
    "https://nine-turtles-serve.loca.lt",
    "https://*.exp.direct",       # Expo web
    "http://localhost:19006",     # Expo web local
    "http://127.0.0.1:19006",
    "http://localhost:8081",      # Expo mobile
    "http://127.0.0.1:8081",
    "*",  # Temporary for testing
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}


# Include all routers
app.include_router(auth_router.router, prefix="/auth", tags=["Authentication"])
app.include_router(users_router.router, prefix="/users", tags=["Users"])
app.include_router(categories_router.router, prefix="/categories", tags=["Categories"])
app.include_router(entries_router.router, prefix="/entries", tags=["Entries"])
app.include_router(dashboard_router.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(motivation_router.router, prefix="/motivation", tags=["Motivation"])
app.include_router(books_router.router, prefix="/books", tags=["Books"])
app.include_router(export_router.router, prefix="/export", tags=["Export"])
app.include_router(backup_router.router, prefix="/backup", tags=["Backup"])
app.include_router(reports_router.router, prefix="/reports", tags=["Reports"])
app.include_router(reminders_router.router, prefix="/reminders", tags=["Reminders"])
