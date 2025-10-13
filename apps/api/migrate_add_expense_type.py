"""
Migration script to add expense_type column to categories table
"""
import sqlite3
import sys

def migrate():
    """Add expense_type column to categories table"""
    try:
        # Connect to database
        conn = sqlite3.connect('dev.db')
        cursor = conn.cursor()
        
        print("🔄 Starting migration: Adding expense_type column...")
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(categories)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'expense_type' in columns:
            print("✓ Column 'expense_type' already exists. Skipping migration.")
            conn.close()
            return
        
        # Add the new column
        cursor.execute("""
            ALTER TABLE categories 
            ADD COLUMN expense_type TEXT
        """)
        
        # Update existing expense categories with default expense_type based on name
        mandatory_categories = ['Rent', 'Utilities', 'Groceries', 'Transport', 'Health']
        excess_categories = ['Entertainment', 'Shopping', 'Dining Out']
        
        for cat_name in mandatory_categories:
            cursor.execute("""
                UPDATE categories 
                SET expense_type = 'mandatory' 
                WHERE name = ? AND type = 'expense'
            """, (cat_name,))
        
        for cat_name in excess_categories:
            cursor.execute("""
                UPDATE categories 
                SET expense_type = 'excess' 
                WHERE name = ? AND type = 'expense'
            """, (cat_name,))
        
        # Set remaining expense categories to 'neutral'
        cursor.execute("""
            UPDATE categories 
            SET expense_type = 'neutral' 
            WHERE type = 'expense' AND expense_type IS NULL
        """)
        
        conn.commit()
        print("✅ Migration completed successfully!")
        print("✓ Added expense_type column")
        print("✓ Updated existing categories with expense types")
        
        # Show updated categories
        cursor.execute("""
            SELECT name, type, expense_type 
            FROM categories 
            WHERE type = 'expense' 
            ORDER BY expense_type, name
        """)
        
        print("\n📊 Updated expense categories:")
        for row in cursor.fetchall():
            print(f"  - {row[0]}: {row[2]}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate()