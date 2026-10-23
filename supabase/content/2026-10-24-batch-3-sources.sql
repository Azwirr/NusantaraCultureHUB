-- Content batch 3 (Phase 2d, 2026-10-23): a second, independent source for
-- each draft that can be confirmed, the fixes those sources called for, and
-- placeholder images for the batch 2 dress. Researched by Claude as the AI
-- Workflow; every page below was opened and compared with the draft.
--
-- Run as a database operator. Only drafts change. Re-running is safe.
-- Items left out (no second website, or no servings and time in any source)
-- stay drafts: batu-berdaun, kasuari-dan-dara-makota, nasi-timbel,
-- ikan-kuah-kuning, papeda.

-- 1. Dendeng balado follows Kompas (and RRI): the beef is boiled with spices
--    and asam kandis, sliced thin, fried dry, then tossed in a coarse sambal
--    finished with lime leaves.
update public.recipes set minutes = 60 where slug = 'dendeng-balado' and review_status = 'draft';
delete from public.recipe_ingredients i using public.recipes r
where i.recipe_id = r.id and r.slug = 'dendeng-balado' and r.review_status = 'draft';
insert into public.recipe_ingredients (recipe_id, position, name_id, name_en, amount, unit)
select r.id, x.position, x.name_id, x.name_en, x.amount, x.unit
from public.recipes r, (values
  (1, 'Daging sapi has dalam', 'Beef tenderloin', 500::numeric, 'g'),
  (2, 'Bawang putih (bumbu halus)', 'Garlic (for the paste)', 5, 'clove'),
  (3, 'Ketumbar (bumbu halus)', 'Coriander seed (for the paste)', 1, 'tbsp'),
  (4, 'Jahe (bumbu halus)', 'Ginger (for the paste)', 2, 'cm'),
  (5, 'Asam kandis', 'Asam kandis (dried garcinia)', 3, 'piece'),
  (6, 'Cabai merah besar', 'Large red chillies', 15, 'piece'),
  (7, 'Bawang merah', 'Shallots', 12, 'piece'),
  (8, 'Tomat merah, potong empat', 'Ripe tomatoes, quartered', 3, 'piece'),
  (9, 'Daun jeruk, buang tulangnya', 'Kaffir lime leaves, stems removed', 4, 'leaf'),
  (10, 'Garam dan gula', 'Salt and sugar', null, 'to_taste'),
  (11, 'Minyak goreng', 'Cooking oil', null, 'to_taste')
) as x (position, name_id, name_en, amount, unit)
where r.slug = 'dendeng-balado' and r.review_status = 'draft';
delete from public.recipe_steps st using public.recipes r
where st.recipe_id = r.id and r.slug = 'dendeng-balado' and r.review_status = 'draft';
insert into public.recipe_steps (recipe_id, step_no, text_id, text_en)
select r.id, x.step_no, x.text_id, x.text_en
from public.recipes r, (values
  (1, 'Haluskan bawang putih, ketumbar, jahe, dan sedikit garam. Lumuri daging dengan bumbu dan asam kandis, lalu rebus hingga empuk.',
      'Grind the garlic, coriander, ginger and a little salt. Coat the beef with the paste and asam kandis, then boil until tender.'),
  (2, 'Setelah agak dingin, iris daging tipis melawan serat, lalu pipihkan.',
      'When slightly cooled, slice the beef thinly against the grain and flatten the slices.'),
  (3, 'Goreng daging dengan api sedang hingga kering, lalu tiriskan.',
      'Fry the beef over medium heat until dry, then drain.'),
  (4, 'Ulek kasar bawang merah, cabai, dan tomat.',
      'Coarsely grind the shallots, chillies and tomatoes.'),
  (5, 'Masak sambal dengan sedikit minyak, garam, gula, dan sedikit air hingga airnya habis, lalu masukkan daun jeruk.',
      'Cook the sambal in a little oil with salt, sugar and a splash of water until the water is gone, then add the lime leaves.'),
  (6, 'Masukkan daging goreng, aduk hingga terbalut sambal, dan sajikan dengan nasi hangat.',
      'Add the fried beef, toss until coated, and serve with warm rice.')
) as x (step_no, text_id, text_en)
where r.slug = 'dendeng-balado' and r.review_status = 'draft';

