"""
Motivation System API endpoints - Streaks and Goals with authentic expense/income tracking
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from datetime import datetime, date, timedelta
from pydantic import BaseModel, Field

from db import get_db
from models import User, Streak, Goal, Entry, Category, GoalKind, GoalStatus, EntryType
from schemas import StreakOut, GoalCreate, GoalUpdate, GoalOut
from security import get_current_user

router = APIRouter()


# ===== HELPER SCHEMAS =====
class ChallengeProgress(BaseModel):
    """Track user's progress on no-spend challenges"""
    user_id: int
    consecutive_no_spend_days: int
    last_no_spend_date: Optional[str] = None  # YYYY-MM-DD
    days_with_discretionary_spending: int
    personal_record: int = 0  # Best no-spend streak ever
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ===== HELPER FUNCTIONS =====
async def get_personal_no_spend_record(user_id: int, db: AsyncSession) -> int:
    """
    Calculate the user's personal best no-spend streak ever recorded.
    Scans all completed goals of type 'streak' or checks historical data.
    """
    try:
        # Try to get from streak goals that have been completed
        result = await db.execute(
            select(Goal).where(
                Goal.user_id == user_id,
                Goal.kind == GoalKind.streak,
                Goal.status == GoalStatus.completed
            ).order_by(Goal.current_value.desc()).limit(1)
        )
        best_goal = result.scalar_one_or_none()
        if best_goal:
            return int(best_goal.current_value)
        
        # Fallback: check Streak model
        result = await db.execute(select(Streak).where(Streak.user_id == user_id))
        streak = result.scalar_one_or_none()
        if streak:
            return streak.best_count
        
        return 0
    except Exception as e:
        print(f"[ERROR] Failed to get personal record: {str(e)}")
        return 0


async def update_goals_for_user(user_id: int, db: AsyncSession, entry_date: datetime = None):
    """
    Automatically update all active goals for a user based on their entries.
    Called after each entry is created/updated.
    
    - spend_under goals: Count neutral + excess expenses (exclude mandatory)
    - log_n_days goals: Count days with any entries
    - streak goals: Already handled by streak system
    """
    if entry_date is None:
        entry_date = datetime.utcnow()
    
    # Get all active spend_under goals for this user
    result = await db.execute(
        select(Goal).where(
            Goal.user_id == user_id,
            Goal.kind == GoalKind.spend_under,
            Goal.status == GoalStatus.active,
            Goal.start_date <= entry_date,
            and_(Goal.end_date == None, True) | (Goal.end_date >= entry_date)
        )
    )
    spend_goals = result.scalars().all()
    
    for goal in spend_goals:
        # Calculate total discretionary (non-mandatory) expenses within goal period
        expense_query = select(Entry).where(
            Entry.user_id == user_id,
            Entry.type == EntryType.expense,
            Entry.booked_at >= goal.start_date,
            Entry.booked_at <= (goal.end_date or entry_date)
        )
        
        expense_result = await db.execute(expense_query)
        expenses = expense_result.scalars().all()
        
        # Sum discretionary expenses (exclude mandatory)
        discretionary_total = 0.0
        for exp in expenses:
            if exp.category:
                # Check if category is NOT mandatory
                from models import ExpenseType as ModelExpenseType
                if exp.category.expense_type != ModelExpenseType.mandatory:
                    discretionary_total += exp.amount
            else:
                # No category info, include it (safer assumption)
                discretionary_total += exp.amount
        
        goal.current_value = discretionary_total
    
    # Get all active log_n_days goals for this user
    result = await db.execute(
        select(Goal).where(
            Goal.user_id == user_id,
            Goal.kind == GoalKind.log_n_days,
            Goal.status == GoalStatus.active,
            Goal.start_date <= entry_date,
            and_(Goal.end_date == None, True) | (Goal.end_date >= entry_date)
        )
    )
    log_goals = result.scalars().all()
    
    for goal in log_goals:
        # Count unique days with at least one entry in goal period
        entry_query = select(Entry).where(
            Entry.user_id == user_id,
            Entry.booked_at >= goal.start_date,
            Entry.booked_at <= (goal.end_date or entry_date)
        ).order_by(Entry.booked_at)
        
        entry_result = await db.execute(entry_query)
        entries = entry_result.scalars().all()
        
        # Count unique days
        unique_days = set()
        for entry in entries:
            day = entry.booked_at.date()
            unique_days.add(day)
        
        goal.current_value = float(len(unique_days))
    
    await db.commit()


