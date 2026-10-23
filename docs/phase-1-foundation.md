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
| 1 | Builds and deploys to a Vercel preview | `npm run build` | Build passes. The preview deploy needs the Vercel connector authorized (`/mcp`) or the Vercel CLI |
| 2 | Migration runs on a fresh Supabase project | Applied to the new staging project, plus `npm run test:db` on PGlite | Passes on both. All five migrations ran on the empty hosted project with no errors |
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

## Staging on hosted Supabase

The staging project is `nusantara-culture-hub-staging` (ref `mjhgzyecleviqoogqejc`, Singapore, free tier) in the AnumakiiT organization. It was created on 2026-10-23.

- **Migrations:** all five were applied through the Supabase connector. The migration history was set to the local file versions, so a later `supabase db push` sees them as applied.
- **Seed:** `supabase/seed.sql` was loaded. All rows are drafts.
- **pgTAP on the real database:** all 116 assertions pass (11 + 22 + 26 + 46 + 11). Each test file ran as a plpgsql function inside a subtransaction that is rolled back, so the run left no rows behind. The temporary `tests` schema and the pgTAP extension were removed afterwards. This matters most for the grant checks, because hosted projects give broad default privileges that the migrations must revoke.
- **Supabase advisors:** the security advisor reports nothing. The performance advisor has two INFO-level notes. Fifteen foreign keys have no index; they only slow down deleting a user account, and can get indexes in a later migration if needed. Four indexes are unused, which is expected on a new database.
- **App and test accounts:** `.env.local` points the app at staging, and `src/lib/supabase/database.types.ts` is generated from it. Two confirmed test accounts, `e2e-member` and `e2e-reviewer`, exist for the signed-in browser tests (`tests/e2e/signed-in.spec.ts`). Their passwords are only in `.env.local`, and only bcrypt hashes were sent to the database. Recreate them with `supabase/scripts/create-e2e-users.sql`. Remove them before any production launch.
- **Signed-in tests:** these sign in for real and query the Supabase REST API with each user's own token:
  - a member sees no drafts and cannot grant itself a role;
  - a reviewer sees drafts;
  - the review API returns 409 when asked to approve the incomplete seed story;
  - the session cookie is HttpOnly;
  - sign-out clears the session.
- **Found only against a real session:** the session read in `src/lib/auth.ts` now calls `connection()`. Without it, Next.js logged errors on `/me` and `/review`, because the Supabase client reads the clock during a prerender step.

## Google sign-in (added 2026-10-23)

- **Buttons:** `/login` and `/signup` show "Lanjutkan dengan Google / Continue with Google" above the email form.
- **Flow:** the server action `signInWithGoogle` starts a PKCE flow at Supabase and keeps the verifier in an HttpOnly cookie. `/auth/callback` finishes the sign-in and keeps `?next=`.
- **Failures:** a cancelled or failed Google sign-in returns to `/login?error=oauth_cancelled` or `oauth_failed`, with a bilingual message. Email links that fail still show `link_invalid`.
- **Nickname step:** Google sends no nickname. Migration part 6 (`20261023000600_profile_nickname_set.sql`) adds `profiles.nickname_set`.
  - It is false for Google members, and for email sign-ups whose nickname was taken and got a suffix.
  - Those members land on `/me`, which asks them to choose a nickname. Every member can change their nickname there.
  - Members cannot write the flag. A trigger sets it when they save a nickname.
- **Privacy:** the Google name and photo stay in `auth.users` only. They are never copied into `profiles` or shown.
- **Tests:** `06-nickname.test.sql` (11 assertions), `tests/unit/auth-callback.test.ts`, `tests/e2e/google.spec.ts`, plus the nickname test in `signed-in.spec.ts`.
  - The Google test stops at Supabase's authorize step and checks the PKCE parameters, the `redirect_to` and the verifier cookie. It never contacts Google.
  - The required-nickname view was checked once on staging by resetting the test member's flag.

Setup (dashboard, done by the team):

1. Google Cloud → OAuth client (Web):
   - **Authorized JavaScript origins:** `http://localhost:3000` and the Vercel domain.
   - **Authorized redirect URI:** `https://mjhgzyecleviqoogqejc.supabase.co/auth/v1/callback`.
2. Supabase → Authentication → Sign In / Providers → Google: enable it and paste the client ID and secret.
3. Supabase → Authentication → URL Configuration:
   - Set the Site URL to the Vercel domain.
   - Add Redirect URLs **with a trailing `/**`**: `http://localhost:3000/**`, `https://<vercel-domain>/**`, and `https://*-<vercel-team>.vercel.app/**` for previews.
   - The callback URLs carry `?next=` and `?via=`, so an exact `/auth/callback` entry would not match.

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

- **Local Supabase (optional now)**: on this PC, Windows reports that hardware virtualization is turned off. Enable Intel VT-x or AMD SVM in the BIOS, then run `wsl --install` as administrator and reboot. Staging covers the checks until then.
- **Staging auth URLs (dashboard)**: see "Google sign-in" above. Use `/**` patterns, not exact `/auth/callback` entries.
- **Vercel project**: authorize the Vercel connector (`/mcp`) or install the Vercel CLI. Then create the project and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SITE_URL`.
- **First owner**: sign up in the app with your own email and confirm it. Then run `supabase/scripts/bootstrap-owner.sql` with that email.
- **Email sign-up end to end**: not covered by automated tests on staging, because the built-in mailer only sends to team members. Check it by hand while creating the first owner.
- **Still open from the build plan**: the target age group (decides consent at sign-up), confirmation of the owner role, the three regions (seeded as placeholders), recipe sources, the cultural verifier, and ElevenLabs access.
- **Before release**: replace `public/favicon.ico` (still the create-next-app placeholder), and add a nonce-based Content Security Policy.

## Phase 2 starting points

- FR-11 review queue UI: build on `review_content()` and `POST /api/review/...`. Its errors map to 403 (role or four-eyes), 409 (preconditions) and 400 (missing reason).
- FR-12 AI jobs: a server-only module using `SUPABASE_SECRET_KEY`. `guard_approval` already keeps it to drafts. Cache on `ai_jobs (job_type, input_hash)`.
- FR-05 audio: `story_chapters.audio_hash` (sha256) and `audio_url`. Create a Storage bucket in a new migration with RLS on `storage.objects`.
- FR-10 badges: award through a SECURITY DEFINER function, not client writes.
