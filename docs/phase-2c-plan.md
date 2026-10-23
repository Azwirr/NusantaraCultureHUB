# Phase 2c plan: My collection, account menu, island map, content batch 2

Status: approved by the user on 2026-10-23; built. Batch 2 is on staging as drafts.

## 1. My collection replaces Saved and Me

- Navigation becomes: Home, Library, Regions, My collection. The separate "Saved" tab goes.
- `/me` is titled "My collection". It shows every saved item, filtered by type (stories, recipes,
  traditional dress). The 5-item preview and the "See all" link go.
- `/me/saved` redirects to `/me`, so old links still work.
- The profile card keeps the nickname, role, counts, the review queue button (staff) and the story request link.
  The Settings and Sign out buttons move out of the card (see 2).

## 2. Account menu on the avatar

- The ZW avatar in the header opens a small menu: My collection, Settings, Review queue (staff only), Sign out.
- On phones the avatar also shows in the header, so Settings and Sign out stay one tap away.
- Built as a disclosure button with a list of links (keyboard, Escape closes, focus returns).
- `/me/settings` stays as it is.

## 3. Island map on /regions

- The map groups the provinces into 7 islands or island groups and labels them on the map:
  Sumatera, Jawa, Bali & Nusa Tenggara, Kalimantan, Sulawesi, Maluku, Papua.
- Hovering or focusing an island highlights all of its provinces and names it in the caption.
- Every island is a link, even before content is approved, to a new page `/regions/island/[island]`.
  It shows a short note about the island, its approved regions, and their approved stories, recipes and dress.
  With nothing approved yet it says so and links to /requests.
- The list of regions below the map stays as the full alternative to the map.
- No game mechanics. The FR-16 text in docs/prd.md gets the island step.

## 4. Content batch 2 (drafts only)

The 3 regions and 16 items on staging are all drafts. Nothing is public until zwirr approves them in /review;
Claude never approves.

The batch adds one region for each island that has none, each with one story, one recipe and one traditional dress.
Every item comes from real sources that Claude opens and checks, and cites them in both languages:

| Island | Region | Story | Recipe | Dress |
| --- | --- | --- | --- | --- |
| Sumatera | Batak (Sumatera Utara) | Asal Usul Danau Toba | Arsik ikan mas | Ulos |
| Jawa | Sunda (Jawa Barat) | Sangkuriang | Nasi timbel | Kebaya Sunda |
| Bali & Nusa Tenggara | Bali | (a Balinese tale with a checked source) | Ayam betutu | Payas agung |
| Kalimantan | Dayak / Banjar | (a Kalimantan tale with a checked source) | Soto Banjar | King Baba / Bulang |
| Maluku | Ambon | (a Maluku tale with a checked source) | Papeda with ikan kuah kuning | Baju cele |
| Papua | Papua | (a Papua tale with a checked source) | Papeda | Koteka / rok rumbai, described with care |

If a source can't be found for an item, it is left out rather than invented. All costume images stay placeholders.

## Files

- `src/components/bottom-nav.tsx`, `src/components/app-header.tsx`, `src/components/account-button.tsx`, and a new `src/components/account-menu.tsx`
- `src/app/[lang]/me/page.tsx`, `src/app/[lang]/me/saved/page.tsx` (redirect), `src/components/saved-list.tsx` (type filter)
- `src/lib/map/islands.ts` (new: island groups, label points, bilingual names), `src/components/region-map.tsx`, `src/components/map-caption.tsx`
- `src/app/[lang]/regions/island/[island]/page.tsx` (new), `src/lib/content.ts` (approved regions and items by province codes)
- `src/lib/i18n/dictionaries/id.ts`, `src/lib/i18n/dictionaries/en.ts`
- `supabase/content/2026-10-24-batch-2.sql` (new, drafts and sources), `docs/content-seed.md`, `docs/prd.md`, `docs/candidate-sources.md`
- Tests: `tests/e2e/routes.ts`, `tests/e2e/signed-in.spec.ts`, `tests/e2e/requests-settings.spec.ts`, and a new `tests/e2e/island-map.spec.ts`

No database schema change is needed.

Done = `npm run acceptance` green against staging.
