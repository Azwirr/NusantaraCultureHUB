-- Content batch 1 (Phase 2b, 2026-10-23). Researched and drafted by Claude
-- as the AI Workflow; the owner checks and approves in /review.
--
-- Run as a database operator after supabase/seed.sql. Everything stays a
-- draft: this only changes drafts and cites sources. Re-running is safe.
--
-- What it does:
-- 1. Timun Mas follows the version in its source (detikJateng, 2022): the
--    widow Mbok Randa, a golden cucumber, a hermit's four bundles (cucumber
--    seeds, needles, salt, shrimp paste) and a sea of mud. Retold in our own
--    words in both languages.
-- 2. Recipes follow their sources: kluwek in konro bakar (RRI), bihun or soun
--    in soto ayam (indonesia.travel lists bihun), gudeg's chicken and egg as
--    side dishes (indonesia.travel).
-- 3. Cites one checked source on every story, recipe and costume (see
--    docs/candidate-sources.md for what each page does and does not cover).

-- 1. Timun Mas -------------------------------------------------------------------
update public.stories set
  summary_id = 'Seorang janda menerima biji timun dari raksasa, dan putrinya, Timun Mas, lolos dari raksasa itu dengan empat bungkusan ajaib dari seorang pertapa.',
  summary_en = 'A widow receives cucumber seeds from a giant, and her daughter, Timun Mas, escapes him with four magic bundles from a hermit.'
where slug = 'timun-mas' and review_status = 'draft';

update public.story_chapters c set
  text_id = x.text_id, text_en = x.text_en,
  audio_description_id = x.ad_id, audio_description_en = x.ad_en,
  image_alt_id = x.alt_id, image_alt_en = x.alt_en
from public.stories s, (values
  (1,
   'Di sebuah desa hiduplah Mbok Randa, seorang janda yang sangat ingin memiliki anak. Suatu hari raksasa bernama Buto Ijo memberinya biji timun, dengan satu syarat: anak itu harus diserahkan kepadanya ketika berusia enam tahun.',
   'In a village lived Mbok Randa, a widow who longed for a child. One day a giant named Buto Ijo gave her cucumber seeds on one condition: the child must be handed over to him at the age of six.',
   'Sebuah rumah kayu di tepi ladang. Seorang raksasa hijau membungkuk dan menyerahkan segenggam biji kepada seorang perempuan tua.',
   'A wooden house beside a field. A green giant bends down and hands a handful of seeds to an old woman.',
   'Raksasa hijau yang tinggi memberikan biji timun kepada Mbok Randa di depan rumahnya.',
   'A tall green giant gives cucumber seeds to Mbok Randa in front of her house.'),
  (2,
   'Mbok Randa menanam biji itu. Tumbuhlah sebuah timun besar berwarna keemasan, dan di dalamnya ada seorang bayi perempuan. Ia memberinya nama Timun Mas dan merawatnya dengan penuh kasih.',
   'Mbok Randa planted the seeds. A large golden cucumber grew, and inside it was a baby girl. She named her Timun Mas and raised her with great love.',
   'Di ladang timun, sebuah timun keemasan terbelah dan tampak seorang bayi di dalamnya.',
   'In a cucumber field, a golden cucumber splits open to show a baby inside.',
   'Mbok Randa berlutut di ladang dan menggendong bayi dari dalam timun emas.',
   'Mbok Randa kneels in the field, lifting a baby out of a golden cucumber.'),
  (3,
   'Ketika Timun Mas berusia enam tahun, Buto Ijo datang menagih janji. Mbok Randa meminta waktu, lalu pergi kepada seorang pertapa. Pertapa itu memberinya empat bungkusan kecil: biji timun, jarum, garam, dan terasi. Saat raksasa kembali, Timun Mas berlari membawa bungkusan itu.',
   'When Timun Mas turned six, Buto Ijo came to claim his promise. Mbok Randa asked for time and went to a hermit, who gave her four small bundles: cucumber seeds, needles, salt and shrimp paste. When the giant returned, Timun Mas ran off with the bundles.',
   'Seorang pertapa tua di gubuk menyerahkan empat bungkusan kecil. Lalu seorang gadis kecil berlari di jalan setapak, dikejar raksasa.',
   'An old hermit in a hut hands over four small bundles. Then a little girl runs along a path, chased by the giant.',
   'Timun Mas berlari sambil menggenggam bungkusan kecil, dengan raksasa hijau di belakangnya.',
   'Timun Mas runs holding small bundles, with the green giant behind her.'),
  (4,
   'Timun Mas menebar biji timun, dan tumbuhlah ladang timun yang menjerat raksasa. Lalu ia melempar jarum, yang menjadi rumpun bambu yang tajam. Kemudian ia menabur garam, yang menjadi lautan luas, tetapi raksasa itu masih bisa berenang menyeberanginya.',
   'Timun Mas scattered the cucumber seeds, and a cucumber field sprang up and tangled the giant. Then she threw the needles, which became sharp bamboo thickets. Next she scattered the salt, which became a wide sea, but the giant still swam across.',
   'Tiga perubahan ajaib berturut-turut: sulur timun yang menjerat, rumpun bambu yang rapat, dan lautan yang luas.',
   'Three magic changes in a row: tangling cucumber vines, a dense bamboo thicket and a wide sea.',
   'Raksasa hijau terjerat sulur timun dan rumpun bambu, dengan laut terbentang di depannya.',
   'The green giant caught in cucumber vines and bamboo, with a sea stretching ahead of him.'),
  (5,
   'Terakhir, Timun Mas melempar terasi. Terasi itu berubah menjadi lautan lumpur, dan Buto Ijo tenggelam di dalamnya. Timun Mas pulang kepada ibunya, dan mereka hidup bahagia. Cerita ini mengajarkan bahwa kecerdikan dan keberanian dapat mengalahkan kekuatan yang besar.',
   'Last, Timun Mas threw the shrimp paste. It became a sea of mud, and Buto Ijo sank into it. Timun Mas went home to her mother, and they lived happily. The story teaches that cleverness and courage can overcome great strength.',
   'Raksasa hijau tenggelam di lautan lumpur, sementara di kejauhan seorang gadis dan ibunya berpelukan di depan rumah.',
   'The green giant sinks into a sea of mud, while far away a girl and her mother embrace in front of their house.',
   'Timun Mas dan Mbok Randa berdiri di depan rumah dalam cahaya pagi, lautan lumpur jauh di belakang mereka.',
   'Timun Mas and Mbok Randa stand outside their house in morning light, the sea of mud far behind them.')
) as x (no, text_id, text_en, ad_id, ad_en, alt_id, alt_en)
where s.slug = 'timun-mas' and c.story_id = s.id and c.chapter_no = x.no and c.review_status = 'draft';

