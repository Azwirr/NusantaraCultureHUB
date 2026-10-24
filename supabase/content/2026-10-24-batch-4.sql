-- Content batch 4 (2026-10-24). Researched and drafted by Claude as the AI
-- Workflow. Every item follows a checked source and cites a second, different
-- website (the publish rule in migration part 15). Stories are retold in our
-- own words in both languages. Halal status stays unknown.
--
-- Run as a database operator after batches 1 to 3. Only drafts change.
-- Re-running is safe.
--
-- 1. A new region for the Sasak of Lombok (Nusa Tenggara Barat): the legend of
--    Putri Mandalika, ayam taliwang and baju lambung.
-- 2. Sulawesi's first story: Putri Tandampalik (Luwu and Bone).
-- 3. Second sources for Batu Berdaun and Kasuari dan Dara Makota.

-- 1. Region -------------------------------------------------------------------------
insert into public.regions as t (slug, name_id, name_en, summary_id, summary_en, province_codes, sort_order) values
  ('sasak', 'Sasak (Lombok, Nusa Tenggara Barat)', 'Sasak (Lombok, West Nusa Tenggara)',
   'Tanah suku Sasak di Pulau Lombok, Nusa Tenggara Barat, asal legenda Putri Mandalika, ayam taliwang, dan baju lambung.',
   'The land of the Sasak people on Lombok, West Nusa Tenggara, home of the legend of Putri Mandalika, ayam taliwang and the baju lambung.',
   array['ID-NB'], 10)
on conflict (slug) do update set
  name_id = excluded.name_id, name_en = excluded.name_en,
  summary_id = excluded.summary_id, summary_en = excluded.summary_en,
  province_codes = excluded.province_codes, sort_order = excluded.sort_order
where t.review_status = 'draft';

-- 2. Stories -----------------------------------------------------------------------
insert into public.stories as t (region_id, slug, title_id, title_en, summary_id, summary_en)
select r.id, x.slug, x.title_id, x.title_en, x.summary_id, x.summary_en
from (values
  ('sasak', 'putri-mandalika', 'Putri Mandalika', 'Putri Mandalika',
   'Seorang putri Lombok menolak semua pelamarnya demi mencegah perang, dan menjadi nyale yang dicari setiap tahun dalam tradisi Bau Nyale.',
   'A Lombok princess refuses every suitor to prevent a war, and becomes the nyale sea worms that people seek each year at Bau Nyale.'),
  ('bugis', 'putri-tandampalik', 'Putri Tandampalik', 'Putri Tandampalik',
   'Putri Luwu yang diasingkan karena penyakit kulit disembuhkan seekor kerbau putih, lalu menikah dengan putra mahkota Bone.',
   'A Luwu princess exiled for a skin disease is healed by a white buffalo, then marries the crown prince of Bone.')
) as x (region, slug, title_id, title_en, summary_id, summary_en)
join public.regions r on r.slug = x.region
on conflict (slug) do update set
  region_id = excluded.region_id, title_id = excluded.title_id, title_en = excluded.title_en,
  summary_id = excluded.summary_id, summary_en = excluded.summary_en
where t.review_status = 'draft';

insert into public.story_chapters as t (
  story_id, chapter_no, text_id, text_en,
  audio_description_id, audio_description_en, image_alt_id, image_alt_en)
