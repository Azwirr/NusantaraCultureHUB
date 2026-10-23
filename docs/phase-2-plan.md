# Phase 2 plan: content live, redesign, member features, search, map, AI assistant

Oct 23, 2026 · Status: **approved by the user on 2026-10-23**; in progress.

## Goal

Ship a public site that beats a polished competitor on its own ground and then wins on ours:

| Competitor has | We match it with | We win with |
| --- | --- | --- |
| Clickable Indonesia map | A keyboard-accessible province map that opens each region page | Bilingual pages, screen-reader friendly, and a list fallback on phones |
| 35 live items, 9 categories | All content-seed items (2 stories, 10 recipes, 3 costumes) through a real review queue | Every item checked against a cited source and approved by a second person |
| An "Asisten AI" in the header | A search bar (Ctrl+K) plus the grounded assistant "Tanya Nusantara" | Answers only from approved content, with links and sources, and no invented facts |
| Editorial design | Design v2 on our own Stitch identity | Accessibility (WCAG 2.1 AA, Lighthouse ≥ 90), with audio and try-on following in later phases |

## Decisions (user, 2026-10-23)

1. **AI assistant: grounded Q&A.** It answers only from approved, sourced content, cites the items it used, and declines off-topic questions. Free-form AI chat stays out of scope.
2. **Map: navigation map, allowed.** No game mechanics. "Map mode" in CLAUDE.md is clarified to mean a map game.
3. **Content and redesign ship together**, so the new pages launch with real approved content.

## Milestones

Each milestone ends green on `npm run acceptance`, and is committed when the user says so.

### M1. Scope docs and schema

- **Docs:**
  - `CLAUDE.md`: scope wording for the map and the assistant.
  - `docs/prd.md`: FR-14 search, FR-15 grounded assistant, FR-16 region map, and bookmarks under the Member role.
  - `docs/build-plan.md`: decision-log rows.
- **Migrations,** each enabling RLS in the same file (CLAUDE.md):
  - `…0700_bookmarks.sql`: `bookmarks` (user_id, content_type, content_id, created_at; one per item). Members read, add and delete their own rows, only for content that is public.
  - `…0800_region_details.sql`: `regions.summary_id`/`summary_en` (region intro) and `regions.province_codes` (ISO 3166-2:ID codes such as `ID-SB`, for the map). Approval also requires both summaries.
  - `…0900_search.sql`: `pg_trgm` and `public.search_content(q, locale)`, a SECURITY INVOKER function. RLS means guests and members only ever get approved rows. Full-text matching plus trigram matching, so typos still find results.
  - `…1000_assistant_usage.sql`: a per-member daily question count (no question text is stored) and a SECURITY DEFINER function that consumes the quota.
- **pgTAP:** `07-bookmarks`, `08-search` (no drafts ever returned) and `09-assistant-quota`.
- **Seed:** `supabase/seed.sql` gets all content-seed items (Malin Kundang plus 8 more recipes) and Indonesian text for every missing field. All rows stay drafts. The same drafts are loaded onto staging.

### M2. Review queue (FR-11, FR-13, owner roles)

- **`/review`:** drafts by type and status, with counts.
- **`/review/[type]/[id]`:**
  - Indonesian and English fields side by side.
  - Ingredients, steps and chapters.
  - Sources (add, link, unlink).
  - Approve, reject with a reason, or unpublish. Database refusals show as clear messages ("you edited this, ask another reviewer").
- **`/review/audit`:** the audit log for staff.
- **`/review/roles`:** owner only. Grant or revoke the reviewer role by nickname.
- **Candidate sources:** I'll look up real, public reference pages (for example Warisan Budaya Takbenda, Kemdikbud) and attach them as *suggestions*. Your reviewers must check them. I approve nothing.

### M3. Design v2 and public pages

The Stitch "sketchbook archive" identity stays (paper, Batik Indigo, Saga Brown, kawung linework, Merriweather and Plus Jakarta Sans), but becomes editorial:

