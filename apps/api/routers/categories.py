"""
Categories API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List

from db import get_db
from models import User, Category
from schemas import CategoryCreate, CategoryUpdate, CategoryOut
from security import get_current_user

router = APIRouter()


@router.get("/", response_model=List[CategoryOut])
async def list_categories(
    type: str = None,
    expense_type: str = None,
    include_deleted: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all categories available to the user:
    - Default categories (global)
    - User's custom categories
    - Filter by type (expense/income)
    - Filter by expense_type (mandatory/neutral/excess)
    """
    query = select(Category).where(
        or_(
            Category.user_id == current_user.id,
            Category.user_id == None  # Default categories
        )
    )
    
    if not include_deleted:
        query = query.where(Category.is_deleted == False)
    
    if type:
        query = query.where(Category.type == type)
    
    if expense_type:
        query = query.where(Category.expense_type == expense_type)
    
    query = query.order_by(Category.is_default.desc(), Category.name)
    
    result = await db.execute(query)
    categories = result.scalars().all()
    
    return categories


@router.get("/{category_id}", response_model=CategoryOut)
async def get_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific category"""
    result = await db.execute(
        select(Category).where(
            Category.id == category_id,
            or_(
                Category.user_id == current_user.id,
                Category.user_id == None
            )
        )
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return category


@router.post("/", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a custom category"""
    # Check for duplicate name for this user
    result = await db.execute(
        select(Category).where(
            Category.user_id == current_user.id,
            Category.name == category_data.name,
            Category.type == category_data.type
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{category_data.name}' already exists"
        )
    
    category = Category(
        **category_data.model_dump(),
        user_id=current_user.id,
        is_default=False
    )
    
    db.add(category)
    await db.commit()
    await db.refresh(category)
    
    return category


@router.patch("/{category_id}", response_model=CategoryOut)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a custom category (cannot update default categories)"""
    result = await db.execute(
        select(Category).where(
            Category.id == category_id,
            Category.user_id == current_user.id
        )
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found or cannot be modified"
        )
    
    if category.is_default:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify default categories"
        )
    
    # Update fields
    update_data = category_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    await db.commit()
    await db.refresh(category)
    
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    hard_delete: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a custom category (soft delete by default)
    Cannot delete default categories
    """
    result = await db.execute(
        select(Category).where(
            Category.id == category_id,
            Category.user_id == current_user.id
        )
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found or cannot be deleted"
        )
    
    if category.is_default:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete default categories"
        )
    
    if hard_delete:
        await db.delete(category)
    else:
        category.is_deleted = True
    
    await db.commit()
    
    return None