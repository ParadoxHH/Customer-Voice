# Deployment & Operations Notes

## Render (Backend API)
- Create a **Web Service** pointing at the repository root with build command `pip install -r requirements.txt` and start command from `Procfile`.
- Required environment variables:
  - `DATABASE_URL` – Neon connection string (e.g., `postgresql+psycopg://user:pass@ep-neon.aws.neon.tech/db`).
  - `ALLOWED_ORIGIN` – Exact Cloudflare Pages URL (e.g., `https://customer-voice.pages.dev`).
  - `TOKEN_DIGEST_RUN` – Bearer token shared with GitHub Actions for the digest job.
  - Optional: `OPENAI_API_KEY`, `RESEND_API_KEY` for future enhancements.
- Ensure `ALLOWED_ORIGIN` matches the live SPA or CORS will block browser requests.

## Neon (Postgres)
- Create a new Neon project; use the pooled connection string for `DATABASE_URL`.
- Enforce TLS (`?sslmode=require`) and create separate branches for staging/production.
- Run schema migrations (Alembic) or apply `DB.sql` before running the API.

## Cloudflare Pages (Frontend)
- Connect the repo and select the `frontend/` directory.
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_API_URL` – The Render API URL.
  - `VITE_DIGEST_TOKEN` – (Optional) Demo token used in the UI to call `/digest/run`.
- Copy `SAMPLE_DATA.json` to `frontend/public/` (already included) so the Sources page can import sample data.

## GitHub Secrets
- `RENDER_API_URL` = `https://<your-render-service>.onrender.com`
- `DIGEST_TOKEN` = same value used for `TOKEN_DIGEST_RUN`
- Optional future automation: `DATABASE_URL`, `OPENAI_API_KEY`, `RESEND_API_KEY`

## Troubleshooting Tips
- **CORS errors**: Confirm `ALLOWED_ORIGIN` matches the exact Cloudflare Pages domain (protocol + host). Re-deploy backend after changes.
- **Digest job failures**: Check that both `DIGEST_TOKEN` and `RENDER_API_URL` secrets exist and the token matches the backend env var. Inspect Render logs for 401 or 500 responses.
- **Database connectivity**: Verify Neon branch is active and the URL includes required sslmode flags. Render free tier idles connections; enable pooling in Neon settings.
- **Frontend build issues**: Ensure Node 18+ is available. Run `npm install` inside `frontend/` to restore dependencies before `npm run build`.
