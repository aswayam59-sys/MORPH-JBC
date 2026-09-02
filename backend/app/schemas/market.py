"""Validated market request and response contracts."""

from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class MarketTradeRequest(BaseModel):
    opportunity_id: UUID
    quantity: Decimal = Field(gt=0, max_digits=14, decimal_places=4)


class MarketTradeResponse(BaseModel):
    transaction_id: UUID
    team_id: UUID
    opportunity_id: UUID
    transaction_type: str
    quantity: Decimal
    price_per_unit: int
    total_amount: int
    balance: int
