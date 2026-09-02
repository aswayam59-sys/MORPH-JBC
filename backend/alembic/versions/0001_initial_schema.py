"""Create the MORPH schema from the repository source of truth.

The canonical complete DDL remains database/init.sql. This revision executes
that exact file when Alembic is run from the repository root, avoiding a second
hand-maintained schema copy. In hosted deployment, run database/init.sql once
or package database/ with the migration command before upgrading.
"""

from pathlib import Path

import sqlparse

from alembic import op

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    schema_path = Path(__file__).resolve().parents[3] / "database" / "init.sql"
    if not schema_path.exists():
        raise RuntimeError("database/init.sql is required for the initial migration")
    for statement in sqlparse.split(schema_path.read_text(encoding="utf-8")):
        op.execute(statement)


def downgrade() -> None:
    raise RuntimeError("The initial MORPH schema is not safely reversible; restore a database backup instead")
