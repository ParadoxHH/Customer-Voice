Act as a DevOps engineer.

Goal: Wire free-tier CI/CD and a scheduled digest job for the existing backend/frontend repos.

Deliverables:
1) .github/workflows/backend.yml
   - triggers: push to backend/** and pull_request
   - steps: checkout, setup-python (3.11), pip install -r backend/requirements.txt, run tests
   - note: Render auto-deploys on push; include a final echo step with deploy URL placeholder
2) .github/workflows/frontend.yml
   - triggers: push to frontend/** and pull_request
   - steps: checkout, setup-node (>=18), npm ci, npm run build
   - artifact upload optional; CF Pages is connected to repo for auto-deploy
3) .github/workflows/digest.yml
   - on:
       schedule:
         - cron: "0 12 * * MON"   # Mondays 12:00 UTC
       workflow_dispatch:
   - jobs.run:
       runs-on: ubuntu-latest
       steps:
         - name: Call protected digest endpoint
           run: |
             curl -sS -X POST \
               -H "Authorization: Bearer ${{ secrets.DIGEST_TOKEN }}" \
               "${{ secrets.RENDER_API_URL }}/digest/run" \
               | jq .
4) DEPLOY_NOTES.md
   - Render: create Web Service from backend/; env vars: DATABASE_URL, ALLOWED_ORIGIN, TOKEN_DIGEST_RUN, OPENAI_API_KEY, RESEND_API_KEY
   - Neon: create project; copy connection string as DATABASE_URL
   - Cloudflare Pages: project from frontend/; set VITE_API_URL and (demo) VITE_DIGEST_TOKEN
   - GitHub Secrets:
       - RENDER_API_URL = https://<your-render-service>.onrender.com
       - DIGEST_TOKEN = same value as TOKEN_DIGEST_RUN
       - DATABASE_URL, OPENAI_API_KEY, RESEND_API_KEY (if emailing later)
   - CORS: ALLOWED_ORIGIN = your CF Pages URL (exact)

Constraints:
- Keep Actions minimal and free-tier friendly.
- Prefer calling the protected endpoint over running Python inside Actions for MVP.
- Include quick troubleshooting tips in DEPLOY_NOTES.md.

Output ONLY these files.