- **Header and type:** a display type scale, wider layouts, a desktop header with nav, search field, "Tanya Nusantara" and account, and a phone header with search and assistant icons.
- **Visuals:** project-owned line illustrations (wayang, rumah gadang, batik, cobek), and gentle motion that respects reduced-motion settings.
- **Pages:**
  - **Home:** a hero with illustration collage; live counts from approved rows; story of the day; the three pillars; a map teaser; and a "how we verify" strip (sources and a second reviewer), which is our trust edge.
  - **`/library`:** filters by type and region, search, editorial cards, and a save button on every card.
  - **`/regions`:** the province map (Natural Earth, public domain, simplified at build time); hover or focus shows the name; regions without content say "segera hadir"; the list fallback sits below.
  - **`/regions/[slug]`:**
    - top: title, intro, counts, "Tanya tentang wilayah ini", and a province silhouette;
    - content grouped into Cerita, Resep and Busana.
  - **`/stories/[slug]`:** the text reader (FR-04 text). It shows each chapter's text, image alt text and audio description, plus sources and save. Audio comes in Phase 3.
  - **`/recipes/[slug]`:** bilingual ingredients with a servings scaler, steps, dietary tags, a halal badge only through `canShowHalalBadge`, sources and save.
  - **`/costumes/[slug]`:** the costume info card, a reference image, sources, and save. The try-on button arrives in Phase 4.

### M4. Member features, search and map polish

- **Bookmarks ("Simpan"):** a save button on every card and detail page; guests are sent to sign in and back. `/me` shows "Koleksi saya" (recent saves), and `/me/saved` lists all saves with type filters. Items that are later unpublished are hidden, not lost.
- **Search:**
  - a header field, with Ctrl+K opening a search palette;
  - results grouped by type in the visitor's language;
  - `/search?q=` for sharing and no-JS use;
  - the search term is always rendered as plain text.
- **Member page:** nickname, collection, role, and, once Phase 3 lands, reading progress.

### M5. Grounded assistant "Tanya Nusantara" (FR-15)

- **How an answer is built:**
  1. `search_content` retrieves the top approved items.
  2. A strict system prompt tells the model to answer only from those items, in the visitor's language.
  3. The answer streams in as plain text with numbered links to the items and their sources.
  4. Anything outside Indonesian culture, or not covered by approved content, gets a polite "belum ada di arsip kami" and a search link.
- **Access:** guests can search, and members can ask (a daily limit keeps costs safe). This is a member perk, and it drives sign-ups.
- **Engineering:** AI SDK 7 through Vercel AI Gateway (`provider/model` strings), with a fast, low-cost Claude model and server-side keys only.
  - `src/app/api/assistant/route.ts` streams the answer.
  - `src/lib/assistant/` holds retrieval, prompt and citation parsing.
  - Tests use a deterministic fake provider, enabled only in the test environment, so CI never calls a real model.

## Files (planned)

```
CLAUDE.md, docs/prd.md, docs/build-plan.md, docs/phase-2-plan.md, design/design-map.md
supabase/migrations/2026102400070x..1000_*.sql (4 files), supabase/seed.sql
supabase/tests/database/07-bookmarks, 08-search, 09-assistant-quota .test.sql
scripts/build-map.mjs (Natural Earth → simplified SVG paths), src/lib/map/indonesia-provinces.ts (generated)
src/app/globals.css (design v2 tokens, display scale, motion)
src/components/: site-header, search-field, command-search, assistant-panel, content-card, save-button,
  region-map, province-silhouette, category-section, source-list, stat-strip, trust-strip, illustrations/*
src/app/[lang]/: page (home), library, regions, regions/[slug], stories/[slug], recipes/[slug],
  costumes/[slug], search, me, me/saved, review, review/[type]/[id], review/audit, review/roles
src/app/api/assistant/route.ts, src/lib/{content,search,bookmarks,bookmark-actions,review-actions}.ts,
  src/lib/assistant/{retrieve,prompt,citations}.ts, src/lib/i18n/dictionaries/{id,en}.ts
tests/e2e/{search,bookmarks,map,review-queue,assistant,a11y}.spec.ts, tests/unit/*
package.json: ai (AI SDK 7), mapshaper (dev), @axe-core/playwright (dev, for the a11y gate)
```

## Done when

