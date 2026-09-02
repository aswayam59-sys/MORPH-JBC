"""Central API router.

Add versioned routers here as they are implemented: auth, events, teams,
rounds, auction, products, cards, celebrities, market, scoring, and admin.
"""

from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.events import router as events_router
from app.api.routes.market import router as market_router
from app.api.routes.features import router as feature_router
from app.api.routes.state import router as state_router

api_router = APIRouter()
api_router.include_router(health_router, prefix="/health", tags=["health"])
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(events_router, prefix="/events", tags=["events"])
api_router.include_router(market_router, prefix="/market", tags=["market"])
api_router.include_router(feature_router, prefix="/features", tags=["auction", "products", "cards", "celebrities", "conflicts", "scoring", "notifications", "admin"])
api_router.include_router(state_router, prefix="/sync", tags=["sync"])
