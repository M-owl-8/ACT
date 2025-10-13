"""
Dashboard API endpoints - Statistics and analytics
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta
from typing import List

from db import get_db
from models import User, Entry, Category, EntryType
from schemas import DashboardResponse, DashboardStats, CategoryBreakdown
from security import get_current_user

router = APIRouter()


async def calculate_stats(
    user_id: int,
    days: int,
    db: AsyncSession
) -> DashboardStats:
    """Calculate statistics for a given period"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get all entries in period
    result = await db.execute(
        select(Entry).where(
            and_(
                Entry.user_id == user_id,
                Entry.booked_at >= start_date,
                Entry.booked_at <= end_date
            )
        )
    )
    entries = result.scalars().all()
    
    # Calculate totals
    total_income = sum(e.amount for e in entries if e.type == EntryType.income)
    total_expenses = sum(e.amount for e in entries if e.type == EntryType.expense)
    balance = total_income - total_expenses
    
    return DashboardStats(
        period_days=days,
        total_income=round(total_income, 2),
        total_expenses=round(total_expenses, 2),
        balance=round(balance, 2),
        entry_count=len(entries),
        start_date=start_date,
        end_date=end_date
    )


async def calculate_category_breakdown(
    user_id: int,
    days: int,
    db: AsyncSession
) -> List[CategoryBreakdown]:
    """Calculate spending/income by category"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get entries with categories
    result = await db.execute(
        select(Entry, Category).outerjoin(
            Category, Entry.category_id == Category.id
        ).where(
            and_(
                Entry.user_id == user_id,
                Entry.booked_at >= start_date,
                Entry.booked_at <= end_date
            )
        )
    )
    entries_with_categories = result.all()
    
    # Group by category
    category_totals = {}
    total_amount = 0
    
    for entry, category in entries_with_categories:
        cat_name = category.name if category else "Uncategorized"
        cat_id = category.id if category else None
        cat_type = entry.type
        
        key = (cat_id, cat_name, cat_type)
        
        if key not in category_totals:
            category_totals[key] = {
                "amount": 0,
                "count": 0
            }
        
        category_totals[key]["amount"] += entry.amount
        category_totals[key]["count"] += 1
        total_amount += entry.amount
    
    # Convert to CategoryBreakdown objects
    breakdowns = []
    for (cat_id, cat_name, cat_type), data in category_totals.items():
        percentage = (data["amount"] / total_amount * 100) if total_amount > 0 else 0
        
        breakdowns.append(CategoryBreakdown(
            category_id=cat_id,
            category_name=cat_name,
            type=cat_type,
            total_amount=round(data["amount"], 2),
            entry_count=data["count"],
            percentage=round(percentage, 2)
        ))
    
    # Sort by amount descending
    breakdowns.sort(key=lambda x: x.total_amount, reverse=True)
    
    return breakdowns


@router.get("/", response_model=DashboardResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get complete dashboard data:
    - 7-day statistics
    - 30-day statistics
    - Category breakdown (30 days)
    """
    # Calculate stats for both periods
    stats_7d = await calculate_stats(current_user.id, 7, db)
    stats_30d = await calculate_stats(current_user.id, 30, db)
    
    # Calculate category breakdown for 30 days
    category_breakdown = await calculate_category_breakdown(current_user.id, 30, db)
    
    return DashboardResponse(
        stats_7d=stats_7d,
        stats_30d=stats_30d,
        category_breakdown=category_breakdown
    )


@router.get("/stats/{days}", response_model=DashboardStats)
async def get_stats_for_period(
    days: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get statistics for a custom period (in days)"""
    if days < 1 or days > 365:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Days must be between 1 and 365"
        )
    
    return await calculate_stats(current_user.id, days, db)


@router.get("/breakdown/{days}", response_model=List[CategoryBreakdown])
async def get_category_breakdown_for_period(
    days: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get category breakdown for a custom period (in days)"""
    if days < 1 or days > 365:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Days must be between 1 and 365"
        )
    
    return await calculate_category_breakdown(current_user.id, days, db)