- `npm run acceptance` passes against staging, including:
  - the new pgTAP files;
  - search never returns drafts;
  - bookmarks: save, unsave and list; a guest is asked to sign in; a member cannot bookmark a draft id;
  - the map can be driven by keyboard only;
  - review queue: the reviewer who made an edit is refused, and a second reviewer approves;
  - the assistant with the fake provider cites only approved items and declines an off-topic question.
- PRD check 8: Lighthouse accessibility is at least 90 on `/library` and a story page. Check 10 still holds: no horizontal scroll at 360 px.
- At least the content-seed items are reviewed and live on staging. **That needs your two reviewers.**

## Needed from you

1. **First owner:** OK to make `zwirr` the owner? One SQL bootstrap, written to the audit log.
2. **A second person** signs up and becomes a reviewer, because no one can approve their own edits.
3. **Sources:** your reviewers check the candidate sources before approving.
4. **AI:** turn on AI Gateway in your Vercel team, which includes free monthly credit. Then either authorize the Vercel connector (`/mcp`) so I can pull the key, or put `AI_GATEWAY_API_KEY` in `.env.local` yourself. M1–M4 don't need it.

## Risks

- **Content volume:** 15 items against their 35. The quality bar (sourced, reviewed, bilingual, accessible) is our answer; more items need team writing time.
- **Map data:** Natural Earth may lag the 2022 Papua province split. Only the provinces we use (Jawa, Sumatera Barat, Sulawesi Selatan) need to be exact.
- **AI cost:** a daily limit per member, no streaming for guests, and a small, fast model.

## Progress (2026-10-23)

| Milestone | State | Notes |
| --- | --- | --- |
| M1 scope docs and schema | Done, green on staging | Migrations 7–10 applied to staging (versions match the files); pgTAP 07–09 pass on PGlite and on staging; the full content seed (2 stories, 10 recipes, 3 costumes) is loaded on staging, all drafts |
| M2 review queue | Done, green on staging | `/review`, `/review/[type]/[id]`, `/review/audit`, `/review/roles`; migration 11 lets staff read staff nicknames and owners read all nicknames (pgTAP 10); migration 12 merges the profiles read policies into one (Supabase performance advisor). Candidate sources: `docs/candidate-sources.md` |
| M3 design v2 | Done, green on staging | Editorial home, library, regions, region, story, recipe and the new costume page; staff preview at `/review/preview/[type]/[id]` |
| M4 member features | Done | "Simpan" everywhere, `/me` in the user's profile layout, `/me/saved`, Ctrl+K palette, `/search`, province map, axe gate |
| M5 assistant | Waiting | Needs `AI_GATEWAY_API_KEY` (or the Vercel connector) and the user's OK for the first real AI call |

Decisions taken while building:

- **No second test reviewer.** Two test reviewer accounts with stored passwords would let anyone holding `.env.local` approve real content alone. The e2e review test instead uses `supabase/scripts/create-e2e-fixtures.sql`, a draft story that can never become public (it cites no source; a chapter is public only with its story). The test reviewer edits chapter 1 and is refused; it approves chapter 2, which someone else wrote, and unpublishes it again.
- **Region intros are required for approval**, like every other visible text field (migration 8).
- **Search returns approved rows to everyone, staff included.** Drafts are reviewed in the queue, never found through search.
- **Bookmarks of unpublished items are hidden, not deleted** (RLS), and return if the item is approved again.
- **Map data:** Natural Earth 5.1.2 has 33 provinces (North Kalimantan inside East Kalimantan; Papua before the 2022 split). The map says so. All seeded regions use provinces it has exactly. Regenerate with `node scripts/build-map.mjs <geojson>`.
- **No-JS search:** the form submits to `/search?q=`, but streamed results need JavaScript to appear (how Next.js streams Suspense content).
- **Navigation:** five tabs (Beranda, Perpustakaan, Wilayah, Disimpan, Saya) following the user's profile design; the tab bar shortens Perpustakaan to "Pustaka" to fit 360px.

Still needs people:

- **Two human reviewers** must check each item against a source and approve it. Until then the public site shows empty states, and two e2e checks skip themselves (saving a public item, opening a region from the map).
- The Timun Mas draft and several recipes differ from the candidate sources (see `docs/candidate-sources.md`).
