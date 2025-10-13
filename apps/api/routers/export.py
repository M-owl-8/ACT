"""
Data Export API endpoints - CSV export of entries
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from typing import Optional
import csv
import io

from db import get_db
from models import User, Entry
from security import get_current_user

router = APIRouter()


@router.get("/entries/csv")
async def export_entries_csv(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Export user's entries as CSV file
    Optionally filter by date range
    """
    # Build query
    query = select(Entry).where(Entry.user_id == current_user.id)
    
    if start_date:
        query = query.where(Entry.booked_at >= start_date)
    
    if end_date:
        query = query.where(Entry.booked_at <= end_date)
    
    query = query.order_by(Entry.booked_at.desc())
    query = query.options(selectinload(Entry.category))
    
    # Execute query
    result = await db.execute(query)
    entries = result.scalars().all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'ID',
        'Type',
        'Category',
        'Amount',
        'Currency',
        'Note',
        'Date',
        'Created At'
    ])
    
    # Write data
    for entry in entries:
        category_name = entry.category.name if entry.category else 'Uncategorized'
        
        writer.writerow([
            entry.id,
            entry.type.value,
            category_name,
            entry.amount,
            entry.currency,
            entry.note or '',
            entry.booked_at.strftime('%Y-%m-%d %H:%M:%S'),
            entry.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ])
    
    # Prepare response
    output.seek(0)
    
    # Generate filename
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    filename = f"act_entries_{timestamp}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/entries/json")
async def export_entries_json(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Export user's entries as JSON
    Optionally filter by date range
    """
    # Build query
    query = select(Entry).where(Entry.user_id == current_user.id)
    
    if start_date:
        query = query.where(Entry.booked_at >= start_date)
    
    if end_date:
        query = query.where(Entry.booked_at <= end_date)
    
    query = query.order_by(Entry.booked_at.desc())
    query = query.options(selectinload(Entry.category))
    
    # Execute query
    result = await db.execute(query)
    entries = result.scalars().all()
    
    # Convert to dict
    entries_data = []
    for entry in entries:
        entries_data.append({
            "id": entry.id,
            "type": entry.type.value,
            "category": entry.category.name if entry.category else None,
            "category_id": entry.category_id,
            "amount": entry.amount,
            "currency": entry.currency,
            "note": entry.note,
            "booked_at": entry.booked_at.isoformat(),
            "created_at": entry.created_at.isoformat(),
            "updated_at": entry.updated_at.isoformat()
        })
    
    return {
        "user_id": current_user.id,
        "user_email": current_user.email,
        "exported_at": datetime.utcnow().isoformat(),
        "total_entries": len(entries_data),
        "entries": entries_data
    }