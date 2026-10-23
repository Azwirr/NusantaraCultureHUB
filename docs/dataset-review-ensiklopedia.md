# Review: "Ensiklopedia Budaya Indonesia 38 Provinsi" (collaborator zip)

Oct 23, 2026 · Reviewed before any import. Nothing from it was loaded.

## What it is

`ensiklopedia_budaya_indonesia.zip` (29 MB): 380 entries, 10 per province for all 38 provinces (114 traditional dress, 114 folk tales, 152 dishes), as CSV, Excel and Markdown, plus 380 JPG files and the Python scripts that generated them. The scripts were read as text only; none was run.

## Verdict: not loadable as it is

It fails the project's content rules (CLAUDE.md, PRD), independent of how accurate each entry is:

| Rule | What the dataset has |
| --- | --- |
| Every item cites a source a reviewer can check | No source, URL or reference on any of the 380 entries. The "Terverifikasi" (verified) label is a hard-coded string in `build_all_provinces.py`, not the result of a check |
| Both languages on every visible field | Indonesian only |
| Recipes have ingredients with amounts, and steps | Dishes have a one-line ingredient list, a taste profile and a description. No amounts, servings, times or steps |
| Stories have chapters with alt text and an audio description | One-paragraph synopses with a character list and a moral |
| Every image has a licence and a credit | 216 photos were fetched automatically by keyword search on Wikimedia Commons, with TLS verification turned off and no author or licence recorded. Commons images need attribution, and a keyword match is often the wrong subject. The other 164 files (under 12 KB) are generated placeholders |
| Seed data comes from `docs/content-seed.md` | It would replace the agreed content seed |

## Accuracy spot checks

Three entries that looked misplaced, checked against outside sources:

| Entry in the dataset | Finding |
| --- | --- |
| Kalimantan Selatan: "Legenda Danau Lipan di Muara Kaman" | Wrong province. Muara Kaman is in Kutai Kartanegara, **Kalimantan Timur** ([GNFI](https://www.goodnewsfromindonesia.id/2024/11/23/legenda-asal-usul-danau-lipan-padang-luas-yang-ada-di-kutai-kartanegara-kalimantan-timur), [Wikipedia](https://en.wikipedia.org/wiki/Legend_of_the_Centipede_Lake)) |
| Sumatera Utara: "Dendeng Balado Batokok Medan" | Wrong province. Dendeng batokok is Minangkabau, **Sumatera Barat** ([Wikipedia](https://en.wikipedia.org/wiki/Dendeng)); the same dataset also lists it under Sumatera Barat |
| Papua Barat Daya: "Udang Selingkuh" (Sorong) | Wrong province. Udang selingkuh comes from Wamena and the Baliem valley, **Papua Pegunungan** ([indonesia.travel](https://www.indonesia.travel/id-id/travel-ideas/gastronomy/udang-selingkuh/), [Mongabay](https://mongabay.co.id/2023/06/22/ada-udang-selingkuh-di-papua-seperti-apa/)) |

Also noticed, not yet checked against sources:

- History presented as legend: "Kisah Sultan Ageng Tirtayasa", "Legenda Pulau Mansinam dan Dua Misionaris" (the 1855 arrival of Ottow and Geissler).
- Commercial or non-dish entries: "Roti Gulung Abon Khas Sorong (Hawai Bakery)" names a shop; "Kopi Arabika Wamena" is a crop.
- Possible duplicates or mix-ups: "Baamar Galung" appears for both Kalimantan Tengah (Dayak) and Kalimantan Selatan (Banjar); "Si Pahit Lidah" appears in three provinces.
- Garbled names, for example "Baju Pengantin Betawi Care None".

Three of three spot checks failed, so the rest cannot be trusted without checking each entry.

## How it can still help

As a list of **topics to research**, it is useful: many entries are well known (Sangkuriang, Roro Jonggrang, Danau Toba, pempek, rawon, rujak cingur, ayam betutu, coto Makassar, baju bodo). A safe path:

1. Pick a few entries for the three seeded regions (Jawa, Minangkabau, Bugis-Makassar), for example Sabai Nan Aluih, Ayam Pop, Roro Jonggrang, Rujak Cingur, Baju Tutu.
2. For each, find a real source (a cookbook, a museum, Kemendikbud, indonesia.travel), write the full text in both languages, and add it to `docs/content-seed.md`.
3. Load it as a draft through `supabase/seed.sql`, and let two reviewers approve it.

Do not import the images. Use photos with a known licence and credit, or the project's own line art.
