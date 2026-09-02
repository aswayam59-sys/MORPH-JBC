"""Application entrypoint.

Keep this file limited to creating the FastAPI app and including routers.
Business rules belong in services, database access in repositories, and
request/response validation in schemas.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings

app = FastAPI(title=settings.app_name, version=settings.app_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(api_router, prefix="/api")


@app.get("/", tags=["system"])
async def root() -> dict[str, str]:
    """Basic service response used by deployment smoke checks."""
    return {"service": settings.app_name, "status": "ok"}
