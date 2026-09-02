"""Environment-backed configuration.

Production secrets and the hosted PostgreSQL URL belong in environment
variables or a secret manager, never in source control.
"""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MORPH Event API"
    app_version: str = "0.1.0"
    database_url: str | None = None
    cors_origins: list[str] = Field(default_factory=list)
    jwt_secret: str | None = None
    event_slug: str = "morph-event"
    access_token_hours: int = 12

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
