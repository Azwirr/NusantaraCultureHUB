# PRD: Nusantara Culture Hub (MVP)

Oct 22, 2026 · @Azwir

## Overview

Nusantara Culture Hub is a bilingual (Indonesian and English) web app that makes Indonesian culture easy to explore through three pillars: a baju adat try-on, a traditional recipe book, and folklore told with audio and illustrations.

Gen Z and Gen Alpha engage more with games and short digital content than with static archives, so local stories risk being forgotten. The app meets them where they already are, and gives blind users full access to the folklore through audio.

The product is built for the IT Festival 2026 competition. The MVP is scoped to be finished and demonstrated within the festival timeline.

## Goals and success metrics

Success means all three pillars work end to end, and the audio story is usable by blind listeners. Targets below are proposals; the team confirms them before build.

| Goal | Metric | Proposed target | How it is measured |
| --- | --- | --- | --- |
| Accessible folklore | Blind or low-vision testers who finish chapter 1 with a screen reader | 3 of 3 | Moderated test before the festival |
| Accessible folklore | Screen-reader and keyboard coverage of the player | 100% of controls | Manual check against the controls list |
| Accessible pages | Lighthouse accessibility score | 90 or higher | Lighthouse on the library and story pages |
| Engagement | Listeners who reach the last chapter of story 1 | 40% or higher | Anonymous playback events, no personal data |
| Culture reach | Published recipes with at least one source | 10 of 10 | Reviewer checklist in the content tool |
| Try-on quality | Test photos where a pose is detected in good light | 9 of 10 | Test set of 10 photos, solo and couple |
| Demo readiness | Golden path runs without errors | Live or backup video in under 3 minutes | Dry run with the full team |

## Users and roles

Five roles cover the product. Owner is an assumption for the role listed as "Other" and needs confirmation.

| Role | Who | Can | Cannot |
| --- | --- | --- | --- |
| Guest | Any visitor, no sign-in | Browse approved content and use try-on on the device | Save progress to a server, see drafts |
| Member | Signed-in user | Read and listen, save progress and bookmarks of approved content, earn badges, ask the grounded assistant within a daily limit, request new stories (5 a day) | Write or edit content, change review status, see drafts, grant roles, bookmark drafts |
| Reviewer | Curator, a human | Create and edit drafts, run AI jobs, approve or reject content, unpublish, read the audit log, triage story requests | Grant roles, delete content, approve their own work |
| AI Workflow | System actor, no login | Generate chapter drafts, image prompts, and audio through a server job | Approve anything, publish anything, write outside draft status |
| Owner | Team lead (`zwirr`) | Grant and revoke roles; review like a Reviewer, and approve drafts they corrected (Phase 2b) | Approve content they created |

Roles are assigned on the server only. Users cannot change their own role.

## Features

Seventeen requirements make up the MVP: ten are must-haves and seven are should-haves. FR-14 to FR-17 were added on 2026-10-23 (Phase 2 and 2b). If time runs short, cut the should-haves first, starting with the assistant, then the region map and pages.

| ID | Area | Requirement | Priority |
| --- | --- | --- | --- |
| FR-01 | Landing | Show the three pillars with links into the library. One mode only. | Must |
| FR-02 | Library | Browse approved stories, recipes, and costumes. Search by title and filter by region and type. | Must |
| FR-03 | Region pages | One page per region, listing its story, recipe, and costume. | Should |
| FR-04 | Story player | Play chapters in order. Each chapter shows its text, its illustration with alt text, and its audio description before the audio. Controls follow the player spec in the diagrams. | Must |
| FR-05 | Story audio | Generate audio per chapter with TTS. Reuse cached audio when the text and voice are unchanged. Fall back to Web Speech if TTS fails. | Must |
| FR-06 | Illustrations | One fixed art style per story. The reviewer accepts an image or requests a new one. | Must |
| FR-07 | Recipe book | Recipe list and detail pages with bilingual names, ingredients, steps, servings, and dietary tags. Halal shows only when verified. | Must |
| FR-08 | Try-on, solo | Use the camera or an in-browser photo. Detect the pose, overlay a costume, allow scale and move, and download a watermarked photo. | Should |
| FR-09 | Try-on, couple | Detect two people and overlay a costume on each. | Should |
| FR-10 | Badges | A Member earns a badge for finishing story 1 and for cooking the first recipe. | Should |
| FR-11 | Review queue | List drafts by type and status. Edit fields. Approve, reject with a reason, or unpublish. | Must |
| FR-12 | AI jobs | Start a job, see its status, and reuse cached output. Jobs run on the server only. | Must |
| FR-13 | Audit log | Record every approval, rejection, unpublish, and role change with the actor, time, and reason. | Must |
| FR-14 | Search | Search approved stories, recipes, costumes, and regions from the header (Ctrl+K) and from `/search?q=`. Results are grouped by type, in the visitor's language, and tolerate typos. Drafts are never returned, to anyone. The search term is shown as plain text. | Must |
| FR-15 | Grounded assistant "Tanya Nusantara" | Members ask a question about Indonesian culture. The answer is built only from approved, sourced content found by FR-14, cites each item it used with a link and its sources, and politely declines anything outside the archive. A daily limit per member keeps costs safe. No question text is stored. This is not free-form chat. | Should |
| FR-16 | Region map | `/regions` shows a keyboard-accessible province map (Natural Earth, public domain) that opens each region page, with a list fallback below. It is for navigation only, with no game mechanics. | Should |
| FR-17 | Story requests | Members ask for a new story, recipe or dress on `/requests` (title and short note, 5 a day). Everyone sees visible requests with the nickname only; staff plan, close or hide them. Requests never become content by themselves. | Should |

## Content pipeline

