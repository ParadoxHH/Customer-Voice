# Customer Voice Frontend

React + Vite + TypeScript SPA for the Customer Voice Dashboard. Tailwind CSS drives the glassmorphism UI with gem gradients, while React Query keeps API data fresh. The app talks to the Flask API on Render and deploys seamlessly to Cloudflare Pages.

## Getting Started
```bash
cd frontend
npm install
cp .env.example .env
npm run dev -- --host
```
Update `.env` with:
- `VITE_API_URL` – Render API base (e.g. `https://customer-voice.onrender.com`)
- `VITE_DIGEST_TOKEN` – optional demo token for `/digest/run` (the Settings page can also store it in localStorage)

## Key Scripts
- `npm run dev` – Vite dev server on <http://localhost:5173>
- `npm run build` – type-check + production build (`dist/`)
- `npm run preview` – locally serve the compiled build

## Sample Data Ingestion
- `frontend/public/SAMPLE_DATA.json` is bundled with the app.
- Dashboard and Sources pages provide “Import Sample Data / Fetch Reviews” CTAs that POST to `/ingest` and refresh the insights.
- After a successful ingest, revisit the Dashboard to see sentiment and topic visuals populate automatically.

## Cloudflare Pages Deployment
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variables:**
  - `VITE_API_URL`
  - `VITE_DIGEST_TOKEN` (optional; can be empty)
- Point Pages at the `frontend/` directory, keep the production branch on `main`, and ensure `ALLOWED_ORIGIN` on Render matches the Pages URL (`https://*.pages.dev`).

## Architecture Notes
- React Router controls navigation; a phone-first top bar becomes a sideloaded glass nav on desktop.
- Tailwind theme tokens live in `src/styles.css` with `.glass` helpers and gem-gradient utilities.
- React Query (`src/lib/useApi.ts`) caches insights, competitors, and digests on a per-filter key, with 429 retry handling baked into `src/lib/api.ts`.
- Charts use Recharts and are wrapped with accessibility affordances (`data-testid="sentiment-line"` and `data-testid="topic-heatmap"`).
- Settings page lets you preview gradient tokens and store a local digest token without leaking secrets into the bundle.
