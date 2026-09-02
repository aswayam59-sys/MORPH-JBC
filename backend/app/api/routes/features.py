"""Core event feature routes.

These routes use the existing PostgreSQL schema as the source of truth. Each
mutation validates ownership/permissions and commits related rows together.
Split this module into domain files as the API grows; the route contracts are
kept grouped here so the initial backend remains easy to operate.
"""

from decimal import Decimal
import random
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from pwdlib import PasswordHash

from app.api.deps import CurrentPrincipal, get_current_principal, require_admin
from app.api.routes.events import event_id_for_slug
from app.db.session import get_db

router = APIRouter()
password_hash = PasswordHash.recommended()


class StatusRequest(BaseModel):
    status: str = Field(pattern="^(LOCKED|RELEASED|ACTIVE|COMPLETED)$")


class ProductSelectionRequest(BaseModel):
    product_id: UUID


class PurchaseRequest(BaseModel):
    card_id: UUID
    quantity: int = Field(default=1, ge=1)


class CelebrityPurchaseRequest(BaseModel):
    celebrity_id: UUID


class ConflictAnswerRequest(BaseModel):
    answer: str = Field(min_length=1, max_length=500)


class ScoreRequest(BaseModel):
    criterion_id: UUID
    score: Decimal = Field(ge=0)
    notes: str | None = None


class AuctionResultRequest(BaseModel):
    brand_id: UUID
    winning_bid: int = Field(gt=0)


class BidRequest(BaseModel):
    brand_id: UUID
    amount: int = Field(gt=0)


class RiddleAnswerRequest(BaseModel):
    answer: str = Field(min_length=1, max_length=500)


class CelebritySpinRequest(BaseModel):
    team_id: UUID


class ConflictResolveRequest(BaseModel):
    team_id: UUID


class CardUseRequest(BaseModel):
    card_id: UUID
    target_team_id: UUID | None = None


class ScoreConfirmRequest(BaseModel):
    reward_coins: int = Field(default=0, ge=0)


async def ensure_admin_event(db: AsyncSession, principal: CurrentPrincipal):
    return await event_id_for_slug(db, principal.event_slug)


