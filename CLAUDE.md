# Nusantara Culture Hub: rules for Claude Code

## Scope
- MVP only. Read docs/prd.md and docs/build-plan.md before any change.
- Out of scope: RPG mode or a map game, community submissions, video, free-form AI chat, photo storage, payments.
- Allowed (user decision, 2026-10-23):
  - A navigation map of provinces on /regions that opens region pages. No game mechanics.
  - The grounded assistant "Tanya Nusantara": it answers only from approved, sourced content, cites the items it used, and declines anything else. Members only, with a daily limit. Free-form chat stays out of scope.
- AI calls run on the server only, through Vercel AI Gateway. Tests use the fake provider; never call a real model from tests.
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
- Claude may research and draft new content (user decision, 2026-10-23), only from real sources it has opened and checked, cited on every item, in both languages. Claude writes drafts only and never approves; the owner approves.
- Members never write content. They ask for it on /requests; a request is a suggestion, not content.
- Never mark a recipe halal unless halal_status = verified_by_source.

## Working style
- Plan before coding. List the files you will change and wait for approval.
- Run the acceptance checks in docs/prd.md section 8 before saying a task is done.
- One phase per session. Use /clear between tasks to save tokens.
