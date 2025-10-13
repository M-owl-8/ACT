"""
Financial Literacy Books API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime

from db import get_db
from models import User, Book, UserBookProgress, BookStatus
from schemas import BookOut, UserBookProgressOut, UserBookProgressUpdate
from security import get_current_user

router = APIRouter()


@router.get("/", response_model=List[BookOut])
async def list_books(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all books with user's progress
    """
    # Get all books ordered by order_index
    result = await db.execute(
        select(Book).order_by(Book.order_index)
    )
    books = result.scalars().all()
    
    # Get user's progress for all books
    progress_result = await db.execute(
        select(UserBookProgress).where(
            UserBookProgress.user_id == current_user.id
        )
    )
    progress_map = {p.book_id: p for p in progress_result.scalars().all()}
    
    # Combine books with progress
    books_out = []
    for book in books:
        book_dict = {
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "cover_url": book.cover_url,
            "summary": book.summary,
            "key_takeaways": book.key_takeaways,
            "order_index": book.order_index,
            "user_progress": None
        }
        
        if book.id in progress_map:
            progress = progress_map[book.id]
            book_dict["user_progress"] = UserBookProgressOut(
                user_id=progress.user_id,
                book_id=progress.book_id,
                status=progress.status,
                progress_percent=progress.progress_percent,
                started_at=progress.started_at,
                completed_at=progress.completed_at,
                updated_at=progress.updated_at
            )
        
        books_out.append(BookOut(**book_dict))
    
    return books_out


@router.get("/{book_id}", response_model=BookOut)
async def get_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific book with user's progress"""
    result = await db.execute(
        select(Book).where(Book.id == book_id)
    )
    book = result.scalar_one_or_none()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Get user's progress
    progress_result = await db.execute(
        select(UserBookProgress).where(
            UserBookProgress.user_id == current_user.id,
            UserBookProgress.book_id == book_id
        )
    )
    progress = progress_result.scalar_one_or_none()
    
    book_dict = {
        "id": book.id,
        "title": book.title,
        "author": book.author,
        "cover_url": book.cover_url,
        "summary": book.summary,
        "key_takeaways": book.key_takeaways,
        "order_index": book.order_index,
        "user_progress": None
    }
    
    if progress:
        book_dict["user_progress"] = UserBookProgressOut(
            user_id=progress.user_id,
            book_id=progress.book_id,
            status=progress.status,
            progress_percent=progress.progress_percent,
            started_at=progress.started_at,
            completed_at=progress.completed_at,
            updated_at=progress.updated_at
        )
    
    return BookOut(**book_dict)


@router.post("/{book_id}/progress", response_model=UserBookProgressOut)
async def update_book_progress(
    book_id: int,
    progress_data: UserBookProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user's reading progress for a book"""
    # Verify book exists
    result = await db.execute(
        select(Book).where(Book.id == book_id)
    )
    book = result.scalar_one_or_none()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Get or create progress
    result = await db.execute(
        select(UserBookProgress).where(
            UserBookProgress.user_id == current_user.id,
            UserBookProgress.book_id == book_id
        )
    )
    progress = result.scalar_one_or_none()
    
    if not progress:
        progress = UserBookProgress(
            user_id=current_user.id,
            book_id=book_id,
            status=BookStatus.not_started,
            progress_percent=0
        )
        db.add(progress)
    
    # Update fields
    update_data = progress_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(progress, field, value)
    
    # Auto-set timestamps based on status
    if progress_data.status:
        if progress_data.status == BookStatus.in_progress and not progress.started_at:
            progress.started_at = datetime.utcnow()
        elif progress_data.status == BookStatus.done:
            if not progress.started_at:
                progress.started_at = datetime.utcnow()
            progress.completed_at = datetime.utcnow()
            progress.progress_percent = 100
    
    await db.commit()
    await db.refresh(progress)
    
    return UserBookProgressOut(
        user_id=progress.user_id,
        book_id=progress.book_id,
        status=progress.status,
        progress_percent=progress.progress_percent,
        started_at=progress.started_at,
        completed_at=progress.completed_at,
        updated_at=progress.updated_at
    )


@router.get("/progress/stats", response_model=dict)
async def get_reading_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's reading statistics"""
    result = await db.execute(
        select(UserBookProgress).where(
            UserBookProgress.user_id == current_user.id
        )
    )
    all_progress = result.scalars().all()
    
    stats = {
        "total_books": 20,  # Fixed number of books in library
        "not_started": sum(1 for p in all_progress if p.status == BookStatus.not_started),
        "in_progress": sum(1 for p in all_progress if p.status == BookStatus.in_progress),
        "completed": sum(1 for p in all_progress if p.status == BookStatus.done),
        "completion_rate": 0
    }
    
    if stats["total_books"] > 0:
        stats["completion_rate"] = round(
            (stats["completed"] / stats["total_books"]) * 100, 2
        )
    
    return stats