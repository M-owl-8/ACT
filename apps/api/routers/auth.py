from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import jwt

from db import get_db
from models import User
from schemas import UserCreate, LoginRequest, TokenPair, RefreshRequest
from security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    revoke_refresh_token,
    is_refresh_valid,
)
from config import settings

router = APIRouter()

@router.post("/register", response_model=TokenPair)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    # unique email
    exists = await db.execute(select(User).where(User.email == payload.email))
    if exists.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if this is the first user
    user_count = await db.execute(select(User))
    is_first_user = len(user_count.scalars().all()) == 0

    user = User(
        email=payload.email, 
        password_hash=hash_password(payload.password),
        is_admin=is_first_user
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access = create_access_token(user.id)
    refresh = await create_refresh_token(user.id, db)
    return TokenPair(access_token=access, refresh_token=refresh)

@router.post("/login", response_model=TokenPair)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(User).where(User.email == payload.email))
    user = q.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access = create_access_token(user.id)
    refresh = await create_refresh_token(user.id, db)
    return TokenPair(access_token=access, refresh_token=refresh)

@router.post("/refresh", response_model=TokenPair)
async def refresh_tokens(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    token = body.refresh_token
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")

    jti = payload.get("jti")
    sub = int(payload.get("sub"))

    if not await is_refresh_valid(jti, db):
        raise HTTPException(status_code=401, detail="Refresh token revoked or invalid")

    # Rotate: revoke old, issue new pair
    await revoke_refresh_token(jti, db)
    access = create_access_token(sub)
    refresh = await create_refresh_token(sub, db)
    return TokenPair(access_token=access, refresh_token=refresh)

@router.post("/logout")
async def logout(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(body.refresh_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        jti = payload.get("jti")
        await revoke_refresh_token(jti, db)
    except jwt.PyJWTError:
        pass
    return {"ok": True}
