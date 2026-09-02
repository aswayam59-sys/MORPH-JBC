"""Liveness/readiness endpoints for Docker and hosted deployment checks."""

from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("", summary="Check API availability")
async def health() -> dict[str, str | bool]:
    """Return service status without requiring a database connection."""
    return {"status": "ok", "database_configured": bool(settings.database_url)}
