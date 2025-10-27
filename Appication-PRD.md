# CUSTOMER VOICE DASHBOARD — APPLICATION BREAKDOWN

## DESCRIPTION
The Customer Voice Dashboard is a Micro-SaaS web app that helps small and medium-sized businesses understand their customer feedback in one place.  
It automatically collects reviews from platforms like Google, Yelp, and Trustpilot, analyzes tone and key topics using AI, and summarizes the results in a simple dashboard and weekly email digest.

---

## HOSTING AND DEPLOYMENT STACK (FREE-TIER FRIENDLY)

**Frontend:** Cloudflare Pages — hosts the React SPA with free CDN and Git auto-deploy  
**Backend API:** Render — runs the Flask API and serves data  
**Database:** Neon Postgres — stores reviews, topics, and analysis data  
**Schedulers / Jobs:** GitHub Actions — runs weekly or monthly digest jobs via cron calling a protected API endpoint

**Data Flow:**  
Cloudflare Pages (React) → Render (Flask API) → Neon (Postgres)  
GitHub Actions (cron) → /digest/run on Render → generates weekly digest

---

## ARCHITECTURE OVERVIEW

### 1. Core Analysis Engine (Backend on Render)
- **Stack:** Python, Flask, Gunicorn  
- **Functions:**
  - Receive new review data from connected platforms  
  - Run AI sentiment and topic analysis  
  - Store results (sentiment label, score, topics) in Neon  
- **Endpoints:**
  - /ingest — add new reviews  
  - /analyze — analyze a single text  
  - /insights — get aggregated data for charts  
  - /competitors — track and compare competitor sentiment  
  - /digest/run — protected endpoint to trigger summary job

### 2. Frontend Dashboard (React on Cloudflare Pages)
- **Stack:** React (Vite), TypeScript  
- **Functions:**
  - Display review insights and sentiment charts  
  - Manage connected data sources  
  - Compare competitor data  
  - Configure and preview weekly/monthly digests

---

## CORE FEATURES

1. **Multi-Platform Review Aggregation**  
   Connect Google Reviews, Yelp, G2, or Trustpilot.  
   Automatically pull new reviews, deduplicate, and store with timestamps and source IDs.

2. **AI Sentiment Analysis**  
   Classify reviews as Positive, Neutral, or Negative.  
   Track sentiment trends over time and detect spikes in dissatisfaction.

3. **AI Topic and Theme Clustering**  
   Automatically group reviews by recurring themes like Customer Support, Pricing, Ease of Use, Shipping, or Product Quality.  
   Show which topics customers praise or complain about most.

4. **Weekly or Monthly Digest**  
   Automatic summary showing:
   - Top 3 praised areas  
   - Top 3 complaints  
   - Real customer quotes  
   Triggered by GitHub Actions calling /digest/run.

5. **Competitive Benchmarking**  
   Track 1–3 competitors.  
   Compare sentiment trends and topic breakdowns.  
   Highlight where the business outperforms or underperforms.

---

## TARGET USERS
- Local restaurants and retail shops  
- E-commerce stores  
- SaaS founders and product managers  
- Small business marketing and customer support teams

---

## MONETIZATION (SUBSCRIPTION TIERS)

**Starter — $49/month**  
- 1 data source, 500 reviews/month  
- AI analysis and weekly digest  

**Business — $99/month**  
- 3 data sources, 2,000 reviews/month  
- Competitive benchmarking for 1 competitor  

**Pro — $249/month**  
- Unlimited sources, 10,000 reviews/month  
- Benchmarking for 3 competitors  
- Priority support  

**Pricing Justification:**  
Competing analytics tools start at $300–$3,000 per month.  
This solution gives SMBs similar insights at a fraction of the cost.

---

## OPERATIONAL NOTES

**CI/CD:**  
- Frontend auto-deploys from Git to Cloudflare Pages  
- Backend auto-deploys from Git to Render  

**CORS:** Restrict to the Cloudflare Pages domain  

**Environment Variables:**  
DATABASE_URL  
OPENAI_API_KEY  
RESEND_API_KEY  
ALLOWED_ORIGIN  
TOKEN_DIGEST_RUN  
VITE_API_URL  

**Jobs:**  
Weekly GitHub Action calling /digest/run (uses DIGEST_TOKEN)  

**Migrations:**  
Managed through Alembic or SQLAlchemy  

**Scaling:**  
Upgrade Render or Neon free plans as usage grows; Cloudflare Pages stays free

---

## WHY THIS HOSTED SETUP WORKS
- No local servers required  
- Entirely free-tier friendly for MVP launch  
- Fast CI/CD from Git pushes  
- Scales smoothly as users grow  
- Clear separation between frontend, backend, database, and scheduled jobs