select s.id, c.no, c.text_id, c.text_en, c.ad_id, c.ad_en, c.alt_id, c.alt_en
from public.stories s
join (values
  -- Putri Mandalika (Good News From Indonesia, 2026; Mongabay, 2017).
  ('putri-mandalika', 1,
   'Dahulu kala di pesisir selatan Lombok, Raja Tonjang Beru dan Dewi Seranting memimpin kerajaan yang makmur dan damai. Putri mereka, Putri Mandalika, terkenal karena kecantikannya dan karena ia santun serta baik kepada semua orang.',
   'Long ago on the southern coast of Lombok, King Tonjang Beru and Queen Seranting ruled a prosperous, peaceful kingdom. Their daughter, Putri Mandalika, was famous for her beauty, and for being gentle and kind to everyone.',
   'Sebuah istana kerajaan di tepi laut Lombok. Seorang putri muda berjalan di antara rakyat yang tersenyum kepadanya.',
   'A royal palace on the Lombok coast. A young princess walks among people who smile at her.',
   'Putri Mandalika di halaman istana di pesisir selatan Lombok.',
   'Putri Mandalika in the palace grounds on the southern coast of Lombok.'),
  ('putri-mandalika', 2,
   'Kabar kecantikannya menyebar ke seluruh pulau. Tiga putra mahkota dari kerajaan besar di Lombok datang melamar. Raja menyerahkan pilihan kepada putrinya, tetapi Putri Mandalika takut pilihannya akan memicu kecemburuan, perang, dan pertumpahan darah di antara rakyat.',
   'News of her beauty spread across the island. Three crown princes from great Lombok kingdoms came to ask for her hand. The king left the choice to his daughter, but Putri Mandalika feared that her choice would bring jealousy, war and bloodshed among the people.',
   'Tiga pangeran berpakaian kebesaran berdiri berhadapan di depan istana, sementara sang putri tampak gelisah.',
   'Three princes in royal dress stand facing each other before the palace, while the princess looks troubled.',
   'Tiga putra mahkota melamar Putri Mandalika.',
   'Three crown princes ask for Putri Mandalika''s hand.'),
  ('putri-mandalika', 3,
   'Setelah bersemedi, ia mengundang semua orang ke Pantai Seger pada hari ke-20 bulan ke-10 penanggalan Sasak, sebelum fajar. Saat matahari terbit, dari Bukit Seger ia menolak ketiga pangeran dan berkata ia memberikan dirinya untuk seluruh rakyat. Lalu ia terjun ke ombak dan menghilang di laut.',
   'After meditating, she invited everyone to Seger Beach before dawn on the 20th day of the 10th month of the Sasak calendar. At sunrise, from Seger Hill, she refused all three princes and said she gave herself to all her people. Then she leapt into the waves and vanished into the sea.',
   'Fajar di atas bukit karang di tepi pantai. Seorang putri berdiri menghadap laut, dengan orang banyak di pasir di bawahnya.',
   'Dawn over a rocky hill by the beach. A princess stands facing the sea, with a crowd on the sand below.',
   'Putri Mandalika di Bukit Seger saat matahari terbit.',
   'Putri Mandalika on Seger Hill at sunrise.'),
  ('putri-mandalika', 4,
   'Setelah air surut, muncul cacing laut berwarna-warni dalam jumlah besar. Orang percaya cacing itu jelmaan Putri Mandalika dan menamainya nyale. Hingga kini, setiap tahun ribuan orang turun ke laut di Pantai Seger dan Kuta, Lombok Tengah, untuk menangkap nyale dalam tradisi Bau Nyale.',
   'When the tide went out, brightly coloured sea worms appeared in great numbers. People believed they were Putri Mandalika reborn and called them nyale. To this day, thousands of people wade into the sea at Seger and Kuta beaches in Central Lombok every year to catch nyale in the Bau Nyale tradition.',
   'Orang-orang berdiri di laut dangkal sebelum fajar, membawa lampu dan jaring kecil untuk menangkap cacing laut.',
   'People stand in shallow water before dawn, carrying lamps and small nets to catch sea worms.',
   'Warga menangkap nyale di Pantai Seger dalam tradisi Bau Nyale.',
   'Villagers catch nyale at Seger Beach during Bau Nyale.'),
  -- Putri Tandampalik (detikSulsel, 2022; Gramedia, 2021).
  ('putri-tandampalik', 1,
   'Putri Tandampalik adalah anak Datu Luwu. Raja Bone datang melamarnya. Adat Luwu melarang menikah dengan orang dari luar sukunya, tetapi Datu Luwu menerima lamaran itu agar tidak terjadi perang yang akan menyengsarakan rakyatnya.',
   'Putri Tandampalik was the daughter of the Datu, the ruler, of Luwu. The King of Bone asked for her hand. Luwu custom forbade marrying someone from outside the people, but the Datu accepted, so that no war would bring suffering to his people.',
   'Balairung istana Luwu. Seorang utusan Bone membungkuk di hadapan raja, sementara sang putri duduk di sampingnya.',
   'The hall of the Luwu palace. An envoy from Bone bows before the ruler, with the princess seated beside him.',
   'Utusan Bone menyampaikan lamaran kepada Datu Luwu.',
   'An envoy from Bone brings the proposal to the Datu of Luwu.'),
  ('putri-tandampalik', 2,
   'Tak lama kemudian sang putri terserang penyakit kulit. Khawatir penyakit itu menular, Datu Luwu mengasingkannya bersama para pengikutnya yang setia, dan memberinya sebilah keris sebelum ia pergi. Sang putri tiba di sebuah pulau yang subur dan sejuk bernama Wajo, dan mereka membangun permukiman baru di sana.',
   'Soon afterwards the princess fell ill with a skin disease. Fearing it would spread, the Datu sent her away with her loyal followers, and gave her a keris before she left. The princess reached a fertile, cool island called Wajo, and they built a new settlement there.',
   'Sebuah perahu mendarat di pantai pulau yang hijau. Seorang putri bersama pengikutnya membawa barang-barang ke daratan.',
   'A boat lands on the shore of a green island. A princess and her followers carry their belongings ashore.',
   'Putri Tandampalik dan pengikutnya tiba di Wajo.',
   'Putri Tandampalik and her followers arrive at Wajo.'),
  ('putri-tandampalik', 3,
   'Suatu hari sang putri melihat seekor kerbau putih yang ternyata jinak. Ia membiarkan kerbau itu menjilati kulitnya, dan penyakitnya pun sembuh.',
   'One day the princess saw a white buffalo, which turned out to be tame. She let the buffalo lick her skin, and her illness was healed.',
   'Seekor kerbau putih berdiri tenang di tepi sungai, dan seorang putri mengulurkan tangannya.',
   'A white buffalo stands calmly by a river, and a princess reaches out her hand.',
   'Kerbau putih menyembuhkan Putri Tandampalik.',
   'The white buffalo heals Putri Tandampalik.'),
  ('putri-tandampalik', 4,
   'Putra mahkota Bone yang terpisah dari rombongan berburunya menemukan sang putri dan jatuh hati. Ia mengirim utusan untuk melamar. Sang putri mengembalikan keris itu ke Luwu sebagai syarat: bila Datu Luwu menerimanya, ia menerima lamaran. Datu Luwu menerimanya, dan pernikahan mereka dilangsungkan di Wajo.',
   'The crown prince of Bone, separated from his hunting party, found the princess and fell in love. He sent an envoy to propose. The princess returned the keris to Luwu as her condition: if the Datu accepted it, she would accept. The Datu accepted, and their wedding was held in Wajo.',
   'Pesta pernikahan adat di sebuah balai kayu, dengan sepasang pengantin berpakaian kebesaran dan tamu yang bergembira.',
   'A traditional wedding feast in a wooden hall, with a bride and groom in ceremonial dress and joyful guests.',
   'Pernikahan Putri Tandampalik dan putra mahkota Bone di Wajo.',
   'The wedding of Putri Tandampalik and the crown prince of Bone in Wajo.')
) as c (slug, no, text_id, text_en, ad_id, ad_en, alt_id, alt_en) on c.slug = s.slug
on conflict (story_id, chapter_no) do update set
  text_id = excluded.text_id, text_en = excluded.text_en,
  audio_description_id = excluded.audio_description_id, audio_description_en = excluded.audio_description_en,
  image_alt_id = excluded.image_alt_id, image_alt_en = excluded.image_alt_en
