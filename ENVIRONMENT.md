# Environment Configuration

## Render (Flask API)
| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | `postgresql+psycopg://user:pass@ep-neon.aws.neon.tech/db` | Neon connection string with pooling enabled. |
| `OPENAI_API_KEY` | Optional | `sk-...` | Reserved for future LLM topic enrichment. |
| `RESEND_API_KEY` or `SMTP_*` | Optional | `re_...` | Needed once email digests are enabled. |
| `TOKEN_DIGEST_RUN` | Yes | `run_digest_prod_token` | Bearer token used by the scheduled digest workflow. |
| `ALLOWED_ORIGIN` | Yes | `https://customer-voice.pages.dev` | Comma-separated list of allowed origins (e.g. local + production Pages URL). |
| `LOG_LEVEL` | Optional | `info` | Optional override for application logging. |
| `AUTH_TOKEN_SECRET` | Yes | `super-secure-random-string` | Used to sign login tokens; generate at least 32 random characters. |
| `ADMIN_INVITE_CODE` | Optional | `owner-signup-code` | Require this value to grant admin access during registration. |
| `AUTH_TOKEN_TTL_SECONDS` | Optional | `604800` | Override bearer token lifetime (defaults to seven days). |
| `AUTH_PASSWORD_MIN_LENGTH` | Optional | `10` | Increase the minimum password length (default is 8). |

## Neon Postgres
| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `NEON_PROJECT_NAME` | Optional | `customer-voice` | Helpful for scripts and Terraform. |
| `DATABASE_URL` | Yes | same as above | Share with Render and local `.env`. |
| `PGSSLMODE` | Yes | `require` | Enforce TLS from all clients. |

## Cloudflare Pages (React SPA)
| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `VITE_API_URL` | Yes | `https://customer-voice-api.onrender.com` | Must match the CORS allow list configured on the API. |
| `VITE_DIGEST_TOKEN` | Optional | `demo_digest_token` | Used only for the UI "Run Now" helper. |

## GitHub Actions (Secrets)
| Secret | Required | Example | Notes |
| --- | --- | --- | --- |
| `RENDER_API_URL` | Yes | `https://customer-voice-api.onrender.com` | Target endpoint for the digest cron job. |
| `DIGEST_TOKEN` | Yes | `run_digest_prod_token` | Should mirror `TOKEN_DIGEST_RUN`. |
| `DATABASE_URL` | Optional | shared value | Needed if CI runs integration migrations. |
| `OPENAI_API_KEY` | Optional | shared value | Only required when automated analysis uses OpenAI. |
| `RESEND_API_KEY` | Optional | shared value | Optional; provides email delivery credentials. |