-- 2. Recipes ------------------------------------------------------------------------
-- Konro bakar: kluwek, and the peanut sauce it is served with.
insert into public.recipe_ingredients (recipe_id, position, name_id, name_en, amount, unit)
select r.id, 8, 'Kluwek, dihaluskan', 'Kluwek (black nut), mashed', 3, 'piece'
from public.recipes r where r.slug = 'konro-bakar' and r.review_status = 'draft'
on conflict (recipe_id, position) do update set
  name_id = excluded.name_id, name_en = excluded.name_en, amount = excluded.amount, unit = excluded.unit;
update public.recipe_steps st set
  text_id = 'Rebus iga bersama bumbu dan kluwek hingga empuk.',
  text_en = 'Simmer the ribs with the spices and kluwek until tender.'
from public.recipes r
where r.slug = 'konro-bakar' and st.recipe_id = r.id and st.step_no = 1 and r.review_status = 'draft';
update public.recipe_steps st set
  text_id = 'Sajikan selagi panas dengan sambal kacang.',
  text_en = 'Serve hot with peanut sauce.'
from public.recipes r
where r.slug = 'konro-bakar' and st.recipe_id = r.id and st.step_no = 4 and r.review_status = 'draft';

-- Soto ayam: bihun or soun.
update public.recipe_ingredients i set name_id = 'Bihun atau soun', name_en = 'Rice vermicelli or glass noodles'
from public.recipes r
where r.slug = 'soto-ayam' and i.recipe_id = r.id and i.position = 8 and r.review_status = 'draft';
update public.recipe_steps st set
  text_id = 'Suwir ayam, lalu siapkan bihun atau soun dan telur.',
  text_en = 'Shred the chicken and prepare the noodles and eggs.'
from public.recipes r
where r.slug = 'soto-ayam' and st.recipe_id = r.id and st.step_no = 3 and r.review_status = 'draft';

-- Gudeg: chicken and egg are side dishes.
update public.recipe_steps st set
  text_id = 'Masak ayam dan telur dengan sebagian kuah santan hingga empuk, sebagai lauk pendamping.',
  text_en = 'Cook the chicken and eggs in some of the coconut broth until tender, to serve alongside.'
from public.recipes r
where r.slug = 'gudeg-yogyakarta' and st.recipe_id = r.id and st.step_no = 3 and r.review_status = 'draft';

