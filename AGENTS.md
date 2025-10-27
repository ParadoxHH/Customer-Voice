# Repository Guidelines

## Project Structure & Module Organization
- `Appication-PRD.md` holds the customer voice charter; update it only when scope truly shifts.
- `Prompt-1.md` … `Prompt-4.md` dictate deliverables. Place generated assets in the folders they name (`backend/`, `frontend/`, `.github/workflows/`, docs).
- Store shared contracts (`SYSTEM_OVERVIEW.md`, `OPENAPI.yaml`, `DB.sql`, `TYPES.ts`) together at the root or `/docs` and revise them in the same commit to avoid drift.
- Version environment samples, seed data, and deployment notes alongside their prompts.

## Build, Test, and Development Commands
- Backend bootstrap: `python -m venv .venv && .\.venv\Scripts\Activate` (or `source .venv/bin/activate`), then `pip install -r backend/requirements.txt`.
- Local API: `flask --app backend.app:create_app run --host 0.0.0.0 --port 5000`; align `ALLOWED_ORIGIN` with your SPA host.
- Frontend bootstrap: `cd frontend && npm install`; use `npm run dev -- --host` locally and `npm run build` before publishing.
- Quality gates: `pytest backend/tests`; add `npm run test` for vitest once UI tests exist. Format with `black backend` and `npx prettier --write frontend/src`.

## Coding Style & Naming Conventions
- Python: 4-space indent, snake_case functions, UpperCamelCase SQLAlchemy models; responses mirror `OPENAPI.yaml`.
- TypeScript/React: 2-space indent, PascalCase components, camelCase helpers; group screens under `frontend/src/pages` and shared UI under `frontend/src/components`.
- YAML/JSON: lowercase filenames with hyphen separators; keep key names aligned with `DB.sql` and sample payloads.
- Note any assumptions in a short markdown doc co-located with the change.

## Testing Guidelines
- Pytest modules live in `backend/tests/test_<feature>.py` and should cover a happy path plus at least one failure mode (empty data, rate limit, invalid token).
- Use fixtures seeded from `SAMPLE_DATA.json` to keep scenarios realistic; regenerate OpenAPI/TYPES before rerunning suites when contracts change.
- For React, favor vitest + Testing Library with smoke checks for charts, 429 retry handling, and empty states before merging.

## Commit & Pull Request Guidelines
- Write imperative commits with a scope prefix like `backend: add digest scheduler`, and mention the test commands you ran.
- PR descriptions map bullet-by-bullet to the prompt deliverable addressed and list any required env or secret changes.
- Attach UI screenshots or job output when relevant, confirm CI status, and note follow-ups in a `Next steps` line.

## Agent Workflow Tips
- Tie every artifact to a prompt directive and call out intentional variances in the PR checklist.
- When refreshing shared contracts, base changes on the latest committed versions and cite the baseline hash to prevent drift.