Every story moves through these steps. The AI drafts, and only a reviewer can approve.

&#91;embedded content: story content flow, two review gates\]

Recipes and costumes skip chaptering and audio, but they pass the same review gate before they go live.

## Data model

The schema has 16 tables, plus two member tables added in Phase 2 (bookmarks and assistant_usage). Every content table carries one review status, and only approved rows are public. The full ERD and the RLS policies come from the build spec.

| Table | Purpose | Key fields |
| --- | --- | --- |
| profiles | Member identity, linked to the auth user | id, username, created\_at |
| user\_roles | Reviewer and Owner grants; written by Owner only | user\_id, role |
| regions | Region pages, the map, and the filter for every content type | slug, name\_id, name\_en, summary\_id, summary\_en, province\_codes, sort\_order, review\_status |
| stories | Folklore title and summary | region\_id, slug, title\_id, title\_en, summary\_en, review\_status |
| story\_chapters | Chapter text, audio, and illustration | story\_id, chapter\_no, text\_id, text\_en, audio\_description, image\_alt, audio\_url, audio\_hash |
| recipes | Recipe header and dietary data | region\_id, name\_id, name\_en, servings, minutes, dietary\_tags, halal\_status |
| recipe\_ingredients | Ingredient list in order | recipe\_id, position, name\_id, name\_en, amount, unit |
| recipe\_steps | Cooking steps in order | recipe\_id, step\_no, text\_id, text\_en, timer\_seconds |
| costumes | Try-on asset and its info card | region\_id, name\_id, info\_en, layers, anchor\_points, reference\_image\_url |
| sources | Citation for any content | title, url, license, credit |
| content\_sources | Links sources to content of any type | content\_type, content\_id, source\_id |
| badges | Badge definitions | code, name\_en, rule\_key |
| user\_badges | Badges a Member has earned | user\_id, badge\_id, earned\_at |
| user\_progress | Story progress per Member, one row per story | user\_id, story\_id, last\_chapter\_no, updated\_at |
| ai\_jobs | Every AI request, with its cache key | job\_type, target\_type, target\_id, input\_hash, status, output, model |
| audit\_log | Who changed what, and why | actor\_id, actor\_type, action, entity, entity\_id, reason |
| bookmarks | A Member's saved items, approved content only (Phase 2) | user\_id, content\_type, content\_id, created\_at |
| assistant\_usage | Questions asked per Member per day; counts only, no text (Phase 2) | user\_id, usage\_date, question\_count |

No table stores user photos. Try-on has no upload endpoint.

## Non-functional requirements

These apply to every feature. Each one has a check the team can run before the festival.

| Area | Requirement | How it is checked |
| --- | --- | --- |
| Accessibility | WCAG 2.1 AA on all pages. Every player control has a label and works by keyboard. | Lighthouse score and a manual keyboard pass |
| Accessibility | Screen-reader users hear each chapter's audio description before its audio. | Test with TalkBack or VoiceOver |
| Privacy | Try-on photos are processed in the browser and never uploaded. | Network tab shows no image upload |
| Privacy | Players use a nickname. No real name or email is collected from Guests or Members beyond sign-in. | Schema review |
| Privacy | Uploaded images have location metadata removed. | Upload test with a geotagged photo |
| Security | Roles are checked on the server and in the database, never only in the UI. | RLS tests as each role |
| Security | API keys stay on the server. | Build scan for keys in client bundles |
| Security | Any user-entered text, such as search terms and nicknames, is rendered as plain text, never as HTML. | Test with an HTML payload |
| Performance | AI output and audio are generated once and cached. | Two identical requests make one call |
| Performance | Story and library pages load within 3 seconds on a mid-range phone on 4G. | Lighthouse performance check |
| Responsive | No horizontal scroll at 360 px width. | Browser device emulation |
| Language | Every visible text has an Indonesian and an English version. | Missing-field check in the build |
| Licensing | Every asset, font, and sound has a licence and a credit line. | Asset list reviewed before release |

## Acceptance criteria

The MVP is done when all eleven checks pass. Each check is a yes or no, and the team runs them on the staging site.

1. A Guest opens a story and hears chapter 1 with no sign-in.
2. A Guest querying with the public key sees no draft rows.
3. A Member cannot change a review status or write to user\_roles.
4. An AI job cannot set a row to approved. The database rejects it.
5. A story cannot be approved while any chapter lacks alt text or an audio description.
6. Generating audio twice for the same chapter makes one TTS call, not two.
7. The player works with keyboard only, and every control has a label.
8. Lighthouse accessibility scores at least 90 on the story and library pages.
9. Try-on works in couple mode, and the network tab shows no image upload.
10. No horizontal scroll at 360 px width.
11. A recipe shows no halal label unless halal\_status is verified\_by\_source.

## Out of scope

These are not built for the festival MVP. RPG mode and map game mechanics are dropped. A navigation map (FR-16) and the grounded assistant (FR-15) are allowed; they are not a map game or free-form chat.

- Community story submissions and moderation queues (story requests, FR-17, are allowed: they are suggestions, not content)
- Video generation from stories
- Free-form AI chat with characters
- Realistic cloth simulation in try-on
- Storing user photos or accounts beyond sign-in
- Payments, comments, and a native mobile app

## Open questions

- [ ] Confirm the Owner role, or name what "Other" should be.
- [ ] Choose the three regions, three costumes, and first two legends.
- [ ] Name the recipe sources: family, a cookbook, or a community partner.
- [ ] Confirm ElevenLabs access and the free-tier limit. If unavailable, Web Speech is the fallback.
- [ ] Confirm the target age group. This decides the privacy scope in the non-functional requirements.
- [ ] Confirm the festival date and the judging rubric.
