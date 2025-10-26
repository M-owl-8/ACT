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
        "key_takeaways": '["Pay yourself first - save at least 10% of income", "Make your money work for you through investments", "Seek advice from those experienced in handling money", "Guard your wealth from loss", "Own your home", "Ensure future income through planning", "Increase your ability to earn"]',
        "genre": "Personal Finance",
        "isbn": "9780884211624",
        "total_pages": 247,
        "total_chapters": 13,
        "order_index": 0
    },
    {
        "title": "Your Money or Your Life",
        "author": "Vicki Robin & Joe Dominguez",
        "summary": "A transformative approach to personal finance that helps you achieve financial independence by aligning spending with values.",
        "key_takeaways": '["Calculate your real hourly wage", "Track every cent that comes in and goes out", "Evaluate spending against life energy", "Minimize spending and maximize savings", "Invest for financial independence", "Value fulfillment over material possessions"]',
        "genre": "Personal Finance",
        "isbn": "9780143115762",
        "total_pages": 464,
        "total_chapters": 10,
        "order_index": 1
    },
    {
        "title": "I Will Teach You to Be Rich",
        "author": "Ramit Sethi",
        "summary": "A practical 6-week program for young adults to master personal finance, from banking to investing.",
        "key_takeaways": '["Automate your finances", "Optimize credit cards for rewards", "Open high-yield savings accounts", "Invest in low-cost index funds", "Spend extravagantly on things you love, cut costs mercilessly on things you don\'t", "Negotiate your salary"]',
        "genre": "Personal Finance",
        "isbn": "9781523505746",
        "total_pages": 528,
        "total_chapters": 6,
        "order_index": 2
    },
    {
        "title": "The Millionaire Next Door",
        "author": "Thomas J. Stanley & William D. Danko",
        "summary": "Research-based insights into the habits and characteristics of America's wealthy, revealing surprising truths about millionaires.",
        "key_takeaways": '["Live below your means", "Allocate time and money efficiently", "Financial independence is more important than displaying high social status", "Choose the right occupation", "Create an environment for your children to succeed economically"]',
        "genre": "Wealth Building",
        "isbn": "9781594584596",
        "total_pages": 336,
        "total_chapters": 12,
        "order_index": 3
    },
    {
        "title": "The Psychology of Money",
        "author": "Morgan Housel",
        "summary": "Explores how psychology and behavior affect financial decisions, showing that success with money is more about behavior than intelligence.",
        "key_takeaways": '["Wealth is what you don\'t see", "Save money without a specific goal", "Use money to gain control over your time", "Be reasonable rather than rational", "Avoid extreme financial decisions", "Room for error is crucial"]',
        "genre": "Psychology & Finance",
        "isbn": "9780857197689",
        "total_pages": 400,
        "total_chapters": 20,
        "order_index": 4
    },
    {
        "title": "A Random Walk Down Wall Street",
        "author": "Burton G. Malkiel",
        "summary": "Classic guide to investing that advocates for index fund investing and explains why beating the market is nearly impossible.",
        "key_takeaways": '["Markets are efficient", "Index funds outperform most active managers", "Diversification is essential", "Asset allocation determines returns", "Rebalance regularly", "Keep costs low"]',
        "genre": "Investing",
        "isbn": "9780393634632",
        "total_pages": 544,
        "total_chapters": 16,
        "order_index": 5
    },
    {
        "title": "The Little Book of Common Sense Investing",
        "author": "John C. Bogle",
        "summary": "The founder of Vanguard explains why low-cost index fund investing is the most reliable path to wealth accumulation.",
        "key_takeaways": '["Don\'t look for the needle, buy the haystack", "Minimize costs and taxes", "Stay the course through market volatility", "Time in the market beats timing the market", "Simplicity is the master key"]',
        "genre": "Investing",
        "isbn": "9780470102101",
        "total_pages": 432,
        "total_chapters": 15,
        "order_index": 6
    },
    {
        "title": "Think and Grow Rich",
        "author": "Napoleon Hill",
        "summary": "Classic self-help book based on studying successful people, focusing on the power of personal beliefs and mindset in achieving wealth.",
        "key_takeaways": '["Desire is the starting point of achievement", "Faith and visualization are powerful", "Specialized knowledge is essential", "Imagination creates opportunities", "Organized planning is necessary", "Persistence conquers failure"]',
        "genre": "Self-Help",
        "isbn": "9781585424399",
        "total_pages": 320,
        "total_chapters": 15,
        "order_index": 7
    },
    {
        "title": "Money Master the Game",
        "author": "Tony Robbins",
        "summary": "Comprehensive guide to investing and wealth building, featuring insights from top financial minds and practical strategies.",
        "key_takeaways": '["Make the most important financial decision", "Know the rules before you play", "Create a lifetime income plan", "Invest like the 0.001%", "Create your own personal economy", "Just do it, enjoy it, and share it"]',
        "genre": "Investing",
        "isbn": "9781476236032",
        "total_pages": 640,
        "total_chapters": 7,
        "order_index": 8
    },
    {
        "title": "The Total Money Makeover",
        "author": "Dave Ramsey",
        "summary": "Step-by-step plan to get out of debt and build wealth through the 7 Baby Steps system.",
        "key_takeaways": '["Build $1,000 emergency fund", "Pay off all debt using debt snowball", "Save 3-6 months expenses", "Invest 15% for retirement", "Save for children\'s college", "Pay off home early", "Build wealth and give"]',
        "genre": "Debt Management",
        "isbn": "9780785209387",
        "total_pages": 336,
        "total_chapters": 8,
        "order_index": 9
    },
    {
        "title": "The Simple Path to Wealth",
        "author": "JL Collins",
        "summary": "Straightforward advice on achieving financial independence through simple, low-cost index fund investing.",
        "key_takeaways": '["Spend less than you earn", "Invest the surplus in VTSAX", "Avoid debt", "Keep it simple", "F-You Money provides freedom", "The 4% withdrawal rule for retirement"]',
        "genre": "Financial Independence",
        "isbn": "9781533667281",
        "total_pages": 288,
        "total_chapters": 13,
        "order_index": 10
    },
    {
        "title": "Broke Millennial",
        "author": "Erin Lowry",
        "summary": "Practical financial advice for millennials covering everything from student loans to investing, in relatable language.",
        "key_takeaways": '["Get comfortable talking about money", "Create a budget that works for you", "Tackle student loan debt strategically", "Build credit responsibly", "Start investing early", "Negotiate your salary"]',
        "genre": "Personal Finance",
        "isbn": "9781492207818",
        "total_pages": 336,
        "total_chapters": 11,
        "order_index": 11
    },
    {
        "title": "Quit Like a Millionaire",
        "author": "Kristy Shen & Bryce Leung",
        "summary": "Story of achieving financial independence and retiring at 31 through extreme saving and smart investing.",
        "key_takeaways": '["Save 50-70% of income", "Invest in low-cost index funds", "Geographic arbitrage can accelerate FI", "Calculate your FI number", "The 4% rule for early retirement", "Travel can be cheaper than staying home"]',
        "genre": "Financial Independence",
        "isbn": "9781492234747",
        "total_pages": 384,
        "total_chapters": 12,
        "order_index": 12
    },
    {
        "title": "Meet the Frugalwoods",
        "author": "Elizabeth Willard Thames",
        "summary": "Journey of a family achieving financial independence through frugality and moving to a homestead in Vermont.",
        "key_takeaways": '["Frugality is freedom", "Align spending with values", "Question societal norms about consumption", "DIY saves money and builds skills", "Community over consumption", "Financial independence enables life choices"]',
        "genre": "Memoir",
        "isbn": "9780062406071",
        "total_pages": 384,
        "total_chapters": 13,
        "order_index": 13
    },
    {
        "title": "Rich Dad Poor Dad",
        "author": "Robert T. Kiyosaki",
        "summary": "Contrasts lessons from two father figures about money, assets, and building wealth through financial education.",
        "key_takeaways": '["The rich don\'t work for money", "Financial literacy is essential", "Buy assets, not liabilities", "Mind your own business", "Understand taxes and corporations", "Work to learn, not to earn"]',
        "genre": "Wealth Building",
        "isbn": "9781612680032",
        "total_pages": 336,
        "total_chapters": 10,
        "order_index": 14
    },
    {
        "title": "The Automatic Millionaire",
        "author": "David Bach",
        "summary": "Shows how to build wealth automatically through systematic saving and investing without budgeting.",
        "key_takeaways": '["Pay yourself first automatically", "The Latte Factor - small expenses add up", "Buy a home and pay it off early", "Automate everything", "Make it automatic to make it easy", "Start today, not tomorrow"]',
        "genre": "Personal Finance",
        "isbn": "9780553384529",
        "total_pages": 336,
        "total_chapters": 9,
        "order_index": 15
    },
    {
        "title": "Unshakeable",
        "author": "Tony Robbins",
        "summary": "Guide to financial freedom and peace of mind in any market, focusing on proven strategies and avoiding common mistakes.",
        "key_takeaways": '["Don\'t lose money", "Asymmetric risk/reward", "Tax efficiency matters", "Diversification is protection", "Rebalancing maintains allocation", "Have a plan and stick to it"]',
        "genre": "Investing",
        "isbn": "9781476755960",
        "total_pages": 608,
        "total_chapters": 8,
        "order_index": 16
    },
    {
        "title": "One Up On Wall Street",
        "author": "Peter Lynch",
        "summary": "Legendary investor shares how individual investors can beat professionals by investing in what they know.",
        "key_takeaways": '["Invest in what you know", "Do your homework", "Look for tenbaggers", "Ignore short-term market noise", "Know what you own and why", "The best stock to buy may be one you already own"]',
        "genre": "Investing",
        "isbn": "9780743200400",
        "total_pages": 432,
        "total_chapters": 12,
        "order_index": 17
    },
    {
        "title": "The Bogleheads' Guide to Investing",
        "author": "Taylor Larimore, Mel Lindauer, Michael LeBoeuf",
        "summary": "Comprehensive guide to investing based on John Bogle's philosophy of low-cost, diversified index fund investing.",
        "key_takeaways": '["Develop a sound financial plan", "Start early and invest regularly", "Diversify globally", "Minimize costs and taxes", "Keep it simple", "Stay the course"]',
        "genre": "Investing",
        "isbn": "9780470067529",
        "total_pages": 296,
        "total_chapters": 19,
        "order_index": 18
    },
    {
        "title": "Financial Freedom",
        "author": "Grant Sabatier",
        "summary": "Story of going from $2.26 to over $1 million in 5 years, with strategies for accelerating wealth building.",
        "key_takeaways": '["Calculate your number", "Maximize your income", "Invest as much as possible", "Side hustles accelerate FI", "Optimize for time, not just money", "Financial freedom is about options"]',
        "genre": "Financial Independence",
        "isbn": "9781492245483",
        "total_pages": 304,
        "total_chapters": 10,
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


async def seed_books(db: AsyncSession):
    """Seed financial literacy books if they don't exist"""
    for book_data in BOOKS_DATA:
        # Check if book already exists
        result = await db.execute(
            select(Book).where(Book.title == book_data["title"])
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            book = Book(**book_data)
            db.add(book)
    
    await db.commit()
    print(f"✓ Seeded {len(BOOKS_DATA)} books")


async def seed_all(db: AsyncSession):
    """Seed all default data"""
    await seed_default_categories(db)
    await seed_books(db)
    print("✓ All seed data loaded successfully")


async def seed_default_data(db: AsyncSession):
    """Main function to seed default data (alias for seed_all)"""
    await seed_all(db)