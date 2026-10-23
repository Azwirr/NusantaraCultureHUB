# Nusantara Culture Hub

A bilingual (Bahasa Indonesia and English) web app for exploring Indonesian culture through three pillars: a baju adat try-on, a traditional recipe book, and folklore told with audio and illustrations. Built for IT Festival 2026.

- Product: [docs/prd.md](docs/prd.md)
- Build plan and phases: [docs/build-plan.md](docs/build-plan.md)
- Content to seed: [docs/content-seed.md](docs/content-seed.md)
- Phase 1 decisions and how each acceptance check is verified: [docs/phase-1-foundation.md](docs/phase-1-foundation.md)
- Design system and Stitch mapping: [design/design-map.md](design/design-map.md)
- Rules for AI coding agents: [CLAUDE.md](CLAUDE.md)

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · Supabase (Auth, Postgres, Storage) · Vercel.

## Getting started

Prerequisites: Node.js 24. For a local Supabase stack you also need Docker Desktop, which on Windows needs WSL 2 and hardware virtualization turned on in the BIOS.

**Against the staging project** (no Docker needed): copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the Supabase dashboard (project `nusantara-culture-hub-staging`, Settings → API Keys), then `npm install && npm run dev`.

**Against a local stack:**

```bash
npm install
cp .env.example .env.local
npx supabase start          # first run downloads the Supabase images
npx supabase status         # copy the publishable key into .env.local
npx supabase db reset       # applies supabase/migrations and supabase/seed.sql
npm run dev                 # http://localhost:3000
```

Then sign up in the app and make yourself the first owner with [supabase/scripts/bootstrap-owner.sql](supabase/scripts/bootstrap-owner.sql). Owners grant the reviewer role from then on.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint, including the ban on rendering HTML from strings |
| `npm run typecheck` | Generates route types, then `tsc --noEmit` |
| `npm test` | Unit tests (Vitest) |
| `npm run test:db` | Migrations + seed + pgTAP suite on an in-memory Postgres (PGlite). No Docker needed |
| `npm run test:db:supabase` | The same pgTAP suite on the real local Supabase stack (`supabase test db`) |
| `npm run test:e2e` | Playwright: 360 px layout, protected routes, language, HTML payloads. Needs `npm run build` first |
| `npm run check:secrets` | Scans the client bundle for secrets. Needs `npm run build` first |
| `npm run acceptance` | All of the above in order (except the Supabase-only suite) |
| `npm run db:types` | Regenerates `src/lib/supabase/database.types.ts` from the local database |

## Ground rules

Schema changes go in `supabase/migrations` as new SQL files, never through the dashboard. Every table enables RLS in the same migration. Roles live only in `user_roles`. Secrets stay server-side and never use the `NEXT_PUBLIC_` prefix. Content is a draft until a second person (a reviewer) approves it. See [CLAUDE.md](CLAUDE.md).
