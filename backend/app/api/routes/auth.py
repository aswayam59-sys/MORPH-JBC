"""Authentication routes.

Team access codes are verified only against password hashes stored in
PostgreSQL. Plain access codes must never be returned by this API.
"""

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from pwdlib import PasswordHash

from app.core.config import settings
from app.db.session import get_db
from app.schemas.auth import AdminLoginRequest, LoginResponse, TeamLoginRequest

router = APIRouter()
password_hash = PasswordHash.recommended()


@router.post("/team", response_model=LoginResponse)
async def login_team(
    request: TeamLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> LoginResponse:
    """Verify a team access code against the hosted PostgreSQL database."""
    if not settings.jwt_secret:
        raise HTTPException(status_code=503, detail="JWT_SECRET is not configured")

    result = await db.execute(
        text(
            """
            SELECT id, team_number, access_code_hash
            FROM teams
            WHERE event_id = (
              SELECT id FROM events WHERE slug = :event_slug LIMIT 1
            )
              AND team_number = :team_number
        """
        ),
        {"event_slug": settings.event_slug, "team_number": request.team_number},
    )
    team = result.mappings().one_or_none()

    if not team or not password_hash.verify(request.access_code, team["access_code_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid team number or access code",
        )

    now = datetime.now(timezone.utc)
    token = jwt.encode(
        {
            "sub": str(team["id"]),
            "role": "TEAM",
            "event_slug": settings.event_slug,
            "exp": now + timedelta(hours=settings.access_token_hours),
        },
        settings.jwt_secret,
        algorithm="HS256",
    )
    return LoginResponse(
        access_token=token,
        team_id=str(team["id"]),
        team_number=team["team_number"],
    )


@router.post("/admin", response_model=LoginResponse)
async def login_admin(
    request: AdminLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> LoginResponse:
    """Verify an admin password hash stored in the users table."""
    if not settings.jwt_secret:
        raise HTTPException(status_code=503, detail="JWT_SECRET is not configured")

    result = await db.execute(text("""
        SELECT u.id, e.slug, u.password_hash
        FROM users u
        JOIN events e ON e.id = u.event_id
        WHERE u.email = :email AND u.role = 'ADMIN' AND u.is_active
          AND e.slug = :event_slug
    """), {"email": request.email, "event_slug": settings.event_slug})
    user = result.mappings().one_or_none()
    if not user or not password_hash.verify(request.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")

    now = datetime.now(timezone.utc)
    token = jwt.encode(
        {"sub": str(user["id"]), "role": "ADMIN", "event_slug": settings.event_slug,
         "exp": now + timedelta(hours=settings.access_token_hours)},
        settings.jwt_secret,
        algorithm="HS256",
    )
    return LoginResponse(access_token=token, team_id=str(user["id"]), team_number=0)
