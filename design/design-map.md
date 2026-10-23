# Design map: Nusantara Culture Hub

Oct 22, 2026 · Phase 1 (foundation)

This file records how the Stitch designs in `design/stitch/` became the Phase 1 UI shell, which parts were kept, which were dropped, and what later phases add. The PRD (`docs/prd.md`) and build plan (`docs/build-plan.md`) win over the designs wherever they disagree.

Sources, in order of authority:

1. `docs/prd.md` sections 3, 4, 7 and 8, and the foundation prompt in `docs/build-plan.md`.
2. `design/stitch/nusantara_sketchbook_archive/DESIGN.md`: the prose sets brand hues, elevation and component behaviour. Its front-matter sets the type scale, spacing and token names.
3. The `screen.png` mock-ups, for layout and hierarchy only.

The `code.html` exports are reference material, not source. Nothing was copied from them: no hot-linked images, no Material Symbols font, no invented statistics or provenance, no blur or glass effects. Tailwind is told not to scan `design/` (`@source not` in `globals.css`).

## Token decisions

All tokens live in `src/app/globals.css` as CSS variables. Tailwind v4 maps them in `@theme inline`, so components use names like `bg-primary` or `text-on-surface-variant` and a theme switch never needs `dark:` variants. Tailwind's default palette, blurred shadows, type sizes and radii are cleared, so only project tokens exist.

### Colour

| Role | Light | Dark | Notes |
| --- | --- | --- | --- |
| background / surface | `#F7F1E3` paper | `#18191C` night charcoal | DESIGN.md "Paper Light" and dark canvas |
| on-surface | `#2B2B2B` ink | `#EDE6D8` parchment ink | 12.6:1 and 14.2:1 |
| on-surface-variant | `#5A5348` | `#A39E93` | 6.7:1 and 6.6:1 on background |
| primary | `#1F3A5F` batik indigo | `#AEC8F4` light indigo | Indigo text would fail on charcoal, so dark mode lightens it |
| primary-strong | `#032448` | `#C9DAF8` | Hover and pressed state |
| secondary | `#8A5A2B` saga brown | `#E3B48A` | Kickers, chips, motif lines; 5.2:1 on paper |
| tertiary | `#755B00` | `#C9A227` | Text-safe gold |
| accent-gold | `#C9A227` | `#C9A227` | Linework only: 2.2:1 on paper fails for text |
| outline | `#6F6A60` | `#8A857B` | Form controls and UI edges: 4.8:1 (WCAG 1.4.11). DESIGN.md's ink at 30% was 1.8:1 |
| outline-variant | `#C9BFAE` | `#3E4249` | Decorative lines only |
| border-ink (`border-ink`) | ink at 20% | `#3E4249` | Card contours |
| error | `#BA1A1A` | `#FFB4AB` | Form errors |

The surface-container ladder (`lowest` to `highest`) is re-derived as warm paper tints instead of the cool greys in the front-matter. Review status colours use the real statuses: `draft`, `approved`, `rejected`, `unpublished` (`--status-*-bg` and `--status-*-fg`). They are for staff screens only and arrive with the Phase 2 queue.

### Type

- Merriweather (300, 400, 700; italic 300 and 400) for headings, story text and italic subtitles: `font-serif`.
- Plus Jakarta Sans (400 to 700) for interface text: `font-sans`, the body default.
- Both are self-hosted by `next/font` at build time, with the latin and latin-ext subsets and `display: swap`. The browser never contacts Google.
- The DESIGN.md scale is kept as utilities: `text-headline-xl`, `text-headline-xl-mobile`, `text-headline-lg`, `text-headline-lg-mobile`, `text-headline-md`, `text-story-body`, `text-body-lg`, `text-body-md`, `text-body-sm`, `text-label-md`, `text-label-sm`. Each carries its line height, letter spacing and weight. The smallest size is 12px. `text-wordmark` exists for the brand only.
- `next/font` loads every weight in both styles, so Merriweather 700 italic is also generated. It is not used.

### Shape, space and elevation

- Radii: `rounded` = 8px for cards, buttons, inputs and plates; `rounded-sm` = 4px for chips and badges; `rounded-full` for avatars and dots only.
- Layout: `page-container` caps content at 1200px with a 16, 32 or 48px margin. `page-grid` gives 4 columns under 768px, 8 up to 1024px and 12 above, with 16, 24 or 32px gutters. The safe-area insets are respected (`viewport-fit=cover`).
- Elevation: `shadow-1` (1px 2px 0) and `shadow-2` (3px 4px 0) are hard offset shadows. Nothing is blurred and there is no `backdrop-blur`.
- Buttons use the `press` utility: on press they shift 1px down-right and drop the shadow, like a stamp.
- Touch targets are at least 48 by 48px: buttons, links in navigation, the language segments, the theme toggle and the account button.

