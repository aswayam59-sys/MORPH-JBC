"""SQLAlchemy declarative base used by all ORM models and Alembic."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base metadata for the existing PostgreSQL schema."""
