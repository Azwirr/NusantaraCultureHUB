# AI development log: Nusantara Culture Hub

This log records how AI (Claude Code) was used to build the project: what it did, what the team decided, what was checked, and what is still open. It covers 22 to 24 October 2026. Secrets and personal data are not recorded.

## Roles

- **Team lead and owner:** zwirr. Approves content and every commit or push. Holds the only owner role.
- **Builder:** the user (azwirr), who directs the work and makes the product decisions.
- **AI assistant:** Claude Code. Writes code, database migrations and tests, and researches content. It never approves content and never pushes without a yes.

## Timeline

| Date | What happened | Who decided |
| --- | --- | --- |
| 22 Oct | Phase 1 foundation: Next.js, Supabase, roles, row-level security, the content approval trigger. Built on hosted staging. | Team |
| 23 Oct | Phase 2 (M1 to M4): review queue, design v2, saves, search and a region map. Live background, then Phase 2b: owner approval, story requests and a settings page. | User (scope); Claude (code) |
| 23 Oct | Content batch 1: Timun Mas rewritten from its source, recipe corrections, 15 cited sources. | Claude drafted; owner to approve |
| 23 Oct | Collaborator dataset rejected: checked against the internet, not loadable. Documented in `dataset-review-ensiklopedia.md`. | User; Claude reviewed |
| 23 Oct | Phase 2c: merged Saved into My collection, account menu, seven-island map, content batch 2 (6 regions, 18 sourced items). | User approved the plan |
| 23 Oct | Phase 2d: the AI workflow may publish items that cite two different websites. Built as one database function with tests, logged as AI workflow. | User approved the plan |
| 23 Oct | 37 items published on staging by the AI workflow. Public text changed from "reviewer approved" to "checked against sources". | User decided the rule |
| 23 Oct | Pictures: licensed Wikimedia Commons photos for dress, recipes and story cards. Camera try-on studio built. | User asked; Claude searched and checked each licence |
| 23 Oct | AI image generation tested with the gateway key. Blocked: the account needs a card on file. | Waiting on the user |

## What the AI did

- **Code:** pages, components, the content loaders, the camera try-on studio, and the account menu.
- **Database:** every schema change is a migration in `supabase/migrations`, with row-level security on each new table, and pgTAP tests for the rules. About 233 database checks pass.
- **Content:** drafted stories, recipes and dress items in Indonesian and English. Each item cites real sources that Claude opened and checked. Claude never invented a source; where a second source could not be confirmed, the item stayed a draft.
- **Pictures:** searched Wikimedia Commons, opened each file page, and recorded the author and licence. Files with unclear licences were left out.
- **Tests:** unit tests, database tests and end-to-end browser tests across both languages and phone widths, plus an accessibility check.

## Decisions the team made (recorded as decisions in `build-plan.md`)

- Claude may draft content. Only the owner approves, including drafts the owner corrected.
- Members never write content; they ask for stories on `/requests`.
- Claude may publish widely documented heritage itself, but only when an item cites two different websites, the database checks it, and it is logged as the AI workflow.
- Tanya Nusantara (the grounded assistant) is allowed as members-only, answering only from approved, sourced content. Not built yet.
- Try-on runs in the browser; photos are never uploaded or stored.

## Safety checks

- The approval trigger still blocks anyone from approving what they created or last edited. The AI workflow can only publish, through one function that checks sources.
- Keys stay on the server. The gateway key lives in `.env.local` and must be added to Vercel's environment variables, not `NEXT_PUBLIC_`.
- Several incidents were caught by tests before release: a draft fixture that had to stay hidden, a missing media table in the schema test, a header covered by page content, and ESLint picking up a tool folder.
- Flaky browser tests were re-run and fixed where the cause was a timing assumption. No failing test was hidden.

## Known gaps

- Timun Mas, rok rumbai and payas agung have no verified picture yet.
- Nasi timbel, ikan kuah kuning and papeda have no servings or cooking time in any source, so they remain drafts.
- Story illustrations and audio are not generated. Image generation needs a card on the gateway account; voice playback is not built.
- The live site runs an older build until the latest commits are pushed.
- Camera try-on has not been tested with a real camera in a browser.
- AI-generated images, if added, must be labelled as generated and checked against sources before publishing.

## How to continue

1. Add a card to the Vercel AI Gateway account, then generate the three missing pictures.
2. The owner reviews drafts in `/review` and approves the regions first.
3. Push to production once the latest commits pass the full acceptance run.