where t.review_status = 'draft';

-- 3. Recipe: ayam taliwang (Liputan6, 2026: 4 servings, about 95 minutes) ------------
insert into public.recipes as t (region_id, slug, name_id, name_en, servings, minutes, dietary_tags)
select r.id, 'ayam-taliwang', 'Ayam Taliwang', 'Ayam taliwang (Lombok grilled spicy chicken)', 4, 95,
  array['contains_chicken', 'contains_coconut']
from public.regions r where r.slug = 'sasak'
on conflict (slug) do update set
  region_id = excluded.region_id, name_id = excluded.name_id, name_en = excluded.name_en,
  servings = excluded.servings, minutes = excluded.minutes, dietary_tags = excluded.dietary_tags
where t.review_status = 'draft';

insert into public.recipe_ingredients as t (recipe_id, position, name_id, name_en, amount, unit)
select rc.id, i.position, i.name_id, i.name_en, i.amount, i.unit
from public.recipes rc
join (values
  (1, 'Ayam kampung muda atau pejantan (sekitar 1 kg), potong 4', 'Young free-range chicken (about 1 kg), cut in 4', 1::numeric, 'whole'),
  (2, 'Jeruk nipis, peras', 'Lime, juiced', 1, 'piece'),
  (3, 'Garam untuk melumuri ayam', 'Salt for rubbing the chicken', 1, 'tsp'),
  (4, 'Minyak goreng untuk menumis', 'Cooking oil for frying the paste', 2, 'tbsp'),
  (5, 'Santan encer', 'Thin coconut milk', 150, 'ml'),
  (6, 'Cabai merah keriting (bumbu halus)', 'Curly red chillies (for the paste)', 10, 'piece'),
  (7, 'Cabai merah kering, rendam air panas (bumbu halus)', 'Dried red chillies, soaked (for the paste)', 5, 'piece'),
  (8, 'Cabai rawit merah (bumbu halus)', 'Red bird''s eye chillies (for the paste)', 10, 'piece'),
  (9, 'Bawang merah (bumbu halus)', 'Shallots (for the paste)', 8, 'piece'),
  (10, 'Bawang putih (bumbu halus)', 'Garlic (for the paste)', 5, 'clove'),
  (11, 'Kemiri, sangrai (bumbu halus)', 'Candlenuts, toasted (for the paste)', 3, 'piece'),
  (12, 'Kencur (bumbu halus)', 'Kencur (aromatic ginger) (for the paste)', 2, 'cm'),
  (13, 'Terasi bakar (bumbu halus)', 'Roasted shrimp paste (for the paste)', 1, 'tsp'),
  (14, 'Tomat merah (bumbu halus)', 'Red tomatoes (for the paste)', 2, 'piece'),
  (15, 'Gula merah, sisir (bumbu halus)', 'Palm sugar, shaved (for the paste)', 1, 'tbsp'),
  (16, 'Garam (bumbu halus)', 'Salt (for the paste)', 1, 'tsp'),
  (17, 'Daun jeruk', 'Kaffir lime leaves', 2, 'leaf'),
  (18, 'Daun salam', 'Indonesian bay leaves', 2, 'leaf'),
  (19, 'Serai, memarkan', 'Lemongrass, bruised', 1, 'stalk'),
  (20, 'Lengkuas, memarkan', 'Galangal, bruised', 2, 'cm'),
  (21, 'Kecap manis untuk olesan', 'Sweet soy sauce for basting', 2, 'tbsp'),
  (22, 'Minyak atau margarin untuk olesan', 'Oil or margarine for basting', 1, 'tbsp')
) as i (position, name_id, name_en, amount, unit) on true
where rc.slug = 'ayam-taliwang' and rc.review_status = 'draft'
on conflict (recipe_id, position) do update set
  name_id = excluded.name_id, name_en = excluded.name_en, amount = excluded.amount, unit = excluded.unit;

