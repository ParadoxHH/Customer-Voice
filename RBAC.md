# Access & Security Model

## User Roles
- **analyst** (default): Read insights, manage sources, run manual analyses, create competitor notes.
- **admin**: Inherits analyst permissions plus manage users, rotate tokens, and approve schema changes.
- **service**: Non-human principals scoped to automation tasks (e.g., GitHub Actions); no UI access.

## Authentication
- First-party UI sessions rely on Render’s Flask app using JWT cookies (future work). Until then, authenticated endpoints accept `Authorization: Bearer <user token>` generated per user in the `users` table.
- `/digest/run` requires the static bearer token stored in `TOKEN_DIGEST_RUN`. Never expose this token in client-side code—only GitHub Actions should reference it.
- Service tokens are stored hashed in Postgres (`users` with `role='service'`) and rotated by admins.

## Authorization Matrix
| Capability | analyst | admin | service |
| --- | --- | --- | --- |
| View insights/dashboard | ✅ | ✅ | ➖ |
| Manage sources & competitors | ✅ | ✅ | ➖ |
| Trigger manual digest | ✅ | ✅ | ✅ (cron only) |
| CRUD users & tokens | ➖ | ✅ | ➖ |
| Access `/digest/run` | ➖ | ✅ | ✅ |

## CORS & Network Controls
- The Flask API enables CORS exclusively for `ALLOWED_ORIGIN`, matching the Cloudflare Pages URL exactly (including protocol).
- Non-browser clients (CLI, CI) must supply the correct bearer token; there is no wildcard CORS fallback.
- Apply rate limiting middleware to protect all write endpoints; return `429` with `Retry-After` guidance per the API contract.

## Audit & Logging
- Persist request metadata (user_id, source_ip hash, route, status) for sensitive operations in a dedicated audit table (future enhancement).
- Emit structured logs to Render and include correlation IDs so Neon query samples can tie back to API requests.
