# Customer Voice Frontend

React SPA built with Vite for the Customer Voice Dashboard. It consumes the Flask API, rendering sentiment insights, topic heatmaps, competitor comparisons, and digest previews.

## Getting Started
```bash
cd frontend
npm install
cp .env.example .env
npm run dev -- --host
```
Set `VITE_API_URL` to your Render backend (e.g. `https://customer-voice-api.onrender.com`). If you plan to trigger the digest endpoint from the UI, set `VITE_DIGEST_TOKEN` to the same bearer token configured on the backend (`TOKEN_DIGEST_RUN`).

## Key Scripts
- `npm run dev` – start the Vite dev server on http://localhost:5173.
- `npm run build` – type-check and compile for production.
- `npm run preview` – serve the built assets locally for smoke testing.

## Sample Data Ingestion
- Place `SAMPLE_DATA.json` in the deployment root (or copy it to `frontend/public/` before building).
- From the Sources page, click “Import sample data” to POST batches to `/ingest`.
- Refresh the dashboard once ingestion succeeds to see sentiment and topic visuals.

## Cloudflare Pages Deployment
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variables:**
  - `VITE_API_URL` – URL of the Render-hosted API.
  - `VITE_DIGEST_TOKEN` – optional demo token enabling the “Run Now” action on `/digest/run`.
- **Production branch:** `main` (or whichever branch CF Pages watches).
- Ensure the backend allows CORS from your Pages domain (`ALLOWED_ORIGIN=https://<project>.pages.dev`).

## Architecture Notes
- Routing is handled by React Router; the mobile-first nav collapses into a vertical sidebar on desktop.
- API calls live in `src/lib/api.ts` and reuse the shared contracts from `TYPES.ts`.
- Charts are powered by Recharts with graceful empty states to avoid rendering errors when datasets are sparse.
- Components under `src/components` (loading, error, charts) are shared across dashboard modules to keep the UI consistent.
