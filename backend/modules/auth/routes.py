# modules/auth/routes.py
import os
import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from database.db import get_db
from database.models import User
from .auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:3000")
REDIRECT_URI         = "http://localhost:8000/auth/google/callback"


class SignupRequest(BaseModel):
    email: str
    username: str
    password: str
    full_name: str = ""


def _user_dict(user: User) -> dict:
    return {"id": user.id, "email": user.email, "username": user.username, "full_name": user.full_name or ""}


# ── Email/Password Auth ───────────────────────────────────────────────────────
@router.post("/signup")
async def signup(req: SignupRequest, db: AsyncSession = Depends(get_db)):
    for field, val in [("email", req.email), ("username", req.username)]:
        r = await db.execute(select(User).where(getattr(User, field) == val))
        if r.scalar_one_or_none():
            raise HTTPException(400, f"{field.capitalize()} already taken")

    user = User(id=str(uuid.uuid4()), email=req.email, username=req.username,
                hashed_password=hash_password(req.password), full_name=req.full_name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": _user_dict(user)}


@router.post("/login")
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(User).where(User.email == form.username))
    user = r.scalar_one_or_none()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(401, "Incorrect email or password")
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": _user_dict(user)}


@router.get("/me")
async def get_me(db: AsyncSession = Depends(get_db),
                 token: str = Depends(__import__('fastapi.security', fromlist=['OAuth2PasswordBearer']).OAuth2PasswordBearer(tokenUrl='/auth/login', auto_error=False))):
    from .auth import get_current_user
    from fastapi.security import OAuth2PasswordBearer
    # inline token check
    from jose import jwt as _jwt
    SECRET_KEY = os.getenv("SECRET_KEY", "edugenai-secret-change-me")
    try:
        payload = _jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        uid = payload.get("sub")
    except Exception:
        raise HTTPException(401, "Not authenticated")
    r = await db.execute(select(User).where(User.id == uid))
    user = r.scalar_one_or_none()
    if not user:
        raise HTTPException(401, "User not found")
    return _user_dict(user)


# ── Google OAuth ──────────────────────────────────────────────────────────────
@router.get("/google")
async def google_login():
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(400, "Google OAuth not configured. Add GOOGLE_CLIENT_ID to .env")
    scope = "openid email profile"
    url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&response_type=code"
        f"&scope={scope}"
        f"&access_type=offline"
    )
    return RedirectResponse(url)


@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(400, "Google OAuth not configured")

    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        token_resp = await client.post("https://oauth2.googleapis.com/token", data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        token_data = token_resp.json()

        # Get user info
        userinfo_resp = await client.get("https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"})
        google_user = userinfo_resp.json()

    email    = google_user.get("email")
    name     = google_user.get("name", "")
    google_id = google_user.get("sub")

    # Find or create user
    r = await db.execute(select(User).where(User.email == email))
    user = r.scalar_one_or_none()

    if not user:
        username = email.split("@")[0] + "_" + google_id[:6]
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            username=username,
            full_name=name,
            hashed_password=hash_password(google_id),  # dummy password for OAuth users
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token({"sub": user.id})
    # Redirect back to frontend with token
    return RedirectResponse(f"{FRONTEND_URL}/oauth/callback?token={token}&name={name}&email={email}")
