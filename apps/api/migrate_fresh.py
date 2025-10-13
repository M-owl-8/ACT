"""
Fresh migration with absolute paths
"""
import asyncio
import os
from pathlib import Path
import shutil
import time
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Get absolute path to api directory
API_DIR = Path(__file__).parent.absolute()
DB_PATH = API_DIR / "dev.db"
DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH}"

print(f"📁 API Directory: {API_DIR}")
print(f"📁 Database Path: {DB_PATH}")
print(f"🔗 Database URL: {DATABASE_URL}")

# Create engine with absolute path
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
)

# Import Base and models
from db import Base
from models_new import *  # Import all models


async def migrate():
    print("\n🔄 Starting fresh migration...")
    
    # Backup old database if it exists
    if DB_PATH.exists():
        backup_path = API_DIR / f"dev_backup_{int(time.time())}.db"
        shutil.copy2(DB_PATH, backup_path)
        print(f"✓ Backed up old database to: {backup_path}")
        
        # Remove old database
        DB_PATH.unlink()
        print("✓ Removed old database")
    
    # Create all new tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Created new database schema with all tables")
    
    # Close engine
    await engine.dispose()
    print("✓ Database engine closed")
    
    print("\n✅ Migration complete!")
    print("📋 Next step: Start the API server - it will seed default data automatically")


if __name__ == "__main__":
    asyncio.run(migrate())