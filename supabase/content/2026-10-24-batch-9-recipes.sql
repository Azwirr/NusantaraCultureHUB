-- Content batch 9 (2026-10-24): sourced recipes from Makassar and Bugis,
-- South Sulawesi. No serving count or total time is supplied where the
-- checked sources do not state it. Both remain drafts until owner review.
-- Re-running is safe; only drafts are updated.

insert into public.recipes as t (region_id, slug, name_id, name_en, servings, minutes, dietary_tags)
select r.id, x.slug, x.name_id, x.name_en, null::integer, null::integer, x.tags
from (values
  ('bugis', 'pisang-epe', 'Pisang Epe', 'Pisang Epe (grilled and pressed banana)', array['vegetarian', 'contains_dairy']::text[]),
  ('bugis', 'nasu-likku', 'Nasu Likku', 'Nasu Likku (Bugis chicken with galangal)', array['contains_chicken', 'contains_coconut']::text[])
) as x (region, slug, name_id, name_en, tags)
join public.regions r on r.slug = x.region
on conflict (slug) do update set
  region_id = excluded.region_id, name_id = excluded.name_id, name_en = excluded.name_en,
  servings = null, minutes = null, dietary_tags = excluded.dietary_tags
where t.review_status = 'draft';

insert into public.recipe_ingredients as t (recipe_id, position, name_id, name_en, amount, unit)
select rc.id, i.position, i.name_id, i.name_en, i.amount, i.unit
from public.recipes rc
join (values
  -- Pisang Epe: detikSulsel (2023); cross-check of origin and technique at indonesia.travel.
  ('pisang-epe', 1, 'Pisang kepok matang', 'Ripe kepok bananas', 6::numeric, 'piece'),
  ('pisang-epe', 2, 'Mentega', 'Butter', 2, 'tbsp'),
  ('pisang-epe', 3, 'Gula pasir', 'Granulated sugar', 1, 'tbsp'),
  ('pisang-epe', 4, 'Gula aren, sisir halus (saus)', 'Palm sugar, finely shaved (sauce)', 200, 'g'),
  ('pisang-epe', 5, 'Air (saus)', 'Water (sauce)', 150, 'ml'),
  ('pisang-epe', 6, 'Daun pandan, simpulkan (saus)', 'Pandan leaf, knotted (sauce)', 1, 'leaf'),
  ('pisang-epe', 7, 'Garam (saus)', 'Salt (sauce)', 0.25, 'tsp'),
  -- Nasu Likku: ingredient list summarized from RRI and Indonesia Travel.
  -- The sources do not supply a single standard set of quantities.
  ('nasu-likku', 1, 'Ayam, potong', 'Chicken, cut into pieces', null, null),
  ('nasu-likku', 2, 'Lengkuas muda, parut (bumbu utama)', 'Young galangal, grated (main seasoning)', null, null),
  ('nasu-likku', 3, 'Santan', 'Coconut milk', null, null),
  ('nasu-likku', 4, 'Air asam jawa', 'Tamarind water', null, null),
  ('nasu-likku', 5, 'Garam', 'Salt', null, null),
  ('nasu-likku', 6, 'Bawang merah', 'Shallots', null, null),
  ('nasu-likku', 7, 'Bawang putih', 'Garlic', null, null),
  ('nasu-likku', 8, 'Kemiri', 'Candlenuts', null, null),
  ('nasu-likku', 9, 'Kunyit', 'Turmeric', null, null),
  ('nasu-likku', 10, 'Jahe', 'Ginger', null, null),
  ('nasu-likku', 11, 'Ketumbar', 'Coriander', null, null),
  ('nasu-likku', 12, 'Merica', 'Pepper', null, null),
  ('nasu-likku', 13, 'Serai', 'Lemongrass', null, null),
  ('nasu-likku', 14, 'Daun jeruk purut', 'Makrut lime leaves', null, null),
  ('nasu-likku', 15, 'Kelapa parut sangrai (opsional, sesuai variasi sumber)', 'Toasted grated coconut (optional; varies by source)', null, null)
) as i (slug, position, name_id, name_en, amount, unit) on i.slug = rc.slug
where rc.review_status = 'draft'
on conflict (recipe_id, position) do update set
  name_id = excluded.name_id, name_en = excluded.name_en, amount = excluded.amount, unit = excluded.unit;