-- 2. Bundo Kanduang follows Kompas and the Serupa journal: worn by married
--    women; tingkuluak, gold-thread baju kurung, songket or ikat sarong, and a
--    songket salempang. The suntiang is bridal wear, not part of this dress.
update public.costumes set
  info_id = 'Busana adat Minangkabau dari Sumatera Barat yang umumnya dikenakan perempuan yang telah menikah. Terdiri dari tingkuluak (penutup kepala berbentuk tanduk kerbau atau atap rumah gadang), baju kurung bersulam benang emas, sarung songket atau ikat, dan salempang songket di bahu.',
  info_en = 'A Minangkabau dress from West Sumatra, usually worn by married women. It has a tingkuluak headcloth shaped like buffalo horns or a rumah gadang roof, a baju kurung embroidered with gold thread, a songket or ikat sarong, and a songket salempang over the shoulder.'
where slug = 'baju-bundo-kanduang' and review_status = 'draft';

-- 3. Placeholder line drawings for the batch 2 dress (public/placeholders).
update public.costumes c set reference_image_url = x.url
from (values
  ('ulos', '/placeholders/costume-ulos.svg'),
  ('kebaya-sunda', '/placeholders/costume-kebaya-sunda.svg'),
  ('payas-agung', '/placeholders/costume-payas-agung.svg'),
  ('bagajah-gamuling-baular-lulut', '/placeholders/costume-bagajah-gamuling-baular-lulut.svg'),
  ('baju-cele', '/placeholders/costume-baju-cele.svg'),
  ('rok-rumbai', '/placeholders/costume-rok-rumbai.svg')
) as x (slug, url)
where c.slug = x.slug and c.review_status = 'draft';

