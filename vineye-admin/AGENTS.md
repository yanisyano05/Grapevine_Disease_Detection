<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Mobile API routes (`/api/mobile/*`)

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/mobile/auth/sync` | POST | none | Sync mobile user to admin DB |
| `/mobile/auth/me` | GET | Bearer | Current user info |
| `/mobile/auth/sign-out` | POST | Bearer | Sign out |
| `/mobile/scans` | GET / POST | Bearer | List / create scans |
| `/mobile/diseases` | GET | none | Disease catalog |
| `/mobile/diseases/[slug]` | GET | none | Single disease detail |
| `/mobile/guides` | GET | none | Guide catalog |
| `/mobile/guides/[slug]` | GET | none | Single guide detail |
| `/mobile/predict` | POST | none (rate-limit IP) | Inférence ML serveur, renvoie `{ prediction }` |
