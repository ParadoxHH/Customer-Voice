# Customer Voice Dashboard Overview

## Core Capabilities
- Unified ingestion of reviews from connected sources (app stores, surveys, support tickets).
- Near-real-time sentiment and topic analysis with historical trend tracking.
- Interactive insights dashboard covering sentiment timelines, topic heatmaps, and source comparisons.
- Competitor benchmarking with side-by-side sentiment/topic metrics.
- Automated digest generation with email-ready summaries and anomaly callouts.

## ASCII Architecture
```
  Review Sources        Competitor Data       Scheduled Jobs
 (App Stores, NPS,    (Manual entries,       (GitHub Actions
  Support Export)      CSV imports)             digest cron)
        |                    |                      |
        v                    v                      |
-----------------   -----------------               |
| Flask API @   |<--| Competitors API |<-------------+
| Render (ingest|   -----------------                |
| analyze, CRUD)|          ^                         |
-----------------          |                         |
        |                  |                         |
        v                  |                         |
------------------------------        -------------------------------
| Neon Postgres (users, sources, |<----| Background Analyzer (LLM/TODO)|
| reviews, topics, digests, etc)|      -------------------------------
------------------------------                 ^
        ^                                      |
        |   HTTPS (JSON)                       |
-------------------------------                |
| React SPA @ Cloudflare Pages |---------------+
| (Dashboard, Sources,         |
| Competitors, Digests)        |
------------------------------- 
```
