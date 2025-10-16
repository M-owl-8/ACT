"""
Password Reset API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from typing import Optional
import secrets
import jwt

from db import get_db
from models import User
from schemas import PasswordResetRequest, PasswordResetConfirm, MessageResponse
from security import hash_password
from config import settings

router = APIRouter()

# In-memory store for reset tokens (in production, use Redis or database)
# Format: {token: {"user_id": int, "expires_at": datetime}}
reset_tokens = {}


def generate_reset_token(user_id: int) -> str:
    """Generate a secure reset token"""
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)  # Token valid for 1 hour
    reset_tokens[token] = {
        "user_id": user_id,
        "expires_at": expires_at
    }
    return token


def verify_reset_token(token: str) -> Optional[int]:
    """Verify reset token and return user_id if valid"""
    if token not in reset_tokens:
        return None
    
    token_data = reset_tokens[token]
    if datetime.utcnow() > token_data["expires_at"]:
        # Token expired, remove it
        del reset_tokens[token]
        return None
    
    return token_data["user_id"]


@router.post("/request", response_model=MessageResponse)
async def request_password_reset(
    payload: PasswordResetRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Request a password reset token.
    In production, this would send an email with the reset link.
    For MVP, we return the token directly (for testing).
    """
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == payload.email)
    )
    user = result.scalar_one_or_none()
    
    # Always return success to prevent email enumeration
    # In production, send email only if user exists
    if user:
        token = generate_reset_token(user.id)
        # TODO: Send email with reset link containing token
        # For now, we'll return it in the response (DEV ONLY)
        return MessageResponse(
            message=f"Password reset token generated. Token: {token} (This should be sent via email in production)"
        )
    
    return MessageResponse(
        message="If an account with that email exists, a password reset link has been sent."
    )


@router.post("/confirm", response_model=MessageResponse)
async def confirm_password_reset(
    payload: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db)
):
    """
    Confirm password reset with token and new password
    """
    # Verify token
    user_id = verify_reset_token(payload.token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Get user
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.password_hash = hash_password(payload.new_password)
    user.updated_at = datetime.utcnow()
    
    await db.commit()
    
    # Remove used token
    del reset_tokens[payload.token]
    
    return MessageResponse(
        message="Password has been reset successfully. You can now login with your new password."
    )


@router.post("/verify-token", response_model=MessageResponse)
async def verify_token(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify if a reset token is valid (useful for frontend validation)
    """
    user_id = verify_reset_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    return MessageResponse(message="Token is valid")