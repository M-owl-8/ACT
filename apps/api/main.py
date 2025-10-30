from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from sqlalchemy import text

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
from routers import password_reset as password_reset_router
from routers import push_notifications as push_notifications_router
from backup_service import daily_backup_task
from seed_data import seed_default_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("🚀 Starting ACT Gen-1 API...")
    print(f"📊 Database: {settings.DATABASE_URL[:50]}...")
    
    backup_task = None
    
    try:
        # STEP 1: Create all base tables from models
        print("[DB] STEP 1: Creating base tables from models...")
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("[DB] ✓ Base tables created/verified")
        except Exception as e:
            print(f"[DB] ⚠️  Error creating base tables: {str(e)}")
            import traceback
            print(traceback.format_exc())
        
        # STEP 2: Run PostgreSQL-specific migrations
        if "postgresql" in settings.DATABASE_URL.lower():
            print("[DB] STEP 2: Running PostgreSQL migrations...")
            try:
                async with engine.begin() as conn:
                    # Drop books table for fresh recreation
                    try:
                        await conn.execute(text("DROP TABLE IF EXISTS books CASCADE"))
                        print("[DB] ✓ Books table dropped (will be recreated)")
                    except Exception as e:
                        print(f"[DB] ⚠️  Note: Could not drop books table: {str(e)}")
                    
                    # Ensure currency column exists in users table
                    try:
                        await conn.execute(text("""
                            ALTER TABLE users 
                            ADD COLUMN IF NOT EXISTS currency VARCHAR NOT NULL DEFAULT 'USD'
                        """))
                        print("[DB] ✓ Currency column verified in users table")
                    except Exception as e:
                        print(f"[DB] ⚠️  Could not verify currency column: {str(e)}")
                    
                    # Ensure recovery_keyword column exists in users table
                    try:
                        await conn.execute(text("""
                            ALTER TABLE users 
                            ADD COLUMN IF NOT EXISTS recovery_keyword VARCHAR NOT NULL
                        """))
                        print("[DB] ✓ Recovery keyword column verified in users table")
                    except Exception as e:
                        print(f"[DB] ⚠️  Could not verify recovery_keyword column: {str(e)}")
                
                # Recreate tables that were dropped
                print("[DB] STEP 3: Recreating dropped tables...")
                async with engine.begin() as conn:
                    await conn.run_sync(Base.metadata.create_all)
                print("[DB] ✓ All tables finalized")
            except Exception as e:
                print(f"[DB] ⚠️  Error running PostgreSQL migrations: {str(e)}")
                import traceback
                print(traceback.format_exc())
        
        print("✓ Database tables ready")
        
        # Seed default data (categories and books)
        try:
            async with AsyncSessionLocal() as session:
                await seed_default_data(session)
            print("✓ Default data seeded")
        except Exception as e:
            print(f"[DB] ⚠️  Error seeding data: {str(e)}")
        
        # Start daily backup task
        try:
            backup_task = asyncio.create_task(daily_backup_task())
            print("✓ Daily backup task started")
        except Exception as e:
            print(f"[DB] ⚠️  Error starting backup task: {str(e)}")
        
        print("✅ ACT Gen-1 API is ready!\n")
    except Exception as e:
        print(f"⚠️ Unexpected error during API initialization: {str(e)}")
        import traceback
        print(traceback.format_exc())
        print("⚠️ API will start in limited mode (no persistent data)")
    
    yield
    
    # Shutdown
    print("\n🛑 Shutting down ACT Gen-1 API...")
    if backup_task:
        backup_task.cancel()
    await engine.dispose()
    print("✓ Cleanup complete")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="ACT Gen-1 MVP - Personal Finance Tracker",
    lifespan=lifespan
)

# CORS for mobile app - DEV + PRODUCTION
ALLOWED = [
    # Local Development (for testing on phone/emulator)
    "http://10.21.69.205:8000",
    "http://10.0.2.2:8000",      # Android Emulator
    "http://localhost:8000",      # iOS Simulator
    "http://localhost:3000",      # Web development
    # Production URL (CRITICAL: Only your app!)
    "https://act-production-8080.up.railway.app",
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


@app.get("/health/db")
async def health_db():
    """Comprehensive database diagnostic endpoint"""
    result = {
        "status": "unknown",
        "database_type": "unknown",
        "connection": False,
        "tables": [],
        "users_table_columns": [],
        "error": None
    }
    
    try:
        # Detect database type
        if "sqlite" in settings.DATABASE_URL.lower():
            result["database_type"] = "SQLite"
        elif "postgresql" in settings.DATABASE_URL.lower():
            result["database_type"] = "PostgreSQL"
        else:
            result["database_type"] = "Unknown"
        
        # Try to connect
        async with engine.begin() as conn:
            # Test connection
            await conn.execute(text("SELECT 1"))
            result["connection"] = True
            
            # Get all tables
            if result["database_type"] == "PostgreSQL":
                table_query = """
                    SELECT table_name FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """
            else:  # SQLite
                table_query = "SELECT name FROM sqlite_master WHERE type='table'"
            
            tables_result = await conn.execute(text(table_query))
            result["tables"] = [row[0] for row in tables_result.fetchall()]
            
            # Get users table columns
            if "users" in result["tables"]:
                if result["database_type"] == "PostgreSQL":
                    cols_query = """
                        SELECT column_name, data_type, is_nullable, column_default
                        FROM information_schema.columns 
                        WHERE table_name = 'users'
                    """
                else:  # SQLite
                    cols_query = "PRAGMA table_info(users)"
                
                cols_result = await conn.execute(text(cols_query))
                result["users_table_columns"] = [row[0] for row in cols_result.fetchall()]
        
        result["status"] = "ok"
        return result
        
    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
        return result


# Include all routers
app.include_router(auth_router.router, prefix="/auth", tags=["Authentication"])
app.include_router(password_reset_router.router, prefix="/password-reset", tags=["Password Reset"])
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
app.include_router(push_notifications_router.router)
