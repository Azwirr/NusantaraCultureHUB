# Build Plan: Nusantara Culture Hub

Oct 22, 2026 · @Azwir

Build starts after seven decisions are made. Then four tracks run in parallel for 12 working days, and the foundation is built in one Emergent pass on day 1. Days are relative until the festival date is confirmed.

## Before build

These seven decisions block the start. Owners and due days are blank until the team assigns them.

| Decision | What it unblocks | Owner | Due |
| --- | --- | --- | --- |
| Target age group | Privacy scope and consent flow | TBD | Day 1 |
| Owner role, and what "Other" means | Role grants and RLS policies | TBD | Day 1 |
| UI language: bilingual or English only | Every visible text field | TBD | Day 1 |
| Three regions, three costumes, two legends | All content tracks | TBD | Day 2 |
| Recipe sources: family, cookbook, or partner | Recipe track | TBD | Day 2 |
| Who verifies cultural content | Review gate and sign-off | TBD | Day 2 |
| ElevenLabs access and free-tier limit | Audio track and its fallback | TBD | Day 3 |

The festival date and judging rubric set the timeline in section 3. They do not block the build.

## Work tracks

Four tracks run in parallel after the foundation. Track B goes first, because the other tracks need its schema and sign-in before they can merge.

| Track | Owner | Deliverables | Depends on |
| --- | --- | --- | --- |
| A. Try-on | Member 1 | FR-08 and FR-09: three costumes, solo and couple mode, watermarked download. Test set of 10 photos. | Costume assets; foundation from B |
| B. Data, auth, RLS | Member 2 | Foundation build, schema, RLS policies, audit log, FR-11 review queue, FR-13 audit. Role tests for acceptance checks 2 to 4. | Owner role decision |
| C. Audio story and AI | Member 3 | FR-04 player, FR-05 audio with cache, FR-06 illustrations, FR-12 AI jobs. Story 1 with five chapters. | Foundation from B; ElevenLabs decision |
| D. Content, recipes, design | Member 4 | FR-01 landing, FR-02 library, FR-07 ten recipes, story 1 text and images. FR-03 region pages and FR-10 badges if time allows. | Recipe sources; verifier; language decision |

## Timeline

Each phase ends at a gate. A failed gate stops the next phase until the team fixes the cause.

&#91;embedded content: build roadmap, five phases, four gates\]

The phases are equal widths, not to scale. Real dates come once the festival date is set.

## Emergent foundation prompt

Paste this into Emergent after the seven decisions close. It covers Track B and the shared shell only. Features follow in the four tracks.

