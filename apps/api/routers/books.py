"""
Comprehensive Books Reading System - Track progress, reading sessions, and statistics
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, date, timedelta
from pydantic import BaseModel
import httpx
import os
from pathlib import Path

from db import get_db
from models import User, Book, UserBookProgress, BookStatus, ReadingSession
from schemas import (
    BookOut, BookCreate, BookSearchResult, UserBookProgressOut, 
    UserBookProgressUpdate, ReadingSessionCreate, ReadingSessionOut,
    BookStatsOut
)
from security import get_current_user

# PDF files storage directory
UPLOADS_DIR = Path("uploads/books")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Create language directories
for lang in ["en", "ru", "uz"]:
    (UPLOADS_DIR / lang).mkdir(parents=True, exist_ok=True)

router = APIRouter()

# ===== OPEN LIBRARY API INTEGRATION =====
async def search_open_library(query: str, limit: int = 10) -> List[BookSearchResult]:
    """
    Search for books using Open Library API
    Returns book details with cover images
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # Search by title/author
            response = await client.get(
                "https://openlibrary.org/search.json",
                params={
                    "q": query,
                    "limit": min(limit, 20),
                    "fields": "key,title,author_name,isbn,cover_i,first_publish_year,number_of_pages"
                }
            )
            
            if response.status_code != 200:
                return []
            
            data = response.json()
            results = []
            
            for doc in data.get("docs", []):
                cover_url = None
                if doc.get("cover_i"):
                    cover_url = f"https://covers.openlibrary.org/b/id/{doc['cover_i']}-M.jpg"
                
                isbn = None
                if doc.get("isbn"):
                    isbn = doc["isbn"][0] if doc["isbn"] else None
                
                result = BookSearchResult(
                    title=doc.get("title", "Unknown"),
                    author=", ".join(doc.get("author_name", [])) if doc.get("author_name") else None,
                    cover_url=cover_url,
                    description=None,  # Open Library doesn't provide descriptions easily
                    isbn=isbn,
                    pages=doc.get("number_of_pages")
                )
                results.append(result)
            
            return results
    
    except Exception as e:
        print(f"[ERROR] Open Library API search failed: {str(e)}")
        return []


# ===== BOOK ENDPOINTS =====
@router.get("/search", response_model=List[BookSearchResult])
async def search_books(
    q: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(default=10, ge=1, le=20),
    current_user: User = Depends(get_current_user)
):
    """
    Search for books using Open Library API
    Returns available books to add to reading list
    """
    results = await search_open_library(q, limit)
    return results


