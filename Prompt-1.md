Act as a senior product+platform architect.

Goal: Produce a SINGLE SOURCE OF TRUTH for the “Customer Voice Dashboard” hosted on:
- Frontend: React SPA on Cloudflare Pages
- Backend: Python Flask API on Render
- Database: Neon Postgres
- Jobs: GitHub Actions (cron) calling a protected API endpoint or Python script

Deliverables (as code blocks, no extra prose):
1) SYSTEM_OVERVIEW.md — concise feature list + ASCII data flow diagram.
2) OPENAPI.yaml — full API spec for:
   - /ingest (batch add reviews)
   - /analyze (ad-hoc analyze)
   - /insights (charts/aggregates with pagination, date/source filters)
   - /competitors (CRUD basics + comparisons)
   - /digest/run (protected endpoint to generate digest)
3) DB.sql — Postgres schema:
   - tables: users, sources, reviews, topics, review_topics, competitors, digests
   - columns: include source_review_id, sentiment_label, sentiment_score [-1..1], topic_label, topic_confidence, created_at (UTC), updated_at
   - indexes: by source, created_at, sentiment_label, (review_id, topic_label)
   - FKs + ON DELETE rules
4) TYPES.ts — TypeScript types mirroring OpenAPI/DB for the frontend.
5) ENVIRONMENT.md — env vars for Render, Neon, Cloudflare Pages, GitHub Actions:
   - DATABASE_URL, OPENAI_API_KEY, RESEND_API_KEY (or SMTP_*), TOKEN_DIGEST_RUN, ALLOWED_ORIGIN (CF Pages URL), VITE_API_URL, VITE_DIGEST_TOKEN (demo)
6) RBAC.md — minimal auth model:
   - simple user table
   - service token for /digest/run
   - CORS allowlist using ALLOWED_ORIGIN
7) SAMPLE_DATA.json — realistic seed (3 sources, 12 reviews, mixed sentiment, a few topics; include at least one competitor).

Non-negotiables:
- Sentiment: Positive | Neutral | Negative (+ score).
- Topics: auto-clustered labels with confidence.
- Timestamps: store in UTC.
- Pagination on list endpoints; include 429 strategy (retry-after).
- Security: Signed token must guard /digest/run; CORS allow only ALLOWED_ORIGIN.

Output ONLY the files above, in that order.
