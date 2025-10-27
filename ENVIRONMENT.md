# Environment Configuration

## Render (Flask API)
| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | ✅ | `postgresql+psycopg://user:pass@ep-neon.aws.neon.tech/db` | Neon connection string with pooling enabled. |
| `OPENAI_API_KEY` | ➖ | `sk-...` | Reserved for future LLM topic enrichment. |
| `RESEND_API_KEY` or `SMTP_*` | ➖ | `re_...` | Needed once email digests are enabled. |
| `TOKEN_DIGEST_RUN` | ✅ | `run_digest_prod_token` | Bearer token used by the scheduled digest workflow. |
| `ALLOWED_ORIGIN` | ✅ | `https://customer-voice.pages.dev` | Exact Cloudflare Pages URL. |
| `LOG_LEVEL` | ➖ | `info` | Optional override for application logging. |

## Neon Postgres
| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `NEON_PROJECT_NAME` | ➖ | `customer-voice` | Helpful for scripts and Terraform. |
| `DATABASE_URL` | ✅ | same as above | Share with Render and local `.env`. |
| `PGSSLMODE` | ✅ | `require` | Enforce TLS from all clients. |

## Cloudflare Pages (React SPA)
| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `VITE_API_URL` | ✅ | `https://customer-voice-api.onrender.com` | Must match CORS allowlist. |
| `VITE_DIGEST_TOKEN` | ➖ | `demo_digest_token` | Used only for the UI “Run Now” helper. |

## GitHub Actions (Secrets)
| Secret | Required | Example | Notes |
| --- | --- | --- | --- |
| `RENDER_API_URL` | ✅ | `https://customer-voice-api.onrender.com` | Target endpoint for the digest cron job. |
| `DIGEST_TOKEN` | ✅ | `run_digest_prod_token` | Should mirror `TOKEN_DIGEST_RUN`. |
| `DATABASE_URL` | ➖ | shared value | Needed if CI runs integration migrations. |
| `OPENAI_API_KEY` | ➖ | shared value | Only required when automated analysis uses OpenAI. |
| `RESEND_API_KEY` | ➖ | shared value | Optional; provides email delivery credentials. |
