"""Read-only event state routes used after login and on browser refresh."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentPrincipal, get_current_principal
from app.db.session import get_db

router = APIRouter()


async def event_id_for_slug(db: AsyncSession, slug: str):
    result = await db.execute(text("SELECT id FROM events WHERE slug = :slug"), {"slug": slug})
    event = result.scalar_one_or_none()
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.get("/current/state")
async def current_state(
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Return authoritative persisted state required to hydrate the frontend."""
    event_id = await event_id_for_slug(db, principal.event_slug)
    rounds = (await db.execute(text("""
        SELECT id, round_number, code, name, status, info_released, objective,
               instructions, rules, regulations, time_limit, important_notes,
               additional_info, deadline, config
        FROM event_rounds WHERE event_id = :event_id ORDER BY round_number
    """), {"event_id": event_id})).mappings().all()
    teams = (await db.execute(text("""
        SELECT id, team_number, team_name, morph_coins, total_score, current_rank
        FROM teams WHERE event_id = :event_id ORDER BY team_number
    """), {"event_id": event_id})).mappings().all()
    opportunities = (await db.execute(text("""
        SELECT id, name, description, current_price, status, metadata
        FROM market_opportunities WHERE event_id = :event_id ORDER BY name
    """), {"event_id": event_id})).mappings().all()
    return {
        "event_id": str(event_id),
        "rounds": [dict(row) for row in rounds],
        "teams": [dict(row) | {"id": str(row["id"])} for row in teams],
        "market_opportunities": [dict(row) | {"id": str(row["id"])} for row in opportunities],
    }


@router.get("/teams/me")
async def team_me(
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Return the authenticated team without its access-code hash."""
    result = await db.execute(text("""
        SELECT id, team_number, team_name, morph_coins, total_score, current_rank
        FROM teams WHERE id = :team_id
    """), {"team_id": principal.subject})
    team = result.mappings().one_or_none()
    if team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return dict(team) | {"id": str(team["id"])}