```text
Build the foundation of "Nusantara Culture Hub". Phase 1 only: no features beyond this list.

STACK
- Next.js (App Router), TypeScript, Tailwind CSS
- Supabase: Auth, Postgres, Storage
- Ready to deploy to Vercel. No other frameworks.
- All API keys are server-side only. Never prefix a secret with NEXT_PUBLIC_.

ROLES
- guest: no login. Reads approved rows only.
- member: Supabase Auth user with a profiles row.
- reviewer: has a user_roles row with role = 'reviewer'.
- owner: has a user_roles row with role = 'owner'. Grants roles only.
- AI Workflow: a server module with no login and no UI. Writes draft rows only.
- Roles are assigned on the server. A user can never set their own role.

DATABASE
Create these tables: profiles, user_roles, regions, stories, story_chapters, recipes, recipe_ingredients, recipe_steps, costumes, sources, content_sources, badges, user_badges, user_progress, ai_jobs, audit_log.
- uuid primary keys and created_at timestamps on every table.
- Paired text fields: name_id and name_en, title_id and title_en, and so on.
- review_status text, checked to one of: draft, approved, rejected, unpublished.
- profiles.id references auth.users.id.
- Use only the columns in the Data model table of the attached PRD.

SECURITY
- Enable RLS on every table.
- Public read: approved rows only.
- Member: read and update own profiles row, own user_progress, own user_badges.
- Reviewer: read all content, create and edit drafts, change review_status.
- Nobody except owner can insert or update user_roles.
- Create trigger guard_approval on regions, stories, story_chapters, recipes, and costumes. It raises an error unless the caller is a reviewer or owner.
- Every review action writes an audit_log row with actor, action, entity, and reason.

ROUTES (placeholder pages only; the shell and navigation are real)
/, /library, /regions/[slug], /stories/[slug], /recipes/[slug], /try-on, /me, /login, /signup, /review

API ROUTES (check the role on the server for every call)
- POST /api/ai/jobs: reviewer only. Stub, returns 501.
- POST /api/review/[type]/[id]/approve, /reject, /unpublish: reviewer only. Reject requires a reason.
- POST /api/progress: member only. Stub, returns 501.

SEED DATA
- 3 regions: Jawa, Minangkabau, Bugis (pending confirmation; mark as placeholders).
- 1 story with 5 chapters, text only, approved.
- 2 recipes, approved, with dietary_tags and halal_status = unknown.
- 3 costumes, draft, with placeholder images.
- 3 badges.

ACCEPTANCE (all must pass before Phase 2)
1. The app builds and deploys to a Vercel preview.
2. The migration runs on a fresh Supabase project with no errors.
3. An anonymous client sees approved rows only.
4. A member cannot change review_status or user_roles.
5. An anonymous client gets 401 or 403 from every review route.
6. An update to approved status from a caller without a reviewer role is rejected, including calls with no auth user.
7. Every route renders at 360 px width with no horizontal scroll.
8. No secret appears in the client bundle.

NON-GOALS
No AI calls, no audio, no try-on, no community submissions, no video, no payments.
```

## Decision log

Fourteen decisions are recorded so far. Add a row whenever a blocking decision closes.

| Date | Decision | Where it lives |
| --- | --- | --- |
| 2026-10-22 | Admin role replaced by Reviewer. AI Workflow added as a system actor with no login. | PRD, section 3 |
| 2026-10-22 | Owner role assumed for "Other". Needs confirmation. | PRD, section 3 |
| 2026-10-22 | Scope narrowed to three pillars: try-on, recipe book, and audio folklore. | PRD, section 4 |
| 2026-10-22 | Community submissions, video, and free-form AI chat moved out of the MVP. | PRD, section 8 |
| 2026-10-22 | RPG mode dropped. The landing page shows content directly, with no mode choice. | PRD, section 4 |
| 2026-10-22 | Try-on runs in the browser only. No photos are stored. | PRD, section 7 |
| 2026-10-22 | Audio is generated once per chapter and cached by hash. | PRD, FR-05 |
| 2026-10-23 | `zwirr` is the first owner (operator bootstrap, recorded in the audit log). A second human reviewer is still needed before any content can go live. | PRD, section 3; `docs/phase-1-foundation.md` |
| 2026-10-23 | The assistant "Tanya Nusantara" is allowed as grounded Q&A: it answers only from approved, sourced content and cites it. Members only, with a daily limit. Free-form AI chat stays out of scope. | PRD, FR-15 and section 8; CLAUDE.md |
| 2026-10-23 | A navigation map on `/regions` is allowed. "Map mode" in CLAUDE.md now means a map game, which stays out of scope. | PRD, FR-16; CLAUDE.md |
| 2026-10-23 | Search (FR-14) and bookmarks for members join the MVP. Bookmarks only hold approved content. | PRD, FR-14 and section 3 |
| 2026-10-23 | The reviewed content and the design v2 pages ship together in Phase 2. | `docs/phase-2-plan.md` |
| 2026-10-23 | Claude researches and drafts content from checked sources; the owner approves alone, including drafts they corrected. Reviewers keep four-eyes; nobody approves what they created. | `docs/phase-2b-plan.md`; migration part 13 |
| 2026-10-23 | Members read and listen only, and ask for new content on `/requests`. | PRD FR-17; migration part 14 |
