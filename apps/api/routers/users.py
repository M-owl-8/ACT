from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from security import get_current_user, get_current_admin_user
from schemas import UserOut, UserUpdate
from models import User
from db import get_db

router = APIRouter()

@router.get("/me", response_model=UserOut)
async def read_me(user: User = Depends(get_current_user)):
    return user

@router.patch("/me", response_model=UserOut)
async def update_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user's settings"""
    # Update fields
    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    await db.commit()
    await db.refresh(current_user)
    
    return current_user

@router.get("/", response_model=List[UserOut])
async def list_all_users(
    admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Admin-only endpoint to list all users."""
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users