-- 3. Sources --------------------------------------------------------------------------
create temporary table batch_sources (content_type text, slug text, title text, url text, credit text) on commit drop;
insert into batch_sources values
  ('story', 'timun-mas', 'Kisah Timun Mas, Cerita Rakyat dari Jawa Tengah', 'https://www.detik.com/jateng/budaya/d-6264915/kisah-timun-mas-cerita-rakyat-dari-jawa-tengah', 'detikJateng, 1 September 2022'),
  ('story', 'malin-kundang', 'Kisah Legenda Malin Kundang dari Sumatera Barat Beserta Pesan Moralnya', 'https://www.detik.com/sumut/budaya/d-6958903/kisah-legenda-malin-kundang-dari-sumatera-barat-beserta-pesan-moralnya', 'detikSumut, 1 October 2023'),
  ('recipe', 'gudeg-yogyakarta', 'Gudeg Yogyakarta: Sejarah, Jenis, dan Ciri Khas Kuliner Tradisional', 'https://www.indonesia.travel/id/id/destination/java/yogyakarta/gudeg/', 'Kementerian Pariwisata RI (indonesia.travel)'),
  ('recipe', 'rawon', 'Rawon: Sejarah, Bahan, dan Ciri Khasnya', 'https://www.indonesia.travel/id-id/destination/java/east-java/rawon/', 'Kementerian Pariwisata RI (indonesia.travel)'),
  ('recipe', 'soto-ayam', 'Soto Lamongan: Ciri Khas Kuah Koya, Bumbu, & Sejarahnya', 'https://www.indonesia.travel/id-id/destination/java/east-java/soto-lamongan/', 'Kementerian Pariwisata RI (indonesia.travel)'),
  ('recipe', 'pecel', 'Asal usul nasi pecel, kuliner tradisional yang jadi ikon Nusantara', 'https://www.antaranews.com/berita/4742269/asal-usul-nasi-pecel-kuliner-tradisional-yang-jadi-ikon-nusantara', 'ANTARA News, 28 March 2025'),
  ('recipe', 'rendang-daging', 'Mengenal Rendang dan Tempat Untuk Menikmatinya', 'https://www.indonesia.travel/id/id/travel-ideas/gastronomy/rendang-the-legendary-dish-from-west-sumatra/', 'Kementerian Pariwisata RI (indonesia.travel)'),
  ('recipe', 'dendeng-balado', 'Minangkabau''s Dendeng Balado for Iftar and Sahoor Menu', 'https://rri.co.id/en/culinary/1379284/minangkabau-s-dendeng-balado-for-iftar-and-sahoor-menu', 'RRI (Voice of Indonesia), 10 March 2025'),
  ('recipe', 'sate-padang', 'Sate Padang: History, Types, and Most Popular Recommendations', 'https://www.indonesia.travel/uae-ar/travel-ideas/gastronomy/fakta-menarik-di-balik-nikmatnya-sate-padang', 'Kementerian Pariwisata RI (indonesia.travel)'),
  ('recipe', 'coto-makassar', 'Resep Coto Makassar Asli, Hidangan Kaya Rempah yang Nikmat', 'https://www.cnnindonesia.com/gaya-hidup/20240212132201-267-1061455/resep-coto-makassar-asli-hidangan-kaya-rempah-yang-nikmat', 'CNN Indonesia, 15 February 2024'),
  ('recipe', 'konro-bakar', 'Sop Konro: Makassar''s Legendary Beef Rib Soup', 'https://rri.co.id/voice-of-indonesia/culinary/2737271/sop-konro-makassars-legendary-beef-rib-soup', 'RRI (Voice of Indonesia), 18 September 2026'),
  ('recipe', 'barongko', 'Berburu Takjil Barongko, Kue Khas Makassar', 'https://www.kompas.tv/article/171901/berburu-takjil-barongko-kue-khas-makassar', 'Kompas TV, 7 May 2021'),
  ('costume', 'baju-bodo', 'Baju Bodo: Sejarah, Makna Warna, Bentuk, dan Fungsi Pakaian Adat Bugis', 'https://www.indonesia.travel/id/id/travel-ideas/culture/baju-bodo/', 'Kementerian Pariwisata RI (indonesia.travel)'),
  ('costume', 'baju-bundo-kanduang', 'Tinjauan Pakaian Adat Bundo Kanduang di Kenagarian Koto Tinggi Kecamatan Baso Kabupaten Agam Sumatera Barat', 'https://ejournal.unp.ac.id/index.php/serupa/article/view/3218', 'Rela Gusparini, Zubaidah. Serupa: The Journal of Art Education 2(2), 2014'),
  ('costume', 'pengantin-jawa', 'Mengenal Beskap dan Asal-usulnya', 'https://www.goodnewsfromindonesia.id/infographic/mengenal-beskap-dan-asal-usulnya', 'Good News From Indonesia, 2 May 2025');

-- One source row per URL.
insert into public.sources (title, url, credit)
select distinct b.title, b.url, b.credit from batch_sources b
where not exists (select 1 from public.sources s where s.url = b.url);

-- Cite it on the draft (skipped if already cited).
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
