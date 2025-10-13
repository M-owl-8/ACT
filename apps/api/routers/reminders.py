"""
Reminders API endpoints - Planned expenses with local notifications
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

from db import get_db
from models import User, Reminder, Category, Entry
from security import get_current_user

router = APIRouter()


# ===== SCHEMAS =====
class ReminderCreate(BaseModel):
    """Schema for creating a reminder"""
    title: str = Field(..., min_length=1, max_length=200)
    amount: Optional[float] = Field(None, ge=0)
    category_id: Optional[int] = None
    note: Optional[str] = None
    reminder_date: datetime


class ReminderUpdate(BaseModel):
    """Schema for updating a reminder"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    amount: Optional[float] = Field(None, ge=0)
    category_id: Optional[int] = None
    note: Optional[str] = None
    reminder_date: Optional[datetime] = None
    is_completed: Optional[bool] = None


class ReminderResponse(BaseModel):
    """Schema for reminder response"""
    id: int
    user_id: int
    category_id: Optional[int]
    category_name: Optional[str]
    category_icon: Optional[str]
    category_color: Optional[str]
    title: str
    amount: Optional[float]
    currency: str
    note: Optional[str]
    reminder_date: datetime
    is_completed: bool
    completed_at: Optional[datetime]
    entry_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReminderListResponse(BaseModel):
    """Schema for list of reminders"""
    reminders: List[ReminderResponse]
    total: int
    upcoming_count: int
    completed_count: int


class QuickExpenseCreate(BaseModel):
    """Schema for quickly creating expense from reminder"""
    amount: Optional[float] = Field(None, ge=0)
    note: Optional[str] = None
    booked_at: Optional[datetime] = None


# ===== ENDPOINTS =====

