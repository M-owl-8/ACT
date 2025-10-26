"""
Seed script to populate database with multi-language books
Creates 3 books in English, Russian, and Uzbek
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from models import Base, Book
from db import DATABASE_URL

# Book data in 3 languages
BOOKS_DATA = [
    {
        "id": 1,
        "en": {
            "title": "The Richest Man in Babylon",
            "author": "George S. Clason",
            "summary": "A classic book on personal finance and wealth building through parables and stories set in ancient Babylon.",
            "genre": "Finance",
            "total_pages": 238,
            "total_chapters": 14,
        },
        "ru": {
            "title": "Самый богатый человек в Вавилоне",
            "author": "Джордж С. Клейсон",
            "summary": "Классическая книга о личных финансах и накоплении богатства через притчи и истории из древнего Вавилона.",
            "genre": "Финансы",
        },
        "uz": {
            "title": "Vavilondagi eng boy odam",
            "author": "Jorj S. Kleyson",
            "summary": "Shaxsiy moliyaviy o'sish va boylik yig'ish haqida klassik kitob, qadim Vavilondan olingan hikoyalar orqali.",
            "genre": "Moliya",
        }
    },
    {
        "id": 2,
        "en": {
            "title": "Atomic Habits",
            "author": "James Clear",
            "summary": "Transform your life with tiny habits. Practical strategies for building good habits and breaking bad ones.",
            "genre": "Self-Help",
            "total_pages": 320,
            "total_chapters": 37,
        },
        "ru": {
            "title": "Атомные привычки",
            "author": "Джеймс Клир",
            "summary": "Трансформируйте свою жизнь с помощью крошечных привычек. Практические стратегии для создания хороших привычек.",
            "genre": "Саморазвитие",
        },
        "uz": {
            "title": "Atomli odatlar",
            "author": "Jeyms Klir",
            "summary": "O'z hayotingizni kichik odatlar bilan o'zgartirib yuboring. Yaxshi odatlarni shakllantirish uchun amaliy strategiyalar.",
            "genre": "O'z-o'zini rivojlantirish",
        }
    },
    {
        "id": 3,
        "en": {
            "title": "Rich Dad Poor Dad",
            "author": "Robert T. Kiyosaki",
            "summary": "A personal finance book that contrasts the financial philosophies of a wealthy businessman and a schoolteacher.",
            "genre": "Finance",
            "total_pages": 336,
            "total_chapters": 10,
        },
        "ru": {
            "title": "Богатый папа, бедный папа",
            "author": "Роберт Т. Кийосаки",
            "summary": "Книга о личных финансах, контрастирующая финансовые философии богатого бизнесмена и учителя школы.",
            "genre": "Финансы",
        },
        "uz": {
            "title": "Boy otasi, kambag'al otasi",
            "author": "Robert T. Kiyosaki",
            "summary": "Shaxsiy moliyaviy kitob, boy biznesmenga va maktab o'qituvchisining moliyaviy falsafalarini solishtiradi.",
            "genre": "Moliya",
        }
    }
]


async def seed_books():
    """Seed the database with books in multiple languages"""
    
    # Create engine and session
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with async_session() as session:
        try:
            # Create books for each language
            for book_data in BOOKS_DATA:
                for lang_code in ["en", "ru", "uz"]:
                    lang_data = book_data[lang_code]
                    
                    book = Book(
                        id=book_data["id"] * 10 + (0 if lang_code == "en" else 1 if lang_code == "ru" else 2),
                        title=lang_data["title"],
                        author=lang_data.get("author"),
                        summary=lang_data.get("summary"),
                        genre=lang_data.get("genre"),
                        total_pages=lang_data.get("total_pages"),
                        total_chapters=lang_data.get("total_chapters"),
                        language_code=lang_code,
                        is_user_created=False,
                        order_index=book_data["id"],
                    )
                    
                    session.add(book)
                    print(f"✅ Added book: {lang_data['title']} ({lang_code})")
            
            await session.commit()
            print("\n✅ Database seeded successfully!")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error seeding database: {e}")
        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_books())