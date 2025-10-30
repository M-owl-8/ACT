"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional, List
from enum import Enum


# ===== ENUMS =====
class EntryType(str, Enum):
    expense = "expense"
    income = "income"


class ExpenseType(str, Enum):
    mandatory = "mandatory"
    neutral = "neutral"
    excess = "excess"


class GoalKind(str, Enum):
    streak = "streak"
    spend_under = "spend_under"
    log_n_days = "log_n_days"
    savings = "savings"


class GoalStatus(str, Enum):
    active = "active"
    completed = "completed"


class BookStatus(str, Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    done = "done"


class Language(str, Enum):
    en = "en"
    ru = "ru"
    uz = "uz"


class Theme(str, Enum):
    light = "light"
    dark = "dark"


# ===== AUTH SCHEMAS =====
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    recovery_keyword: str = Field(min_length=3, max_length=100)  # Secret keyword for password recovery
    currency: str = Field(default="USD", min_length=3, max_length=3)  # Currency selected during signup


class UserOut(BaseModel):
    id: int
    email: EmailStr
    is_admin: bool
    name: Optional[str] = None
    language: str
    theme: str
    currency: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    language: Optional[Language] = None
    theme: Optional[Theme] = None
    # Note: Currency is NOT included here - it cannot be changed after signup


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    """Request to verify recovery keyword"""
    email: EmailStr
    recovery_keyword: str


class PasswordResetConfirm(BaseModel):
    """Reset password after keyword verification"""
    email: EmailStr
    recovery_keyword: str
    new_password: str = Field(min_length=8, max_length=100)


class DeviceInfo(BaseModel):
    """Device information for tracking logins"""
    device_name: str  # e.g., "iPhone 13", "Samsung Galaxy"
    device_type: str  # e.g., "mobile", "web", "tablet"
    os: Optional[str] = None  # e.g., "iOS", "Android", "Windows"


class MessageResponse(BaseModel):
    message: str


# ===== CATEGORY SCHEMAS =====
class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    type: EntryType
    expense_type: Optional[ExpenseType] = None  # Only for expense categories
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    icon: Optional[str] = Field(None, max_length=10)


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    expense_type: Optional[ExpenseType] = None
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    icon: Optional[str] = Field(None, max_length=10)
    is_deleted: Optional[bool] = None


class CategoryOut(BaseModel):
    id: int
    user_id: Optional[int]
    name: str
    type: EntryType
    expense_type: Optional[ExpenseType]
    color: Optional[str]
    icon: Optional[str]
    is_default: bool
    is_deleted: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ===== ENTRY SCHEMAS =====
class EntryCreate(BaseModel):
    type: EntryType
    category_id: Optional[int] = None
    amount: float = Field(gt=0, le=1_000_000_000)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    note: Optional[str] = Field(None, max_length=500)
    booked_at: datetime

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        return round(v, 2)


class EntryUpdate(BaseModel):
    category_id: Optional[int] = None
    amount: Optional[float] = Field(None, gt=0, le=1_000_000_000)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    note: Optional[str] = Field(None, max_length=500)
    booked_at: Optional[datetime] = None

    @validator('amount')
    def validate_amount(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Amount must be positive')
        return round(v, 2) if v else v


class EntryOut(BaseModel):
    id: int
    user_id: int
    category_id: Optional[int]
    type: EntryType
    amount: float
    currency: str
    note: Optional[str]
    booked_at: datetime
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryOut] = None

    class Config:
        from_attributes = True


class EntryFilter(BaseModel):
    type: Optional[EntryType] = None
    category_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = Field(default=100, ge=1, le=1000)
    offset: int = Field(default=0, ge=0)


# ===== DASHBOARD SCHEMAS =====
class DashboardStats(BaseModel):
    period_days: int
    total_income: float
    total_expenses: float
    balance: float
    entry_count: int
    start_date: datetime
    end_date: datetime


class CategoryBreakdown(BaseModel):
    category_id: Optional[int]
    category_name: str
    type: EntryType
    total_amount: float
    entry_count: int
    percentage: float


class DashboardResponse(BaseModel):
    stats_7d: DashboardStats
    stats_30d: DashboardStats
    category_breakdown: List[CategoryBreakdown]


# ===== STREAK SCHEMAS =====
class StreakOut(BaseModel):
    user_id: int
    current_count: int
    best_count: int
    last_check_date: str
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== GOAL SCHEMAS =====
class GoalCreate(BaseModel):
    kind: GoalKind
    title: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    target_value: Optional[float] = Field(None, gt=0)
    status: Optional[GoalStatus] = GoalStatus.active
    start_date: datetime
    end_date: Optional[datetime] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    target_value: Optional[float] = Field(None, gt=0)
    current_value: Optional[float] = Field(None, ge=0)
    status: Optional[GoalStatus] = None
    end_date: Optional[datetime] = None


class GoalOut(BaseModel):
    id: int
    user_id: int
    kind: GoalKind
    title: str
    description: Optional[str]
    target_value: Optional[float]
    current_value: float
    status: GoalStatus
    start_date: datetime
    end_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    progress_percentage: Optional[float] = None

    class Config:
        from_attributes = True


# ===== BOOK SCHEMAS =====
class BookCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    author: Optional[str] = Field(None, max_length=100)
    cover_url: Optional[str] = None
    summary: Optional[str] = Field(None, max_length=2000)
    genre: Optional[str] = Field(None, max_length=50)
    isbn: Optional[str] = Field(None, max_length=20)
    total_pages: Optional[int] = Field(None, gt=0, le=10000)
    total_chapters: Optional[int] = Field(None, gt=0)
    language_code: Language = Field(default=Language.en)  # en, ru, uz


class BookOut(BaseModel):
    id: int
    title: str
    author: Optional[str]
    cover_url: Optional[str]
    summary: Optional[str]
    key_takeaways: Optional[str]
    genre: Optional[str]
    isbn: Optional[str]
    total_pages: Optional[int]
    total_chapters: Optional[int]
    is_user_created: bool
    language_code: str  # en, ru, uz
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    order_index: int
    created_at: datetime
    user_progress: Optional['UserBookProgressOut'] = None

    class Config:
        from_attributes = True


class ReadingSessionCreate(BaseModel):
    pages_read: int = Field(default=0, ge=0)
    chapters_read: int = Field(default=0, ge=0)
    time_minutes: int = Field(gt=0, le=1440)  # Max 24 hours
    session_type: str = Field(default="manual")
    notes: Optional[str] = Field(None, max_length=500)
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None


class ReadingSessionOut(BaseModel):
    id: int
    user_id: int
    book_id: int
    pages_read: int
    chapters_read: int
    time_minutes: int
    session_type: str
    notes: Optional[str]
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class UserBookProgressOut(BaseModel):
    user_id: int
    book_id: int
    status: BookStatus
    progress_percent: int
    pages_read: int
    chapters_read: int
    total_time_minutes: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    updated_at: datetime

    class Config:
        from_attributes = True


class UserBookProgressUpdate(BaseModel):
    status: Optional[BookStatus] = None
    progress_percent: Optional[int] = Field(None, ge=0, le=100)
    pages_read: Optional[int] = Field(None, ge=0)
    chapters_read: Optional[int] = Field(None, ge=0)


class BookSearchResult(BaseModel):
    title: str
    author: Optional[str]
    cover_url: Optional[str]
    description: Optional[str]
    isbn: Optional[str]
    pages: Optional[int]


class BookStatsOut(BaseModel):
    total_books: int
    not_started: int
    in_progress: int
    completed: int
    completion_rate: float
    average_progress: float
    total_time_minutes: int
    reading_streak: int
    recent_activity: Optional[dict]
    achievements: List[str]


# ===== EXPORT SCHEMAS =====
class ExportRequest(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    include_deleted: bool = False


class ExportResponse(BaseModel):
    filename: str
    download_url: str
    total_entries: int
    created_at: datetime


# ===== BACKUP SCHEMAS =====
class BackupOut(BaseModel):
    id: int
    filename: str
    file_size: int
    backup_type: str
    created_at: datetime

    class Config:
        from_attributes = True