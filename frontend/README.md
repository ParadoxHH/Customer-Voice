# Customer Voice Dashboard Frontend

Marketing site and placeholder app shell for Customer Voice Dashboard. Built with React, Vite, TypeScript, and Tailwind CSS using glassmorphism styling and gem gradients.

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to explore the landing page and `/app` route for the app shell scaffold.

## Available Scripts

- `npm run dev` – start Vite in development mode.
- `npm run build` – type-check and generate a production bundle in `dist/`.
- `npm run preview` – preview the production bundle locally.

## Cloudflare Pages Deployment

Use these settings when creating or updating the Cloudflare Pages project:

- **Framework preset:** Vite (or Other)
- **Build command:** `npm run build`
- **Output directory:** `dist`

No environment variables are required for this project at the moment.

## Tech Highlights

- React + Vite + TypeScript
- Tailwind CSS with custom glass and gem utility classes
- Framer Motion for scroll-triggered animations
- Lucide icons for lightweight vector glyphs

The marketing experience follows hero → features → impact stats → screenshots carousel → testimonials slider → pricing → FAQ → CTA flow. The `/app` route provides a glassmorphism app chrome ready for wiring to real data.
