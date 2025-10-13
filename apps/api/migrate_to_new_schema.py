"""
Migration script to create new database schema
This will create a fresh database with all the new tables
"""
import asyncio
import os
from pathlib import Path

from db import engine, Base, AsyncSessionLocal
from models_new import *  # Import all models
from seed_data import seed_all


async def migrate():
    print("🔄 Starting database migration...")
    
    # Backup old database if it exists
    old_db = Path("./dev.db")
    if old_db.exists():
        backup_path = Path(f"./dev_backup_{int(time.time())}.db")
        import shutil
        shutil.copy2(old_db, backup_path)
        print(f"✓ Backed up old database to: {backup_path}")
        
        # Remove old database
        old_db.unlink()
        print("✓ Removed old database")
    
    # Create all new tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Created new database schema")
    
    # Seed default data
    async with AsyncSessionLocal() as db:
        await seed_all(db)
    print("✓ Seeded default data")
    
    print("✅ Migration complete!")
    print("\nNext steps:")
    print("1. Register a new user (will be admin)")
    print("2. Start using the app")


import time

if __name__ == "__main__":
    asyncio.run(migrate())