insert into public.recipe_steps as t (recipe_id, step_no, text_id, text_en, timer_seconds)
select rc.id, s.step_no, s.text_id, s.text_en, s.timer_seconds
from public.recipes rc
join (values
  (1, 'Cuci ayam, lumuri dengan air jeruk nipis dan 1 sendok teh garam, lalu diamkan 15 menit. Bilas lagi dan keringkan.',
      'Rinse the chicken, rub it with the lime juice and 1 tsp salt, and leave it for 15 minutes. Rinse again and pat dry.', 900),
  (2, 'Haluskan semua bahan bumbu halus.',
      'Grind all the paste ingredients until smooth.', null::integer),
  (3, 'Panaskan 2 sendok makan minyak. Tumis bumbu halus bersama daun jeruk, daun salam, serai, dan lengkuas selama 8 sampai 10 menit hingga harum dan berminyak.',
      'Heat 2 tbsp oil. Fry the paste with the lime leaves, bay leaves, lemongrass and galangal for 8 to 10 minutes, until fragrant and the oil separates.', 600),
  (4, 'Masukkan ayam dan aduk hingga terbalut bumbu.',
      'Add the chicken and stir until coated in the paste.', null),
  (5, 'Tuang santan encer, kecilkan api, dan tutup. Masak 30 sampai 40 menit sambil sesekali dibalik hingga kuah menyusut.',
      'Pour in the thin coconut milk, lower the heat and cover. Simmer for 30 to 40 minutes, turning now and then, until the sauce reduces.', 2400),
  (6, 'Angkat ayam. Ambil sekitar 4 sendok makan bumbu, campur dengan kecap manis dan 1 sendok makan minyak untuk olesan.',
      'Lift out the chicken. Mix about 4 tbsp of the cooking paste with the sweet soy sauce and 1 tbsp oil for basting.', null),
  (7, 'Bakar ayam di atas api sedang 5 sampai 7 menit tiap sisi sambil terus diolesi, hingga mengilap dan kecokelatan. Pastikan daging matang.',
      'Grill the chicken over medium heat for 5 to 7 minutes on each side, basting all the time, until glossy and brown. Make sure it is cooked through.', 420),
  (8, 'Sajikan panas dengan nasi putih, plecing kangkung, dan sambal beberuk terong.',
      'Serve hot with white rice, plecing kangkung and sambal beberuk terong.', null)
) as s (step_no, text_id, text_en, timer_seconds) on true
where rc.slug = 'ayam-taliwang' and rc.review_status = 'draft'
on conflict (recipe_id, step_no) do update set
  text_id = excluded.text_id, text_en = excluded.text_en, timer_seconds = excluded.timer_seconds;

