"""
Push Notifications Router
Handles registration and management of push notification tokens
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from db import get_db
from models import User, PushToken
from security import get_current_user
from pydantic import BaseModel


router = APIRouter(prefix="/push", tags=["Push Notifications"])


# ===== SCHEMAS =====
class PushTokenRegister(BaseModel):
    token: str
    device_type: str | None = None  # 'ios', 'android', 'web'
    device_name: str | None = None


class PushTokenResponse(BaseModel):
    id: int
    token: str
    device_type: str | None
    device_name: str | None
    is_active: bool
    created_at: datetime
    last_used_at: datetime

    class Config:
        from_attributes = True


# ===== ENDPOINTS =====
@router.post("/register", response_model=PushTokenResponse, status_code=status.HTTP_201_CREATED)
def register_push_token(
    data: PushTokenRegister,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Register or update a push notification token for the current user.
    If the token already exists, it will be reactivated and updated.
    """
    # Check if token already exists
    existing_token = db.query(PushToken).filter(PushToken.token == data.token).first()
    
    if existing_token:
        # Update existing token
        existing_token.user_id = current_user.id
        existing_token.device_type = data.device_type
        existing_token.device_name = data.device_name
        existing_token.is_active = True
        existing_token.updated_at = datetime.utcnow()
        existing_token.last_used_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_token)
        return existing_token
    
    # Create new token
    new_token = PushToken(
        user_id=current_user.id,
        token=data.token,
        device_type=data.device_type,
        device_name=data.device_name,
        is_active=True
    )
    
    db.add(new_token)
    db.commit()
    db.refresh(new_token)
    
    return new_token


@router.get("/tokens", response_model=List[PushTokenResponse])
def get_user_push_tokens(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all push tokens for the current user.
    """
    tokens = db.query(PushToken).filter(
        PushToken.user_id == current_user.id
    ).order_by(PushToken.created_at.desc()).all()
    
    return tokens


@router.delete("/tokens/{token_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_push_token(
    token_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a specific push token.
    """
    token = db.query(PushToken).filter(
        PushToken.id == token_id,
        PushToken.user_id == current_user.id
    ).first()
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Push token not found"
        )
    
    db.delete(token)
    db.commit()
    
    return None


@router.post("/tokens/{token_id}/deactivate", response_model=PushTokenResponse)
def deactivate_push_token(
    token_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deactivate a push token without deleting it.
    """
    token = db.query(PushToken).filter(
        PushToken.id == token_id,
        PushToken.user_id == current_user.id
    ).first()
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Push token not found"
        )
    
    token.is_active = False
    token.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(token)
    
    return token


@router.delete("/tokens", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_push_tokens(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete all push tokens for the current user.
    """
    db.query(PushToken).filter(
        PushToken.user_id == current_user.id
    ).delete()
    
    db.commit()
    
    return None


# ===== HELPER FUNCTIONS (for internal use) =====
def get_active_tokens_for_user(db: Session, user_id: int) -> List[str]:
    """
    Get all active push tokens for a specific user.
    This function is used internally by other services to send notifications.
    """
    tokens = db.query(PushToken).filter(
        PushToken.user_id == user_id,
        PushToken.is_active == True
    ).all()
    
    return [token.token for token in tokens]


def update_token_last_used(db: Session, token: str):
    """
    Update the last_used_at timestamp for a token.
    Call this after successfully sending a notification.
    """
    push_token = db.query(PushToken).filter(PushToken.token == token).first()
    if push_token:
        push_token.last_used_at = datetime.utcnow()
        db.commit()


def deactivate_invalid_token(db: Session, token: str):
    """
    Deactivate a token that failed to deliver.
    Call this when FCM returns an error indicating the token is invalid.
    """
    push_token = db.query(PushToken).filter(PushToken.token == token).first()
    if push_token:
        push_token.is_active = False
        push_token.updated_at = datetime.utcnow()
        db.commit()