@router.post("/create", response_model=BookOut)
async def create_book(
    book_data: BookCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Manually add a book to user's reading list
    User-created books are separate from library books
    """
    book = Book(
        user_id=current_user.id,
        title=book_data.title,
        author=book_data.author,
        cover_url=book_data.cover_url,
        summary=book_data.summary,
        genre=book_data.genre,
        isbn=book_data.isbn,
        total_pages=book_data.total_pages,
        total_chapters=book_data.total_chapters,
        is_user_created=True,
        language_code=book_data.language_code.value
    )
    
    db.add(book)
    await db.commit()
    await db.refresh(book)
    
    return BookOut(
        id=book.id,
        title=book.title,
        author=book.author,
        cover_url=book.cover_url,
        summary=book.summary,
        key_takeaways=book.key_takeaways,
        genre=book.genre,
        isbn=book.isbn,
        total_pages=book.total_pages,
        total_chapters=book.total_chapters,
        is_user_created=book.is_user_created,
        language_code=book.language_code,
        file_path=book.file_path,
        file_size=book.file_size,
        order_index=book.order_index,
        created_at=book.created_at,
        user_progress=None
    )


@router.get("/", response_model=List[BookOut])
async def list_books(
    status_filter: Optional[str] = Query(None),  # not_started, in_progress, done
    lang: Optional[str] = Query(None),  # Optionally override user's language (en, ru, uz)
    include_all_languages: bool = Query(False),  # If true, return books in all languages
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all books (library + user-created) with progress
    - Automatically filters by user's preferred language unless include_all_languages=true
    - Optionally filter by reading status
    - Can override language with lang parameter
    """
    # Determine which language to filter by
    book_language = lang or current_user.language  # Use provided lang or user's preference
    
    if not include_all_languages:
        # Filter by language if not requesting all languages
        result = await db.execute(
            select(Book)
            .where(Book.language_code == book_language)
            .order_by(Book.order_index, Book.created_at)
        )
    else:
        # Get all books regardless of language
        result = await db.execute(
            select(Book).order_by(Book.order_index, Book.created_at)
        )
    
    books = result.scalars().all()
    
    # Get user's progress for all books
    progress_result = await db.execute(
        select(UserBookProgress).where(
            UserBookProgress.user_id == current_user.id
        )
    )
    progress_map = {p.book_id: p for p in progress_result.scalars().all()}
    
    # Build response with filtering
    books_out = []
    for book in books:
        progress = progress_map.get(book.id)
        
        # Apply status filter if specified
        if status_filter and progress:
            if progress.status.value != status_filter:
                continue
        elif status_filter and not progress:
            # No progress = not_started
            if status_filter != "not_started":
                continue
        
        user_progress_out = None
        if progress:
            user_progress_out = UserBookProgressOut(
                user_id=progress.user_id,
                book_id=progress.book_id,
                status=progress.status,
                progress_percent=progress.progress_percent,
                pages_read=progress.pages_read,
                chapters_read=progress.chapters_read,
                total_time_minutes=progress.total_time_minutes,
                started_at=progress.started_at,
                completed_at=progress.completed_at,
                updated_at=progress.updated_at
            )
        
        book_out = BookOut(
            id=book.id,
            title=book.title,
            author=book.author,
            cover_url=book.cover_url,
            summary=book.summary,
            key_takeaways=book.key_takeaways,
            genre=book.genre,
            isbn=book.isbn,
            total_pages=book.total_pages,
            total_chapters=book.total_chapters,
            is_user_created=book.is_user_created,
            language_code=book.language_code,
            file_path=book.file_path,
            file_size=book.file_size,
            order_index=book.order_index,
            created_at=book.created_at,
            user_progress=user_progress_out
        )
        books_out.append(book_out)
    
    return books_out


@router.get("/{book_id}", response_model=BookOut)
async def get_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific book with user's progress and reading sessions"""
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
    
    user_progress_out = None
    if progress:
        user_progress_out = UserBookProgressOut(
            user_id=progress.user_id,
            book_id=progress.book_id,
            status=progress.status,
            progress_percent=progress.progress_percent,
            pages_read=progress.pages_read,
            chapters_read=progress.chapters_read,
            total_time_minutes=progress.total_time_minutes,
            started_at=progress.started_at,
            completed_at=progress.completed_at,
            updated_at=progress.updated_at
        )
    
    return BookOut(
        id=book.id,
        title=book.title,
        author=book.author,
        cover_url=book.cover_url,
        summary=book.summary,
        key_takeaways=book.key_takeaways,
        genre=book.genre,
        isbn=book.isbn,
        total_pages=book.total_pages,
        total_chapters=book.total_chapters,
        is_user_created=book.is_user_created,
        language_code=book.language_code,
        file_path=book.file_path,
        file_size=book.file_size,
        order_index=book.order_index,
        created_at=book.created_at,
        user_progress=user_progress_out
    )


# ===== READING SESSIONS =====
@router.post("/{book_id}/sessions", response_model=ReadingSessionOut)
async def add_reading_session(
    book_id: int,
    session_data: ReadingSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add a reading session - track pages/chapters read and time spent
    Automatically updates book progress
    """
    # Verify book exists
    book_result = await db.execute(
        select(Book).where(Book.id == book_id)
    )
    book = book_result.scalar_one_or_none()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Create reading session
    session = ReadingSession(
        user_id=current_user.id,
        book_id=book_id,
        pages_read=session_data.pages_read,
        chapters_read=session_data.chapters_read,
        time_minutes=session_data.time_minutes,
        session_type=session_data.session_type,
        notes=session_data.notes,
        started_at=session_data.started_at,
        ended_at=session_data.ended_at
    )
    
    db.add(session)
    
    # Get or create progress record
    progress_result = await db.execute(
        select(UserBookProgress).where(
            UserBookProgress.user_id == current_user.id,
            UserBookProgress.book_id == book_id
        )
    )
    progress = progress_result.scalar_one_or_none()
    
    if not progress:
        progress = UserBookProgress(
            user_id=current_user.id,
            book_id=book_id,
            status=BookStatus.in_progress,
            progress_percent=0,
            pages_read=0,
            chapters_read=0,
            total_time_minutes=0
        )
        db.add(progress)
    
    # Update progress
    progress.pages_read += session_data.pages_read
    progress.chapters_read += session_data.chapters_read
    progress.total_time_minutes += session_data.time_minutes
    
    # Update status if not started
    if progress.status == BookStatus.not_started:
        progress.status = BookStatus.in_progress
        progress.started_at = datetime.utcnow()
    
    # Calculate progress percentage
    if book.total_pages and book.total_pages > 0:
        progress.progress_percent = min(
            100,
            int((progress.pages_read / book.total_pages) * 100)
        )
    elif book.total_chapters and book.total_chapters > 0:
        progress.progress_percent = min(
            100,
            int((progress.chapters_read / book.total_chapters) * 100)
        )
    
    # Auto-complete if reached 100%
    if progress.progress_percent >= 100:
        progress.progress_percent = 100
        progress.status = BookStatus.done
        if not progress.completed_at:
            progress.completed_at = datetime.utcnow()
    
    progress.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(session)
    
    return ReadingSessionOut(
        id=session.id,
        user_id=session.user_id,
        book_id=session.book_id,
        pages_read=session.pages_read,
        chapters_read=session.chapters_read,
        time_minutes=session.time_minutes,
        session_type=session.session_type,
        notes=session.notes,
        started_at=session.started_at,
        ended_at=session.ended_at,
        created_at=session.created_at
    )


@router.get("/{book_id}/sessions", response_model=List[ReadingSessionOut])
async def get_reading_sessions(
    book_id: int,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all reading sessions for a book
    Ordered by most recent first
    """
    # Verify book exists
    book_result = await db.execute(
        select(Book).where(Book.id == book_id)
    )
    book = book_result.scalar_one_or_none()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Get sessions
    result = await db.execute(
        select(ReadingSession).where(
            ReadingSession.user_id == current_user.id,
            ReadingSession.book_id == book_id
        ).order_by(desc(ReadingSession.created_at)).limit(limit).offset(offset)
    )
    sessions = result.scalars().all()
    
    return [
        ReadingSessionOut(
            id=s.id,
            user_id=s.user_id,
            book_id=s.book_id,
            pages_read=s.pages_read,
            chapters_read=s.chapters_read,
            time_minutes=s.time_minutes,
            session_type=s.session_type,
            notes=s.notes,
            started_at=s.started_at,
            ended_at=s.ended_at,
            created_at=s.created_at
        )
        for s in sessions
    ]


# ===== PROGRESS UPDATES =====
@router.post("/{book_id}/progress", response_model=UserBookProgressOut)
async def update_book_progress(
    book_id: int,
    progress_data: UserBookProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update book progress manually
    Mostly used for marking as complete or updating status
    """
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
    progress_result = await db.execute(
        select(UserBookProgress).where(
            UserBookProgress.user_id == current_user.id,
            UserBookProgress.book_id == book_id
        )
    )
    progress = progress_result.scalar_one_or_none()
    
    if not progress:
        progress = UserBookProgress(
            user_id=current_user.id,
            book_id=book_id,
            status=BookStatus.not_started,
            progress_percent=0,
            pages_read=0,
            chapters_read=0,
            total_time_minutes=0
        )
        db.add(progress)
    
    # Update fields
    update_data = progress_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if value is not None:
            setattr(progress, field, value)
    
    # Auto-set timestamps based on status
    if progress_data.status:
        if progress_data.status == BookStatus.in_progress and not progress.started_at:
            progress.started_at = datetime.utcnow()
        elif progress_data.status == BookStatus.done:
            if not progress.started_at:
                progress.started_at = datetime.utcnow()
            if not progress.completed_at:
                progress.completed_at = datetime.utcnow()
            progress.progress_percent = 100
    
    progress.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(progress)
    
    return UserBookProgressOut(
        user_id=progress.user_id,
        book_id=progress.book_id,
        status=progress.status,
        progress_percent=progress.progress_percent,
        pages_read=progress.pages_read,
        chapters_read=progress.chapters_read,
        total_time_minutes=progress.total_time_minutes,
        started_at=progress.started_at,
        completed_at=progress.completed_at,
        updated_at=progress.updated_at
    )


# ===== STATISTICS =====
@router.get("/stats/overview", response_model=BookStatsOut)
async def get_reading_stats(
    lang: Optional[str] = Query(None),  # Optionally override user's language
    include_all_languages: bool = Query(False),  # If true, include all language books
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get comprehensive reading statistics
    Includes completion rate, time spent, streaks, and achievements
    - Filters by user's language preference unless include_all_languages=true
    """
    # Determine language filter
    book_language = lang or current_user.language
    
    # Get books (filtered by language)
    if include_all_languages:
        book_result = await db.execute(select(Book))
    else:
        book_result = await db.execute(
            select(Book).where(Book.language_code == book_language)
        )
    
    all_books = book_result.scalars().all()
    total_books = len(all_books)
    
    # Get user's progress for all books
    progress_result = await db.execute(
        select(UserBookProgress).where(
            UserBookProgress.user_id == current_user.id
        )
    )
    all_progress = progress_result.scalars().all()
    
    # Count by status
    not_started = sum(1 for p in all_progress if p.status == BookStatus.not_started)
    in_progress = sum(1 for p in all_progress if p.status == BookStatus.in_progress)
    completed = sum(1 for p in all_progress if p.status == BookStatus.done)
    
    # Add books not started
    not_started += max(0, total_books - len(all_progress))
    
    completion_rate = round((completed / total_books) * 100, 2) if total_books > 0 else 0
    
    # Calculate average progress
    avg_progress = 0
    if all_progress:
        total_progress = sum(p.progress_percent for p in all_progress)
        avg_progress = round(total_progress / len(all_progress), 1)
    
    # Calculate total time spent reading
    total_time_minutes = sum(p.total_time_minutes for p in all_progress)
    
    # Calculate reading streak (consecutive days with activity)
    reading_streak = 0
    if all_progress:
        sorted_progress = sorted(
            [p for p in all_progress if p.updated_at],
            key=lambda p: p.updated_at,
            reverse=True
        )
        if sorted_progress:
            current_streak = 0
            last_date = None
            for p in sorted_progress:
                current_date = p.updated_at.date() if p.updated_at else None
                if current_date:
                    if last_date is None or (last_date - current_date).days == 1:
                        current_streak += 1
                        last_date = current_date
                    else:
                        break
            reading_streak = current_streak
    
    # Get most recent book activity
    recent_activity = None
    if all_progress:
        most_recent = max(
            [p for p in all_progress if p.updated_at],
            key=lambda p: p.updated_at,
            default=None
        )
        if most_recent:
            book = await db.execute(
                select(Book).where(Book.id == most_recent.book_id)
            )
            book_obj = book.scalar_one_or_none()
            if book_obj:
                recent_activity = {
                    "book_title": book_obj.title,
                    "book_id": book_obj.id,
                    "status": most_recent.status.value,
                    "progress_percent": most_recent.progress_percent,
                    "time_today": 0,  # Would need session data
                    "updated_at": most_recent.updated_at.isoformat() if most_recent.updated_at else None
                }
    
    # Achievement badges
    achievements = []
    if completed >= 1:
        achievements.append("📖 First Book")
    if completed >= 5:
        achievements.append("📚 5 Books")
    if completed >= 10:
        achievements.append("🎓 10 Books")
    if completion_rate == 100:
        achievements.append("👑 Master Reader")
    if reading_streak >= 7:
        achievements.append("🔥 Week Streak")
    if reading_streak >= 30:
        achievements.append("⭐ Month Streak")
    if total_time_minutes >= 3600:  # 60 hours
        achievements.append("⏱️ 60 Hours Read")
    
    return BookStatsOut(
        total_books=total_books,
        not_started=not_started,
        in_progress=in_progress,
        completed=completed,
        completion_rate=completion_rate,
        average_progress=avg_progress,
        total_time_minutes=total_time_minutes,
        reading_streak=reading_streak,
        recent_activity=recent_activity,
        achievements=achievements
    )


# Alias endpoint for mobile app compatibility
@router.get("/progress/stats", response_model=BookStatsOut)
async def get_reading_stats_alias(
    lang: Optional[str] = Query(None),
    include_all_languages: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Alias for /stats/overview endpoint
    Mobile app calls this endpoint path
    """
    # Determine language filter
    book_language = lang or current_user.language
    
    # Get books (filtered by language)
    if include_all_languages:
        book_result = await db.execute(select(Book))
    else:
        book_result = await db.execute(
            select(Book).where(Book.language_code == book_language)
        )
    
    all_books = book_result.scalars().all()
    total_books = len(all_books)
    
    # Get user's progress for all books
    progress_result = await db.execute(
        select(UserBookProgress).where(
            UserBookProgress.user_id == current_user.id
        )
    )
    all_progress = progress_result.scalars().all()
    
    # Count by status
    not_started = sum(1 for p in all_progress if p.status == BookStatus.not_started)
    in_progress = sum(1 for p in all_progress if p.status == BookStatus.in_progress)
    completed = sum(1 for p in all_progress if p.status == BookStatus.done)
    
    # Add books not started
    not_started += max(0, total_books - len(all_progress))
    
    completion_rate = round((completed / total_books) * 100, 2) if total_books > 0 else 0
    
    # Average progress
    avg_progress = 0
    if all_progress:
        avg_progress = round(sum(p.progress_percent for p in all_progress) / len(all_progress), 2)
    
    # Total time spent reading
    sessions_result = await db.execute(
        select(ReadingSession).where(
            ReadingSession.user_id == current_user.id
        )
    )
    all_sessions = sessions_result.scalars().all()
    total_time_minutes = sum(s.time_spent_minutes for s in all_sessions if s.time_spent_minutes)
    
    # Calculate reading streak
    if not all_sessions:
        reading_streak = 0
    else:
        # Sort sessions by date descending
        sorted_sessions = sorted([s for s in all_sessions if s.session_date], key=lambda s: s.session_date, reverse=True)
        
        if not sorted_sessions:
            reading_streak = 0
        else:
            reading_streak = 1
            current_date = sorted_sessions[0].session_date
            
            for session in sorted_sessions[1:]:
                session_date = session.session_date
                expected_prev_date = current_date - timedelta(days=1)
                
                if session_date == expected_prev_date:
                    reading_streak += 1
                    current_date = session_date
                elif session_date < expected_prev_date:
                    break
                else:
                    current_date = session_date
                    reading_streak = 1
    
    # Get most recent book activity
    recent_activity = None
    if all_progress:
        most_recent = max(
            [p for p in all_progress if p.updated_at],
            key=lambda p: p.updated_at,
            default=None
        )
        if most_recent:
            book = await db.execute(
                select(Book).where(Book.id == most_recent.book_id)
            )
            book_obj = book.scalar_one_or_none()
            if book_obj:
                recent_activity = {
                    "book_title": book_obj.title,
                    "book_id": book_obj.id,
                    "status": most_recent.status.value,
                    "progress_percent": most_recent.progress_percent,
                    "time_today": 0,
                    "updated_at": most_recent.updated_at.isoformat() if most_recent.updated_at else None
                }
    
    # Achievement badges
    achievements = []
    if completed >= 1:
        achievements.append("📖 First Book")
    if completed >= 5:
        achievements.append("📚 5 Books")
    if completed >= 10:
        achievements.append("🎓 10 Books")
    if completion_rate == 100:
        achievements.append("👑 Master Reader")
    if reading_streak >= 7:
        achievements.append("🔥 Week Streak")
    if reading_streak >= 30:
        achievements.append("⭐ Month Streak")
    if total_time_minutes >= 3600:
        achievements.append("⏱️ 60 Hours Read")
    
    return BookStatsOut(
        total_books=total_books,
        not_started=not_started,
        in_progress=in_progress,
        completed=completed,
        completion_rate=completion_rate,
        average_progress=avg_progress,
        total_time_minutes=total_time_minutes,
        reading_streak=reading_streak,
        recent_activity=recent_activity,
        achievements=achievements
    )


@router.delete("/{book_id}")
async def delete_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a user-created book and all its progress
    Cannot delete library books
    """
    result = await db.execute(
        select(Book).where(Book.id == book_id)
    )
    book = result.scalar_one_or_none()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Only allow deleting user-created books
    if not book.is_user_created or book.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only delete your own books"
        )
    
    # Delete file if it exists
    if book.file_path:
        file_path = UPLOADS_DIR / book.file_path
        if file_path.exists():
            file_path.unlink()
    
    await db.delete(book)
    await db.commit()
    
    return {"message": "Book deleted successfully"}


# ===== MULTI-LANGUAGE PDF SUPPORT =====
@router.get("/by-language/{language_code}", response_model=List[BookOut])
async def get_books_by_language(
    language_code: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all books filtered by language code (en, ru, uz)
    Returns library books in that language
    """
    if language_code not in ["en", "ru", "uz"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Language code must be 'en', 'ru', or 'uz'"
        )
    
    # Get all books with the specified language
    result = await db.execute(
        select(Book)
        .where(Book.language_code == language_code)
        .order_by(Book.order_index, Book.created_at)
    )
    books = result.scalars().all()
    
    # Get user's progress for all books
    progress_result = await db.execute(
        select(UserBookProgress).where(
            UserBookProgress.user_id == current_user.id
        )
    )
    progress_map = {p.book_id: p for p in progress_result.scalars().all()}
    
    # Build response
    books_out = []
    for book in books:
        progress = progress_map.get(book.id)
        
        user_progress_out = None
        if progress:
            user_progress_out = UserBookProgressOut(
                user_id=progress.user_id,
                book_id=progress.book_id,
                status=progress.status,
                progress_percent=progress.progress_percent,
                pages_read=progress.pages_read,
                chapters_read=progress.chapters_read,
                total_time_minutes=progress.total_time_minutes,
                started_at=progress.started_at,
                completed_at=progress.completed_at,
                updated_at=progress.updated_at
            )
        
        book_out = BookOut(
            id=book.id,
            title=book.title,
            author=book.author,
            cover_url=book.cover_url,
            summary=book.summary,
            key_takeaways=book.key_takeaways,
            genre=book.genre,
            isbn=book.isbn,
            total_pages=book.total_pages,
            total_chapters=book.total_chapters,
            is_user_created=book.is_user_created,
            language_code=book.language_code,
            file_path=book.file_path,
            file_size=book.file_size,
            order_index=book.order_index,
            created_at=book.created_at,
            user_progress=user_progress_out
        )
        books_out.append(book_out)
    
    return books_out


@router.post("/{book_id}/upload")
async def upload_book_file(
    book_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a PDF file for a book
    File is stored in language-specific folder: uploads/books/{language_code}/{book_id}.pdf
    """
    # Get book
    result = await db.execute(
        select(Book).where(Book.id == book_id)
    )
    book = result.scalar_one_or_none()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Validate file is PDF
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    # Limit file size (50MB max)
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 50MB limit"
        )
    
    # Create file path: uploads/books/{language_code}/book_{id}.pdf
    lang_dir = UPLOADS_DIR / book.language_code
    lang_dir.mkdir(parents=True, exist_ok=True)
    
    file_name = f"book_{book_id}.pdf"
    file_path = lang_dir / file_name
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Update book record
    book.file_path = f"{book.language_code}/{file_name}"
    book.file_size = len(file_content)
    
    await db.commit()
    await db.refresh(book)
    
    return {
        "message": "File uploaded successfully",
        "file_path": book.file_path,
        "file_size": book.file_size,
        "book_id": book.id
    }


@router.get("/{book_id}/download")
async def download_book_file(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Download a PDF file for a book
    Returns the PDF file if it exists
    """
    # Get book
    result = await db.execute(
        select(Book).where(Book.id == book_id)
    )
    book = result.scalar_one_or_none()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Check if file exists
    if not book.file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No PDF file available for this book"
        )
    
    file_path = UPLOADS_DIR / book.file_path
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF file not found on server"
        )
    
    # Return file
    return FileResponse(
        path=file_path,
        filename=f"{book.title}.pdf",
        media_type="application/pdf"
    )