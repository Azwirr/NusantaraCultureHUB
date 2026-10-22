# Phase 1: Foundation

Oct 22, 2026 · Built from the build plan's foundation prompt (Track B and the shared shell). Claude Code built this phase instead of Emergent.

## What Phase 1 contains

- **Schema**: the 16 PRD tables in five migrations under `supabase/migrations`. The fifth hardens the review gate after the security review. Every table enables RLS in the migration that creates it. Grants are explicit, so the database behaves the same whether or not a project auto-exposes new tables.
- **Review gate**: `guard_approval` on regions, stories, story_chapters, recipes and costumes. `review_content()` is the single entry point used by the review API. Triggers write every status change and role change to `audit_log`.
- **Seed**: `supabase/seed.sql`, taken from `docs/content-seed.md`, all draft. It has 3 placeholder regions, Timun Mas with 5 chapters, Gudeg and Rendang, 3 costume cards and 3 badges.
- **App shell**: bilingual (ID/EN) Next.js 16 app. Light and dark themes come from the Stitch design system. It has every build plan route as a placeholder, plus a `/regions` index for the Wilayah tab.
- **Auth**: Supabase email and password. Members choose a nickname at sign-up; no real name is stored. Sessions are refreshed in `src/proxy.ts`. All session and role reads go through `src/lib/auth.ts`.
- **API**: `POST /api/review/[type]/[id]/[approve|reject|unpublish]` is reviewer-only and fully working. `POST /api/ai/jobs` is reviewer-only and returns 501 for now. `POST /api/progress` is member-only and returns 501 for now.
- **Checks**: the pgTAP suite, Playwright end-to-end tests, Vitest unit tests, the client-bundle secret scan, and ESLint rules that ban rendering HTML from strings.

## Decisions made for Phase 1

| Decision | Why |
| --- | --- |
| Seed content is all draft, not approved as the build plan's seed list says | CLAUDE.md and the content seed: nothing is public until a reviewer checks it against a source. Tests approve rows by acting as a reviewer |
| Owner can also review | The build plan's guard text allows "reviewer or owner" |
| No one approves their own work | PRD section 3. The approver must be neither the creator nor the last editor (`created_by`, `updated_by`, stamped by the trigger and never taken from the client) |
| Approved rows are locked; edits need an unpublish first | Keeps published content reviewed. Editing a rejected or unpublished row sends it back to draft automatically, so approve, reject and unpublish are the only actions needed |
| Stories, recipes and costumes need at least one cited source to be approved; their region must be approved first | Content seed "Sources to verify". This also means a recipe can never go live as `verified_by_source` halal without a source |
| Approval requires both languages on every visible field, including alt text and audio descriptions | PRD language NFR and acceptance check 5 |
| A story needs every chapter approved first | Chapters are reviewed one by one (FR-06). A chapter is public only when it and its story are both approved |
| Members cannot write `user_badges` | The build plan said "read and update own user_badges", but that would let members award themselves badges. The server awards badges in Phase 2 (FR-10) |
| Sources have no status of their own | A source is public while it cites at least one public item. It is locked while it cites approved content |
| First owner via an operator SQL script | "Only owner can write user_roles" is enforced by RLS and a trigger. The service role is refused. `supabase/scripts/bootstrap-owner.sql` is the one documented bootstrap path |
| URLs match the build plan (`/library`, not `/id/library`) | The proxy rewrites each page to its locale route using the `nch_locale` cookie or Accept-Language, so every page can still be prerendered in both languages |
| Guests opening `/me` or `/review` get a 307 to `/login` from the proxy | It checks only for a non-empty session cookie. Pages still verify the session. A signed-in non-staff user on `/review` sees the static heading and then the not-found UI, with HTTP 200 because the shell has already streamed. No draft data is ever sent |
| No secret key in the app environment in Phase 1 | Review actions run with the reviewer's own session. The service key arrives with the AI Workflow module in Phase 2, server-side only |
| Extra columns beyond the PRD's key fields | Needed by the rules above: `slug`, `review_status` on all content tables, `created_by` and `updated_by`, `summary_id`, paired `_id`/`_en` alt text and audio descriptions, `story_chapters.image_url`, `costumes.info_id`, `badges.name_id`, and `audit_log.details` |

## How each build plan check is verified

| # | Check | Verified by | Status |
| --- | --- | --- | --- |
| 1 | Builds and deploys to a Vercel preview | `npm run build` | Build passes. The preview deploy needs the team's Vercel project |
| 2 | Migration runs on a fresh Supabase project | `npm run test:db` applies all five migrations and the seed to a fresh database | Passes on PGlite. Rerun with `npx supabase db reset` once Docker runs |
| 3 | Anonymous client sees approved rows only | `supabase/tests/database/02-public-read.test.sql` | Passes |
| 4 | A member cannot change review_status or user_roles | `03-roles-and-members.test.sql` | Passes |
| 5 | Anonymous client gets 401/403 from every review route | `tests/e2e/api-auth.spec.ts` (all 15 type and action pairs, plus the stubs) | Passes |
| 6 | Approval without a reviewer role is rejected, including no auth user | `04-guard-approval.test.sql` (service role, operator, guest, member) | Passes |
| 7 | Every route at 360 px with no horizontal scroll | `tests/e2e/responsive.spec.ts` (every route, ID light and EN dark) | Passes |
| 8 | No secret in the client bundle | `npm run check:secrets` after a build | Passes |

## PRD section 8 checks, Phase 1 coverage

