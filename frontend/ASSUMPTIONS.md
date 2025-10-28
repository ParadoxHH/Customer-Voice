# Assumptions & Notes

- Hero and dashboard SVGs in `src/assets/` remain illustrative; replace with production captures during launch hardening.
- The customer dashboard (`/app`) presents sample metrics and recent feedback placeholders until real analytics endpoints land.
- Admin portal tools manage connector setup, sample data import, and digest triggers locally; wire them to backend endpoints as they become available.
- Authentication relies on the Flask `/auth/*` endpoints. The first registered account (or anyone with `ADMIN_INVITE_CODE`) becomes an admin.
- `VITE_DIGEST_TOKEN` is optional; without it the admin portal still renders guidance but skips API calls for digests.
