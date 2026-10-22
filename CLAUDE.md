# Nusantara Culture Hub: rules for Claude Code

## Scope
- MVP only. Read docs/prd.md and docs/build-plan.md before any change.
- Out of scope: RPG or map mode, community submissions, video, free-form AI chat, photo storage, payments.
- Phase 1 (foundation) makes no AI, TTS, or image calls.

## Stack
- Next.js App Router, TypeScript, Tailwind CSS, Supabase (Auth, Postgres, Storage), Vercel.

## Security (never relax)
- Roles live only in user_roles. Only owner can write to it. Never trust a role sent by the client.
- RLS on every table. Public read returns approved rows only.
- Trigger guard_approval on content tables.
- API keys are server-side only. Never use NEXT_PUBLIC_ for secrets.
- Render user-entered text as plain text, never as HTML.

## Database
- Schema changes go in supabase/migrations as SQL files. No manual edits in the dashboard.
- Every new table enables RLS in the same migration.

## Content
- Seed data comes from docs/content-seed.md. All content stays draft until a reviewer approves it.
- Never mark a recipe halal unless halal_status = verified_by_source.

## Working style
- Plan before coding. List the files you will change and wait for approval.
- Run the acceptance checks in docs/prd.md section 8 before saying a task is done.
- One phase per session. Use /clear between tasks to save tokens.