-- 4. Traditional dress: baju lambung (Orami, 2024; detikTravel, 2021) ---------------
insert into public.costumes as t (region_id, slug, name_id, name_en, info_id, info_en, reference_image_url)
select r.id, 'baju-lambung', 'Baju Lambung', 'Baju lambung',
  'Pakaian adat perempuan suku Sasak di Lombok: atasan hitam tanpa lengan dengan kerah berbentuk V dan sedikit hiasan. Namanya berasal dari bentuknya yang tidak menutupi perut (lambung), sehingga dipadukan dengan kain lempot, kain panjang atau songket, selendang bermotif ragi di bahu, dan ikat pinggang. Dipakai dalam pernikahan, upacara adat, dan penyambutan tamu. Warna hitam melambangkan watak Sasak yang tegas dan berwibawa. Pasangan busana laki-lakinya disebut pegon.',
  'The traditional women''s dress of the Sasak of Lombok: a black sleeveless top with a V-shaped neckline and light decoration. Its name comes from leaving the stomach (lambung) uncovered, so it is worn with a kain lempot cloth, a long cloth or songket, a ragi-patterned shawl over the shoulder and a belt. It is worn at weddings, ceremonies and to welcome guests. The black stands for the firm, dignified character of the Sasak. The men''s counterpart is the pegon.',
  '/placeholders/costume-baju-lambung.svg'
from public.regions r where r.slug = 'sasak'
on conflict (slug) do update set
  region_id = excluded.region_id, name_id = excluded.name_id, name_en = excluded.name_en,
  info_id = excluded.info_id, info_en = excluded.info_en, reference_image_url = excluded.reference_image_url
