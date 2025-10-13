"""
Simple migration - just create tables, seed data separately
"""
import asyncio
from pathlib import Path
import shutil
import time

from db import engine, Base
from models_new import *  # Import all models


async def migrate():
    print("🔄 Starting simple migration...")
    
    # Backup old database if it exists
    old_db = Path("./dev.db")
    if old_db.exists():
        backup_path = Path(f"./dev_backup_{int(time.time())}.db")
        shutil.copy2(old_db, backup_path)
        print(f"✓ Backed up old database to: {backup_path}")
        
        # Remove old database
        old_db.unlink()
        print("✓ Removed old database")
    
    # Create all new tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Created new database schema")
    
    # Close engine
    await engine.dispose()
    print("✓ Database engine closed")
    
    print("✅ Migration complete!")
    print("\nNext step: Start the API server - it will seed data automatically")


if __name__ == "__main__":
    asyncio.run(migrate())