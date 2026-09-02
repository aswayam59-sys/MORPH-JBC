# MORPH Backend

## Hosted PostgreSQL

Set `DATABASE_URL` to the provider's connection URL. For async SQLAlchemy,
use the `postgresql+asyncpg://` form. Keep credentials in deployment secrets.

## Run locally against hosted services

```bash
pip install -r requirements.txt
DATABASE_URL='postgresql+asyncpg://...' uvicorn main:app --reload
```

The API currently exposes `/`, `/api/health`, and `/docs`. Add domain models,
Pydantic schemas, repositories, services, and routers before connecting the
frontend. Alembic migrations must be reviewed and run against the hosted DB.
