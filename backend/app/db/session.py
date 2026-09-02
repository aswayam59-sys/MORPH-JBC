"""Async SQLAlchemy session setup for hosted PostgreSQL.

The engine is created only when DATABASE_URL is configured, allowing the API
health route and container startup to work before deployment secrets exist.
Business operations must use one session/transaction for related writes.
"""

from collections.abc import AsyncIterator

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

_engine = (
    create_async_engine(settings.database_url, pool_pre_ping=True, pool_size=10, max_overflow=20)
    if settings.database_url
    else None
)
_session_factory = async_sessionmaker(_engine, expire_on_commit=False) if _engine else None


async def get_db() -> AsyncIterator[AsyncSession]:
    """Provide a request-scoped database session."""
    if _session_factory is None:
        raise HTTPException(status_code=503, detail="DATABASE_URL is not configured")
    async with _session_factory() as session:
        yield session