insert into public.recipe_steps as t (recipe_id, step_no, text_id, text_en, timer_seconds)
select rc.id, s.step_no, s.text_id, s.text_en, null::integer
from public.recipes rc
join (values
  ('pisang-epe', 1, 'Kupas pisang. Letakkan di antara alas plastik bersih, lalu tekan perlahan dengan piring hingga agak pipih.', 'Peel the bananas. Place each between clean plastic sheets and gently press with a plate until slightly flattened.'),
  ('pisang-epe', 2, 'Panggang pisang sambil mengoleskan mentega hingga kecokelatan. Taburi gula pasir dan lanjutkan memanggang sampai gula meleleh.', 'Grill the bananas, brushing with butter, until browned. Sprinkle with granulated sugar and continue grilling until the sugar melts.'),
  ('pisang-epe', 3, 'Untuk saus, rebus gula aren, air, pandan, dan garam hingga gula larut dan mendidih sebentar. Saring, dinginkan, lalu sajikan bersama pisang.', 'For the sauce, simmer the palm sugar, water, pandan and salt until the sugar dissolves and briefly boils. Strain, cool and serve with the bananas.'),
  ('nasu-likku', 1, 'Lumuri potongan ayam dengan air asam jawa dan garam. Siapkan bumbu halus dari bawang merah, bawang putih, kemiri, kunyit, jahe, ketumbar, merica, dan serai.', 'Rub the chicken pieces with tamarind water and salt. Make a spice paste with shallots, garlic, candlenuts, turmeric, ginger, coriander, pepper and lemongrass.'),
  ('nasu-likku', 2, 'Tumis bumbu halus hingga harum. Masukkan ayam, lengkuas parut, daun jeruk, dan santan; aduk hingga rata.', 'Sauté the spice paste until fragrant. Add the chicken, grated galangal, lime leaves and coconut milk; stir to combine.'),
  ('nasu-likku', 3, 'Masak dengan api kecil hingga ayam empuk dan bumbu meresap. Variasi resep dapat dimasak hingga kuah menyusut; kelapa parut sangrai dapat ditambahkan sesuai variasi yang dipilih.', 'Cook over low heat until the chicken is tender and the seasoning has infused. Some recipe variations reduce the liquid further; toasted grated coconut may be added according to the chosen variation.')
) as s (slug, step_no, text_id, text_en) on s.slug = rc.slug
where rc.review_status = 'draft'
on conflict (recipe_id, step_no) do update set
  text_id = excluded.text_id, text_en = excluded.text_en, timer_seconds = excluded.timer_seconds;

create temporary table batch_sources (slug text, title text, url text, credit text) on commit drop;
insert into batch_sources values
  ('pisang-epe', 'Resep Pisang Epe, Jajanan Khas Makassar yang Manis dan Legit', 'https://www.detik.com/sulsel/kuliner/d-7031542/resep-pisang-epe-jajanan-khas-makassar-yang-manis-dan-legit', 'Nauroh, detikSulsel, 11 November 2023'),
  ('pisang-epe', 'Pisang Epe Makassar: Kuliner Tradisional Berbahan Pisang Kepok', 'https://www.indonesia.travel/id/id/travel-ideas/gastronomy/pisang-epe', 'Indonesia Travel, Ministry of Tourism'),
  ('nasu-likku', 'Nasu Likku: Kuliner Ayam Lengkuas Khas Masyarakat Bugis', 'https://www.indonesia.travel/id/id/travel-ideas/gastronomy/nasu-likku', 'Indonesia Travel, Ministry of Tourism'),
  ('nasu-likku', 'Nasu Likku, Kuliner Ayam Rempah Tradisional Khas Bugis', 'https://rri.co.id/makassar/kuliner/1709082/nasu-likku-kuliner-ayam-rempah-tradisional-khas-bugis', 'Muh. Iqbal Aminullah, RRI Makassar, 13 July 2025');

insert into public.sources (title, url, credit)
select distinct b.title, b.url, b.credit from batch_sources b
where not exists (select 1 from public.sources s where s.url = b.url);

insert into public.content_sources (content_type, content_id, source_id)
select 'recipe', c.id, s.id
from batch_sources b
join public.sources s on s.url = b.url
join public.recipes c on c.slug = b.slug
where c.review_status = 'draft'
on conflict (content_type, content_id, source_id) do nothing;