async def calculate_no_spend_challenge_progress(user_id: int, db: AsyncSession) -> ChallengeProgress:
    """
    Calculate user's no-spend challenge progress.
    A no-spend day = day with ONLY mandatory expenses or no expenses at all.
    Discretionary spending = neutral + excess category expenses.
    Includes personal record (best streak ever).
    """
    # Get all expenses for this user (recent ones first)
    result = await db.execute(
        select(Entry).where(
            Entry.user_id == user_id,
            Entry.type == EntryType.expense
        ).order_by(Entry.booked_at.desc()).limit(365)  # Last year
    )
    expenses = result.scalars().all()
    
    # Group by date and check for discretionary spending
    daily_spending = {}  # date -> has_discretionary_spending
    
    for expense in expenses:
        day = expense.booked_at.date()
        
        if day not in daily_spending:
            daily_spending[day] = False
        
        # Mark day as having discretionary spending if this is a non-mandatory expense
        if expense.category:
            from models import ExpenseType as ModelExpenseType
            if expense.category.expense_type != ModelExpenseType.mandatory:
                daily_spending[day] = True
        else:
            # No category = assume discretionary
            daily_spending[day] = True
    
    # Calculate consecutive no-spend days (most recent backwards)
    consecutive_days = 0
    last_no_spend_date = None
    
    for day in sorted(daily_spending.keys(), reverse=True):
        if not daily_spending[day]:  # No discretionary spending on this day
            consecutive_days += 1
            if last_no_spend_date is None:
                last_no_spend_date = day.isoformat()
        else:
            break  # Stop counting when we hit a day with spending
    
    # Count total days with discretionary spending
    days_with_spending = sum(1 for has_spending in daily_spending.values() if has_spending)
    
    # Get personal record
    personal_record = await get_personal_no_spend_record(user_id, db)
    
    return ChallengeProgress(
        user_id=user_id,
        consecutive_no_spend_days=consecutive_days,
        last_no_spend_date=last_no_spend_date,
        days_with_discretionary_spending=days_with_spending,
        personal_record=personal_record,
        updated_at=datetime.utcnow()
    )


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
    """Create a new goal and automatically calculate current value based on existing entries"""
    goal = Goal(
        **goal_data.model_dump(),
        user_id=current_user.id,
        current_value=0
    )
    
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    
    # Update goal progress based on existing entries
    await update_goals_for_user(current_user.id, db, goal.start_date)
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


@router.post("/goals/{goal_id}/complete", response_model=GoalOut)
async def complete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a goal as completed"""
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
    
    goal.status = GoalStatus.completed
    goal.updated_at = datetime.utcnow()
    
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


# ===== SAVINGS GOAL ENDPOINTS =====
class SavingsUpdate(BaseModel):
    """Request body for adding savings to a goal"""
    amount: float = Field(gt=0, description="Amount to add to savings")


@router.post("/goals/{goal_id}/add-savings", response_model=GoalOut)
async def add_savings_to_goal(
    goal_id: int,
    savings_data: SavingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add savings amount to a savings goal"""
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
    
    if goal.kind != GoalKind.savings:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This goal is not a savings goal"
        )
    
    # Add amount to current savings
    goal.current_value += savings_data.amount
    goal.updated_at = datetime.utcnow()
    
    # Auto-complete if target reached
    if goal.target_value and goal.current_value >= goal.target_value:
        goal.status = GoalStatus.completed
    
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


# ===== NO-SPEND CHALLENGES =====
@router.get("/challenges/no-spend", response_model=ChallengeProgress)
async def get_no_spend_challenge_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's no-spend challenge progress.
    A "no-spend day" means ONLY mandatory expenses or no expenses.
    This tracks consecutive days without discretionary spending.
    """
    progress = await calculate_no_spend_challenge_progress(current_user.id, db)
    return progress


@router.post("/goals/refresh", response_model=List[GoalOut])
async def refresh_all_goals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Manually refresh all goals - recalculate current_value based on entries.
    Useful after bulk operations or to sync frontend with backend.
    """
    # Update all goals for this user
    await update_goals_for_user(current_user.id, db)
    
    # Return updated goals
    result = await db.execute(
        select(Goal).where(Goal.user_id == current_user.id).order_by(Goal.created_at.desc())
    )
    goals = result.scalars().all()
    
    goals_out = []
    for goal in goals:
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
        goals_out.append(GoalOut(**goal_dict))
    
    return goals_out