### Theme, focus and motion

- Light tokens sit on `:root`. Dark tokens apply under `:root[data-theme="dark"]` (the visitor chose dark) and under `@media (prefers-color-scheme: dark)` for `:root:not([data-theme="light"])` (no saved choice). The two dark blocks must stay identical.
- `ThemeScript` is a constant inline script in `<head>` that reads the `nch_theme` cookie and sets `data-theme` before first paint, so pages stay prerendered and never flash. It is the only `dangerouslySetInnerHTML` in the repository; ESLint (`react/no-danger`) rejects any other.
- One focus ring everywhere: 3px solid `--focus-ring` with a 2px offset.
- `prefers-reduced-motion: reduce` cuts every transition and animation to near zero.

## Component inventory

| Component | File | Purpose | PRD link |
| --- | --- | --- | --- |
| AppHeader | `src/components/app-header.tsx` | Brand, navigation (md and up), language, theme, account | Shell |
| BottomNav, HeaderNav | `src/components/bottom-nav.tsx` | Home, Library, Regions, Me. Bottom tab bar under md, header links from md. `aria-current`, safe-area padding | Shell |
| LanguageSwitcher | `src/components/language-switcher.tsx` | ID / EN segmented control; writes `nch_locale`, then refreshes | NFR Language |
| ThemeToggle, ThemeScript | `src/components/theme-toggle.tsx`, `theme-script.tsx` | Light and dark, saved in `nch_theme` | NFR Accessibility |
| AccountButton | `src/components/account-button.tsx` | Initials linking to /me, or a sign-in link. Streams in behind `<Suspense>` | Roles |
| Button, ButtonLink | `src/components/button.tsx` | Primary (indigo), secondary (saga outline), ghost | All |
| Card | `src/components/card.tsx` | Paper card with ink contour and `shadow-1` | All |
| Chip | `src/components/chip.tsx` | 32px tag, 4px radius, wraps instead of truncating | FR-02, FR-07 |
| EmptyState | `src/components/empty-state.tsx` | "Appears after reviewer approval" lists, and the 404 page | FR-02, FR-03 |
| PageHeader | `src/components/page-header.tsx` | Kicker, the page's h1, lead | All |
| MotifDivider | `src/components/motif-divider.tsx` | 1px rules around a kawung node; decorative | Brand |
| HalalBadge | `src/components/halal-badge.tsx` | Renders only when `canShowHalalBadge(status)` from `src/lib/halal.ts` is true, i.e. `verified_by_source` | FR-07, acceptance check 11 |
| PlaceholderPanel | `src/components/placeholder-panel.tsx` | Phase 1 body for detail routes | Shell |
| Line art | `src/components/line-art.tsx` | Brand mark, hero plate, costume, recipe and story drawings | Brand |
| Auth forms | `src/components/auth/*` | Labelled inputs, inline errors from `dict.auth.errors`, `aria-invalid` | Roles |

All visible text comes from `src/lib/i18n/dictionaries/{id,en}.ts`. TypeScript rejects a missing or extra English key, and `tests/unit/i18n.test.ts` checks key parity and empty strings. The wordmark "Nusantara" is the only literal.

## Routes in Phase 1

Every route lives under `src/app/[lang]/`. The proxy rewrites unprefixed URLs to the visitor's language, so links stay unprefixed (`href="/library"`).

| Route | Stitch screen | Phase 1 state |
| --- | --- | --- |
| `/` | beranda (light; the "dark" export is a theme, not a page) | Hero, motif divider, three FR-01 pillars linking to `/library?type=costume`, `recipe`, `story`, and a "reviewed before publishing" note |
| `/library` | perpustakaan | Header and an empty state until reviewed content exists |
| `/regions`, `/regions/[slug]` | wilayah | List page with an empty state; detail placeholder |
| `/stories/[slug]` | pemutar cerita | Placeholder that states the audio-description-first rule |
| `/recipes/[slug]` | detail resep | Placeholder that states the halal rule |
| `/try-on` | studio coba busana | Placeholder that states photos are processed on the device and never uploaded |
| `/me` | halaman anggota | Nickname, role labels, review link for staff, sign out |
| `/login`, `/signup` | none | Email and password forms with a nickname at sign-up |
| `/review` | antrean peninjau | Draft counts per type for staff; full queue in Phase 2 |

## Dropped from the Stitch designs

