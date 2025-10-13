from typing import List, Tuple
from sqlmodel import Session, select
from models import Category, Book

DEFAULT_CATEGORIES: List[Tuple[str, str]] = [
    ("Food", "expense"),
    ("Transport", "expense"),
    ("Rent", "expense"),
    ("Groceries", "expense"),
    ("Entertainment", "expense"),
    ("Utilities", "expense"),
    ("Health", "expense"),
    ("Education", "expense"),
    ("Other", "expense"),
    ("Salary", "income"),
    ("Bonus", "income"),
    ("Gift", "income"),
    ("Other income", "income"),
]

BOOK_TITLES: List[str] = [
    # 20 slots (you can edit later)
    "The Richest Man in Babylon",
    "Your Money or Your Life",
    "I Will Teach You to Be Rich",
    "The Millionaire Next Door",
    "The Psychology of Money",
    "A Random Walk Down Wall Street",
    "The Little Book of Common Sense Investing",
    "Think and Grow Rich",
    "Money Master the Game",
    "The Total Money Makeover",
    "The Simple Path to Wealth",
    "Broke Millennial",
    "Quit Like a Millionaire",
    "Meet the Frugalwoods",
    "Rich Dad Poor Dad",
    "The Automatic Millionaire",
    "Unshakeable",
    "One Up On Wall Street",
    "The Bogleheads' Guide to Investing",
    "Financial Freedom",
]

def seed_defaults(engine):
    with Session(engine) as session:
        # Seed default categories (global: user_id=None, is_default=True)
        for name, kind in DEFAULT_CATEGORIES:
            exists = session.exec(
                select(Category).where(
                    Category.name == name,
                    Category.type == kind,
                    Category.is_default == True,  # noqa: E712
                )
            ).first()
            if not exists:
                session.add(Category(name=name, type=kind, is_default=True))

        # Seed books (titles only for now)
        for i, title in enumerate(BOOK_TITLES):
            exists = session.exec(select(Book).where(Book.title == title)).first()
            if not exists:
                session.add(Book(title=title, order_index=i))

        session.commit()
