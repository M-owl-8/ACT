"""
Migration script to add is_admin column to existing users table.
Run this once to update your existing database.
"""
import asyncio
from sqlalchemy import text
from db import engine

async def migrate():
    async with engine.begin() as conn:
        # Check if column exists
        result = await conn.execute(text("PRAGMA table_info(users)"))
        columns = [row[1] for row in result.fetchall()]
        
        if 'is_admin' not in columns:
            print("Adding is_admin column to users table...")
            await conn.execute(text(
                "ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0 NOT NULL"
            ))
            print("✓ Column added successfully")
            
            # Make the first user an admin if there are any users
            result = await conn.execute(text("SELECT id FROM users ORDER BY id LIMIT 1"))
            first_user = result.fetchone()
            if first_user:
                await conn.execute(text(
                    f"UPDATE users SET is_admin = 1 WHERE id = {first_user[0]}"
                ))
                print(f"✓ First user (id={first_user[0]}) is now an admin")
        else:
            print("is_admin column already exists, skipping migration")

if __name__ == "__main__":
    asyncio.run(migrate())
    print("\nMigration complete!")