| Design element | Screens | Why |
| --- | --- | --- |
| Hot-linked `lh3.googleusercontent.com` images with fake archive labels | All but the reviewer queue | Unlicensed, uncredited, and they invent provenance. Replaced by project-owned line art |
| Material Symbols icon font | All | Heavy font load; replaced by lucide-react SVG icons at stroke 1.75 |
| Statistics strip ("38 Provinsi", "300+ Cerita Rakyat", "1.200 Resep") | Home | Invented numbers. Counts may return later, computed from approved rows |
| Featured story and "Pilihan Kurator" | Home | Needs approved content and a curation decision |
| Quotes with attribution ("Arsip Etnografi Nusantara", proverb callouts) | Home | Invented attribution |
| Second home mode and the RPG or map framing | Home, regions | PRD: one mode only; map mode is out of scope |
| Ratings and reader counts | Library, member | Not in the MVP |
| Community contribution callout | Library | Community submissions are out of scope |
| Points, levels, daily claim, field notes, PDF export | Member | Not in the MVP. Badges (FR-10) return in a later phase as earned badges only |
| Avatar photos and a "verified" seal | Member, headers | No photo storage. Initials only; staff status comes from `user_roles` on the server |
| "Halal 100%" and unsourced diet chips | Recipe, library, region | A halal label shows only for `verified_by_source` |
| "Peneliti: Dr. ..." names and "pengajuan" wording | Reviewer queue | Implies outside submissions |
| Ambient soundscape, "Dramatisasi", promises of a professional dalang | Story player | No such recordings exist; audio arrives as generated or recorded narration in a later phase |
| Face-detection precision badge ("98% Presisi") and artistic filters | Try-on | Invented claim; filters are not in FR-08 |
| Blur, glass and gradient overlays on images | Several | DESIGN.md rejects blurred shadows; overlays also hurt text contrast |
| 10px text and 28 to 44px controls | Several | Below the 12px minimum and the 48px touch target |

## What later phases add

| Phase work | PRD | Notes |
| --- | --- | --- |
| Library with search and region and type filters | FR-02 | Reads `searchParams` inside `<Suspense>`; search text rendered as plain text |
| Region pages with their story, recipe and costume | FR-03 | List only, never a map |
| Story player: chapters in order, alt text, audio description before audio | FR-04 | Player controls follow the player spec; keyboard and screen-reader complete |
| Chapter audio with caching and a Web Speech fallback | FR-05 | Generated on the server, cached by hash |
| Illustrations in one style per story | FR-06 | Credited and reviewed before publishing |
| Recipe list and detail with bilingual names, ingredients, steps, servings, diet tags | FR-07 | `HalalBadge` already enforces the halal rule |
| Try-on, solo and couple, with a watermarked download | FR-08, FR-09 | Camera and pose detection in the browser only; no upload endpoint |
| Badges for finishing story 1 and cooking the first recipe | FR-10 | Shown on /me |
| Review queue: edit, approve, reject with reason, unpublish | FR-11 | Uses the status tokens defined here |
| AI jobs and the audit log views | FR-12, FR-13 | Staff only |

## Design v2 (Phase 2, 2026-10-23)

The Stitch "sketchbook archive" identity stays: paper, Batik Indigo, Saga Brown, kawung linework, Merriweather and Plus Jakarta Sans. Phase 2 makes it editorial.

| Change | Where | Notes |
| --- | --- | --- |
| Display type: `text-display` (60px) and `text-display-mobile` (38px), `text-numeral` for big numbers | `globals.css` | Page heroes and detail titles. Merriweather 700; numerals in 300 |
| `rule-lead`: a 1px ink rule with a short saga-brown lead | `globals.css` | Opens every editorial section (`SectionHeading`) |
| `measure`: a 68ch reading column | `globals.css` | Story text, recipe steps, info cards |
| `rise`: content rises 8px and fades in once, staggered with `--rise-delay` | `globals.css` | Cut to nothing under `prefers-reduced-motion` |
| Hero collage: rumah gadang, wayang and batik parang on paper plates | Home | Project-owned line art, decorative (`aria-hidden`) |
| Live counts from approved rows only | Home | Hidden while nothing is approved; a note explains the review instead. Replaces the invented "38 Provinsi" strip |
| "How we verify" strip on the inverse surface | Home | Bilingual, sourced, approved by a second person. Our trust edge |
| `ContentCard`: tinted line-art plate, kicker with type and region, serif title as a stretched link | Library, region pages | `action` slot for the save button (M4) |
| Detail views shared with the staff preview | `src/components/views/*` | `/review/preview/[type]/[id]` renders a draft with the public template |
| Story reader: audio description, then illustration (or its alt text), then text | `/stories/[slug]` | PRD FR-04 order; chapter list on the side from `lg` |
| Recipe page: servings stepper that scales amounts, numbered steps | `/recipes/[slug]` | The halal chip only through `HalalBadge` |
| Costume page: reference image plate and info card | `/costumes/[slug]` | New route; try-on joins in Phase 4 |

Public pages read approved content through a cookie-less guest client with `"use cache"` and the `public-content` tag, so they prerender. Review actions expire the tag.
