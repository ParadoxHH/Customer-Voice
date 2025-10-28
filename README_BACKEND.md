# Customer Voice Backend

Flask + SQLAlchemy service that powers the Customer Voice Dashboard. Use this guide to set up local development, run migrations, and deploy to Render with Neon Postgres.

## Prerequisites
- Python 3.11+
- PostgreSQL (local instance or Neon connection string)
- Node 18+ for the frontend (separate project)
- `psycopg[binary]` dependencies handled by `pip`

## Setup & Local Development
```bash
python -m venv .venv
. .venv/bin/activate          # use .venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
cp .env.example .env
```

Update `.env` with your Neon `DATABASE_URL`, a local SPA URL (`ALLOWED_ORIGIN=http://localhost:5173`), an `AUTH_TOKEN_SECRET` for signing login tokens, and a `TOKEN_DIGEST_RUN` for protected digests. Optionally add `ADMIN_INVITE_CODE` if admin access should require an invite code.

Run the API:
```bash
flask --app backend.app:create_app run --host 0.0.0.0 --port 5000
```

## Database & Migrations
1. Create a Postgres database (locally or via Neon) and export `DATABASE_URL`.
2. Initialise the schema using Alembic:
   ```bash
   alembic init backend/migrations     # one-time
   ```
   Update `backend/migrations/env.py` to import `backend.models.get_metadata`.
3. Generate migrations when the schema changes:
   ```bash
   alembic revision --autogenerate -m "describe change"
   alembic upgrade head
   ```
4. Seed with sample data:
   ```bash
   psql "$DATABASE_URL" -f DB.sql
   python -m backend.scripts.send_digest --pretty  # sanity check aggregation
   ```

## Testing
```bash
pytest backend/tests
```
Use the provided factory methods to build fixtures; tests rely on SQLite, so Postgres-only features (ARRAY/JSONB) are handled via SQLAlchemy variants.

## Deployment (Render + Neon)
1. Push to `main` or merge a PR. Render automatically rebuilds using `Procfile`.
2. Render env vars:
   - `DATABASE_URL` (Neon connection string)
   - `ALLOWED_ORIGIN` (Cloudflare Pages URL)
   - `AUTH_TOKEN_SECRET` (32+ character string for issuing auth tokens)
   - `TOKEN_DIGEST_RUN` (must match GitHub Actions secret)
   - Optional: `ADMIN_INVITE_CODE`, `AUTH_TOKEN_TTL_SECONDS`, `AUTH_PASSWORD_MIN_LENGTH`, `OPENAI_API_KEY`, `RESEND_API_KEY`
3. Neon: create a branch/database per environment; enable pooling for serverless usage.
4. GitHub Actions:
   - `RENDER_API_URL` — `https://<service>.onrender.com`
   - `DIGEST_TOKEN` — same as `TOKEN_DIGEST_RUN`
5. After deployment, hit `/health` to confirm the service is live.

## Running Scheduled Digest Manually
Locally or inside CI:
```bash
python -m backend.scripts.send_digest --pretty \
  --start 2025-03-01T00:00:00Z \
  --end 2025-03-07T00:00:00Z
```
The output mirrors the `/digest/run` response and is stored in the `digests` table during API execution.