@router.get("/auction")
async def get_auction(
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Return the auction control state and brands for the current event."""
    event_id = await event_id_for_slug(db, principal.event_slug)
    auction = (await db.execute(text("""
        SELECT a.id, a.status, a.active_brand_id, a.started_at, a.completed_at
        FROM auctions a WHERE a.event_id = :event_id LIMIT 1
    """), {"event_id": event_id})).mappings().one_or_none()
    brands = (await db.execute(text("""
        SELECT id, lot_number, name, sector, logo_url, base_price, short_description, brand_details, status
        FROM brands WHERE event_id = :event_id ORDER BY lot_number
    """), {"event_id": event_id})).mappings().all()
    return {"auction": dict(auction) if auction else None, "brands": [dict(row) for row in brands]}


@router.post("/auction/bids")
async def place_bid(
    request: BidRequest,
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Record a bid after locking the auction and validating its active state."""
    if principal.role != "TEAM":
        raise HTTPException(status_code=403, detail="Team access required")
    event_id = await event_id_for_slug(db, principal.event_slug)
    await db.rollback()
    async with db.begin():
        auction = (await db.execute(text("SELECT id FROM auctions WHERE event_id = :event_id AND status = 'ACTIVE' FOR UPDATE"), {"event_id": event_id})).mappings().one_or_none()
        brand = (await db.execute(text("SELECT id, base_price FROM brands WHERE id = :id AND event_id = :event_id AND status IN ('AVAILABLE','LIVE') FOR UPDATE"), {"id": request.brand_id, "event_id": event_id})).mappings().one_or_none()
        if not auction or not brand:
            raise HTTPException(status_code=409, detail="Auction or brand is not active")
        highest = await db.execute(text("SELECT COALESCE(MAX(amount), 0) FROM auction_bids WHERE auction_id = :auction_id AND brand_id = :brand_id"), {"auction_id": auction["id"], "brand_id": request.brand_id})
        minimum = max(brand["base_price"], int(highest.scalar_one()) + 1)
        if request.amount < minimum:
            raise HTTPException(status_code=400, detail=f"Bid must be at least {minimum}")
        await db.execute(text("INSERT INTO auction_bids (auction_id, brand_id, team_id, amount) VALUES (:auction_id, :brand_id, :team_id, :amount)"), {"auction_id": auction["id"], "brand_id": request.brand_id, "team_id": principal.subject, "amount": request.amount})
    return {"brand_id": str(request.brand_id), "amount": request.amount}


@router.get("/rounds")
async def get_rounds(
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    event_id = await event_id_for_slug(db, principal.event_slug)
    rows = (await db.execute(text("SELECT * FROM event_rounds WHERE event_id = :event_id ORDER BY round_number"), {"event_id": event_id})).mappings().all()
    return [dict(row) for row in rows]


@router.patch("/rounds/{round_id}/status")
async def update_round_status(
    round_id: UUID,
    request: StatusRequest,
    principal: CurrentPrincipal = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    event_id = await ensure_admin_event(db, principal)
    result = await db.execute(text("""
        UPDATE event_rounds SET status = CAST(:status AS round_status),
          info_released = (:status <> 'LOCKED')
        WHERE id = :round_id AND event_id = :event_id RETURNING status
    """), {"status": request.status, "round_id": round_id, "event_id": event_id})
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Round not found")
    await db.commit()
    return {"status": request.status}


@router.post("/auction/result")
async def auction_result(
    request: AuctionResultRequest,
    principal: CurrentPrincipal = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Confirm an auction result with locked team/brand rows and coin ledger."""
    event_id = await ensure_admin_event(db, principal)
    await db.rollback()
    async with db.begin():
        brand = (await db.execute(text("SELECT id, base_price FROM brands WHERE id = :id AND event_id = :event_id FOR UPDATE"), {"id": request.brand_id, "event_id": event_id})).mappings().one_or_none()
        if not brand:
            raise HTTPException(status_code=404, detail="Brand not found")
        bid = (await db.execute(text("""
            SELECT team_id FROM auction_bids WHERE brand_id = :brand_id AND amount = :amount
            ORDER BY created_at DESC LIMIT 1
        """), {"brand_id": request.brand_id, "amount": request.winning_bid})).mappings().one_or_none()
        if not bid:
            raise HTTPException(status_code=404, detail="Winning bid not found")
        team = (await db.execute(text("SELECT id, morph_coins FROM teams WHERE id = :id FOR UPDATE"), {"id": bid["team_id"]})).mappings().one_or_none()
        if not team or team["morph_coins"] < request.winning_bid:
            raise HTTPException(status_code=400, detail="Insufficient Morph Coins")
        balance = team["morph_coins"] - request.winning_bid
        await db.execute(text("INSERT INTO brand_assignments (brand_id, team_id, winning_bid) VALUES (:brand_id, :team_id, :bid)"), {"brand_id": request.brand_id, "team_id": team["id"], "bid": request.winning_bid})
        await db.execute(text("UPDATE brands SET status = 'SOLD' WHERE id = :id"), {"id": request.brand_id})
        await db.execute(text("UPDATE teams SET morph_coins = :balance WHERE id = :id"), {"balance": balance, "id": team["id"]})
        await db.execute(text("INSERT INTO coin_ledger (event_id, team_id, transaction_type, amount, balance_before, balance_after, note) VALUES (:event_id, :team_id, 'AUCTION_PURCHASE', :amount, :before_balance, :after_balance, 'Auction purchase')"), {"event_id": event_id, "team_id": team["id"], "amount": -request.winning_bid, "before_balance": team["morph_coins"], "after_balance": balance})
    return {"brand_id": str(request.brand_id), "team_id": str(team["id"]), "balance": balance}


@router.patch("/auction/status")
async def update_auction_status(
    request: StatusRequest,
    principal: CurrentPrincipal = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    """Update auction status; only admins may control the round."""
    if request.status == "RELEASED":
        raise HTTPException(status_code=400, detail="Auction status cannot be RELEASED")
    event_id = await ensure_admin_event(db, principal)
    result = await db.execute(text("""
        UPDATE auctions SET status = CAST(:status AS auction_status)
        WHERE event_id = :event_id RETURNING status
    """), {"status": request.status, "event_id": event_id})
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Auction not found")
    await db.commit()
    return {"status": request.status}


@router.get("/products")
async def get_products(
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    event_id = await event_id_for_slug(db, principal.event_slug)
    rows = (await db.execute(text("""
        SELECT id, name, category, image_url, short_description, status, taken_by_team_id, taken_at
        FROM products WHERE event_id = :event_id ORDER BY name
    """), {"event_id": event_id})).mappings().all()
    return [dict(row) for row in rows]


@router.get("/products/riddle")
async def get_riddle(
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    event_id = await event_id_for_slug(db, principal.event_slug)
    row = (await db.execute(text("""
        SELECT rp.id, rp.puzzle_type, rp.puzzle_text, rp.image_url, rp.round_id
        FROM round_puzzles rp JOIN event_rounds er ON er.id = rp.round_id
        WHERE er.event_id = :event_id ORDER BY er.round_number LIMIT 1
    """), {"event_id": event_id})).mappings().one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Riddle not configured")
    return dict(row) | {"id": str(row["id"]), "round_id": str(row["round_id"])}


@router.post("/products/riddle/answer")
async def answer_riddle(
    request: RiddleAnswerRequest,
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    if principal.role != "TEAM":
        raise HTTPException(status_code=403, detail="Team access required")
    event_id = await event_id_for_slug(db, principal.event_slug)
    row = (await db.execute(text("""
        SELECT rp.id, rp.correct_answer_hash FROM round_puzzles rp
        JOIN event_rounds er ON er.id = rp.round_id WHERE er.event_id = :event_id
        ORDER BY er.round_number LIMIT 1
    """), {"event_id": event_id})).mappings().one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Riddle not configured")
    correct = password_hash.verify(request.answer, row["correct_answer_hash"])
    await db.execute(text("INSERT INTO puzzle_attempts (puzzle_id, team_id, answer, is_correct) VALUES (:puzzle_id, :team_id, :answer, :correct)"), {"puzzle_id": row["id"], "team_id": principal.subject, "answer": request.answer, "correct": correct})
    await db.commit()
    return {"correct": correct}


@router.post("/products/select")
async def select_product(
    request: ProductSelectionRequest,
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Claim a product atomically; the product row is locked before insert."""
    if principal.role != "TEAM":
        raise HTTPException(status_code=403, detail="Team access required")
    event_id = await event_id_for_slug(db, principal.event_slug)
    await db.rollback()
    async with db.begin():
        product = (await db.execute(text("""
            SELECT id, status FROM products
            WHERE id = :product_id AND event_id = :event_id FOR UPDATE
        """), {"product_id": request.product_id, "event_id": event_id})).mappings().one_or_none()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if product["status"] == "TAKEN":
            raise HTTPException(status_code=409, detail="Product already selected")
        try:
            await db.execute(text("""
                INSERT INTO product_selections (product_id, team_id)
                VALUES (:product_id, :team_id)
            """), {"product_id": request.product_id, "team_id": principal.subject})
        except Exception as exc:
            raise HTTPException(status_code=409, detail="Product selection conflict") from exc
    return {"product_id": str(request.product_id), "team_id": principal.subject, "status": "TAKEN"}


@router.get("/cards")
async def get_cards(
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    event_id = await event_id_for_slug(db, principal.event_slug)
    rows = (await db.execute(text("""
        SELECT id, name, price, power, description, max_available, purchased_count, is_active
        FROM cards WHERE event_id = :event_id ORDER BY name
    """), {"event_id": event_id})).mappings().all()
    return [dict(row) for row in rows]


@router.post("/cards/purchase")
async def purchase_card(
    request: PurchaseRequest,
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Purchase cards with locked team/card rows and an atomic coin ledger entry."""
    if principal.role != "TEAM":
        raise HTTPException(status_code=403, detail="Team access required")
    event_id = await event_id_for_slug(db, principal.event_slug)
    await db.rollback()
    async with db.begin():
        team = (await db.execute(text("SELECT id, morph_coins FROM teams WHERE id = :id FOR UPDATE"), {"id": principal.subject})).mappings().one_or_none()
        card = (await db.execute(text("SELECT id, price, max_available, purchased_count FROM cards WHERE id = :id AND event_id = :event_id FOR UPDATE"), {"id": request.card_id, "event_id": event_id})).mappings().one_or_none()
        if not team or not card:
            raise HTTPException(status_code=404, detail="Team or card not found")
        if card["max_available"] is not None and card["purchased_count"] + request.quantity > card["max_available"]:
            raise HTTPException(status_code=409, detail="Card availability exceeded")
        total = card["price"] * request.quantity
        if team["morph_coins"] < total:
            raise HTTPException(status_code=400, detail="Insufficient Morph Coins")
        balance = team["morph_coins"] - total
        await db.execute(text("UPDATE teams SET morph_coins = :balance WHERE id = :id"), {"balance": balance, "id": principal.subject})
        await db.execute(text("UPDATE cards SET purchased_count = purchased_count + :quantity WHERE id = :id"), {"quantity": request.quantity, "id": request.card_id})
        await db.execute(text("""
            INSERT INTO team_cards (team_id, card_id, quantity)
            VALUES (:team_id, :card_id, :quantity)
            ON CONFLICT (team_id, card_id) DO UPDATE SET quantity = team_cards.quantity + EXCLUDED.quantity
        """), {"team_id": principal.subject, "card_id": request.card_id, "quantity": request.quantity})
        await db.execute(text("""
            INSERT INTO card_transactions (card_id, team_id, price, quantity)
            VALUES (:card_id, :team_id, :price, :quantity)
        """), {"card_id": request.card_id, "team_id": principal.subject, "price": card["price"], "quantity": request.quantity})
        await db.execute(text("""
            INSERT INTO coin_ledger (event_id, team_id, transaction_type, amount, balance_before, balance_after, note)
            VALUES (:event_id, :team_id, 'CARD_PURCHASE', :amount, :before_balance, :after_balance, 'Card purchase')
        """), {"event_id": event_id, "team_id": principal.subject, "amount": -total, "before_balance": team["morph_coins"], "after_balance": balance})
    return {"card_id": str(request.card_id), "quantity": request.quantity, "balance": balance}


@router.post("/cards/use")
async def use_card(
    request: CardUseRequest,
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Consume one owned card; specific powers remain represented by metadata/UI."""
    if principal.role != "TEAM":
        raise HTTPException(status_code=403, detail="Team access required")
    result = await db.execute(text("""
        UPDATE team_cards SET used_quantity = used_quantity + 1
        WHERE team_id = :team_id AND card_id = :card_id AND used_quantity < quantity
        RETURNING team_id, card_id, used_quantity
    """), {"team_id": principal.subject, "card_id": request.card_id})
    row = result.mappings().one_or_none()
    if not row:
        raise HTTPException(status_code=409, detail="No unused card available")
    await db.commit()
    return {"card_id": str(row["card_id"]), "used_quantity": row["used_quantity"], "target_team_id": str(request.target_team_id) if request.target_team_id else None}


@router.get("/celebrities")
async def get_celebrities(
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    event_id = await event_id_for_slug(db, principal.event_slug)
    rows = (await db.execute(text("""
        SELECT id, celebrity_number, name, domain, image_url, price, description,
               public_notes, assigned_team_id, purchased_price, is_identity_revealed, revealed_at
        FROM celebrities WHERE event_id = :event_id ORDER BY celebrity_number
    """), {"event_id": event_id})).mappings().all()
    return [dict(row) for row in rows]


@router.post("/celebrities/purchase")
async def purchase_celebrity(
    request: CelebrityPurchaseRequest,
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Assign one celebrity to one team and debit coins atomically."""
    if principal.role != "TEAM":
        raise HTTPException(status_code=403, detail="Team access required")
    event_id = await event_id_for_slug(db, principal.event_slug)
    await db.rollback()
    async with db.begin():
        team = (await db.execute(text("SELECT id, morph_coins FROM teams WHERE id = :id FOR UPDATE"), {"id": principal.subject})).mappings().one_or_none()
        celebrity = (await db.execute(text("SELECT id, price, assigned_team_id FROM celebrities WHERE id = :id AND event_id = :event_id FOR UPDATE"), {"id": request.celebrity_id, "event_id": event_id})).mappings().one_or_none()
        if not team or not celebrity:
            raise HTTPException(status_code=404, detail="Team or celebrity not found")
        if celebrity["assigned_team_id"] is not None:
            raise HTTPException(status_code=409, detail="Celebrity already assigned")
        if team["morph_coins"] < celebrity["price"]:
            raise HTTPException(status_code=400, detail="Insufficient Morph Coins")
        balance = team["morph_coins"] - celebrity["price"]
        await db.execute(text("UPDATE celebrities SET assigned_team_id = :team_id, purchased_price = :price WHERE id = :id"), {"team_id": principal.subject, "price": celebrity["price"], "id": request.celebrity_id})
        await db.execute(text("UPDATE teams SET morph_coins = :balance WHERE id = :id"), {"balance": balance, "id": principal.subject})
        await db.execute(text("""
            INSERT INTO coin_ledger (event_id, team_id, transaction_type, amount, balance_before, balance_after, note)
            VALUES (:event_id, :team_id, 'CELEBRITY_PURCHASE', :amount, :before_balance, :after_balance, 'Celebrity purchase')
        """), {"event_id": event_id, "team_id": principal.subject, "amount": -celebrity["price"], "before_balance": team["morph_coins"], "after_balance": balance})
    return {"celebrity_id": str(request.celebrity_id), "balance": balance}


@router.post("/celebrities/spin")
async def spin_celebrity(
    request: CelebritySpinRequest,
    principal: CurrentPrincipal = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Select a team and an available celebrity atomically."""
    event_id = await ensure_admin_event(db, principal)
    await db.rollback()
    async with db.begin():
        celebrity = (await db.execute(text("SELECT id, celebrity_number FROM celebrities WHERE event_id = :event_id AND assigned_team_id IS NULL ORDER BY celebrity_number LIMIT 1 FOR UPDATE"), {"event_id": event_id})).mappings().one_or_none()
        if not celebrity:
            raise HTTPException(status_code=409, detail="No celebrities available")
        count = await db.execute(text("SELECT COUNT(*) FROM celebrity_spins WHERE event_id = :event_id"), {"event_id": event_id})
        spin_number = int(count.scalar_one()) + 1
        await db.execute(text("INSERT INTO celebrity_spins (event_id, selected_team_id, selected_celebrity_id, spin_number, spun_by) VALUES (:event_id, :team_id, :celebrity_id, :spin_number, :spun_by)"), {"event_id": event_id, "team_id": request.team_id, "celebrity_id": celebrity["id"], "spin_number": spin_number, "spun_by": principal.subject})
    return {"team_id": str(request.team_id), "celebrity_id": str(celebrity["id"]), "spin_number": spin_number}


@router.post("/celebrities/{celebrity_id}/reveal")
async def reveal_celebrity(
    celebrity_id: UUID,
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    if principal.role != "TEAM":
        raise HTTPException(status_code=403, detail="Team access required")
    result = await db.execute(text("UPDATE celebrities SET is_identity_revealed = true, revealed_at = now() WHERE id = :id AND assigned_team_id = :team_id RETURNING id, name"), {"id": celebrity_id, "team_id": principal.subject})
    row = result.mappings().one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Celebrity assignment not found")
    await db.commit()
    return {"celebrity_id": str(row["id"]), "name": row["name"], "revealed": True}


@router.get("/conflicts")
async def get_conflicts(
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    rows = (await db.execute(text("""
        SELECT c.id, c.brand_id, c.status, c.puzzle_text, c.puzzle_image_url,
               c.winner_team_id, c.created_at, c.resolved_at
        FROM brand_conflicts c JOIN brands b ON b.id = c.brand_id
        WHERE b.event_id = (SELECT id FROM events WHERE slug = :slug)
        ORDER BY c.created_at DESC
    """), {"slug": principal.event_slug})).mappings().all()
    return [dict(row) for row in rows]


@router.post("/conflicts/{conflict_id}/answer")
async def answer_conflict(
    conflict_id: UUID,
    request: ConflictAnswerRequest,
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Record a conflict answer without exposing the stored answer hash."""
    if principal.role != "TEAM":
        raise HTTPException(status_code=403, detail="Team access required")
    result = await db.execute(text("""
        SELECT c.id, c.correct_answer_hash
        FROM brand_conflicts c JOIN brands b ON b.id = c.brand_id
        WHERE c.id = :id AND b.event_id = (SELECT id FROM events WHERE slug = :slug)
    """), {"id": conflict_id, "slug": principal.event_slug})
    conflict = result.mappings().one_or_none()
    if not conflict:
        raise HTTPException(status_code=404, detail="Conflict not found")
    correct = password_hash.verify(request.answer, conflict["correct_answer_hash"])
    await db.execute(text("""
        INSERT INTO conflict_attempts (conflict_id, team_id, answer, is_correct)
        VALUES (:conflict_id, :team_id, :answer, :is_correct)
    """), {"conflict_id": conflict_id, "team_id": principal.subject, "answer": request.answer, "is_correct": correct})
    await db.commit()
    return {"conflict_id": str(conflict_id), "correct": correct}


@router.post("/conflicts/{conflict_id}/resolve")
async def resolve_conflict(
    conflict_id: UUID,
    request: ConflictResolveRequest,
    principal: CurrentPrincipal = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    event_id = await ensure_admin_event(db, principal)
    result = await db.execute(text("""
        UPDATE brand_conflicts c SET status = 'RESOLVED', winner_team_id = :team_id, resolved_at = now()
        FROM brands b WHERE c.id = :conflict_id AND c.brand_id = b.id AND b.event_id = :event_id
        RETURNING c.id
    """), {"conflict_id": conflict_id, "team_id": request.team_id, "event_id": event_id})
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Conflict not found")
    await db.commit()
    return {"conflict_id": str(conflict_id), "status": "RESOLVED"}


@router.get("/scoring/leaderboard")
async def leaderboard(
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    """Return the authoritative leaderboard from PostgreSQL cached totals."""
    event_id = await event_id_for_slug(db, principal.event_slug)
    rows = (await db.execute(text("""
        SELECT id, team_number, team_name, morph_coins, total_score, current_rank
        FROM teams WHERE event_id = :event_id ORDER BY total_score DESC, morph_coins DESC, team_number
    """), {"event_id": event_id})).mappings().all()
    return [dict(row) for row in rows]


@router.put("/scoring/{round_id}/{team_id}")
async def set_score(
    round_id: UUID,
    team_id: UUID,
    request: ScoreRequest,
    principal: CurrentPrincipal = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    event_id = await ensure_admin_event(db, principal)
    await db.rollback()
    async with db.begin():
        valid = await db.execute(text("SELECT 1 FROM judging_criteria jc JOIN event_rounds er ON er.id = jc.round_id WHERE jc.id = :criterion_id AND er.id = :round_id AND er.event_id = :event_id"), {"criterion_id": request.criterion_id, "round_id": round_id, "event_id": event_id})
        if valid.scalar_one_or_none() is None:
            raise HTTPException(status_code=404, detail="Criterion or round not found")
        score = (await db.execute(text("""
            INSERT INTO team_scores (round_id, team_id) VALUES (:round_id, :team_id)
            ON CONFLICT (round_id, team_id) DO UPDATE SET team_id = EXCLUDED.team_id
            RETURNING id
        """), {"round_id": round_id, "team_id": team_id})).scalar_one()
        await db.execute(text("""
            INSERT INTO criterion_scores (team_score_id, criterion_id, score, notes)
            VALUES (:team_score_id, :criterion_id, :score, :notes)
            ON CONFLICT (team_score_id, criterion_id) DO UPDATE SET score = EXCLUDED.score, notes = EXCLUDED.notes
        """), {"team_score_id": score, "criterion_id": request.criterion_id, "score": request.score, "notes": request.notes})
    return {"round_id": str(round_id), "team_id": str(team_id), "score": str(request.score)}


@router.post("/scoring/{round_id}/{team_id}/confirm")
async def confirm_score(
    round_id: UUID,
    team_id: UUID,
    request: ScoreConfirmRequest,
    principal: CurrentPrincipal = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Confirm a score and optionally award coins atomically."""
    event_id = await ensure_admin_event(db, principal)
    await db.rollback()
    async with db.begin():
        team = (await db.execute(text("SELECT morph_coins FROM teams WHERE id = :team_id AND event_id = :event_id FOR UPDATE"), {"team_id": team_id, "event_id": event_id})).mappings().one_or_none()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        score = await db.execute(text("UPDATE team_scores SET is_confirmed = true, confirmed_by = :user_id, confirmed_at = now() WHERE round_id = :round_id AND team_id = :team_id RETURNING total_score"), {"round_id": round_id, "team_id": team_id, "user_id": principal.subject})
        if score.scalar_one_or_none() is None:
            raise HTTPException(status_code=404, detail="Score not found")
        balance = team["morph_coins"] + request.reward_coins
        await db.execute(text("UPDATE teams SET morph_coins = :balance WHERE id = :team_id"), {"balance": balance, "team_id": team_id})
        if request.reward_coins:
            await db.execute(text("INSERT INTO coin_ledger (event_id, team_id, transaction_type, amount, balance_before, balance_after, note) VALUES (:event_id, :team_id, 'SCORE_REWARD', :amount, :before_balance, :after_balance, 'Score reward')"), {"event_id": event_id, "team_id": team_id, "amount": request.reward_coins, "before_balance": team["morph_coins"], "after_balance": balance})
    return {"round_id": str(round_id), "team_id": str(team_id), "balance": balance, "confirmed": True}


@router.get("/notifications")
async def notifications(
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    event_id = await event_id_for_slug(db, principal.event_slug)
    rows = (await db.execute(text("""
        SELECT id, notification_type, title, message, team_id, target_team_id, metadata, created_at
        FROM notifications WHERE event_id = :event_id
          AND (team_id IS NULL OR team_id = :team_id OR target_team_id = :team_id)
        ORDER BY created_at DESC LIMIT 200
    """), {"event_id": event_id, "team_id": principal.subject if principal.role == "TEAM" else None})).mappings().all()
    return [dict(row) for row in rows]


@router.post("/admin/reset-active-gameplay")
async def reset_active_gameplay(
    principal: CurrentPrincipal = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    """Reset temporary gameplay records while retaining saved event content."""
    event_id = await ensure_admin_event(db, principal)
    await db.rollback()
    async with db.begin():
        await db.execute(text("DELETE FROM puzzle_attempts WHERE puzzle_id IN (SELECT id FROM round_puzzles WHERE round_id IN (SELECT id FROM event_rounds WHERE event_id = :event_id))"), {"event_id": event_id})
        await db.execute(text("DELETE FROM conflict_attempts WHERE conflict_id IN (SELECT id FROM brand_conflicts WHERE brand_id IN (SELECT id FROM brands WHERE event_id = :event_id))"), {"event_id": event_id})
        await db.execute(text("DELETE FROM market_transactions WHERE team_id IN (SELECT id FROM teams WHERE event_id = :event_id)"), {"event_id": event_id})
        await db.execute(text("DELETE FROM market_holdings WHERE team_id IN (SELECT id FROM teams WHERE event_id = :event_id)"), {"event_id": event_id})
        await db.execute(text("UPDATE teams SET morph_coins = 10000, total_score = 0, current_rank = NULL WHERE event_id = :event_id"), {"event_id": event_id})
    return {"status": "reset", "scope": "active_gameplay"}