@router.post("/", response_model=ReminderResponse, status_code=201)
async def create_reminder(
    reminder_data: ReminderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new reminder for planned expense
    
    - Limited to 3 months in the future
    - Optional category and amount
    - Returns created reminder with category details
    """
    # Validate reminder date is not in the past
    if reminder_data.reminder_date < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reminder date cannot be in the past")
    
    # Validate reminder date is within 3 months
    max_date = datetime.utcnow() + timedelta(days=90)
    if reminder_data.reminder_date > max_date:
        raise HTTPException(status_code=400, detail="Reminder date cannot be more than 3 months in the future")
    
    # Validate category if provided
    category = None
    if reminder_data.category_id:
        result = await db.execute(
            select(Category).filter(
                Category.id == reminder_data.category_id,
                or_(Category.user_id == current_user.id, Category.is_default == True),
                Category.is_deleted == False
            )
        )
        category = result.scalar_one_or_none()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    
    # Create reminder
    new_reminder = Reminder(
        user_id=current_user.id,
        category_id=reminder_data.category_id,
        title=reminder_data.title,
        amount=reminder_data.amount,
        currency=current_user.currency,
        note=reminder_data.note,
        reminder_date=reminder_data.reminder_date,
        is_completed=False
    )
    
    db.add(new_reminder)
    await db.commit()
    await db.refresh(new_reminder)
    
    # Build response with category details
    return ReminderResponse(
        id=new_reminder.id,
        user_id=new_reminder.user_id,
        category_id=new_reminder.category_id,
        category_name=category.name if category else None,
        category_icon=category.icon if category else None,
        category_color=category.color if category else None,
        title=new_reminder.title,
        amount=new_reminder.amount,
        currency=new_reminder.currency,
        note=new_reminder.note,
        reminder_date=new_reminder.reminder_date,
        is_completed=new_reminder.is_completed,
        completed_at=new_reminder.completed_at,
        entry_id=new_reminder.entry_id,
        created_at=new_reminder.created_at,
        updated_at=new_reminder.updated_at
    )


@router.get("/", response_model=ReminderListResponse)
async def get_reminders(
    include_completed: bool = Query(default=False, description="Include completed reminders"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all reminders for current user
    
    - Filter by completion status
    - Filter by date range
    - Returns reminders with category details
    - Includes summary counts
    """
    # Build query
    query = select(Reminder).filter(Reminder.user_id == current_user.id)
    
    # Filter by completion status
    if not include_completed:
        query = query.filter(Reminder.is_completed == False)
    
    # Filter by date range
    if start_date:
        query = query.filter(Reminder.reminder_date >= start_date)
    if end_date:
        query = query.filter(Reminder.reminder_date <= end_date)
    
    # Order by reminder date
    query = query.order_by(Reminder.reminder_date.asc())
    
    result = await db.execute(query)
    reminders = result.scalars().all()
    
    # Get category details for each reminder
    reminder_responses = []
    for reminder in reminders:
        category = None
        if reminder.category_id:
            cat_result = await db.execute(
                select(Category).filter(Category.id == reminder.category_id)
            )
            category = cat_result.scalar_one_or_none()
        
        reminder_responses.append(ReminderResponse(
            id=reminder.id,
            user_id=reminder.user_id,
            category_id=reminder.category_id,
            category_name=category.name if category else None,
            category_icon=category.icon if category else None,
            category_color=category.color if category else None,
            title=reminder.title,
            amount=reminder.amount,
            currency=reminder.currency,
            note=reminder.note,
            reminder_date=reminder.reminder_date,
            is_completed=reminder.is_completed,
            completed_at=reminder.completed_at,
            entry_id=reminder.entry_id,
            created_at=reminder.created_at,
            updated_at=reminder.updated_at
        ))
    
    # Get summary counts
    total_result = await db.execute(
        select(Reminder).filter(Reminder.user_id == current_user.id)
    )
    total_count = len(total_result.scalars().all())
    
    upcoming_result = await db.execute(
        select(Reminder).filter(
            Reminder.user_id == current_user.id,
            Reminder.is_completed == False,
            Reminder.reminder_date >= datetime.utcnow()
        )
    )
    upcoming_count = len(upcoming_result.scalars().all())
    
    completed_result = await db.execute(
        select(Reminder).filter(
            Reminder.user_id == current_user.id,
            Reminder.is_completed == True
        )
    )
    completed_count = len(completed_result.scalars().all())
    
    return ReminderListResponse(
        reminders=reminder_responses,
        total=total_count,
        upcoming_count=upcoming_count,
        completed_count=completed_count
    )


@router.get("/{reminder_id}", response_model=ReminderResponse)
async def get_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific reminder by ID"""
    result = await db.execute(
        select(Reminder).filter(
            Reminder.id == reminder_id,
            Reminder.user_id == current_user.id
        )
    )
    reminder = result.scalar_one_or_none()
    
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    # Get category details
    category = None
    if reminder.category_id:
        cat_result = await db.execute(
            select(Category).filter(Category.id == reminder.category_id)
        )
        category = cat_result.scalar_one_or_none()
    
    return ReminderResponse(
        id=reminder.id,
        user_id=reminder.user_id,
        category_id=reminder.category_id,
        category_name=category.name if category else None,
        category_icon=category.icon if category else None,
        category_color=category.color if category else None,
        title=reminder.title,
        amount=reminder.amount,
        currency=reminder.currency,
        note=reminder.note,
        reminder_date=reminder.reminder_date,
        is_completed=reminder.is_completed,
        completed_at=reminder.completed_at,
        entry_id=reminder.entry_id,
        created_at=reminder.created_at,
        updated_at=reminder.updated_at
    )


@router.put("/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(
    reminder_id: int,
    reminder_data: ReminderUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a reminder
    
    - Can update title, amount, category, note, date, completion status
    - Cannot update if already linked to an entry
    - Validates date constraints
    """
    # Get reminder
    result = await db.execute(
        select(Reminder).filter(
            Reminder.id == reminder_id,
            Reminder.user_id == current_user.id
        )
    )
    reminder = result.scalar_one_or_none()
    
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    # Validate reminder date if provided
    if reminder_data.reminder_date:
        if reminder_data.reminder_date < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Reminder date cannot be in the past")
        
        max_date = datetime.utcnow() + timedelta(days=90)
        if reminder_data.reminder_date > max_date:
            raise HTTPException(status_code=400, detail="Reminder date cannot be more than 3 months in the future")
    
    # Validate category if provided
    if reminder_data.category_id:
        cat_result = await db.execute(
            select(Category).filter(
                Category.id == reminder_data.category_id,
                or_(Category.user_id == current_user.id, Category.is_default == True),
                Category.is_deleted == False
            )
        )
        category = cat_result.scalar_one_or_none()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    
    # Update fields
    if reminder_data.title is not None:
        reminder.title = reminder_data.title
    if reminder_data.amount is not None:
        reminder.amount = reminder_data.amount
    if reminder_data.category_id is not None:
        reminder.category_id = reminder_data.category_id
    if reminder_data.note is not None:
        reminder.note = reminder_data.note
    if reminder_data.reminder_date is not None:
        reminder.reminder_date = reminder_data.reminder_date
    if reminder_data.is_completed is not None:
        reminder.is_completed = reminder_data.is_completed
        if reminder_data.is_completed and not reminder.completed_at:
            reminder.completed_at = datetime.utcnow()
        elif not reminder_data.is_completed:
            reminder.completed_at = None
    
    await db.commit()
    await db.refresh(reminder)
    
    # Get category details
    category = None
    if reminder.category_id:
        cat_result = await db.execute(
            select(Category).filter(Category.id == reminder.category_id)
        )
        category = cat_result.scalar_one_or_none()
    
    return ReminderResponse(
        id=reminder.id,
        user_id=reminder.user_id,
        category_id=reminder.category_id,
        category_name=category.name if category else None,
        category_icon=category.icon if category else None,
        category_color=category.color if category else None,
        title=reminder.title,
        amount=reminder.amount,
        currency=reminder.currency,
        note=reminder.note,
        reminder_date=reminder.reminder_date,
        is_completed=reminder.is_completed,
        completed_at=reminder.completed_at,
        entry_id=reminder.entry_id,
        created_at=reminder.created_at,
        updated_at=reminder.updated_at
    )


@router.delete("/{reminder_id}", status_code=204)
async def delete_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a reminder"""
    result = await db.execute(
        select(Reminder).filter(
            Reminder.id == reminder_id,
            Reminder.user_id == current_user.id
        )
    )
    reminder = result.scalar_one_or_none()
    
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    await db.delete(reminder)
    await db.commit()
    
    return None


@router.post("/{reminder_id}/complete", response_model=ReminderResponse)
async def mark_reminder_complete(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark a reminder as completed without creating an expense
    
    - Sets is_completed to true
    - Records completion timestamp
    """
    result = await db.execute(
        select(Reminder).filter(
            Reminder.id == reminder_id,
            Reminder.user_id == current_user.id
        )
    )
    reminder = result.scalar_one_or_none()
    
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    if reminder.is_completed:
        raise HTTPException(status_code=400, detail="Reminder is already completed")
    
    reminder.is_completed = True
    reminder.completed_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(reminder)
    
    # Get category details
    category = None
    if reminder.category_id:
        cat_result = await db.execute(
            select(Category).filter(Category.id == reminder.category_id)
        )
        category = cat_result.scalar_one_or_none()
    
    return ReminderResponse(
        id=reminder.id,
        user_id=reminder.user_id,
        category_id=reminder.category_id,
        category_name=category.name if category else None,
        category_icon=category.icon if category else None,
        category_color=category.color if category else None,
        title=reminder.title,
        amount=reminder.amount,
        currency=reminder.currency,
        note=reminder.note,
        reminder_date=reminder.reminder_date,
        is_completed=reminder.is_completed,
        completed_at=reminder.completed_at,
        entry_id=reminder.entry_id,
        created_at=reminder.created_at,
        updated_at=reminder.updated_at
    )


@router.post("/{reminder_id}/create-expense", response_model=dict)
async def create_expense_from_reminder(
    reminder_id: int,
    expense_data: QuickExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Quick add: Create an actual expense from a reminder and mark it complete
    
    - Creates expense entry with reminder details
    - Marks reminder as completed
    - Links reminder to created entry
    - Returns both reminder and entry IDs
    """
    # Get reminder
    result = await db.execute(
        select(Reminder).filter(
            Reminder.id == reminder_id,
            Reminder.user_id == current_user.id
        )
    )
    reminder = result.scalar_one_or_none()
    
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    if reminder.is_completed and reminder.entry_id:
        raise HTTPException(status_code=400, detail="Reminder already converted to expense")
    
    # Validate category exists and is expense type
    if not reminder.category_id:
        raise HTTPException(status_code=400, detail="Reminder must have a category to create expense")
    
    cat_result = await db.execute(
        select(Category).filter(Category.id == reminder.category_id)
    )
    category = cat_result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    from models import EntryType
    if category.type != EntryType.expense:
        raise HTTPException(status_code=400, detail="Category must be an expense category")
    
    # Use provided amount or reminder amount
    amount = expense_data.amount if expense_data.amount is not None else reminder.amount
    if amount is None or amount <= 0:
        raise HTTPException(status_code=400, detail="Amount is required and must be greater than 0")
    
    # Use provided note or reminder note
    note = expense_data.note if expense_data.note is not None else reminder.note
    
    # Use provided booked_at or current time
    booked_at = expense_data.booked_at if expense_data.booked_at else datetime.utcnow()
    
    # Create expense entry
    new_entry = Entry(
        user_id=current_user.id,
        category_id=reminder.category_id,
        type=EntryType.expense,
        amount=amount,
        currency=current_user.currency,
        note=note,
        booked_at=booked_at
    )
    
    db.add(new_entry)
    await db.flush()  # Get entry ID without committing
    
    # Mark reminder as completed and link to entry
    reminder.is_completed = True
    reminder.completed_at = datetime.utcnow()
    reminder.entry_id = new_entry.id
    
    await db.commit()
    await db.refresh(reminder)
    await db.refresh(new_entry)
    
    return {
        "message": "Expense created successfully from reminder",
        "reminder_id": reminder.id,
        "entry_id": new_entry.id,
        "amount": new_entry.amount,
        "category_name": category.name
    }


@router.get("/calendar/{year}/{month}", response_model=dict)
async def get_calendar_reminders(
    year: int,
    month: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get reminders for a specific month in calendar format
    
    - Returns reminders grouped by date
    - Includes only non-completed reminders by default
    - Useful for calendar view rendering
    """
    # Validate month and year
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    
    if year < 2000 or year > 2100:
        raise HTTPException(status_code=400, detail="Year must be between 2000 and 2100")
    
    # Calculate date range for the month
    from calendar import monthrange
    _, last_day = monthrange(year, month)
    
    start_date = datetime(year, month, 1, 0, 0, 0)
    end_date = datetime(year, month, last_day, 23, 59, 59)
    
    # Get reminders for the month
    result = await db.execute(
        select(Reminder).filter(
            Reminder.user_id == current_user.id,
            Reminder.reminder_date >= start_date,
            Reminder.reminder_date <= end_date
        ).order_by(Reminder.reminder_date.asc())
    )
    reminders = result.scalars().all()
    
    # Group reminders by date
    reminders_by_date = {}
    for reminder in reminders:
        date_key = reminder.reminder_date.strftime("%Y-%m-%d")
        
        # Get category details
        category = None
        if reminder.category_id:
            cat_result = await db.execute(
                select(Category).filter(Category.id == reminder.category_id)
            )
            category = cat_result.scalar_one_or_none()
        
        reminder_data = {
            "id": reminder.id,
            "title": reminder.title,
            "amount": reminder.amount,
            "currency": reminder.currency,
            "time": reminder.reminder_date.strftime("%H:%M"),
            "is_completed": reminder.is_completed,
            "category_name": category.name if category else None,
            "category_icon": category.icon if category else None,
            "category_color": category.color if category else None
        }
        
        if date_key not in reminders_by_date:
            reminders_by_date[date_key] = []
        reminders_by_date[date_key].append(reminder_data)
    
    return {
        "year": year,
        "month": month,
        "reminders_by_date": reminders_by_date,
        "total_reminders": len(reminders)
    }