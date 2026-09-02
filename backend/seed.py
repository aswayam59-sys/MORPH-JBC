"""Seed the MORPH event with secure, database-backed accounts.

Run this after database/init.sql or Alembic has created the schema.
Access codes are stored only as Argon2 hashes — never as plaintext.

Idempotent: safe to run repeatedly; existing rows are updated in-place
via ON CONFLICT upserts and no duplicates are ever created.

Team access-code mapping
------------------------
Team  1  → ARBITRAGE
Team  2  → LEVERAGE
Team  3  → HOSTILE
Team  4  → TAKEOVER
Team  5  → INSIDER
Team  6  → MONOPOLY
Team  7  → CARTEL
Team  8  → ACQUISITION
Team  9  → LIQUIDATE
Team 10  → UNDERCUT
Team 11  → SHORTSELL
Team 12  → BLACKBOOK
Team 13  → OFFBOOK
Team 14  → STAKEHOLD
Team 15  → RAIDER

Admin    → MORPHCODE2026
"""

import asyncio
import os

from pwdlib import PasswordHash
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# ---------------------------------------------------------------------------
# Access-code registry
# Plain codes only appear here during the seeding process and are never stored.
# ---------------------------------------------------------------------------

TEAM_ACCESS_CODES: dict[int, str] = {
    1:  "ARBITRAGE",
    2:  "LEVERAGE",
    3:  "HOSTILE",
    4:  "TAKEOVER",
    5:  "INSIDER",
    6:  "MONOPOLY",
    7:  "CARTEL",
    8:  "ACQUISITION",
    9:  "LIQUIDATE",
    10: "UNDERCUT",
    11: "SHORTSELL",
    12: "BLACKBOOK",
    13: "OFFBOOK",
    14: "STAKEHOLD",
    15: "RAIDER",
}

# The admin password may also be supplied via the ADMIN_PASSWORD environment
# variable to allow CI/CD overrides without touching source code.
_DEFAULT_ADMIN_PASSWORD = "MORPHCODE2026"


async def main() -> None:
    database_url = os.environ["DATABASE_URL"]
    event_slug = os.getenv("EVENT_SLUG", "morph-event")
    admin_email = os.getenv("ADMIN_EMAIL", "admin@morph.local")
    admin_password = os.getenv("ADMIN_PASSWORD", _DEFAULT_ADMIN_PASSWORD)

    hasher = PasswordHash.recommended()
    engine = create_async_engine(database_url, pool_pre_ping=True)

    async with engine.begin() as db:
        # ------------------------------------------------------------------
        # 1. Ensure the event row exists (idempotent upsert on slug).
        # ------------------------------------------------------------------
        event_id = (await db.execute(text("""
            INSERT INTO events (name, slug, status)
            VALUES ('MORPH Event', :slug, 'ACTIVE')
            ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
        """), {"slug": event_slug})).scalar_one()

        # ------------------------------------------------------------------
        # 2. Seed the admin account (idempotent upsert on event_id + email).
        # ------------------------------------------------------------------
        await db.execute(text("""
            INSERT INTO users (event_id, email, password_hash, role)
            VALUES (:event_id, :email, :password_hash, 'ADMIN')
            ON CONFLICT (event_id, email) DO UPDATE
            SET password_hash = EXCLUDED.password_hash, is_active = true
        """), {
            "event_id": event_id,
            "email": admin_email,
            "password_hash": hasher.hash(admin_password),
        })

        # ------------------------------------------------------------------
        # 3. Seed all 15 teams with their assigned access-code hashes.
        #    Idempotent upsert on (event_id, team_number).
        # ------------------------------------------------------------------
        for number, code in TEAM_ACCESS_CODES.items():
            await db.execute(text("""
                INSERT INTO teams (event_id, team_number, team_name, access_code_hash)
                VALUES (:event_id, :number, :name, :access_code_hash)
                ON CONFLICT (event_id, team_number) DO UPDATE
                SET access_code_hash = EXCLUDED.access_code_hash
            """), {
                "event_id": event_id,
                "number": number,
                "name": f"Team {number:02d}",
                "access_code_hash": hasher.hash(code),
            })

    await engine.dispose()

    # ------------------------------------------------------------------
    # Print the final mapping for operator verification.
    # ------------------------------------------------------------------
    print(f"\nSeeded event '{event_slug}' successfully.\n")
    print("-" * 32)
    for number, code in TEAM_ACCESS_CODES.items():
        print(f"Team {number:>2}  ->  {code}")
    print(f"Admin    ->  MORPHCODE2026")
    print("-" * 32)
    print("\nAll access codes stored as Argon2 hashes. Plaintext never persisted.")


if __name__ == "__main__":
    asyncio.run(main())
