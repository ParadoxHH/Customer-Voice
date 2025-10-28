# Customer Voice Frontend

React + Vite + TypeScript single-page app that powers the Customer Voice marketing site, authenticated customer dashboard, and the owner-only administration portal.

## Getting Started
```bash
cd frontend
npm install
cp .env.example .env
npm run dev -- --host
```

Update `.env` with:
- `VITE_API_URL` — base URL of the Flask API (`http://localhost:5000` during local development).
- `VITE_DIGEST_TOKEN` — optional; enables the admin portal to trigger `POST /digest/run`.

## Available Scripts
- `npm run dev` — start the Vite dev server on <http://localhost:5173>.
- `npm run build` — type-check and build the production bundle into `dist/`.
- `npm run preview` — serve the compiled build locally.

## Application Structure
- `src/pages/Landing.tsx` — marketing site with pricing, testimonials, and CTA routing.
- `src/pages/Dashboard.tsx` — authenticated workspace for everyday users.
- `src/pages/AppShell.tsx` — administration portal housing source setup, sample data import, and digest tooling (guarded by admin access).
- `src/lib/auth.tsx` — authentication context handling registration, login, token storage, and guard rails.
- `src/components/ProtectedRoute.tsx` — wraps routes that require a logged-in (or admin) user.

## Deployment Notes
1. Deploy the Flask API first and ensure `ALLOWED_ORIGIN` matches your Pages/hosting domain.
2. Configure the following environment variables for the frontend host:
   - `VITE_API_URL`
   - `VITE_DIGEST_TOKEN` (optional)
3. Run `npm run build` and publish the contents of `frontend/dist/`.
4. Confirm that `/login`, `/register`, `/app`, and `/admin` routes all load correctly against the deployed API.

## Authentication Flow Overview
- Visitors create an account on `/register`; the first signup (or anyone with `ADMIN_INVITE_CODE`) becomes an admin.
- Login on `/login` stores an auth token in `localStorage`.
- Protected routes rely on the `/auth/me` endpoint to verify tokens and expose role information for gating the admin tools.
