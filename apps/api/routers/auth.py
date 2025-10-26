from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import jwt
import traceback
from datetime import datetime

from db import get_db
from models import User, UserDevice
from schemas import (
    UserCreate, LoginRequest, TokenPair, RefreshRequest,
    PasswordResetRequest, PasswordResetConfirm, DeviceInfo, MessageResponse
)
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
    try:
        # Check unique email
        exists = await db.execute(select(User).where(User.email == payload.email))
        if exists.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")

        # Check if this is the first user
        user_count = await db.execute(select(User))
        is_first_user = len(user_count.scalars().all()) == 0

        # Hash password asynchronously
        password_hash = await hash_password(payload.password)
        
        # Hash recovery keyword for security
        recovery_keyword_hash = await hash_password(payload.recovery_keyword)
        
        user = User(
            email=payload.email, 
            password_hash=password_hash,
            recovery_keyword=recovery_keyword_hash,  # Store hashed recovery keyword
            is_admin=is_first_user
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        access = create_access_token(user.id)
        refresh = await create_refresh_token(user.id, db)
        return TokenPair(access_token=access, refresh_token=refresh)
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Registration error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=TokenPair)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Login endpoint
    """
    print(f"🔐 Login attempt: email={payload.email}")
    
    q = await db.execute(select(User).where(User.email == payload.email))
    user = q.scalar_one_or_none()
    if not user:
        print(f"❌ User not found: {payload.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password asynchronously
    password_valid = await verify_password(payload.password, user.password_hash)
    if not password_valid:
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


# ===== PASSWORD RECOVERY ENDPOINTS =====

@router.post("/verify-recovery-keyword", response_model=MessageResponse)
async def verify_recovery_keyword(payload: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    """
    Verify recovery keyword before allowing password reset.
    This step validates that user knows their recovery keyword.
    """
    try:
        # Find user by email
        q = await db.execute(select(User).where(User.email == payload.email))
        user = q.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=401, detail="Email not found")
        
        # Verify recovery keyword
        keyword_valid = await verify_password(payload.recovery_keyword, user.recovery_keyword)
        if not keyword_valid:
            raise HTTPException(status_code=401, detail="Invalid recovery keyword")
        
        return MessageResponse(message="Recovery keyword verified successfully. You can now reset your password.")
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error verifying recovery keyword: {str(e)}")
        raise HTTPException(status_code=500, detail="Error verifying recovery keyword")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(payload: PasswordResetConfirm, db: AsyncSession = Depends(get_db)):
    """
    Reset password using email and recovery keyword.
    
    Steps:
    1. Find user by email
    2. Verify recovery keyword
    3. Update password
    4. Invalidate all existing tokens (user must login again)
    """
    try:
        # Find user by email
        q = await db.execute(select(User).where(User.email == payload.email))
        user = q.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=401, detail="Email not found")
        
        # Verify recovery keyword
        keyword_valid = await verify_password(payload.recovery_keyword, user.recovery_keyword)
        if not keyword_valid:
            raise HTTPException(status_code=401, detail="Invalid recovery keyword")
        
        # Hash new password
        new_password_hash = await hash_password(payload.new_password)
        user.password_hash = new_password_hash
        user.updated_at = datetime.utcnow()
        
        # Revoke all existing tokens for security (force re-login on all devices)
        tokens_q = await db.execute(select(User.tokens).where(User.id == user.id))
        tokens = tokens_q.scalars().all()
        for token in user.tokens:
            token.revoked = True
        
        db.add(user)
        await db.commit()
        
        print(f"✓ Password reset successful for user: {user.email}")
        return MessageResponse(message="Password reset successfully. All devices have been logged out. Please login with your new password.")
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error resetting password: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error resetting password")


@router.get("/devices", response_model=list)
async def get_user_devices(user_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all devices where user has logged in.
    Used to manage sessions across devices.
    """
    try:
        q = await db.execute(
            select(UserDevice).where(UserDevice.user_id == user_id).order_by(UserDevice.last_login.desc())
        )
        devices = q.scalars().all()
        
        return [{
            "id": d.id,
            "device_name": d.device_name,
            "device_type": d.device_type,
            "os": d.os,
            "last_login": d.last_login.isoformat(),
            "created_at": d.created_at.isoformat(),
            "is_active": d.is_active
        } for d in devices]
    
    except Exception as e:
        print(f"❌ Error fetching devices: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching devices")


@router.delete("/devices/{device_id}", response_model=MessageResponse)
async def logout_device(device_id: int, db: AsyncSession = Depends(get_db)):
    """
    Logout from a specific device by deactivating it.
    Useful for removing access from lost or compromised devices.
    """
    try:
        q = await db.execute(select(UserDevice).where(UserDevice.id == device_id))
        device = q.scalar_one_or_none()
        
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        
        device.is_active = False
        db.add(device)
        await db.commit()
        
        print(f"✓ Device logged out: {device.device_name}")
        return MessageResponse(message=f"Device '{device.device_name}' has been logged out successfully.")
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error logging out device: {str(e)}")
        raise HTTPException(status_code=500, detail="Error logging out device")
