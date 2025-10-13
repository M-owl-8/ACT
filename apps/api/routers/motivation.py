"""
Motivation System API endpoints - Streaks and Goals
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime, date

from db import get_db
from models import User, Streak, Goal, Entry
from schemas import StreakOut, GoalCreate, GoalUpdate, GoalOut
from security import get_current_user

router = APIRouter()


# ===== STREAKS =====
@router.get("/streak", response_model=StreakOut)
async def get_streak(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's current streak"""
    result = await db.execute(
        select(Streak).where(Streak.user_id == current_user.id)
    )
    streak = result.scalar_one_or_none()
    
    if not streak:
        # Create initial streak
        streak = Streak(
            user_id=current_user.id,
            current_count=0,
            best_count=0,
            last_check_date=""
        )
        db.add(streak)
        await db.commit()
        await db.refresh(streak)
    
    return streak


@router.post("/streak/check", response_model=StreakOut)
async def check_and_update_streak(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Check if user logged an entry today and update streak
    Called automatically when user adds an entry
    """
    # Get or create streak
    result = await db.execute(
        select(Streak).where(Streak.user_id == current_user.id)
    )
    streak = result.scalar_one_or_none()
    
    if not streak:
        streak = Streak(
            user_id=current_user.id,
            current_count=0,
            best_count=0,
            last_check_date=""
        )
        db.add(streak)
    
    today = date.today().isoformat()
    
    # If already checked today, return current streak
    if streak.last_check_date == today:
        return streak
    
    # Check if user has entries today
    today_start = datetime.combine(date.today(), datetime.min.time())
    result = await db.execute(
        select(Entry).where(
            Entry.user_id == current_user.id,
            Entry.booked_at >= today_start
        ).limit(1)
    )
    has_entry_today = result.scalar_one_or_none() is not None
    
    if has_entry_today:
        # Check if yesterday was logged
        if streak.last_check_date:
            last_date = date.fromisoformat(streak.last_check_date)
            yesterday = date.today() - timedelta(days=1)
            
            if last_date == yesterday:
                # Continue streak
                streak.current_count += 1
            elif last_date == date.today():
                # Already counted today
                pass
            else:
                # Streak broken, restart
                streak.current_count = 1
        else:
            # First entry ever
            streak.current_count = 1
        
        # Update best streak
        if streak.current_count > streak.best_count:
            streak.best_count = streak.current_count
        
        streak.last_check_date = today
    else:
        # No entry today, check if streak should be broken
        if streak.last_check_date:
            last_date = date.fromisoformat(streak.last_check_date)
            if (date.today() - last_date).days > 1:
                # Streak broken
                streak.current_count = 0
    
    await db.commit()
    await db.refresh(streak)
    
    return streak


# ===== GOALS =====
@router.get("/goals", response_model=List[GoalOut])
async def list_goals(
    status: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's goals"""
    query = select(Goal).where(Goal.user_id == current_user.id)
    
    if status:
        query = query.where(Goal.status == status)
    
    query = query.order_by(Goal.created_at.desc())
    
    result = await db.execute(query)
    goals = result.scalars().all()
    
    # Calculate progress percentage
    goals_out = []
    for goal in goals:
        goal_dict = {
            "id": goal.id,
            "user_id": goal.user_id,
            "kind": goal.kind,
            "title": goal.title,
            "description": goal.description,
            "target_value": goal.target_value,
            "current_value": goal.current_value,
            "status": goal.status,
            "start_date": goal.start_date,
            "end_date": goal.end_date,
            "created_at": goal.created_at,
            "updated_at": goal.updated_at,
            "progress_percentage": None
        }
        
        if goal.target_value and goal.target_value > 0:
            progress = (goal.current_value / goal.target_value) * 100
            goal_dict["progress_percentage"] = min(round(progress, 2), 100)
        
        goals_out.append(GoalOut(**goal_dict))
    
    return goals_out


@router.get("/goals/{goal_id}", response_model=GoalOut)
async def get_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific goal"""
    result = await db.execute(
        select(Goal).where(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        )
    )
    goal = result.scalar_one_or_none()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Calculate progress
    progress_percentage = None
    if goal.target_value and goal.target_value > 0:
        progress = (goal.current_value / goal.target_value) * 100
        progress_percentage = min(round(progress, 2), 100)
    
    goal_dict = {
        "id": goal.id,
        "user_id": goal.user_id,
        "kind": goal.kind,
        "title": goal.title,
        "description": goal.description,
        "target_value": goal.target_value,
        "current_value": goal.current_value,
        "status": goal.status,
        "start_date": goal.start_date,
        "end_date": goal.end_date,
        "created_at": goal.created_at,
        "updated_at": goal.updated_at,
        "progress_percentage": progress_percentage
    }
    
    return GoalOut(**goal_dict)


@router.post("/goals", response_model=GoalOut, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new goal"""
    goal = Goal(
        **goal_data.model_dump(),
        user_id=current_user.id,
        current_value=0
    )
    
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    
    # Calculate progress
    progress_percentage = None
    if goal.target_value and goal.target_value > 0:
        progress = (goal.current_value / goal.target_value) * 100
        progress_percentage = min(round(progress, 2), 100)
    
    goal_dict = {
        "id": goal.id,
        "user_id": goal.user_id,
        "kind": goal.kind,
        "title": goal.title,
        "description": goal.description,
        "target_value": goal.target_value,
        "current_value": goal.current_value,
        "status": goal.status,
        "start_date": goal.start_date,
        "end_date": goal.end_date,
        "created_at": goal.created_at,
        "updated_at": goal.updated_at,
        "progress_percentage": progress_percentage
    }
    
    return GoalOut(**goal_dict)


@router.patch("/goals/{goal_id}", response_model=GoalOut)
async def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a goal"""
    result = await db.execute(
        select(Goal).where(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        )
    )
    goal = result.scalar_one_or_none()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Update fields
    update_data = goal_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)
    
    await db.commit()
    await db.refresh(goal)
    
    # Calculate progress
    progress_percentage = None
    if goal.target_value and goal.target_value > 0:
        progress = (goal.current_value / goal.target_value) * 100
        progress_percentage = min(round(progress, 2), 100)
    
    goal_dict = {
        "id": goal.id,
        "user_id": goal.user_id,
        "kind": goal.kind,
        "title": goal.title,
        "description": goal.description,
        "target_value": goal.target_value,
        "current_value": goal.current_value,
        "status": goal.status,
        "start_date": goal.start_date,
        "end_date": goal.end_date,
        "created_at": goal.created_at,
        "updated_at": goal.updated_at,
        "progress_percentage": progress_percentage
    }
    
    return GoalOut(**goal_dict)


@router.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a goal"""
    result = await db.execute(
        select(Goal).where(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        )
    )
    goal = result.scalar_one_or_none()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    await db.delete(goal)
    await db.commit()
    
    return None


from datetime import timedelta