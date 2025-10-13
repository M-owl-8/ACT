"""
Database Backup Service
Handles automatic daily backups and manual backups
"""
import os
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import asyncio

from models import DatabaseBackup
from config import settings


# Backup directory
BACKUP_DIR = Path("./backups")
BACKUP_DIR.mkdir(exist_ok=True)


def get_db_file_path() -> Path:
    """Get the path to the SQLite database file"""
    # Extract path from DATABASE_URL
    # Format: sqlite+aiosqlite:///./dev.db?check_same_thread=False
    db_url = settings.DATABASE_URL
    if ":///" in db_url:
        db_path = db_url.split("///")[1]
        # Remove query string if present
        if "?" in db_path:
            db_path = db_path.split("?")[0]
        return Path(db_path)
    return Path("./dev.db")


async def create_backup(
    db: AsyncSession,
    backup_type: str = "daily",
    user_id: int = None
) -> DatabaseBackup:
    """
    Create a database backup
    
    Args:
        db: Database session
        backup_type: Type of backup ('daily' or 'manual')
        user_id: User ID if manual backup
    
    Returns:
        DatabaseBackup record
    """
    # Get source database file
    source_db = get_db_file_path()
    
    if not source_db.exists():
        raise FileNotFoundError(f"Database file not found: {source_db}")
    
    # Generate backup filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"act_backup_{backup_type}_{timestamp}.db"
    backup_path = BACKUP_DIR / backup_filename
    
    # Copy database file
    shutil.copy2(source_db, backup_path)
    
    # Get file size
    file_size = backup_path.stat().st_size
    
    # Create backup record
    backup_record = DatabaseBackup(
        filename=backup_filename,
        file_path=str(backup_path.absolute()),
        file_size=file_size,
        backup_type=backup_type,
        created_by_user_id=user_id
    )
    
    db.add(backup_record)
    await db.commit()
    await db.refresh(backup_record)
    
    print(f"✓ Backup created: {backup_filename} ({file_size} bytes)")
    
    return backup_record


async def cleanup_old_backups(db: AsyncSession, keep_days: int = 30):
    """
    Delete backups older than specified days
    
    Args:
        db: Database session
        keep_days: Number of days to keep backups
    """
    cutoff_date = datetime.utcnow() - timedelta(days=keep_days)
    
    # Find old backups
    result = await db.execute(
        select(DatabaseBackup).where(
            DatabaseBackup.created_at < cutoff_date
        )
    )
    old_backups = result.scalars().all()
    
    deleted_count = 0
    for backup in old_backups:
        # Delete file
        backup_path = Path(backup.file_path)
        if backup_path.exists():
            backup_path.unlink()
        
        # Delete record
        await db.delete(backup)
        deleted_count += 1
    
    if deleted_count > 0:
        await db.commit()
        print(f"✓ Cleaned up {deleted_count} old backups")


async def list_backups(db: AsyncSession, limit: int = 50):
    """List recent backups"""
    result = await db.execute(
        select(DatabaseBackup)
        .order_by(DatabaseBackup.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


async def restore_backup(backup_id: int, db: AsyncSession):
    """
    Restore database from a backup
    WARNING: This will overwrite the current database!
    
    Args:
        backup_id: ID of the backup to restore
        db: Database session
    """
    # Get backup record
    result = await db.execute(
        select(DatabaseBackup).where(DatabaseBackup.id == backup_id)
    )
    backup = result.scalar_one_or_none()
    
    if not backup:
        raise ValueError(f"Backup {backup_id} not found")
    
    backup_path = Path(backup.file_path)
    if not backup_path.exists():
        raise FileNotFoundError(f"Backup file not found: {backup_path}")
    
    # Get current database path
    current_db = get_db_file_path()
    
    # Create a backup of current database before restoring
    pre_restore_backup = BACKUP_DIR / f"pre_restore_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.db"
    shutil.copy2(current_db, pre_restore_backup)
    
    # Restore backup
    shutil.copy2(backup_path, current_db)
    
    print(f"✓ Database restored from backup: {backup.filename}")
    print(f"✓ Pre-restore backup saved: {pre_restore_backup}")
    
    return backup


# Background task for daily backups
async def daily_backup_task():
    """
    Background task that runs daily backups
    Should be scheduled to run once per day
    """
    from db import AsyncSessionLocal
    
    while True:
        try:
            async with AsyncSessionLocal() as db:
                # Create daily backup
                await create_backup(db, backup_type="daily")
                
                # Cleanup old backups (keep 30 days)
                await cleanup_old_backups(db, keep_days=30)
            
            # Wait 24 hours
            await asyncio.sleep(86400)  # 24 hours in seconds
            
        except Exception as e:
            print(f"✗ Daily backup failed: {e}")
            # Wait 1 hour before retrying
            await asyncio.sleep(3600)