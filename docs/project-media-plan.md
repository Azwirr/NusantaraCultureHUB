# Complete project media

Requested by the owner on 24 October 2026 while the AI portrait studio was
being built. The published inventory now contains 15 stories, 20 recipes and
15 costumes. Existing draft-only covers are retained as well.

The snapshot requires 53 chapter illustrations, seven recipe covers, six new
costume covers, and six new three-part outfit atlases. Seven missing story
covers reuse their first chapter illustration. Total: 72 generation calls;
all image generation uses the built-in OpenAI image_gen tool, not the app's
paid gateway key. Ulos/Baju Bodo v2 covers were generated just before this batch.

Each scene follows its approved bilingual chapter and alt text. Characters and
palette are fixed in the prompts for each story; sensitive mythic scenes are
symbolic and non-graphic. Illustrations are interpretive AI art, never a claim
of historical/documentary accuracy. Existing credited food/landscape photos
remain where they already suit the interface. Recipe steps have no picture slot;
maps, icons and intentional line-art decorations do not need unrelated photos.

The atlases provide head, upper and lower references for the portrait provider.
Only transparent gutters are sliced; if pieces overlap, that atlas is flagged
for repair rather than cutting garment artwork. Supporting garments for an
item such as the Ti'i Langga hat are simple styling, not a new cultural claim.

Assets install locally after RLS has loaded public content. No approval status,
story text, source citation or database content is changed by the media job.
Prompts/provenance are recorded in `project-media-prompts.json`; chapter assets
are registered in `src/lib/media/chapters.json` and covers in `covers.json`.

Working snapshots/results are ignored under `tmp/media/`. Generate the job list
with `node scripts/plan-media-assets.mjs`; install available completed results
with `node scripts/install-project-media.mjs`. Keep final image files in
`public/`; generated originals in the tool's output directory are not a runtime
dependency. Installation can run incrementally without repeating image calls.

All 72 jobs completed on 24 October 2026. Installation produced 53 catalog
covers, 53 chapter images and 45 outfit parts (including the previous assets).
All six new atlases had transparent gutters and were split without crossing
garment artwork. Contact sheets were visually checked for scene relevance,
complete outfits and consistent illustration style. No database approval or
publication action was performed.

Verification: production build, 110 unit tests, 258 database assertions and
client secret scan passed. The first browser run passed 135 tests, skipped
three and failed nine. Four axe timeouts plus bookmark/review timing failures
passed with one worker. The old compositor had also been reintroduced beside
the portrait UI; it was removed to honor the owner's requested replacement.
After correcting the exact portrait selector and waiting for photo processing
before consent, all five portrait browser tests passed. All nine original
browser failures are resolved across the targeted reruns; this is not a claim
that the first full acceptance command exited successfully.

No paid app image-generation call, commit, push or deployment was performed.
