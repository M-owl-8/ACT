#!/usr/bin/env python3
"""
Simple synchronous seed script for books
No async - just simple database operations
"""
import os
import shutil
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Book

# Get database URL from environment or use default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

print("\n" + "="*60)
print("BOOKS DATABASE SEEDING")
print("="*60)

# Create engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
print(f"✓ Connected to database: {DATABASE_URL[:40]}...")

# Create tables
Base.metadata.create_all(bind=engine)
print("✓ Tables created")

# Create session
Session = sessionmaker(bind=engine)
session = Session()

# Book data in 3 languages with file locations
BOOKS_DATA = [
    {
        "book_set_id": 1,
        "en": {
            "id": 10,
            "title": "The Richest Man in Babylon",
            "author": "George S. Clason",
            "summary": "A classic book on personal finance and wealth building through parables set in ancient Babylon.",
            "genre": "Finance",
            "total_pages": 238,
            "total_chapters": 14,
            "language_code": "en",
            "file_path": "books/en/book_10.pdf",
        },
        "ru": {
            "id": 11,
            "title": "Самый богатый человек в Вавилоне",
            "author": "Джордж С. Клейсон",
            "summary": "Классическая книга о личных финансах и накоплении богатства через притчи из древнего Вавилона.",
            "genre": "Финансы",
            "total_pages": 238,
            "total_chapters": 14,
            "language_code": "ru",
            "file_path": "books/ru/book_11.pdf",
        },
        "uz": {
            "id": 12,
            "title": "Vavilondagi eng boy odam",
            "author": "Jorj S. Kleyson",
            "summary": "Shaxsiy moliyaviy o'sish va boylik yig'ish haqida klassik kitob, qadim Vavilondan olingan hikoyalar orqali.",
            "genre": "Moliya",
            "total_pages": 238,
            "total_chapters": 14,
            "language_code": "uz",
            "file_path": "books/uz/book_12.pdf",
        }
    },
    {
        "book_set_id": 2,
        "en": {
            "id": 20,
            "title": "Atomic Habits",
            "author": "James Clear",
            "summary": "Transform your life with tiny habits. Practical strategies for building good habits and breaking bad ones.",
            "genre": "Self-Help",
            "total_pages": 320,
            "total_chapters": 37,
            "language_code": "en",
            "file_path": "books/en/book_20.pdf",
        },
        "ru": {
            "id": 21,
            "title": "Атомные привычки",
            "author": "Джеймс Клир",
            "summary": "Трансформируйте свою жизнь с помощью крошечных привычек. Практические стратегии для создания хороших привычек.",
            "genre": "Саморазвитие",
            "total_pages": 320,
            "total_chapters": 37,
            "language_code": "ru",
            "file_path": "books/ru/book_21.pdf",
        },
        "uz": {
            "id": 22,
            "title": "Atom ko'nikmalari",
            "author": "Jeyms Klir",
            "summary": "Yo'q ko'nikmalari bilan hayotingizni o'zgartirib qo'ying. Yaxshi ko'nikma qurish va yomon ko'nikmalari buzish uchun amaliy strategiyalar.",
            "genre": "O'z-o'zini Rivojlantirish",
            "total_pages": 320,
            "total_chapters": 37,
            "language_code": "uz",
            "file_path": "books/uz/book_22.pdf",
        }
    },
    {
        "book_set_id": 3,
        "en": {
            "id": 30,
            "title": "Rich Dad Poor Dad",
            "author": "Robert T. Kiyosaki",
            "summary": "Learn the financial lessons taught by the author's rich and poor fathers. Explore money myths and build financial independence.",
            "genre": "Finance",
            "total_pages": 336,
            "total_chapters": 10,
            "language_code": "en",
            "file_path": "books/en/book_30.pdf",
        },
        "ru": {
            "id": 31,
            "title": "Богатый папа, бедный папа",
            "author": "Роберт Т. Кийосаки",
            "summary": "Узнайте финансовые уроки, которые преподавали богатый и бедный отцы автора. Исследуйте мифы о деньгах и достигайте финансовой независимости.",
            "genre": "Финансы",
            "total_pages": 336,
            "total_chapters": 10,
            "language_code": "ru",
            "file_path": "books/ru/book_31.pdf",
        },
        "uz": {
            "id": 32,
            "title": "Boy Ota, Kambag'al Ota",
            "author": "Robert T. Kiyosaki",
            "summary": "Muallifning boy va kambag'al otalarini o'rgatgan moliyaviy darslarni o'rganing. Pul miflarini o'rganing va moliyaviy erkindikka erishnig.",
            "genre": "Moliya",
            "total_pages": 336,
            "total_chapters": 10,
            "language_code": "uz",
            "file_path": "books/uz/book_32.pdf",
        }
    }
]

# Copy existing PDFs and add to database
uploads_dir = Path(__file__).parent / "uploads"
books_dir = uploads_dir / "books"

print("\nProcessing books...")

# Create books directory structure if needed
for lang in ["en", "ru", "uz"]:
    (books_dir / lang).mkdir(parents=True, exist_ok=True)

# Counters
added = 0
skipped = 0

for book_set in BOOKS_DATA:
    for lang_code in ["en", "ru", "uz"]:
        book_info = book_set[lang_code]
        book_id = book_info["id"]
        
        # Check if book already exists
        existing = session.query(Book).filter(Book.id == book_id).first()
        if existing:
            print(f"  → Book {book_id} ({lang_code}) already exists - skipping")
            skipped += 1
            continue
        
        # Source and destination paths
        source_base = uploads_dir / lang_code
        source_pdf = source_base / f"Book_{book_set['book_set_id']}.pdf" if lang_code in ["ru", "uz"] else source_base / f"book_{book_set['book_set_id']}.pdf"
        
        dest_pdf = books_dir / book_info["file_path"]
        
        # Copy PDF if it exists
        file_size = 0
        if source_pdf.exists():
            dest_pdf.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source_pdf, dest_pdf)
            file_size = dest_pdf.stat().st_size
            print(f"  ✓ Copied {source_pdf.name} → {book_info['file_path']} ({file_size:,} bytes)")
        else:
            print(f"  ⚠ Source PDF not found: {source_pdf}")
        
        # Create book record
        book = Book(
            id=book_id,
            title=book_info["title"],
            author=book_info["author"],
            summary=book_info["summary"],
            genre=book_info["genre"],
            total_pages=book_info.get("total_pages"),
            total_chapters=book_info.get("total_chapters"),
            language_code=lang_code,
            file_path=book_info["file_path"],
            file_size=file_size,
        )
        session.add(book)
        added += 1
        print(f"  ✓ Added book {book_id}: {book_info['title']} ({lang_code})")

# Commit all changes
try:
    session.commit()
    print(f"\n{'='*60}")
    print(f"✓ SUCCESS!")
    print(f"  Added: {added} books")
    print(f"  Skipped: {skipped} (already exist)")
    print(f"{'='*60}\n")
except Exception as e:
    session.rollback()
    print(f"\n✗ ERROR during commit: {e}\n")
finally:
    session.close()