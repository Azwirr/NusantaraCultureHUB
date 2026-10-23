# Asset credits

Oct 22, 2026 · Phase 1

Every font, icon, image and sound that ships with Nusantara Culture Hub is listed here with its licence and credit line (PRD, non-functional requirements: Licensing). Add a row whenever an asset is added, and remove it when the asset is removed.

## Fonts

Both fonts are downloaded at build time by `next/font/google` and served from our own domain. Visitors' browsers never contact Google.

| Asset | Where it is used | Licence | Credit |
| --- | --- | --- | --- |
| Merriweather (300, 400, 700; italic 300, 400) | Headings, story text, italic subtitles | SIL Open Font License 1.1 | Merriweather by Sorkin Type Co. (Eben Sorkin) |
| Plus Jakarta Sans (400, 500, 600, 700) | Interface text | SIL Open Font License 1.1 | Plus Jakarta Sans by Tokotype (Gumpita Rahayu) |

## Icons

| Asset | Where it is used | Licence | Credit |
| --- | --- | --- | --- |
| lucide-react | Interface icons across the app | ISC License | Lucide Contributors; portions derived from Feather by Cole Bemis (MIT) |
| Google "G" mark | "Continue with Google" button (`src/components/auth/google-sign-in.tsx`) | Google trademark, used as the Google Sign-In branding guidelines allow | Google LLC |

## Project-owned artwork

Drawn for this project as inline SVG in `src/components/line-art.tsx` and `src/components/motif-divider.tsx`. No third-party source, no AI generation. Owned by the Nusantara Culture Hub team.

| Asset | Where it is used | Description |
| --- | --- | --- |
| BrandMark | Header | Indigo tile with a kawung node |
| HeroArt | Home hero | Sketchbook plate with a kawung lattice |
| CostumeArt | Home try-on pillar, /try-on | Kebaya and kain on a hanger |
| RecipeArt | Home recipe pillar, /recipes placeholder | Cobek and ulekan with chilli and bay leaf |
| StoryArt | Home story pillar, /stories placeholder | Gunungan (kayon) with sound arcs |
| MotifDivider | Home | Two 1px rules meeting at a kawung node |
| WayangArt | Home hero collage (Phase 2) | Wayang kulit figure in profile on its rod |
| RumahGadangArt | Home hero collage and regions teaser (Phase 2) | Rumah gadang with gonjong roof horns |
| BatikArt | Home hero collage (Phase 2) | A strip of batik parang |
| `public/placeholders/costume-*.svg` (3 files) | Costume reference image until a reviewed photo exists (Phase 2) | Line drawings of Pengantin Jawa, Bundo Kanduang and Baju Bodo. Placeholders, not references: reviewers replace them |

## Other files

| Asset | Licence | Note |
| --- | --- | --- |
| Nusantara logo (`public/brand/logo-*.png`, `src/app/icon.png`, `src/app/apple-icon.png`, `src/app/opengraph-image.jpg`) | Provided by the team (zwirr), 2026-10-23 | Header logo, browser-tab icon and link-preview image. Confirm who made it and its licence before release (if it was made with an image generator, note the tool and its terms) |

## Not shipped

The Stitch exports in `design/stitch/` are design references only. Their hot-linked images and icon font are not used anywhere in the app.

No sounds or photographs ship in Phase 1.
