# Phase 2d plan: Claude publishes well-documented Nusantara content

Status: approved by the user on 2026-10-23; built. Publish run 1 published 37 items on staging (see supabase/content/2026-10-24-publish-1.sql).

## The new rule (user decision, 2026-10-23)

When the user asks Claude to find content, Claude may publish an item itself if it is widely documented
as Indonesian (Nusantara) heritage. Anything new, disputed or poorly documented stays a draft for the
owner, and members ask for it on /requests.

"Widely documented" is checked by the database, not by trust:

- Each story, recipe and dress cites at least **2 sources from 2 different websites**, and Claude has
  opened both and matched the draft to them.
- Everything the database already requires still holds: both languages, alt text and audio
  descriptions on every chapter, an approved region first, and a reference image on every dress.
- Halal stays unknown unless a source verifies it.
- Every publish is written to the audit log as **AI workflow** (never as zwirr), and the owner can
  unpublish anything from /review at any time.

## Database (one migration)

- `supabase/migrations/20261024001500_ai_publish.sql`:
  - `private.ai_publish(entity, id, reason)` for the AI workflow only (not callable by members or guests).
    It checks the 2-source rule, approves a story together with its chapters, and lets the
    approval guard accept it.
  - The approval guard accepts this one path; every other rule stays the same.
  - The audit trigger records these approvals as `ai_workflow`.
- pgTAP `13-ai-publish.test.sql`: members, guests and reviewers cannot use it. A 1-source item is
  refused, and so is a dress without an image or a story with a chapter missing alt text. A 2-source
  item is published and logged as `ai_workflow`.

## Content

1. Add a second independent source to each draft, checked against the text. Fix the draft if the
   second source disagrees, or leave the item as a draft if it can't be confirmed.
   Known gaps: barongko (milk or coconut milk), coto Makassar (offal), Bundo Kanduang and
   pengantin Jawa (the sources only cover part of the outfit).
2. Draw simple line-art placeholder images for the 6 new dress items, the same style as the existing 3.
3. Publish what passes: regions first, then stories with chapters, recipes and dress.

## Docs

- `CLAUDE.md` (Content and Security), `docs/prd.md` (roles, content pipeline), `docs/build-plan.md`
  (decision row), `docs/candidate-sources.md`.

Done = `npm run acceptance` green, and the library on production shows the published items.