-- 4. Second sources ------------------------------------------------------------------
create temporary table batch_sources (content_type text, slug text, title text, url text, credit text) on commit drop;
insert into batch_sources values
  ('story', 'timun-mas', 'Cerita Singkat dan Pesan Moral Dongeng Timun Mas Asal Jawa Tengah', 'https://regional.kompas.com/read/2022/02/21/061500478/cerita-singkat-dan-pesan-moral-dongeng-timun-mas-asal-jawa-tengah-', 'Kompas.com, 21 February 2022'),
  ('story', 'malin-kundang', 'Cerita Rakyat Malin Kundang, Legenda Anak Durhaka Berubah Menjadi Batu', 'https://www.goodnewsfromindonesia.id/2024/11/29/cerita-rakyat-malin-kundang', 'Allicia Dhea, Good News From Indonesia, 29 November 2024'),
  ('story', 'danau-toba', 'Kisah Legenda di balik Indahnya Danau Toba di Pulau Samosir', 'https://www.goodnewsfromindonesia.id/2024/09/06/kisah-legenda-dibalik-indahnya-danau-toba-dan-pulau-samosir', 'Raditya Audhiansyach, Good News From Indonesia, 6 September 2024'),
  ('story', 'sangkuriang', 'Mountains in Greater Bandung: Mount Tangkuban Parahu, The Legend of Sangkuriang and its Geological History', 'https://bandungbergerak.id/article/detail/158829/mountains-in-greater-bandung-mount-tangkuban-parahu-the-legend-of-sangkuriang-and-its-geological-history', 'Gan Gan Jatnika, BandungBergerak, 22 September 2023'),
  ('story', 'manik-angkeran', 'Legenda Selat Bali, Cerita Rakyat Sarat Makna untuk Si Kecil', 'https://www.haibunda.com/parenting/20211217234353-61-262188/legenda-selat-bali-cerita-rakyat-sarat-makna-untuk-si-kecil', 'Nanie Wardhani, HaiBunda, 23 December 2021'),
  ('story', 'putri-junjung-buih', 'Cerita Rakyat Kalimantan Selatan Putri Junjung Buih, Kisah Bayi Ajaib yang Ditemukan Raja di Sungai', 'https://www.goodnewsfromindonesia.id/2025/08/27/cerita-rakyat-kalimantan-selatan-putri-junjung-buih-kisah-bayi-ajaib-yang-ditemukan-raja-di-sungai', 'Irfan Jumadil Aslam, Good News From Indonesia, 27 August 2025'),
  ('recipe', 'gudeg-yogyakarta', 'Resep Gudeg Nangka, Cocok untuk Lauk Makan Siang', 'https://www.kompas.com/food/read/2022/07/12/121300375/resep-gudeg-nangka-cocok-untuk-lauk-makan-siang-', 'Alma Erin Mentari, Kompas.com, 12 July 2022'),
  ('recipe', 'rawon', 'Resep Rawon Daging, Sup Berkuah Hitam Khas Jawa Timur', 'https://www.kompas.com/food/read/2024/08/20/194627175/resep-rawon-daging-sup-berkuah-hitam-khas-jawa-timur', 'Suci Wulandari Putri Chaniago, Kompas.com, 20 August 2024'),
  ('recipe', 'soto-ayam', 'Resep Soto Lamongan, Hidangan Berkuah Kuning dan Pakai Koya', 'https://www.kompas.com/food/read/2023/09/22/140200775/resep-soto-lamongan-hidangan-berkuah-kuning-dan-pakai-koya', 'Krisda Tiofani, Kompas.com, 22 September 2023'),
  ('recipe', 'pecel', 'Cara Membuat Sambal Pecel untuk Stok Makan Praktis', 'https://www.kompas.com/food/read/2025/03/01/050300575/cara-membuat-sambal-pecel-untuk-stok-makan-praktis', 'Nuril Laili Azizah, Kompas.com, 1 March 2025'),
  ('recipe', 'rendang-daging', 'Resep Rendang Daging Sapi Sederhana, Mudah Cukup 4 Langkah', 'https://www.kompas.com/food/read/2026/03/19/134051775/resep-rendang-daging-sapi-sederhana-mudah-cukup-4-langkah', 'Ella Triana, Kompas.com, 19 March 2026'),
  ('recipe', 'dendeng-balado', 'Resep Dendeng Balado Khas Padang, Hasilnya Kering dan Renyah', 'https://www.kompas.com/food/read/2020/08/02/193000875/resep-dendeng-balado-khas-padang-hasilnya-kering-dan-renyah', 'Yuharrani Aisyah, Kompas.com, 2 August 2020'),
  ('recipe', 'sate-padang', 'Resep Sate Sapi Padang, Kuahnya dari Tepung Beras dan Rempah', 'https://www.kompas.com/food/read/2020/10/11/203800675/resep-sate-sapi-padang-kuahnya-dari-tepung-beras-dan-rempah', 'Nine Fridayani, Kompas.com, 11 October 2020'),
  ('recipe', 'coto-makassar', 'Resep Coto Makassar Ala Rumahan, Kuah Kental Khas Sulawesi', 'https://www.kompas.com/food/read/2026/06/06/133823275/resep-coto-makassar-ala-rumahan-kuah-kental-khas-sulawesi', 'Ella Triana, Kompas.com, 6 June 2026'),
  ('recipe', 'konro-bakar', 'Resep Konro Bakar Bumbu Kacang, Menu Bakaran Saat Perayaan Tahun Baru', 'https://www.kompas.com/food/read/2022/12/27/090900875/resep-konro-bakar-bumbu-kacang-menu-bakaran-saat-perayaan-tahun-baru', 'Alma Erin Mentari, Kompas.com, 27 December 2022'),
  ('recipe', 'barongko', 'Resep Barongko, Kue Tradisional Berbahan Pisang dari Bugis', 'https://www.kompas.com/food/read/2023/11/20/140800275/resep-barongko-kue-tradisional-berbahan-pisang-dari-bugis-', 'Silvita Agmasari, Kompas.com, 20 November 2023'),
  ('recipe', 'arsik-ikan-mas', 'Resep Arsik Ikan Mas Khas Batak yang Autentik dan Gurih', 'https://www.liputan6.com/lifestyle/read/8261634/arsik-ikan-mas', 'Fitriyani Puspa Samodra, Liputan6, 6 August 2026'),
  ('recipe', 'soto-banjar', 'Asli dari Kalimantan Selatan, Ini Dia Resep Soto Banjar Enak', 'https://www.haibunda.com/moms-life/20211110142211-90-252013/asli-dari-kalimantan-selatan-ini-dia-resep-soto-banjar-enak', 'Tim HaiBunda, 18 November 2021'),
  ('costume', 'ulos', 'Mengenal Ulos, Kain Tenun Khas Suku Batak yang Penuh Makna', 'https://www.detik.com/edu/detikpedia/d-5817187/mengenal-ulos-kain-tenun-khas-suku-batak-yang-penuh-makna', 'Kholida Qothrunnada, detikEdu, 18 November 2021'),
  ('costume', 'kebaya-sunda', '6 Pakaian Adat Jawa Barat dan Ciri Khasnya, dari Pangsi hingga Kebaya Sunda', 'https://bandung.kompas.com/read/2022/01/06/185714678/6-pakaian-adat-jawa-barat-dan-ciri-khasnya-dari-pangsi-hingga-kebaya-sunda', 'William Ciputra, Kompas.com, 6 January 2022'),
  ('costume', 'payas-agung', 'Payas Agung, pakaian adat pengantin Bali', 'https://www.antaranews.com/berita/4289583/payas-agung-pakaian-adat-pengantin-bali', 'Sean Anggiatheda Sitorus, ANTARA News, 27 August 2024'),
  ('costume', 'bagajah-gamuling-baular-lulut', '7 Baju Adat Kalimantan Selatan yang Unik, Sejarah dan Ciri Warisan Luhur Tanah Banjar', 'https://www.liputan6.com/hot/read/6232981/baju-adat-kalimantan-selatan', 'Ibrahim Hasan, Liputan6, 11 December 2025'),
  ('costume', 'baju-cele', 'Baju Cele Maluku', 'https://www.indonesia.travel/uk/en/travel-ideas/culture/baju-cele-maluku-/', 'Kementerian Pariwisata RI (indonesia.travel)'),
  ('costume', 'rok-rumbai', 'Koteka dan Rok Rumbai, Pakaian Adat Papua', 'https://www.kompas.com/skola/read/2021/02/19/161500569/koteka-dan-rok-rumbai-pakaian-adat-papua', 'Ari Welianto, Kompas.com, 19 February 2021'),
  ('costume', 'baju-bodo', 'Baju Adat Bugis-Makassar dan Perlengkapannya serta Penjelasan Makna-Filosofi', 'https://www.detik.com/sulsel/budaya/d-6348565/baju-adat-bugis-makassar-dan-perlengkapannya-serta-penjelasan-makna-filosofi', 'Edward Ridwan, detikSulsel, 15 October 2022'),
  ('costume', 'baju-bundo-kanduang', 'Bundo Kanduang, Pakaian Adat Sumatera Barat', 'https://www.kompas.com/skola/read/2021/02/17/114500569/bundo-kanduang-pakaian-adat-sumatera-barat', 'Ari Welianto, Kompas.com, 17 February 2021'),
  ('costume', 'pengantin-jawa', 'Mengenal pakaian adat Jawa Tengah dan filosofinya', 'https://www.antaranews.com/berita/4289459/mengenal-pakaian-adat-jawa-tengah-dan-filosofinya', 'Putri Atika Chairulia, ANTARA News, 27 August 2024');

insert into public.sources (title, url, credit)
select distinct b.title, b.url, b.credit from batch_sources b
where not exists (select 1 from public.sources s where s.url = b.url);

insert into public.content_sources (content_type, content_id, source_id)
select b.content_type, c.id, s.id
from batch_sources b
join public.sources s on s.url = b.url
join (
  select 'story' as t, id, slug, review_status from public.stories
  union all select 'recipe', id, slug, review_status from public.recipes
  union all select 'costume', id, slug, review_status from public.costumes
) c on c.t = b.content_type and c.slug = b.slug
where c.review_status = 'draft'
on conflict (content_type, content_id, source_id) do nothing;
