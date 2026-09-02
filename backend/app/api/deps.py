"""Shared authentication and database dependencies."""

from dataclasses import dataclass

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.db.session import get_db

bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class CurrentPrincipal:
    subject: str
    role: str
    event_slug: str


async def get_current_principal(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> CurrentPrincipal:
    """Validate the bearer token issued by the authentication routes."""
    if not credentials or not settings.jwt_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    try:
        payload = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=["HS256"])
        return CurrentPrincipal(
            subject=str(payload["sub"]),
            role=str(payload["role"]),
            event_slug=str(payload["event_slug"]),
        )
    except (jwt.PyJWTError, KeyError, TypeError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token") from exc


def require_admin(principal: CurrentPrincipal = Depends(get_current_principal)) -> CurrentPrincipal:
    """Restrict a route to admin principals."""
    if principal.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return principal


async def get_authenticated_db(db=Depends(get_db)):
    """Document the shared authenticated database dependency for routers."""
    return db
