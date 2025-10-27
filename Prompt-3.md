Act as a senior React engineer focused on clarity and phone-first UX.

Input contracts: (PASTE TYPES.ts, OPENAPI.yaml, ENVIRONMENT.md from Prompt 1).

Goal: Build a React SPA that consumes the API and renders insights; deployable on Cloudflare Pages.

Deliverables:
1) /frontend/package.json
   - Vite scripts: dev, build, preview
2) /frontend/vite.config.ts
   - basic config; base path safe for CF Pages
3) /frontend/src/main.tsx and /frontend/src/App.tsx
   - router + layout shell; mobile-first nav
4) /frontend/src/lib/api.ts
   - typed client using TYPES.ts; base URL from import.meta.env.VITE_API_URL
   - fetch wrapper with retries for 429 (respect Retry-After)
   - helpers: listInsights(params), postIngest(payload), postAnalyze(text), manageCompetitors, runDigest()
5) /frontend/src/pages/Dashboard.tsx
   - sentiment line chart (by day/week); topic heatmap; source breakdown cards
   - empty states and error banners
6) /frontend/src/pages/Sources.tsx
   - connect/manage sources form (just store metadata for now)
   - “Import sample data” button that POSTs SAMPLE_DATA.json to /ingest
7) /frontend/src/pages/Competitors.tsx
   - add/list competitors; compare cards (You vs Them): overall sentiment, top topics
8) /frontend/src/pages/Digests.tsx
   - toggle weekly/monthly; “Run Now” button:
     - calls /digest/run with Authorization: Bearer VITE_DIGEST_TOKEN (for demo only)
     - shows returned summary JSON
9) /frontend/src/components/
   - ChartLine.tsx (Recharts), Heatmap.tsx (Recharts)
   - Loading.tsx, EmptyState.tsx, ErrorBanner.tsx
10) /frontend/src/styles.css
   - minimal clean styling (responsive, accessible)
11) /frontend/.env.example
   - VITE_API_URL, VITE_DIGEST_TOKEN
12) README_FRONTEND.md
   - Cloudflare Pages: build command, output dir, environment variables

Constraints:
- Phone-first (responsive); charts must not crash on empty datasets.
- No heavy UI kit; keep it simple and fast.
- API client must align with TYPES.ts and OpenAPI.
- CORS: calls only to VITE_API_URL domain.
- Include a brief “Getting Started” in README to deploy on CF Pages.

Output ONLY these files.
