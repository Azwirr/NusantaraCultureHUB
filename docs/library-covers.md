# Library covers

Requested by the owner on 24 October 2026: replace repeated line-art placeholders
with individual, relevant covers for the library's 15 dress items, 23 recipe entries and
15 folk tales (three recipe entries remain drafts). The files are bundled in `public/covers/`, so the visitor does not
depend on Wikimedia redirects or another site's image server.

`src/lib/media/covers.json` is the complete asset register: each entry has an
item type and slug, a local URL, Indonesian and English descriptions, attribution,
licence and (for photos) the original Commons file page and licence link.
`docs/cover-prompts.json` records the prompts for generated illustrations.

## Visual direction

Warm paper, natural light, indigo and earth colours match the existing archive.
Food images show the actual named dish; dress images keep the relevant garments
and headwear visible. Fictional scenes from folk tales are illustrations.
Generated artwork is labelled **Ilustrasi AI / AI illustration** wherever shown;
it is an interpretive cover, not historical evidence or a reference photograph.

The owner requested illustrated Ulos and Baju Bodo covers as well. These use
versioned v2 URLs so existing image caches do not keep showing the old photos.
All fifteen dress covers are now illustrations; the complete catalog contains
59 illustrations and 16 licensed photographs. Older replaced photos remain
archived with their original attribution in `library-cover-credits.md`.

Licensed photographs retain the photographer's credit and a link to their
Commons page, plus the applicable Creative Commons licence link. Resizing and
WebP conversion are the only modifications to downloaded photographs. Card
layouts crop images using CSS; the original composition is preserved in files.

## References

- Ulos: https://www.indonesia.travel/id/en/travel-ideas/the-batak-ulos-handwoven-textile
- Payas agung: https://disbudpar.bulelengkab.go.id/informasi/detail/artikel/69-payas-agung
- Baju bodo: https://www.indonesia.travel/id/id/travel-ideas/culture/baju-bodo/
- Ayam betutu: https://www.indonesia.travel/id/id/travel-ideas/gastronomy/ayam-betutu-balis-iconic-spiced-chicken-dish
- Gudeg: https://kebudayaan.jogjakota.go.id/page/index/gudeg
- Papeda and yellow fish broth: https://dispar.malukuprov.go.id/destinasi/papeda-dan-ikan-kuah-kuning
- The item's existing sources and the plot in `supabase/content/` guide story covers.

## Integration

The existing content loader first loads the item through Supabase RLS. It then
resolves a local cover by type and slug; its existing database media remain the
fallback for any future items. No publication status or reviewed text changes.
Cards, recipe/dress/story detail pages and saved-item thumbnails use these assets.
Local images use Next Image; their dimensions reserve space before loading.

## Reproduction

`node scripts/prepare-covers.mjs` fetches the existing Commons media seed's files,
checks the current licence metadata, and saves attributed WebP derivatives.
It batches metadata requests and backs off when Commons returns 429/503.
Existing catalog entries are preserved, including deliberately chosen AI covers.

Generated originals were made with the built-in `image_gen` tool. A local
working job list in `tmp/covers/generated-jobs.json` holds the returned paths.
`node scripts/install-generated-covers.mjs` installs and optimizes those files.
The job list and originals are working files, not required to build the app.

## Verification (24 October 2026)

`npm run acceptance` passed: lint, typecheck, 79 unit tests, 233 database
assertions, production build, secret scan and 134 browser tests (1 skipped).
Cover checks verify all 33 WebP responses and published dress-card images and
attribution. Desktop previews cover all three categories; the 390px mobile
preview has no horizontal overflow. The cover batch was committed as `262c95f`
and pushed to main during the following camera-studio task.


The expanded collection includes 53 chapter-specific illustrations, 20 earlier additional covers (seven reuse chapter-one artwork), and complete three-part references for 15 outfits. The 24 October culture batch adds 20 ceremony illustrations, two recipe covers and a new Putri Junjung Buih illustration. See `project-media-prompts.json` and `project-media-plan.md`. Media lookup happens only after the content passes its existing RLS read; installing an asset never publishes a draft.