| # | Check | Phase 1 |
| --- | --- | --- |
| 2 | Guest with the public key sees no draft rows | Passes (database test) |
| 3 | Member cannot change review status or write user_roles | Passes (database test) |
| 4 | AI job cannot set a row to approved | Passes (database test: service role with no auth user) |
| 5 | Story cannot be approved while a chapter lacks alt text or an audio description | Passes (database test) |
| 10 | No horizontal scroll at 360 px | Passes (Playwright) |
| 11 | No halal label unless `verified_by_source` | Covered by the `canShowHalalBadge` unit test and the database source rule. The recipe page that uses it ships in Phase 2 |
| 1, 6, 7, 8, 9 | Audio, player, Lighthouse, try-on | Later phases, by design |

## Security and accessibility review

Four independent reviewers checked the finished foundation: database security, app and API security, rules and i18n, and design and accessibility. A separate verifier then tried to refute each finding. Eleven findings survived and all were fixed, each with a regression test. Seven accessibility findings were not run through a verifier because of a usage limit. I checked each against the code, confirmed it, and fixed it too.

| Area | Finding | Fix |
| --- | --- | --- |
| Database (major) | An edit by the AI Workflow (service role) cleared `updated_by`, so the reviewer who last edited a row could then approve it | Callers with no auth user never clear or replace the human editor (migration part 5, test file 05) |
| Database (major) | The guards undid the `ON DELETE SET NULL` on `created_by`/`updated_by`, so deleting a staff account failed or left dangling ids | The guards let a deleted user's id be cleared and nothing else |
| Database | A member could tell whether a hidden draft id exists from the `content_sources` error | Non-staff are refused before any lookup |
| Database | A child or citation write running at the same moment as an approval could slip into approved content | The parent row is locked (`FOR NO KEY UPDATE` / `FOR SHARE`) |
| App | Session cookies were not HttpOnly or Secure | `src/lib/supabase/cookies.ts` sets HttpOnly, plus Secure in production |
| App | The proxy's cookie deletions were recreated by Next, and empty or PKCE cookies counted as signed in | Epoch expiry on deletions, and an exact session-cookie match |
| App | `?error=link` and "email already registered" showed no useful message | New `link_invalid` and `email_taken` messages in both languages |
| App | URLs outside a locale got Next's English-only 404, and API paths got HTML | Bilingual root and global 404, and JSON 404 for `/api/*` |
| Accessibility | The current header link was marked by colour alone, below 3:1 | A 2px bar under the current link |
| Accessibility | Focus rings were cut off at the edges of the bottom tab bar | The ring is drawn inside each tab |
| Accessibility | Focus was lost after switching language | Focus returns to the chosen language button |
| Accessibility | The browser `theme-color` ignored the in-app theme | It follows the toggle |
| Accessibility | Not-found pages reused the home title; the "Me" link was under 48px; the nickname field used `autocomplete="username"` | Own title; `min-w-12`; `nickname` on the nickname field and `username` on the email fields |

Thirteen findings were refuted or judged trade-offs. Two are worth keeping in mind for Phase 2:

- **Auth rate limits.** Supabase rate-limits sign-in by IP, and every call comes from the server's IP. Consider passing the client IP or adding app-level throttling before launch.
- **Citations.** The reviewer who adds a citation can still approve the item it cites. Only content authorship is under the four-eyes rule.

## How the database tests run without Docker

Docker Desktop cannot start on the development machine until WSL is installed. `npm run test:db` therefore runs the same pgTAP files on PGlite, which is real Postgres compiled to WebAssembly. A small stand-in (`scripts/pglite/supabase-shim.sql`) provides the Supabase roles, `auth.users` and `auth.uid()`.

A mutation check confirmed that the suite catches real breakage. The hardening tests (file 05) also fail against the schema without migration part 5. Each of these deliberate sabotages made tests fail:

- a public-read policy that leaks drafts;
- a dropped guard trigger;
- a role helper that lets the service role approve;
- a member able to grant roles;
- a missing alt-text check.

The real stack remains the reference. With Docker running: `npx supabase db reset && npm run test:db:supabase`.

## Open items for the team

- **WSL and Docker**: run `wsl --install` in an administrator terminal and reboot. Then run `npx supabase start`, put the printed publishable key in `.env.local`, and run `npm run db:types` to generate `src/lib/supabase/database.types.ts`. Until then the Supabase client is untyped.
- **Hosted projects**: create the Supabase staging project and the Vercel project, then set the env vars from `.env.example`. Add `https://<preview-domain>/auth/callback` to the Supabase redirect allow-list.
- **First owner**: sign up, then run `supabase/scripts/bootstrap-owner.sql`.
- **Member end-to-end tests**: `E2E_SUPABASE=1 npm run test:e2e` runs the sign-up and member-403 tests against a live stack.
- **Still open from the build plan**: the target age group (decides consent at sign-up), confirmation of the owner role, the three regions (seeded as placeholders), recipe sources, the cultural verifier, and ElevenLabs access.
- **Before release**: replace `public/favicon.ico` (still the create-next-app placeholder), and add a nonce-based Content Security Policy.

## Phase 2 starting points

- FR-11 review queue UI: build on `review_content()` and `POST /api/review/...`. Its errors map to 403 (role or four-eyes), 409 (preconditions) and 400 (missing reason).
- FR-12 AI jobs: a server-only module using `SUPABASE_SECRET_KEY`. `guard_approval` already keeps it to drafts. Cache on `ai_jobs (job_type, input_hash)`.
- FR-05 audio: `story_chapters.audio_hash` (sha256) and `audio_url`. Create a Storage bucket in a new migration with RLS on `storage.objects`.
- FR-10 badges: award through a SECURITY DEFINER function, not client writes.
