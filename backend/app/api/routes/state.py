"""Versioned authoritative state and SSE synchronization for the MVP."""

import asyncio
import json
from collections.abc import AsyncIterator
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentPrincipal, get_current_principal, require_admin
from app.api.routes.events import event_id_for_slug
from app.db.session import get_db

router = APIRouter()


class StateUpdate(BaseModel):
    state: dict[str, Any]
    expected_version: int


@router.get("/state")
async def get_state(
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    event_id = await event_id_for_slug(db, principal.event_slug)
    result = await db.execute(text("SELECT version, state FROM event_state WHERE event_id = :event_id"), {"event_id": event_id})
    row = result.mappings().one_or_none()
    return {"version": row["version"] if row else 0, "state": row["state"] if row else {}}


@router.put("/state")
async def put_state(
    update: StateUpdate,
    principal: CurrentPrincipal = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    event_id = await event_id_for_slug(db, principal.event_slug)
    await db.rollback()
    async with db.begin():
        row = (await db.execute(text("SELECT version FROM event_state WHERE event_id = :event_id FOR UPDATE"), {"event_id": event_id})).mappings().one_or_none()
        current_version = row["version"] if row else 0
        if current_version != update.expected_version:
            raise HTTPException(status_code=409, detail={"message": "Stale state", "version": current_version})
        new_version = current_version + 1
        await db.execute(text("""
            INSERT INTO event_state (event_id, version, state)
            VALUES (:event_id, :version, CAST(:state AS jsonb))
            ON CONFLICT (event_id) DO UPDATE SET version = EXCLUDED.version, state = EXCLUDED.state, updated_at = now()
        """), {"event_id": event_id, "version": new_version, "state": json.dumps(update.state)})
        await db.execute(text("""
            INSERT INTO event_state_versions (event_id, version)
            VALUES (:event_id, :version)
            ON CONFLICT (event_id) DO UPDATE SET version = EXCLUDED.version, updated_at = now()
        """), {"event_id": event_id, "version": new_version})
    return {"version": new_version, "state": update.state}


@router.get("/events")
async def state_events(
    request: Request,
    principal: CurrentPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """Simple polling SSE stream; clients receive the latest version periodically."""
    async def stream() -> AsyncIterator[str]:
        last_version = -1
        while not await request.is_disconnected():
            event_id = await event_id_for_slug(db, principal.event_slug)
            row = (await db.execute(text("SELECT version, state FROM event_state WHERE event_id = :event_id"), {"event_id": event_id})).mappings().one_or_none()
            version = row["version"] if row else 0
            if version != last_version:
                yield f"data: {json.dumps({'version': version, 'state': row['state'] if row else {}})}\n\n"
                last_version = version
            await asyncio.sleep(2)
    return StreamingResponse(stream(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
