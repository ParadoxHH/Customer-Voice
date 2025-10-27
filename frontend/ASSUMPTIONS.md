# Assumptions & Notes

- Placeholder screenshot and avatar assets are generated as inline SVG data URIs to avoid bundling large binaries while still delivering 35 unique visuals.
- Testimonials, stats, and copy are fictional but grounded in plausible product outcomes to satisfy the conversational tone.
- Existing frontend dependencies that are no longer required (e.g., `@tanstack/react-query`) remain in `package.json` so the lockfile stays consistent; remove them in a follow-up if you prefer a lean dependency tree.
- The `/app` route is an illustrative shell only—navigation buttons are non-functional placeholders until real routes are wired up.
