# Culture batch 9: new food entries and visual coverage

Research checked: 24 October 2026. Both recipes are bilingual drafts, with citations attached in `supabase/content/2026-10-24-batch-9-recipes.sql`. They remain unpublished. The recipe sources do not state consistent servings or total preparation time, so those fields are left blank rather than estimated.

| Entry | Cultural origin used in the catalog | What the checked sources support | Sources |
| --- | --- | --- | --- |
| Pisang Epe | Makassar, South Sulawesi; catalog region Bugis-Makassar | Indonesia Travel identifies it as a Makassar specialty made by grilling and pressing kepok bananas, traditionally served with palm-sugar sauce. detikSulsel gives the ingredient list and method used in the draft. It does not specify serving count or elapsed total time. | [Indonesia Travel](https://www.indonesia.travel/id/id/travel-ideas/gastronomy/pisang-epe); [detikSulsel, 11 Nov 2023](https://www.detik.com/sulsel/kuliner/d-7031542/resep-pisang-epe-jajanan-khas-makassar-yang-manis-dan-legit) |
| Nasu Likku | Bugis, South Sulawesi; catalog region Bugis-Makassar | Indonesia Travel describes the Bugis origin and the dish's defining galangal, often grated and cooked with coconut milk. RRI independently identifies its Bugis origin, explains *nasu* and *likku*, and describes chicken, tamarind, aromatics, coconut milk and common variations. Neither source provides a standard quantity set, serving count or total time, so ingredient amounts and those fields are left blank. | [Indonesia Travel](https://www.indonesia.travel/id/id/travel-ideas/gastronomy/nasu-likku); [RRI Makassar, 13 Jul 2025](https://rri.co.id/makassar/kuliner/1709082/nasu-likku-kuliner-ayam-rempah-tradisional-khas-bugis) |

## Visuals

Twenty generated covers were added for the existing ceremony catalog: Pasola, Ngaben, Tiwah, Sekaten, Seren Taun, Yadnya Kasada, Mapalus, Bakar Batu, Ma'nene, Tabuik, Mappacci, Mangongkal Holi, Baayun Maulid, Pukul Sapu, Bau Nyale, Palang Pintu, Peusijuek, Caci, Rambu Solo' and Karapan Sapi. Two covers accompany the recipe drafts. The generated Putri Junjung Buih illustration replaces the generic river photograph as that story's cover.

These are clearly credited AI illustrations, not documentary photographs or historical evidence. Their prompts and bilingual alt text are in `docs/project-media-prompts.json`; licence/credit records and URLs are in `docs/library-cover-credits.md`. Prompts were constrained to avoid depicting remains or injury in sensitive ceremonies and to show animals safely. Ceremony facts continue to be governed by the two-source research and draft/publish records already documented in `docs/adat-data.md`.

The local cover registry now maps each of these assets by content type and slug. The SQL seed adds only the two recipes as drafts; it does not approve or publish them. Apply the seed to the project database before expecting the two recipe cards to appear, then have the owner check the entries and sources in the review queue.
