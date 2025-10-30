"""
Seed default data: categories and books
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import Category, Book, EntryType, ExpenseType
from db import AsyncSessionLocal


# Default categories with icons, colors, and expense types
DEFAULT_CATEGORIES = [
    # Mandatory Expenses
    {"name": "Rent", "type": EntryType.expense, "expense_type": ExpenseType.mandatory, "icon": "🏠", "color": "#FF6B6B"},
    {"name": "Utilities", "type": EntryType.expense, "expense_type": ExpenseType.mandatory, "icon": "💡", "color": "#DFE6E9"},
    {"name": "Groceries", "type": EntryType.expense, "expense_type": ExpenseType.mandatory, "icon": "🛒", "color": "#96CEB4"},
    {"name": "Transport", "type": EntryType.expense, "expense_type": ExpenseType.mandatory, "icon": "🚗", "color": "#45B7D1"},
    {"name": "Health", "type": EntryType.expense, "expense_type": ExpenseType.mandatory, "icon": "⚕️", "color": "#74B9FF"},
    
    # Neutral Expenses
    {"name": "Food", "type": EntryType.expense, "expense_type": ExpenseType.neutral, "icon": "🍔", "color": "#4ECDC4"},
    {"name": "Study", "type": EntryType.expense, "expense_type": ExpenseType.neutral, "icon": "📚", "color": "#A29BFE"},
    {"name": "Clothing", "type": EntryType.expense, "expense_type": ExpenseType.neutral, "icon": "👕", "color": "#FD79A8"},
    
    # Excess Expenses
    {"name": "Entertainment", "type": EntryType.expense, "expense_type": ExpenseType.excess, "icon": "🎮", "color": "#FFEAA7"},
    {"name": "Shopping", "type": EntryType.expense, "expense_type": ExpenseType.excess, "icon": "🛍️", "color": "#FD79A8"},
    {"name": "Dining Out", "type": EntryType.expense, "expense_type": ExpenseType.excess, "icon": "🍽️", "color": "#FF7675"},
    {"name": "Other", "type": EntryType.expense, "expense_type": ExpenseType.neutral, "icon": "📦", "color": "#B2BEC3"},
    
    # Income (no expense_type)
    {"name": "Salary", "type": EntryType.income, "expense_type": None, "icon": "💰", "color": "#00B894"},
    {"name": "Bonus", "type": EntryType.income, "expense_type": None, "icon": "🎁", "color": "#00CEC9"},
    {"name": "Freelance", "type": EntryType.income, "expense_type": None, "icon": "💼", "color": "#55EFC4"},
    {"name": "Investment", "type": EntryType.income, "expense_type": None, "icon": "📈", "color": "#81ECEC"},
    {"name": "Gift", "type": EntryType.income, "expense_type": None, "icon": "🎉", "color": "#74B9FF"},
    {"name": "Other Income", "type": EntryType.income, "expense_type": None, "icon": "💵", "color": "#A29BFE"},
]


# 20 Financial literacy books
BOOKS_DATA = [
    {
        "title": "The Richest Man in Babylon",
        "author": "George S. Clason",
        "summary": "Ancient wisdom about money management through parables set in ancient Babylon. Teaches fundamental principles of wealth building.",
        "order_index": 0
    },
    {
        "title": "Your Money or Your Life",
        "author": "Vicki Robin & Joe Dominguez",
        "summary": "A transformative approach to personal finance that helps you achieve financial independence by aligning spending with values.",
        "order_index": 1
    },
    {
        "title": "I Will Teach You to Be Rich",
        "author": "Ramit Sethi",
        "summary": "A practical 6-week program for young adults to master personal finance, from banking to investing.",
        "order_index": 2
    },
    {
        "title": "The Millionaire Next Door",
        "author": "Thomas J. Stanley & William D. Danko",
        "summary": "Research-based insights into the habits and characteristics of America's wealthy, revealing surprising truths about millionaires.",
        "order_index": 3
    },
    {
        "title": "The Psychology of Money",
        "author": "Morgan Housel",
        "summary": "Explores how psychology and behavior affect financial decisions, showing that success with money is more about behavior than intelligence.",
        "order_index": 4
    },
    {
        "title": "A Random Walk Down Wall Street",
        "author": "Burton G. Malkiel",
        "summary": "Classic guide to investing that advocates for index fund investing and explains why beating the market is nearly impossible.",
        "order_index": 5
    },
    {
        "title": "The Little Book of Common Sense Investing",
        "author": "John C. Bogle",
        "summary": "The founder of Vanguard explains why low-cost index fund investing is the most reliable path to wealth accumulation.",
        "order_index": 6
    },
    {
        "title": "Think and Grow Rich",
        "author": "Napoleon Hill",
        "summary": "Classic self-help book based on studying successful people, focusing on the power of personal beliefs and mindset in achieving wealth.",
        "order_index": 7
    },
    {
        "title": "Money Master the Game",
        "author": "Tony Robbins",
        "summary": "Comprehensive guide to investing and wealth building, featuring insights from top financial minds and practical strategies.",
        "order_index": 8
    },
    {
        "title": "The Total Money Makeover",
        "author": "Dave Ramsey",
        "summary": "Step-by-step plan to get out of debt and build wealth through the 7 Baby Steps system.",
        "order_index": 9
    },
    {
        "title": "The Simple Path to Wealth",
        "author": "JL Collins",
        "summary": "Straightforward advice on achieving financial independence through simple, low-cost index fund investing.",
        "order_index": 10
    },
    {
        "title": "Broke Millennial",
        "author": "Erin Lowry",
        "summary": "Practical financial advice for millennials covering everything from student loans to investing, in relatable language.",
        "order_index": 11
    },
    {
        "title": "Quit Like a Millionaire",
        "author": "Kristy Shen & Bryce Leung",
        "summary": "Story of achieving financial independence and retiring at 31 through extreme saving and smart investing.",
        "order_index": 12
    },
    {
        "title": "Meet the Frugalwoods",
        "author": "Elizabeth Willard Thames",
        "summary": "Journey of a family achieving financial independence through frugality and moving to a homestead in Vermont.",
        "order_index": 13
    },
    {
        "title": "Rich Dad Poor Dad",
        "author": "Robert T. Kiyosaki",
        "summary": "Contrasts lessons from two father figures about money, assets, and building wealth through financial education.",
        "order_index": 14
    },
    {
        "title": "The Automatic Millionaire",
        "author": "David Bach",
        "summary": "Shows how to build wealth automatically through systematic saving and investing without budgeting.",
        "order_index": 15
    },
    {
        "title": "Unshakeable",
        "author": "Tony Robbins",
        "summary": "Guide to financial freedom and peace of mind in any market, focusing on proven strategies and avoiding common mistakes.",
        "order_index": 16
    },
    {
        "title": "One Up On Wall Street",
        "author": "Peter Lynch",
        "summary": "Legendary investor shares how individual investors can beat professionals by investing in what they know.",
        "order_index": 17
    },
    {
        "title": "The Bogleheads' Guide to Investing",
        "author": "Taylor Larimore, Mel Lindauer, Michael LeBoeuf",
        "summary": "Comprehensive guide to investing based on John Bogle's philosophy of low-cost, diversified index fund investing.",
        "order_index": 18
    },
    {
        "title": "Financial Freedom",
        "author": "Grant Sabatier",
        "summary": "Story of going from $2.26 to over $1 million in 5 years, with strategies for accelerating wealth building.",
        "order_index": 19
    }
]


async def seed_default_categories(db: AsyncSession):
    """Seed default categories if they don't exist"""
    for cat_data in DEFAULT_CATEGORIES:
        # Check if default category already exists
        result = await db.execute(
            select(Category).where(
                Category.name == cat_data["name"],
                Category.type == cat_data["type"],
                Category.is_default == True
            )
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            category = Category(
                name=cat_data["name"],
                type=cat_data["type"],
                expense_type=cat_data.get("expense_type"),
                icon=cat_data["icon"],
                color=cat_data["color"],
                is_default=True,
                user_id=None  # Global default
            )
            db.add(category)
    
    await db.commit()
    print(f"✓ Seeded {len(DEFAULT_CATEGORIES)} default categories")


async def seed_multilingual_books(db: AsyncSession):
    """
    Seed 3 multilingual books - DISABLED due to schema mismatch
    """
    return  # Skip multilingual books for now
    
    # Original multilingual books array:
    multilingual_books = [
        {
            "base_title": "The Richest Man in Babylon",
            "order_index": 1,
            "books_by_lang": {
                "en": {
                    "title": "The Richest Man in Babylon",
                    "author": "George S. Clason",
                    "summary": "Ancient wisdom about money management through parables set in ancient Babylon. Teaches fundamental principles of wealth building.",
                    "key_takeaways": '["Pay yourself first - save at least 10% of income", "Make your money work for you through investments", "Seek advice from those experienced in handling money", "Guard your wealth from loss", "Own your home", "Ensure future income through planning", "Increase your ability to earn"]',
                    "genre": "Personal Finance",
                    "total_pages": 247,
                    "total_chapters": 13,
                    "file_path": "en/book_1.pdf",
                },
                "ru": {
                    "title": "Самый богатый человек в Вавилоне",
                    "author": "Джордж С. Клейсон",
                    "summary": "Древняя мудрость об управлении деньгами через притчи из древнего Вавилона. Учит фундаментальным принципам накопления богатства.",
                    "key_takeaways": '["Плати себе в первую очередь - сэкономь минимум 10% дохода", "Заставляй свои деньги работать на тебя через инвестиции", "Ищи советы у тех, кто умеет управлять деньгами", "Защищай свое богатство от потерь", "Владей своим домом", "Обеспечивай будущий доход через планирование", "Увеличивай свою способность зарабатывать"]',
                    "genre": "Персональные финансы",
                    "total_pages": 247,
                    "total_chapters": 13,
                    "file_path": "ru/Book_1.pdf",
                },
                "uz": {
                    "title": "Vavilondagi eng boy odam",
                    "author": "Jorj S. Kleyson",
                    "summary": "Qadim Vavilondan olingan hikoyalar orqali pul boshqarish haqida qadimiy donolik. Boylik yig'ishning asosiy tamoyillarini o'retadi.",
                    "key_takeaways": '["O\'zindan birinchi pul olib qol - kirimning hech bo\'lmaganda 10% tejamondir", "Pullarni sening uchun ishlat investitsiyalar orqali", "Pul boshqarishni bilganlardan maslahat oling", "Yog\'iligingni yo\'qotishdan saqlang", "Sening uyini o\'z nombingizga qilin", "Kelajak daromadini rejalashtirishni tayyorla", "Yig\'iladigan qobiliyatini oshir"]',
                    "genre": "Moliyaviy o\'sish",
                    "total_pages": 247,
                    "total_chapters": 13,
                    "file_path": "uz/Book_1.pdf",
                }
            }
        },
        {
            "base_title": "Atomic Habits",
            "order_index": 2,
            "books_by_lang": {
                "en": {
                    "title": "Atomic Habits",
                    "author": "James Clear",
                    "summary": "Transform your life with tiny habits. Practical strategies for building good habits and breaking bad ones.",
                    "key_takeaways": '["Make it obvious - design your environment", "Make it attractive - use temptation bundling", "Make it easy - reduce friction", "Make it satisfying - immediate reward", "Compound effect of small improvements", "Identity-based habits work best"]',
                    "genre": "Self-Help",
                    "total_pages": 320,
                    "total_chapters": 37,
                    "file_path": "en/book_2.pdf",
                },
                "ru": {
                    "title": "Атомные привычки",
                    "author": "Джеймс Клир",
                    "summary": "Трансформируй свою жизнь с помощью крошечных привычек. Практические стратегии для создания хороших привычек и избавления от плохих.",
                    "key_takeaways": '["Сделай это очевидным - создай благоприятную среду", "Сделай это привлекательным - используй связанное искушение", "Сделай это легким - снизь трение", "Сделай это приятным - немедленное вознаграждение", "Кумулятивный эффект малых улучшений", "Привычки, основанные на идентичности, работают лучше всего"]',
                    "genre": "Саморазвитие",
                    "total_pages": 320,
                    "total_chapters": 37,
                    "file_path": "ru/Book_2.pdf",
                },
                "uz": {
                    "title": "Atomli odatlar",
                    "author": "Jeyms Klir",
                    "summary": "O'z hayotingizni kichik odatlar bilan o'zgartirib yuboring. Yaxshi odatlarni shakllantirish va yomon odatlardan qutulish uchun amaliy strategiyalar.",
                    "key_takeaways": '["Uni aniq qilib bering - muhitingni rejala\\\'shtirib oling", "Uni qiziqarli qilib bering - valajon kelishini ishlating", "Uni oson qilib bering - ishqalanishni kamaytiring", "Uni qoniqtiruvchi qilib bering - darhol mukofot", "Kichik yaxsiliklarning murakkab ta\'siri", "Shaxsiyatga asoslangan odatlar eng yaxshi ishlaydi"]',
                    "genre": "O\'z-o\'zini rivojlantirish",
                    "total_pages": 320,
                    "total_chapters": 37,
                    "file_path": "uz/Book_2.pdf",
                }
            }
        },
        {
            "base_title": "Rich Dad Poor Dad",
            "order_index": 3,
            "books_by_lang": {
                "en": {
                    "title": "Rich Dad Poor Dad",
                    "author": "Robert T. Kiyosaki",
                    "summary": "Contrasts lessons from two father figures about money, assets, and building wealth through financial education.",
                    "key_takeaways": '["The rich don\'t work for money", "Financial literacy is essential", "Buy assets, not liabilities", "Mind your own business", "Understand taxes and corporations", "Work to learn, not to earn"]',
                    "genre": "Wealth Building",
                    "total_pages": 336,
                    "total_chapters": 10,
                    "file_path": "en/book_3.pdf",
                },
                "ru": {
                    "title": "Богатый папа, бедный папа",
                    "author": "Роберт Т. Кийосаки",
                    "summary": "Контрастирует уроки двух отцов о деньгах, активах и накоплении богатства через финансовое образование.",
                    "key_takeaways": '["Богатые не работают за деньги", "Финансовая грамотность существенна", "Покупай активы, а не пассивы", "Занимайся своим делом", "Разбирайся в налогах и корпорациях", "Работай, чтобы учиться, а не зарабатывать"]',
                    "genre": "Накопление богатства",
                    "total_pages": 336,
                    "total_chapters": 10,
                    "file_path": "ru/Book_3.pdf",
                },
                "uz": {
                    "title": "Boy otasi, kambag\'al otasi",
                    "author": "Robert T. Kiyosaki",
                    "summary": "Ikki otasining pul, aktivlar va moliyaviy bilim orqali boylik yig\'ish haqidagi darslarini solishtiradi.",
                    "key_takeaways": '["Boy odamlar pul uchun ishlamaydi", "Moliyaviy savodoborat zarurdir", "Aktivlar sotib oling, passivlar emas", "O\'z biznesini ehtiyot bilan ko\'rib chiq", "Solgalar va korporatsiyalarni tushun", "Ishlash uchun emas, o\'rganish uchun ishlang"]',
                    "genre": "Boylik yig\'ish",
                    "total_pages": 336,
                    "total_chapters": 10,
                    "file_path": "uz/Book_3.pdf",
                }
            }
        }
    ]
    
    books_created = 0
    for book_group in multilingual_books:
        for lang_code, book_data in book_group["books_by_lang"].items():
            # Check if this book in this language already exists
            result = await db.execute(
                select(Book).where(
                    Book.title == book_data["title"],
                    Book.language_code == lang_code
                )
            )
            existing = result.scalar_one_or_none()
            
            if not existing:
                book = Book(
                    title=book_data["title"],
                    author=book_data.get("author"),
                    summary=book_data.get("summary"),
                    key_takeaways=book_data.get("key_takeaways"),
                    genre=book_data.get("genre"),
                    total_pages=book_data.get("total_pages"),
                    total_chapters=book_data.get("total_chapters"),
                    language_code=lang_code,
                    file_path=book_data.get("file_path"),
                    order_index=book_group["order_index"],
                    is_user_created=False
                )
                db.add(book)
                books_created += 1
                print(f"✅ Added book: {book_data['title']} ({lang_code})")
    
    await db.commit()
    if books_created > 0:
        print(f"✓ Seeded {books_created} multilingual books")


async def seed_books(db: AsyncSession):
    """Seed additional financial literacy books if they don't exist"""
    for book_data in BOOKS_DATA:
        # Check if book already exists
        result = await db.execute(
            select(Book).where(
                Book.title == book_data["title"]
            )
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            book = Book(
                title=book_data["title"],
                author=book_data.get("author"),
                summary=book_data.get("summary"),
                order_index=book_data.get("order_index", 0)
            )
            db.add(book)
    
    await db.commit()
    additional_books_count = len([b for b in BOOKS_DATA])  # Count added books
    if additional_books_count > 0:
        print(f"✓ Seeded {additional_books_count} additional books")


async def seed_all(db: AsyncSession):
    """Seed all default data"""
    await seed_default_categories(db)
    await seed_multilingual_books(db)  # Seed 3 main multilingual books first
    await seed_books(db)  # Seed additional financial books
    print("✓ All seed data loaded successfully")


async def seed_default_data(db: AsyncSession):
    """Main function to seed default data (alias for seed_all)"""
    await seed_all(db)