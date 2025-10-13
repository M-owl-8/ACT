"""
Reports API endpoints - Financial summaries with alerts
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional, List
from datetime import datetime, timedelta
from enum import Enum

from db import get_db
from models import User, Entry, Category, EntryType, ExpenseType
from security import get_current_user

router = APIRouter()


class ReportRange(str, Enum):
    day = "day"
    week = "week"
    fifteen_days = "15d"
    month = "month"
    last_3_months = "last3m"


def get_date_range(range_type: ReportRange) -> tuple[datetime, datetime]:
    """Calculate start and end dates based on range type"""
    now = datetime.utcnow()
    end_date = now
    
    if range_type == ReportRange.day:
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif range_type == ReportRange.week:
        start_date = now - timedelta(days=7)
    elif range_type == ReportRange.fifteen_days:
        start_date = now - timedelta(days=15)
    elif range_type == ReportRange.month:
        start_date = now - timedelta(days=30)
    elif range_type == ReportRange.last_3_months:
        start_date = now - timedelta(days=90)
    else:
        start_date = now - timedelta(days=30)
    
    return start_date, end_date


@router.get("/summary")
async def get_report_summary(
    range: ReportRange = Query(default=ReportRange.month, description="Time range for the report"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get financial summary report for specified time range
    
    Returns:
    - income_total: Total income
    - expense_total: Total expenses
    - net: Net balance (income - expenses)
    - expense_by_type: Breakdown by mandatory/neutral/excess
    - top_categories: Top 5 spending categories
    - excess_over_threshold: Alert flag if excess > 0.5 × mandatory
    - date_range: Start and end dates
    - has_data: Boolean indicating if user has any entries
    """
    start_date, end_date = get_date_range(range)
    
    # ===== 1. Calculate Income Total =====
    income_query = select(
        func.coalesce(func.sum(Entry.amount), 0).label('total')
    ).where(
        Entry.user_id == current_user.id,
        Entry.type == EntryType.income,
        Entry.booked_at >= start_date,
        Entry.booked_at <= end_date
    )
    
    income_result = await db.execute(income_query)
    income_total = float(income_result.scalar())
    
    # ===== 2. Calculate Expense Total =====
    expense_query = select(
        func.coalesce(func.sum(Entry.amount), 0).label('total')
    ).where(
        Entry.user_id == current_user.id,
        Entry.type == EntryType.expense,
        Entry.booked_at >= start_date,
        Entry.booked_at <= end_date
    )
    
    expense_result = await db.execute(expense_query)
    expense_total = float(expense_result.scalar())
    
    # ===== 3. Calculate Net Balance =====
    net = income_total - expense_total
    
    # ===== 4. Breakdown by Expense Type =====
    expense_by_type = {
        "mandatory": 0.0,
        "neutral": 0.0,
        "excess": 0.0
    }
    
    for exp_type in ExpenseType:
        type_query = select(
            func.coalesce(func.sum(Entry.amount), 0).label('total')
        ).select_from(Entry).join(
            Category, Entry.category_id == Category.id
        ).where(
            Entry.user_id == current_user.id,
            Entry.type == EntryType.expense,
            Category.expense_type == exp_type,
            Entry.booked_at >= start_date,
            Entry.booked_at <= end_date
        )
        
        type_result = await db.execute(type_query)
        expense_by_type[exp_type.value] = float(type_result.scalar())
    
    # ===== 5. Top Categories (Top 5 by spending) =====
    top_categories_query = select(
        Category.id,
        Category.name,
        Category.icon,
        Category.color,
        Category.expense_type,
        func.sum(Entry.amount).label('total'),
        func.count(Entry.id).label('count')
    ).select_from(Entry).join(
        Category, Entry.category_id == Category.id
    ).where(
        Entry.user_id == current_user.id,
        Entry.type == EntryType.expense,
        Entry.booked_at >= start_date,
        Entry.booked_at <= end_date
    ).group_by(
        Category.id, Category.name, Category.icon, Category.color, Category.expense_type
    ).order_by(
        func.sum(Entry.amount).desc()
    ).limit(5)
    
    top_result = await db.execute(top_categories_query)
    top_categories = []
    
    for row in top_result:
        top_categories.append({
            "category_id": row.id,
            "category_name": row.name,
            "category_icon": row.icon,
            "category_color": row.color,
            "expense_type": row.expense_type.value if row.expense_type else None,
            "total": round(float(row.total), 2),
            "count": int(row.count)
        })
    
    # ===== 6. Excess Alert Rule =====
    # Alert if: excess > 0.5 × mandatory
    mandatory_total = expense_by_type["mandatory"]
    excess_total = expense_by_type["excess"]
    
    excess_over_threshold = False
    threshold_value = mandatory_total * 0.5
    
    if mandatory_total > 0 and excess_total > threshold_value:
        excess_over_threshold = True
    
    # ===== 7. Check if user has any data =====
    has_data = income_total > 0 or expense_total > 0
    
    # ===== 8. Build Response =====
    return {
        "range": range.value,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "has_data": has_data,
        "income_total": round(income_total, 2),
        "expense_total": round(expense_total, 2),
        "net": round(net, 2),
        "expense_by_type": {
            "mandatory": round(expense_by_type["mandatory"], 2),
            "neutral": round(expense_by_type["neutral"], 2),
            "excess": round(expense_by_type["excess"], 2)
        },
        "top_categories": top_categories,
        "excess_alert": {
            "excess_over_threshold": excess_over_threshold,
            "excess_total": round(excess_total, 2),
            "mandatory_total": round(mandatory_total, 2),
            "threshold_value": round(threshold_value, 2),
            "message": f"⚠️ Excess spending (${excess_total:.2f}) exceeds 50% of mandatory expenses (${mandatory_total:.2f})" if excess_over_threshold else None
        },
        "currency": current_user.currency
    }


