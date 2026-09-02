"""SQLAlchemy models mapped to database/init.sql.

Add one model module per domain area and export models here for Alembic
metadata discovery. Do not duplicate business rules in model definitions.
"""

from app.models.core import Event, EventRound, EventState, Team, User
from app.models.market import CoinLedger, MarketHolding, MarketOpportunity, MarketTransaction
from app.models.all import *  # noqa: F401,F403 - register every schema table for Alembic

__all__ = [
	"CoinLedger",
	"Event",
	"EventRound",
	"EventState",
	"MarketHolding",
	"MarketOpportunity",
	"MarketTransaction",
	"Team",
	"User",
]
