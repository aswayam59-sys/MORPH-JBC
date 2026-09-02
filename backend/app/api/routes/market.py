"""Transactional market routes.

Every BUY/SELL locks the team and opportunity rows, updates holdings and the
cached coin balance, and writes the transaction/ledger records in one commit.
"""

from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentPrincipal, get_current_principal
from app.api.routes.events import event_id_for_slug
from app.db.session import get_db
from app.schemas.market import MarketTradeRequest, MarketTradeResponse

router = APIRouter()


async def trade(
    request: MarketTradeRequest,
    transaction_type: str,
    principal: CurrentPrincipal,
    db: AsyncSession,
) -> MarketTradeResponse:
    if principal.role != "TEAM":
        raise HTTPException(status_code=403, detail="Team access required")

    event_id = await event_id_for_slug(db, principal.event_slug)
    await db.rollback()
    async with db.begin():
        team_result = await db.execute(text("""
            SELECT id, morph_coins
            FROM teams
            WHERE id = :team_id AND event_id = :event_id
            FOR UPDATE
        """), {"team_id": principal.subject, "event_id": event_id})
        team = team_result.mappings().one_or_none()
        if team is None:
            raise HTTPException(status_code=404, detail="Team not found")

        opportunity_result = await db.execute(text("""
            SELECT id, current_price
            FROM market_opportunities
            WHERE id = :opportunity_id AND event_id = :event_id AND status = 'ACTIVE'
            FOR UPDATE
        """), {"opportunity_id": request.opportunity_id, "event_id": event_id})
        opportunity = opportunity_result.mappings().one_or_none()
        if opportunity is None:
            raise HTTPException(status_code=404, detail="Market opportunity not found or inactive")

        price = int(opportunity["current_price"])
        total_amount = int(request.quantity * price)
        holding_result = await db.execute(text("""
            SELECT quantity, average_buy_price
            FROM market_holdings
            WHERE team_id = :team_id AND opportunity_id = :opportunity_id
            FOR UPDATE
        """), {"team_id": principal.subject, "opportunity_id": request.opportunity_id})
        holding = holding_result.mappings().one_or_none()
        current_quantity = Decimal(holding["quantity"]) if holding else Decimal("0")
        current_average = Decimal(holding["average_buy_price"]) if holding else Decimal("0")

        if transaction_type == "BUY":
            if team["morph_coins"] < total_amount:
                raise HTTPException(status_code=400, detail="Insufficient Morph Coins")
            new_quantity = current_quantity + request.quantity
            new_average = ((current_quantity * current_average) + Decimal(total_amount)) / new_quantity
            new_balance = team["morph_coins"] - total_amount
        else:
            if current_quantity < request.quantity:
                raise HTTPException(status_code=400, detail="Insufficient market holding")
            new_quantity = current_quantity - request.quantity
            new_average = current_average if new_quantity else Decimal("0")
            new_balance = team["morph_coins"] + total_amount

        await db.execute(text("""
            INSERT INTO market_holdings (team_id, opportunity_id, quantity, average_buy_price)
            VALUES (:team_id, :opportunity_id, :quantity, :average_buy_price)
            ON CONFLICT (team_id, opportunity_id) DO UPDATE
            SET quantity = EXCLUDED.quantity,
                average_buy_price = EXCLUDED.average_buy_price,
                updated_at = now()
        """), {"team_id": principal.subject, "opportunity_id": request.opportunity_id,
               "quantity": new_quantity, "average_buy_price": new_average})
        await db.execute(text("""
            UPDATE teams SET morph_coins = :balance, updated_at = now()
            WHERE id = :team_id
        """), {"balance": new_balance, "team_id": principal.subject})
        transaction_result = await db.execute(text("""
            INSERT INTO market_transactions
              (team_id, opportunity_id, transaction_type, quantity, price_per_unit, total_amount)
            VALUES (:team_id, :opportunity_id, CAST(:transaction_type AS market_transaction_type),
                    :quantity, :price, :total_amount)
            RETURNING id
        """), {"team_id": principal.subject, "opportunity_id": request.opportunity_id,
               "transaction_type": transaction_type, "quantity": request.quantity,
               "price": price, "total_amount": total_amount})
        transaction_id = transaction_result.scalar_one()
        await db.execute(text("""
                        INSERT INTO coin_ledger
              (event_id, team_id, transaction_type, amount, balance_before, balance_after, note)
                        VALUES (:event_id, :team_id, CAST(:coin_transaction_type AS coin_transaction_type), :amount,
                    :before_balance, :after_balance, :note)
        """), {"event_id": event_id, "team_id": principal.subject,
               "amount": -total_amount if transaction_type == "BUY" else total_amount,
                             "coin_transaction_type": "MARKET_BUY" if transaction_type == "BUY" else "MARKET_SELL",
               "before_balance": team["morph_coins"], "after_balance": new_balance,
               "note": f"Market {transaction_type.lower()}"})

    return MarketTradeResponse(
        transaction_id=transaction_id,
        team_id=UUID(principal.subject),
        opportunity_id=request.opportunity_id,
        transaction_type=transaction_type,
        quantity=request.quantity,
        price_per_unit=price,
        total_amount=total_amount,
        balance=new_balance,
    )


@router.post("/trades/buy", response_model=MarketTradeResponse)
async def buy(
    request: MarketTradeRequest,
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> MarketTradeResponse:
    return await trade(request, "BUY", principal, db)


@router.post("/trades/sell", response_model=MarketTradeResponse)
async def sell(
    request: MarketTradeRequest,
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> MarketTradeResponse:
    return await trade(request, "SELL", principal, db)
