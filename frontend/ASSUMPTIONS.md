# Assumptions & Notes

- SVG screenshots in `src/assets/` are lightweight placeholders that mirror the layout of the real dashboard. Replace them with production captures before launch.
- The `/app` shell stores connected sources in component state and sends a minimal payload to `POST /ingest`. Swap in the real API contract once backend endpoints are available.
- `VITE_DIGEST_TOKEN` is optional; digest instructions surface in the UI without calling the endpoint when the token is unset.
- Existing dependencies that are not yet used (e.g., React Query) remain in `package.json` to avoid disrupting the shared lockfile. Remove them when the data layer lands.