where t.review_status = 'draft';

-- 5. Sources -------------------------------------------------------------------------
create temporary table batch_sources (content_type text, slug text, title text, url text, credit text) on commit drop;
insert into batch_sources values
  ('story', 'putri-mandalika', 'Cerita Rakyat Putri Mandalika: Legenda di Balik Tradisi Bau Nyale dan Kemegahan Sirkuit Lombok', 'https://www.goodnewsfromindonesia.id/indonesiana/legenda/cerita-rakyat-putri-mandalika-legenda-di-balik-tradisi-bau-nyale-dan-kemegahan-sirkuit-lombok', 'Muhammad Sholeh, Good News From Indonesia, 8 October 2026'),
  ('story', 'putri-mandalika', 'Liputan Bau Nyale: Puluhan Ribu Warga ke Laut Mencari Cacing Laut Jelmaan Putri', 'https://mongabay.co.id/2017/02/22/liputan-bau-nyale-puluhan-ribu-warga-ke-laut-mencari-cacing-laut-jelmaan-putri/', 'Mongabay Indonesia, 22 February 2017'),
  ('story', 'putri-tandampalik', '8 Cerita Rakyat Sulawesi Selatan Beserta Pesan Moralnya', 'https://www.detik.com/sulsel/budaya/d-6036473/8-cerita-rakyat-sulawesi-selatan-beserta-pesan-moralnya', 'Al Khoriah Etiek Nugraha, detikSulsel, 17 April 2022'),
  ('story', 'putri-tandampalik', 'Menyelami 7 Cerita Rakyat Sulawesi Selatan yang Sarat Falsafah Hidup', 'https://www.gramedia.com/literasi/menyelami-7-cerita-rakyat-sulawesi-selatan-yang-sarat-falsafah-hidup/', 'Laura Saraswati, Gramedia Literasi'),
  ('story', 'batu-berdaun', 'Cerita Rakyat Maluku: Kisah Batu Berdaun', 'https://www.reinha.com/2018/10/29/cerita-rakyat-maluku-kisah-batu-berdaun/', 'REINHA.com, 29 October 2018'),
  ('story', 'kasuari-dan-dara-makota', 'Kasuari dan Dara Mahkota', 'https://analisadaily.com/berita/arsip/2014/9/14/63761/kasuari-dan-dara-mahkota/', 'Rayona Tampubolon, Analisadaily.com, 13 September 2014'),
  ('recipe', 'ayam-taliwang', 'Resep Ayam Taliwang Asli Lombok, Ayam Bakar Pedas Meresap Sempurna', 'https://www.liputan6.com/lifestyle/read/8307016/resep-ayam-taliwang', 'Ibrahim Hasan, Liputan6, 6 October 2026'),
  ('recipe', 'ayam-taliwang', 'Asal Usul dan Resep Ayam Taliwang, Kuliner Pedas Gurih Khas Lombok', 'https://www.detik.com/bali/kuliner/d-7221636/asal-usul-dan-resep-ayam-taliwang-kuliner-pedas-gurih-khas-lombok', 'Zheerlin Larantika Djati Kusuma, detikBali, 3 March 2024'),
  ('costume', 'baju-lambung', 'Pakaian Adat Suku Sasak, Jadi Daya Tarik Wisatawan!', 'https://www.orami.co.id/magazine/pakaian-adat-suku-sasak', 'Orami, 10 June 2024'),
  ('costume', 'baju-lambung', 'Baju Lambung, ''Crop Top'' Adat Perempuan Khas Suku Sasak', 'https://travel.detik.com/domestic-destination/d-5870658/baju-lambung-crop-top-adat-perempuan-khas-suku-sasak', 'detikTravel, 26 December 2021'),
  ('costume', 'baju-lambung', 'Pakaian Lambung', 'https://www.indonesia.travel/us/en/travel-ideas/culture/pakaian-lambung/', 'Kementerian Pariwisata RI (indonesia.travel)');

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
