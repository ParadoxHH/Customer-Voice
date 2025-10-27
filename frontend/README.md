# Customer Voice Dashboard Frontend

Marketing site and lightweight app shell for the Customer Voice Dashboard. Built with React, Vite, TypeScript, Tailwind CSS, and Framer Motion in a bright, whitespace-first visual style inspired by modern marketing sites.

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` for the marketing site and `http://localhost:5173/app` for the product shell preview.

## Available Scripts

- `npm run dev` &mdash; start Vite in development mode.
- `npm run build` &mdash; run TypeScript checks and produce the production bundle in `dist/`.
- `npm run preview` &mdash; preview the production build locally.

## Environment Variables

Configure the following variables (see `.env.example`) when wiring the shell to the Flask backend:

- `VITE_API_URL` &mdash; base URL for API calls (used by the sample data importer).
- `VITE_DIGEST_TOKEN` &mdash; optional bearer token for triggering `POST /digest/run`.

## Cloudflare Pages Deployment

Use these settings for deployment:

- **Framework preset:** Vite (or Other)
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variables:** add `VITE_API_URL` (required when the shell calls the backend) and `VITE_DIGEST_TOKEN` if you want digest functionality in production.

## Project Structure

- `src/pages/Landing.tsx` &mdash; marketing site with hero, features, stats, screenshots, testimonials slider, pricing, FAQ, and final CTA.
- `src/pages/AppShell.tsx` &mdash; placeholder product chrome containing source management, sample data import, insights preview, and digest guidance.
- `src/components/` &mdash; reusable UI primitives (buttons, cards, carousel, badge, etc.) plus motion helpers.
- `src/styles.css` &mdash; Tailwind layer with theme tokens, gradients, focus states, and utility helpers.
- `src/assets/` &mdash; logo and lightweight SVG placeholders for dashboard screenshots.

## Design Notes

- Light theme with neutral surfaces, soft shadows, gentle hover lifts, and gem-gradient accents used sparingly.
- Framer Motion wrappers respect `prefers-reduced-motion`; testimonial slider auto-advances only when motion is allowed.
- Feature grid switches 1x6 → 2x3 → 3x2 across breakpoints per the specification.
- Pricing copy mirrors the backend subscription limits (Starter 1/500, Business 3/2,000, Pro unlimited/10,000).

## Next Steps

- Replace SVG placeholders with real dashboard captures once available.
- Wire the `/app` shell buttons to live API endpoints and display digest payloads when backend integration is ready.