@router.get("/comparison")
async def get_period_comparison(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Compare current month vs previous month
    Useful for trend analysis
    """
    now = datetime.utcnow()
    
    # Current month
    current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    current_month_end = now
    
    # Previous month
    if now.month == 1:
        prev_month_start = now.replace(year=now.year - 1, month=12, day=1, hour=0, minute=0, second=0, microsecond=0)
        prev_month_end = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0) - timedelta(seconds=1)
    else:
        prev_month_start = now.replace(month=now.month - 1, day=1, hour=0, minute=0, second=0, microsecond=0)
        prev_month_end = current_month_start - timedelta(seconds=1)
    
    async def get_period_stats(start: datetime, end: datetime):
        # Income
        income_query = select(
            func.coalesce(func.sum(Entry.amount), 0)
        ).where(
            Entry.user_id == current_user.id,
            Entry.type == EntryType.income,
            Entry.booked_at >= start,
            Entry.booked_at <= end
        )
        income_result = await db.execute(income_query)
        income = float(income_result.scalar())
        
        # Expenses
        expense_query = select(
            func.coalesce(func.sum(Entry.amount), 0)
        ).where(
            Entry.user_id == current_user.id,
            Entry.type == EntryType.expense,
            Entry.booked_at >= start,
            Entry.booked_at <= end
        )
        expense_result = await db.execute(expense_query)
        expense = float(expense_result.scalar())
        
        return {
            "income": round(income, 2),
            "expense": round(expense, 2),
            "net": round(income - expense, 2)
        }
    
    current_stats = await get_period_stats(current_month_start, current_month_end)
    previous_stats = await get_period_stats(prev_month_start, prev_month_end)
    
    # Calculate changes
    income_change = current_stats["income"] - previous_stats["income"]
    expense_change = current_stats["expense"] - previous_stats["expense"]
    net_change = current_stats["net"] - previous_stats["net"]
    
    income_change_pct = (income_change / previous_stats["income"] * 100) if previous_stats["income"] > 0 else 0
    expense_change_pct = (expense_change / previous_stats["expense"] * 100) if previous_stats["expense"] > 0 else 0
    
    return {
        "current_month": {
            **current_stats,
            "start_date": current_month_start.isoformat(),
            "end_date": current_month_end.isoformat()
        },
        "previous_month": {
            **previous_stats,
            "start_date": prev_month_start.isoformat(),
            "end_date": prev_month_end.isoformat()
        },
        "changes": {
            "income_change": round(income_change, 2),
            "income_change_percent": round(income_change_pct, 2),
            "expense_change": round(expense_change, 2),
            "expense_change_percent": round(expense_change_pct, 2),
            "net_change": round(net_change, 2)
        }
    }