from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid
import jwt
from passlib.hash import argon2
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from db import get_db
from models import User, Token

http_bearer = HTTPBearer(auto_error=False)

def get_token_from_header(request: Request) -> Optional[str]:
    """Extract Bearer token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1]

# Password hashing
def hash_password(password: str) -> str:
    return argon2.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return argon2.verify(password, password_hash)

def _now() -> datetime:
    return datetime.now(timezone.utc)

def create_access_token(user_id: int) -> str:
    exp = _now() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": int(exp.timestamp()),
        "iat": int(_now().timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)

async def create_refresh_token(user_id: int, db: AsyncSession) -> str:
    jti = str(uuid.uuid4())
    exp = _now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "jti": jti,
        "type": "refresh",
        "exp": int(exp.timestamp()),
        "iat": int(_now().timestamp()),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)

    db_token = Token(jti=jti, user_id=user_id, type="refresh", expires_at=exp)
    db.add(db_token)
    await db.commit()
    return token

async def revoke_refresh_token(jti: str, db: AsyncSession) -> None:
    q = await db.execute(select(Token).where(Token.jti == jti))
    t = q.scalar_one_or_none()
    if t:
        t.revoked = True
        await db.commit()

async def is_refresh_valid(jti: str, db: AsyncSession) -> bool:
    q = await db.execute(select(Token).where(Token.jti == jti))
    t = q.scalar_one_or_none()
    if not t or t.revoked or t.expires_at <= _now():
        return False
    return True

async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get current authenticated user from JWT token"""
    token = get_token_from_header(request)
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Access token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")

    user_id = int(payload.get("sub"))
    q = await db.execute(select(User).where(User.id == user_id))
    user = q.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency to ensure the current user is an admin."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user
