from typing import Optional
from uuid import uuid4
from enum import Enum
from sqlmodel import SQLModel, Field
import time

def now_ms() -> int:
    return int(time.time() * 1000)

# ---- Enums ----
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

# ---- Tables ----
class User(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    email: str = Field(index=True, unique=True)
    created_at: int = Field(default_factory=now_ms)

class Category(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: Optional[str] = Field(default=None, foreign_key="user.id", index=True)
    name: str
    type: EntryType  # expense | income
    color: Optional[str] = None
    icon: Optional[str] = None
    is_default: bool = Field(default=False, index=True)
    is_deleted: bool = Field(default=False, index=True)

class Entry(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    type: EntryType
    category_id: Optional[str] = Field(default=None, foreign_key="category.id", index=True)
    amount: float
    currency: str = Field(default="EUR")
    note: Optional[str] = None
    booked_at: int = Field(index=True, description="Epoch ms when the expense happened")
    created_at: int = Field(default_factory=now_ms, index=True)

class Streak(SQLModel, table=True):
    user_id: str = Field(foreign_key="user.id", primary_key=True)
    current_count: int = 0
    best_count: int = 0
    last_check_date: str = Field(default="", description="YYYY-MM-DD (local)")

class Goal(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    kind: GoalKind
    params_json: str = Field(default="{}")     # JSON string
    status: GoalStatus = GoalStatus.active
    progress_json: str = Field(default="{}")   # JSON string
    created_at: int = Field(default_factory=now_ms, index=True)

class Book(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    title: str
    author: Optional[str] = None
    summary: Optional[str] = None
    actions: Optional[str] = None   # JSON string
    order_index: int = Field(default=0, index=True)

class UserBookProgress(SQLModel, table=True):
    user_id: str = Field(foreign_key="user.id", primary_key=True)
    book_id: str = Field(foreign_key="book.id", primary_key=True)
    status: BookStatus = BookStatus.not_started
    updated_at: int = Field(default_factory=now_ms)
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    tokens = relationship("Token", back_populates="user", cascade="all, delete-orphan")

class Token(Base):
    __tablename__ = "tokens"
    id = Column(Integer, primary_key=True)
    jti = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # 'refresh'
    revoked = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="tokens")
    __table_args__ = (UniqueConstraint("jti", name="uq_tokens_jti"),)
