Act as a senior Python backend engineer.

Input contracts: (PASTE SYSTEM_OVERVIEW.md, OPENAPI.yaml, DB.sql, ENVIRONMENT.md, RBAC.md from Prompt 1).

Goal: Implement a Flask API that matches the OpenAPI exactly and runs on Render, using Neon Postgres.

Deliverables (code blocks, minimal prose):
1) /backend/app.py
   - create_app(); register blueprints; JSON error handling; CORS (ALLOWED_ORIGIN only)
   - health route; 429 handler with Retry-After
   - read PORT, bind to 0.0.0.0
2) /backend/models.py
   - SQLAlchemy + session mgmt
   - models exactly per DB.sql; alembic starter (env + script)
3) /backend/routes/ingest.py
   - POST /ingest: validate payload; dedupe by source_review_id; persist reviews
4) /backend/routes/analyze.py
   - POST /analyze: run analysis functions on provided text; return sentiment + topics
5) /backend/routes/insights.py
   - GET /insights: date/source filters; pagination; aggregates for charts (sentiment over time, topic distribution, source breakdown)
6) /backend/routes/competitors.py
   - basic CRUD; compare sentiment/topic aggregates vs self
7) /backend/routes/digest.py
   - POST /digest/run: require Authorization: Bearer ${TOKEN_DIGEST_RUN}; build digest JSON; (TODO: email send)
8) /backend/analysis.py
   - analyze_sentiment(text) -> {label, score}; extract_topics(text) -> [{label, confidence}]
   - implement simple placeholder logic with clear TODO hooks for LLM later
9) /backend/scripts/send_digest.py
   - CLI script to compose and (for now) print/save digest JSON using Neon data
10) /backend/security.py
   - bearer token verify for /digest/run
11) requirements.txt
   - Flask, gunicorn, SQLAlchemy, psycopg[binary], pydantic, python-dotenv, alembic, flask-cors
12) Procfile
   - `web: gunicorn app:app --workers=2 --threads=8 --timeout=120`
13) .env.example
   - DATABASE_URL, ALLOWED_ORIGIN, TOKEN_DIGEST_RUN, OPENAI_API_KEY, RESEND_API_KEY (optional)
14) README_BACKEND.md
   - Local run; Alembic migrate; Render deploy steps; Neon connection notes
15) /backend/tests/test_insights.py
   - one happy path + one edge case (empty dataset)

Constraints:
- Strictly follow OpenAPI: request/response shapes, status codes.
- Use UTC timestamps; ensure idempotent ingest by source_review_id.
- Apply CORS only for ALLOWED_ORIGIN (exact match).
- Include simple rate-limit backoff guidance in error JSON for 429.

Output ONLY these files.
