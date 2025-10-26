"""
Script to upload PDF files for books after seeding
Assumes PDF files are in: uploads/books/{language_code}/book_{id}.pdf
"""
import asyncio
import os
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from models import Book
from db import DATABASE_URL

# Path to books directory
BOOKS_STORAGE = Path("uploads/books")

# Book IDs for each language
BOOK_IDS = {
    "en": [10, 20, 30],      # English: Richest Man, Atomic Habits, Rich Dad Poor Dad
    "ru": [11, 21, 31],      # Russian
    "uz": [12, 22, 32]       # Uzbek
}

BOOK_NAMES = {
    10: "The Richest Man in Babylon",
    20: "Atomic Habits", 
    30: "Rich Dad Poor Dad",
    11: "The Richest Man in Babylon (Russian)",
    21: "Atomic Habits (Russian)",
    31: "Rich Dad Poor Dad (Russian)",
    12: "The Richest Man in Babylon (Uzbek)",
    22: "Atomic Habits (Uzbek)",
    32: "Rich Dad Poor Dad (Uzbek)"
}


async def update_book_file_paths():
    """Update book records with file paths and sizes"""
    
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            print("📚 Updating book file paths...\n")
            
            for lang_code, book_ids in BOOK_IDS.items():
                lang_dir = BOOKS_STORAGE / lang_code
                
                for book_id in book_ids:
                    # Query the book
                    result = await session.execute(
                        select(Book).where(Book.id == book_id)
                    )
                    book = result.scalar_one_or_none()
                    
                    if not book:
                        print(f"⚠️  Book ID {book_id} not found in database")
                        continue
                    
                    # Check if PDF file exists
                    pdf_path = lang_dir / f"book_{book_id}.pdf"
                    
                    if pdf_path.exists():
                        file_size = pdf_path.stat().st_size
                        file_path_rel = f"{lang_code}/book_{book_id}.pdf"
                        
                        # Update book record
                        book.file_path = file_path_rel
                        book.file_size = file_size
                        
                        print(f"✅ {book.title}")
                        print(f"   Path: {file_path_rel}")
                        print(f"   Size: {file_size / 1024 / 1024:.2f} MB\n")
                    else:
                        print(f"⚠️  PDF not found for {book.title} at {pdf_path}")
                        print(f"   Please place the PDF file at: {pdf_path}\n")
            
            await session.commit()
            print("✅ All books updated successfully!")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error updating books: {e}")
        finally:
            await engine.dispose()


async def verify_books():
    """Verify books are in database and show their status"""
    
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            print("\n📖 Books in Database:\n")
            
            result = await session.execute(select(Book).order_by(Book.language_code, Book.order_index))
            books = result.scalars().all()
            
            if not books:
                print("❌ No books found in database!")
                print("   Run seed_books.py first to create books")
                return
            
            for book in books:
                status = "✅ Has PDF" if book.file_path else "⚠️  No PDF"
                size_str = f" ({book.file_size / 1024 / 1024:.2f} MB)" if book.file_size else ""
                
                print(f"{status}: {book.title}")
                print(f"   Language: {book.language_code}")
                print(f"   Author: {book.author}")
                if book.file_path:
                    print(f"   Path: {book.file_path}{size_str}")
                print()
            
        except Exception as e:
            print(f"❌ Error verifying books: {e}")
        finally:
            await engine.dispose()


async def show_setup_instructions():
    """Show setup instructions"""
    
    instructions = """
╔════════════════════════════════════════════════════════════════════════════════╗
║                   MULTI-LANGUAGE BOOKS SETUP INSTRUCTIONS                     ║
╚════════════════════════════════════════════════════════════════════════════════╝

STEP 1: Ensure books are seeded in database
   Run: python seed_books.py

STEP 2: Place PDF files in the correct directories
   Your PDFs should be here (after downloading/preparing):
   
   c:\\work\\act-gen1\\apps\\api\\uploads\\books\\en\\book_10.pdf
   c:\\work\\act-gen1\\apps\\api\\uploads\\books\\en\\book_20.pdf
   c:\\work\\act-gen1\\apps\\api\\uploads\\books\\en\\book_30.pdf
   
   c:\\work\\act-gen1\\apps\\api\\uploads\\books\\ru\\book_11.pdf
   c:\\work\\act-gen1\\apps\\api\\uploads\\books\\ru\\book_21.pdf
   c:\\work\\act-gen1\\apps\\api\\uploads\\books\\ru\\book_31.pdf
   
   c:\\work\\act-gen1\\apps\\api\\uploads\\books\\uz\\book_12.pdf
   c:\\work\\act-gen1\\apps\\api\\uploads\\books\\uz\\book_22.pdf
   c:\\work\\act-gen1\\apps\\api\\uploads\\books\\uz\\book_32.pdf

STEP 3: Run this script to update database records
   Run: python upload_books.py

STEP 4: Test the API
   1. Start FastAPI server: uvicorn main:app --reload
   2. Get books by language: GET /books/by-language/en
   3. Download a book: GET /books/10/download

STEP 5: Update mobile app (optional)
   Integrate file upload/download in BooksScreen.tsx
   See MULTI_LANGUAGE_BOOKS_SETUP.md for details

════════════════════════════════════════════════════════════════════════════════

Book IDs and Mapping:
   
   ID | Book Title                    | EN  | RU  | UZ
   ---|-------------------------------|-----|-----|-----
   1  | The Richest Man in Babylon    | 10  | 11  | 12
   2  | Atomic Habits                 | 20  | 21  | 22
   3  | Rich Dad Poor Dad             | 30  | 31  | 32

════════════════════════════════════════════════════════════════════════════════
"""
    
    print(instructions)


if __name__ == "__main__":
    print("\n🚀 Multi-Language Books Upload Manager\n")
    
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "verify":
        asyncio.run(verify_books())
    elif len(sys.argv) > 1 and sys.argv[1] == "help":
        asyncio.run(show_setup_instructions())
    else:
        # Default: show help and verify
        asyncio.run(show_setup_instructions())
        asyncio.run(verify_books())
        print("\n✨ To update file paths after placing PDFs, run:")
        print("   python upload_books.py update\n")
        
        # Or run the update if user passed "update" argument
        if len(sys.argv) > 1 and sys.argv[1] == "update":
            asyncio.run(update_book_file_paths())