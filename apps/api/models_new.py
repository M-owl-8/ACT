"""
Complete data models for ACT Gen-1 MVP
Using SQLAlchemy for consistency with existing auth system
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from db import Base


# ===== ENUMS =====
class EntryType(str, Enum):
    expense = "expense"
    income = "income"


class GoalKind(str, Enum):
    streak = "streak"
    spend_under = "spend_under"
    log_n_days = "log_n_days"


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


# ===== MODELS =====
class User(Base):
    """User account with authentication and settings"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    
    # User preferences
    language = Column(String, default="en", nullable=False)  # en, ru, uz
    theme = Column(String, default="light", nullable=False)  # light, dark
    currency = Column(String, default="USD", nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    tokens = relationship("Token", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    entries = relationship("Entry", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    streak = relationship("Streak", back_populates="user", uselist=False, cascade="all, delete-orphan")
    book_progress = relationship("UserBookProgress", back_populates="user", cascade="all, delete-orphan")


class Token(Base):
    """JWT refresh tokens"""
    __tablename__ = "tokens"
    
    id = Column(Integer, primary_key=True)
    jti = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)  # 'refresh'
    revoked = Column(Boolean, default=False, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    user = relationship("User", back_populates="tokens")


class Category(Base):
    """Expense/Income categories (default + custom)"""
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String, nullable=False)
    type = Column(SQLEnum(EntryType), nullable=False)  # expense | income
    color = Column(String, nullable=True)  # hex color
    icon = Column(String, nullable=True)  # emoji or icon name
    is_default = Column(Boolean, default=False, nullable=False, index=True)
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="categories")
    entries = relationship("Entry", back_populates="category")


class Entry(Base):
    """Financial entries (expenses and income)"""
    __tablename__ = "entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    type = Column(SQLEnum(EntryType), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD", nullable=False)
    note = Column(Text, nullable=True)
    booked_at = Column(DateTime, nullable=False, index=True)  # When the transaction happened
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="entries")
    category = relationship("Category", back_populates="entries")


class Streak(Base):
    """Daily logging streak for motivation"""
    __tablename__ = "streaks"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    current_count = Column(Integer, default=0, nullable=False)
    best_count = Column(Integer, default=0, nullable=False)
    last_check_date = Column(String, nullable=False, default="")  # YYYY-MM-DD
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    user = relationship("User", back_populates="streak")


class Goal(Base):
    """User goals and challenges"""
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    kind = Column(SQLEnum(GoalKind), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    target_value = Column(Float, nullable=True)  # e.g., spend limit, days count
    current_value = Column(Float, default=0, nullable=False)
    status = Column(SQLEnum(GoalStatus), default=GoalStatus.active, nullable=False, index=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    user = relationship("User", back_populates="goals")


class Book(Base):
    """Financial literacy books library"""
    __tablename__ = "books"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=True)
    cover_url = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    key_takeaways = Column(Text, nullable=True)  # JSON array of strings
    order_index = Column(Integer, default=0, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user_progress = relationship("UserBookProgress", back_populates="book", cascade="all, delete-orphan")


class UserBookProgress(Base):
    """Track user's reading progress"""
    __tablename__ = "user_book_progress"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), primary_key=True)
    status = Column(SQLEnum(BookStatus), default=BookStatus.not_started, nullable=False)
    progress_percent = Column(Integer, default=0, nullable=False)  # 0-100
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="book_progress")
    book = relationship("Book", back_populates="user_progress")


class DatabaseBackup(Base):
    """Track database backups"""
    __tablename__ = "database_backups"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)  # bytes
    backup_type = Column(String, default="daily", nullable=False)  # daily, manual
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)