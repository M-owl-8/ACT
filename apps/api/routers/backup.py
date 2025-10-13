"""
Database Backup API endpoints (Admin only)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from db import get_db
from models import User
from schemas import BackupOut
from security import get_current_admin_user
from backup_service import create_backup, list_backups, cleanup_old_backups

router = APIRouter()


@router.post("/create", response_model=BackupOut)
async def create_manual_backup(
    admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a manual database backup (Admin only)"""
    try:
        backup = await create_backup(db, backup_type="manual", user_id=admin.id)
        return BackupOut(
            id=backup.id,
            filename=backup.filename,
            file_size=backup.file_size,
            backup_type=backup.backup_type,
            created_at=backup.created_at
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Backup failed: {str(e)}"
        )


@router.get("/list", response_model=List[BackupOut])
async def list_all_backups(
    limit: int = 50,
    admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """List all backups (Admin only)"""
    backups = await list_backups(db, limit=limit)
    
    return [
        BackupOut(
            id=b.id,
            filename=b.filename,
            file_size=b.file_size,
            backup_type=b.backup_type,
            created_at=b.created_at
        )
        for b in backups
    ]


@router.post("/cleanup")
async def cleanup_backups(
    keep_days: int = 30,
    admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Cleanup old backups (Admin only)"""
    try:
        await cleanup_old_backups(db, keep_days=keep_days)
        return {"message": f"Cleaned up backups older than {keep_days} days"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cleanup failed: {str(e)}"
        )