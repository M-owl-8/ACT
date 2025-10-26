"""
Entries (Expenses/Income) API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime

from db import get_db
from models import User, Entry, Category, EntryType
from schemas import EntryCreate, EntryUpdate, EntryOut
from security import get_current_user

router = APIRouter()


async def update_goals_after_entry_change(user_id: int, entry_date: datetime, db: AsyncSession):
    """
    Update user goals after an entry is created or updated.
    This is called automatically to keep goals in sync with entries.
    """
    try:
        # Import here to avoid circular imports
        from routers.motivation import update_goals_for_user
        await update_goals_for_user(user_id, db, entry_date)
    except Exception as e:
        # Log but don't fail - goals should not block entry operations
        print(f"Warning: Failed to update goals: {str(e)}")
        pass


@router.get("/", response_model=List[EntryOut])
async def list_entries(
    type: Optional[EntryType] = None,
    category_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List entries with filters
    - Filter by type (expense/income)
    - Filter by category
    - Filter by date range
    - Pagination support
    """
    query = select(Entry).where(Entry.user_id == current_user.id)
    
    # Apply filters
    if type:
        query = query.where(Entry.type == type)
    
    if category_id:
        query = query.where(Entry.category_id == category_id)
    
    if start_date:
        query = query.where(Entry.booked_at >= start_date)
    
    if end_date:
        query = query.where(Entry.booked_at <= end_date)
    
    # Order by booked_at descending (most recent first)
    query = query.order_by(Entry.booked_at.desc())
    
    # Pagination
    query = query.offset(offset).limit(limit)
    
    # Load category relationship
    query = query.options(selectinload(Entry.category))
    
    result = await db.execute(query)
    entries = result.scalars().all()
    
    return entries


@router.get("/{entry_id}", response_model=EntryOut)
async def get_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific entry"""
    result = await db.execute(
        select(Entry)
        .where(
            Entry.id == entry_id,
            Entry.user_id == current_user.id
        )
        .options(selectinload(Entry.category))
    )
    entry = result.scalar_one_or_none()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entry not found"
        )
    
    return entry


@router.post("/", response_model=EntryOut, status_code=status.HTTP_201_CREATED)
async def create_entry(
    entry_data: EntryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new entry (expense or income)"""
    # Validate category belongs to user or is default
    if entry_data.category_id:
        result = await db.execute(
            select(Category).where(
                Category.id == entry_data.category_id,
                and_(
                    (Category.user_id == current_user.id) | (Category.user_id == None),
                    Category.is_deleted == False
                )
            )
        )
        category = result.scalar_one_or_none()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid category"
            )
        
        # Validate category type matches entry type
        if category.type != entry_data.type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category type '{category.type}' does not match entry type '{entry_data.type}'"
            )
    
    # Create entry
    entry = Entry(
        **entry_data.model_dump(),
        user_id=current_user.id
    )
    
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    
    # Load category relationship
    await db.refresh(entry, ["category"])
    
    # Update goals based on this new entry
    # This must happen AFTER the entry is committed to the database
    await update_goals_after_entry_change(current_user.id, entry.booked_at, db)
    
    return entry


@router.patch("/{entry_id}", response_model=EntryOut)
async def update_entry(
    entry_id: int,
    entry_data: EntryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing entry"""
    result = await db.execute(
        select(Entry).where(
            Entry.id == entry_id,
            Entry.user_id == current_user.id
        )
    )
    entry = result.scalar_one_or_none()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entry not found"
        )
    
    # Validate category if provided
    if entry_data.category_id is not None:
        result = await db.execute(
            select(Category).where(
                Category.id == entry_data.category_id,
                and_(
                    (Category.user_id == current_user.id) | (Category.user_id == None),
                    Category.is_deleted == False
                )
            )
        )
        category = result.scalar_one_or_none()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid category"
            )
        
        # Validate category type matches entry type
        if category.type != entry.type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category type '{category.type}' does not match entry type '{entry.type}'"
            )
    
    # Update fields
    update_data = entry_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entry, field, value)
    
    await db.commit()
    await db.refresh(entry)
    await db.refresh(entry, ["category"])
    
    # Update goals based on the modified entry
    await update_goals_after_entry_change(current_user.id, entry.booked_at, db)
    
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an entry"""
    result = await db.execute(
        select(Entry).where(
            Entry.id == entry_id,
            Entry.user_id == current_user.id
        )
    )
    entry = result.scalar_one_or_none()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entry not found"
        )
    
    # Store the date before deleting
    entry_date = entry.booked_at
    
    await db.delete(entry)
    await db.commit()
    
    # Update goals after deletion
    await update_goals_after_entry_change(current_user.id, entry_date, db)
    
    return None


@router.get("/stats/count", response_model=dict)
async def get_entry_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get total entry count for the user"""
    result = await db.execute(
        select(func.count(Entry.id)).where(Entry.user_id == current_user.id)
    )
    count = result.scalar()
    
    return {"total_entries": count}


@router.get("/stats/totals", response_model=dict)
async def get_entry_totals(
    type: Optional[EntryType] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get total amounts for entries with filters
    - Filter by type (expense/income)
    - Filter by date range
    Returns total amount and count
    """
    query = select(
        func.sum(Entry.amount).label('total'),
        func.count(Entry.id).label('count')
    ).where(Entry.user_id == current_user.id)
    
    # Apply filters
    if type:
        query = query.where(Entry.type == type)
    
    if start_date:
        query = query.where(Entry.booked_at >= start_date)
    
    if end_date:
        query = query.where(Entry.booked_at <= end_date)
    
    result = await db.execute(query)
    row = result.first()
    
    total = float(row.total) if row.total else 0.0
    count = int(row.count) if row.count else 0
    
    return {
        "total": round(total, 2),
        "count": count,
        "type": type.value if type else "all",
        "start_date": start_date,
        "end_date": end_date
    }


@router.get("/stats/by-expense-type", response_model=dict)
async def get_expense_totals_by_type(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get expense totals grouped by expense_type (mandatory/neutral/excess)
    - Filter by date range
    Returns totals for each expense type
    """
    from models import ExpenseType
    
    # Query for each expense type
    results = {}
    total_all = 0.0
    count_all = 0
    
    for exp_type in ExpenseType:
        query = select(
            func.sum(Entry.amount).label('total'),
            func.count(Entry.id).label('count')
        ).select_from(Entry).join(
            Category, Entry.category_id == Category.id
        ).where(
            Entry.user_id == current_user.id,
            Entry.type == EntryType.expense,
            Category.expense_type == exp_type
        )
        
        if start_date:
            query = query.where(Entry.booked_at >= start_date)
        
        if end_date:
            query = query.where(Entry.booked_at <= end_date)
        
        result = await db.execute(query)
        row = result.first()
        
        total = float(row.total) if row.total else 0.0
        count = int(row.count) if row.count else 0
        
        results[exp_type.value] = {
            "total": round(total, 2),
            "count": count
        }
        
        total_all += total
        count_all += count
    
    return {
        "mandatory": results.get("mandatory", {"total": 0.0, "count": 0}),
        "neutral": results.get("neutral", {"total": 0.0, "count": 0}),
        "excess": results.get("excess", {"total": 0.0, "count": 0}),
        "total": round(total_all, 2),
        "count": count_all,
        "start_date": start_date,
        "end_date": end_date
    }