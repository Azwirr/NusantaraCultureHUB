# Phase 2b plan: we curate, members read, listen and request

Oct 23, 2026 · Status: **approved by the user on 2026-10-23**; in progress.

## Decisions (user, 2026-10-23)

1. **Claude researches, the owner approves.** Claude finds real sources, writes each item in both languages and attaches the sources, as a draft. The owner (`zwirr`) checks and approves alone; no second reviewer is needed. Claude never approves anything.
2. **Members read and listen**, keep saves and the daily-limited assistant, and **request new stories on one page**. Members never write content.
3. **Profile:** the nickname form leaves `/me` and moves to a new settings page.
4. **Logo:** the new illustrated Nusantara logo replaces the kawung tile.

## Changes

### Rules and docs
- `CLAUDE.md`, `docs/prd.md`, `docs/build-plan.md`: new decision rows; Member role gains "request stories"; story requests are allowed (they are suggestions, not content, so community submissions stay out of scope); Claude may draft content only with real, checked sources.
- Migration `…1300_owner_approval.sql`: an **owner** may approve content they last edited (reviewers still may not approve their own edits). Nobody can approve a row they created, and the AI Workflow still cannot approve anything. pgTAP updated.

### Story requests
- Migration `…1400_story_requests.sql`: `story_requests` (member, title ≤ 120, note ≤ 500, status `open` / `planned` / `done` / `hidden`). RLS: members add their own, at most 5 a day; everyone reads requests that are not hidden, with the nickname only; staff change the status. pgTAP 11.
- `/requests`: the list, newest and "planned" first, and a form for members (guests are sent to sign in). Text is shown as plain text only.
- Staff: a "Permintaan" tab in `/review` to plan, mark done or hide a request.

### Profile and settings
- `/me`: profile card, save counts, "Koleksi saya", review button. The nickname form is removed.
- `/me/settings` (new): nickname, language, theme, sign out. A gear link on `/me`.

### Logo
- `public/brand/`: the logo at header size, 192 px and 512 px icons, favicon, and the link-preview image; credit row in `docs/asset-credits.md`.
- Header: the logo beside the "Nusantara" wordmark at a readable size.

### First content batch (after the above)
- For the three seeded regions: fix the drafts that disagree with their sources (Timun Mas, konro, barongko, soto ayam), attach checked sources to every item, and add replacement reference images only where the licence and credit are known. All as drafts, for you to approve in `/review`.

## Done when
- `npm run acceptance` is green against staging, including the new pgTAP file and e2e tests for requests and settings.
- `/me` has no nickname form; `/me/settings` changes the nickname.
- The new logo shows in the header and the browser tab.
