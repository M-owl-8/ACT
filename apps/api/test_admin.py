"""
Test script to verify admin permissions are working.
"""
import asyncio
from sqlalchemy import select
from db import AsyncSessionLocal
from models import User

async def check_admin_status():
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(User))
            users = result.scalars().all()
            
            print("\n=== User List ===")
            if not users:
                print("No users found in database")
            else:
                for user in users:
                    admin_status = "✓ ADMIN" if user.is_admin else "Regular User"
                    print(f"ID: {user.id} | Email: {user.email} | {admin_status}")
                
                print(f"\nTotal users: {len(users)}")
                admin_count = sum(1 for u in users if u.is_admin)
                print(f"Admin users: {admin_count}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(check_admin_status())