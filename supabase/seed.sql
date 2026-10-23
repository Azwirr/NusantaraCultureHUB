-- Local and staging seed.
--
-- Source: docs/content-seed.md (2 stories, 10 recipes, 3 costume cards).
-- Everything is a DRAFT (CLAUDE.md: content stays draft until a reviewer
-- approves it). Nothing here is verified yet: a reviewer checks each item
-- against a source before approving it, and a second person approves.
--
-- Phase 2 filled in the Indonesian text the content seed left out (summaries,
-- audio descriptions, alt text, recipe steps and costume cards), the region
-- intros and map codes, and Malin Kundang plus eight more recipes. Text that
-- the content seed did not contain at all is marked "[Phase 2]" below and
-- needs the same check as everything else:
--   * the region intros;
--   * Malin Kundang's audio description and alt text (it has no illustration
--     yet; they describe the planned one);
--   * dietary tags derived from each recipe's own ingredient list (chicken,
--     coconut milk, peanuts), in addition to the tags in the content seed.
--
-- Re-running is safe: rows that already exist are updated only while they are
-- drafts, so approved, rejected or unpublished content is never touched. It
-- does overwrite edits made to drafts, so run it once per database.
--
-- The three regions are still PLACEHOLDERS pending the team's decision (build
-- plan, "Three regions, three costumes, two legends").

-- Regions -------------------------------------------------------------------
-- [Phase 2] intros. Map codes are ISO 3166-2:ID: Javanese culture is centred
-- on Central Java, Yogyakarta and East Java; Minangkabau on West Sumatra;
-- Bugis and Makassar on South Sulawesi.
insert into public.regions as t (slug, name_id, name_en, summary_id, summary_en, province_codes, sort_order) values
  ('jawa', 'Jawa', 'Java',
   'Wilayah budaya Jawa meliputi Jawa Tengah, Daerah Istimewa Yogyakarta, dan Jawa Timur. Dari sini datang dongeng Timun Mas, gudeg, rawon, pecel, soto ayam, dan busana pengantin Jawa.',
   'The Javanese cultural region covers Central Java, the Special Region of Yogyakarta and East Java. It is home to the tale of Timun Mas, gudeg, rawon, pecel, soto ayam and Javanese wedding attire.',
   array['ID-JT', 'ID-YO', 'ID-JI'], 1),
  ('minangkabau', 'Minangkabau', 'Minangkabau',
   'Ranah Minang di Sumatera Barat, kampung halaman legenda Malin Kundang, rendang, dendeng balado, sate Padang, dan Baju Bundo Kanduang.',
   'The Minangkabau homeland in West Sumatra, home of the legend of Malin Kundang, rendang, dendeng balado, sate Padang and the Bundo Kanduang dress.',
   array['ID-SB'], 2),
  ('bugis', 'Bugis-Makassar (Sulawesi Selatan)', 'Bugis-Makassar (South Sulawesi)',
   'Sulawesi Selatan, tanah suku Bugis dan Makassar. Dari sini berasal coto Makassar, konro bakar, barongko, dan baju bodo.',
   'South Sulawesi, the land of the Bugis and Makassar peoples. It is the home of coto Makassar, konro bakar, barongko and the baju bodo.',
   array['ID-SN'], 3)
on conflict (slug) do update set
  name_id = excluded.name_id,
  name_en = excluded.name_en,
  summary_id = excluded.summary_id,
  summary_en = excluded.summary_en,
  province_codes = excluded.province_codes,
  sort_order = excluded.sort_order
where t.review_status = 'draft';

-- Stories --------------------------------------------------------------------
insert into public.stories as t (region_id, slug, title_id, title_en, summary_id, summary_en)
select r.id, x.slug, x.title_id, x.title_en, x.summary_id, x.summary_en
from (values
  ('jawa', 'timun-mas', 'Timun Mas', 'Timun Mas',
   'Seorang janda miskin membuat perjanjian dengan seorang raksasa, dan putrinya mengakali raksasa itu dengan empat biji dan benda ajaib.',
   'A poor widow makes a bargain with a giant, and her daughter outwits him with four magical seeds and objects.'),
  ('minangkabau', 'malin-kundang', 'Malin Kundang', 'Malin Kundang',
   'Seorang pemuda meninggalkan ibunya yang miskin, menjadi kaya di perantauan, lalu dikutuk karena tidak mau mengakui ibunya.',
   'A young man leaves his poor mother, becomes rich at sea, and is cursed when he refuses to acknowledge her.')
) as x (region_slug, slug, title_id, title_en, summary_id, summary_en)
join public.regions r on r.slug = x.region_slug
on conflict (slug) do update set
  region_id = excluded.region_id,
  title_id = excluded.title_id,
  title_en = excluded.title_en,
  summary_id = excluded.summary_id,
  summary_en = excluded.summary_en
where t.review_status = 'draft';

-- Chapters. Malin Kundang is text only in the MVP: one chapter, no audio.
insert into public.story_chapters as t (
  story_id, chapter_no, text_id, text_en,
  audio_description_id, audio_description_en, image_alt_id, image_alt_en)
select s.id, c.chapter_no, c.text_id, c.text_en,
  c.audio_description_id, c.audio_description_en, c.image_alt_id, c.image_alt_en
from public.stories s
join (values
  ('timun-mas', 1,
   'Mbok Sirni adalah janda miskin yang tinggal di sebuah desa. Suatu hari ia bertemu Buto Ijo, raksasa yang menawarkan harta dengan satu syarat: anak yang kelak lahir harus diserahkan kepada sang raksasa.',
   'Mbok Sirni was a poor widow in a village. One day she met Buto Ijo, a giant who offered her wealth on one condition: the child she would one day have must be given to him.',
   'Sebuah rumah kayu kecil saat senja. Seorang perempuan tua berdiri di ambang pintu, sementara sosok hijau yang sangat besar membungkuk di atas jalan setapak.',
   'A small wooden house at dusk. An old woman stands at the door while a huge green figure stoops over the path.',
   'Mbok Sirni, perempuan tua bertubuh kurus, berdiri di ambang pintu rumahnya saat raksasa hijau yang tinggi membungkuk ke arahnya dalam cahaya senja.',
   'Mbok Sirni, a thin older woman, stands at her doorway as a tall green giant bends toward her in the evening light.'),
  ('timun-mas', 2,
   'Bertahun-tahun kemudian, Buto Ijo datang menagih janjinya. Mbok Sirni memohon, dan raksasa itu memberi waktu. Anak mereka, yang bersinar seperti emas, diberi nama Timun Mas.',
   'Years later, Buto Ijo came to claim his promise. Mbok Sirni pleaded, and the giant gave her time. Their daughter, who shone like gold, was named Timun Mas.',
   'Seorang anak perempuan yang bercahaya keemasan tumbuh besar di sebuah rumah kecil, sementara sang raksasa menunggu di luar.',
   'A girl with a golden glow grows up in a small house while the giant waits outside.',
   'Seorang gadis kecil berkulit keemasan yang bercahaya di samping ibunya, sementara raksasa hijau menjulang di tepi gambar.',
   'A young girl with golden skin glowing beside her mother, while a green giant looms at the edge of the frame.'),
  ('timun-mas', 3,
   'Ketika Timun Mas beranjak dewasa, Buto Ijo kembali. Sang ibu memberinya empat benda ajaib: biji timun, jarum, garam, dan cabai. Timun Mas pun berlari keluar dari rumah.',
   'When Timun Mas was grown, the giant returned. Her mother gave her four magic items: cucumber seeds, a needle, salt, and chili. Timun Mas ran from the house.',
   'Seorang gadis berlari di jalan tanah sambil menggenggam empat benda kecil, sementara sang raksasa mengejarnya.',
   'A girl runs down a dirt path holding four small objects in her hands, while the giant chases her.',
   'Seorang gadis berlari di sepanjang jalan setapak sambil membawa kantong kecil, dengan raksasa yang melangkah lebar di belakangnya.',
   'A young girl runs along a path holding a small bag, with a giant striding after her.'),
  ('timun-mas', 4,
   'Buto Ijo mengejar. Timun Mas melempar biji timun, dan tumbuhlah ladang timun yang membuat raksasa itu tertahan. Lalu jarum menjadi hutan bambu, garam menjadi lautan, dan cabai menjadi api yang menghalangi sang raksasa.',
   'The giant gave chase. Timun Mas threw the cucumber seeds, and a cucumber field grew to slow him. Then the needle became a bamboo forest, the salt became a sea, and the chili became a fire that blocked the giant.',
   'Empat perubahan ajaib berturut-turut: ladang timun, hutan bambu yang lebat, lautan yang berkilau, dan dinding api.',
   'Four magic changes in a row: a field of cucumbers, a dense bamboo forest, a shining sea, and a wall of flame.',
   'Empat adegan dalam satu gambar: sulur timun yang hijau, bambu yang tinggi, laut biru, dan deretan api jingga, dengan sang raksasa tertahan di tepinya.',
   'Four scenes in one picture: green cucumber vines, tall bamboo, a blue sea, and a line of orange flames, with the giant held back at the edge.'),
  ('timun-mas', 5,
   'Buto Ijo tidak dapat menyeberangi api itu dan tidak pernah kembali. Timun Mas pulang kepada ibunya, dan mereka hidup dengan tenang. Cerita ini mengajarkan bahwa kecerdikan dan keberanian dapat mengalahkan kekuatan yang besar.',
   'The giant could not cross the fire and never returned. Timun Mas went home to her mother, and they lived in peace. The story teaches that courage and cleverness can overcome great strength.',
   'Seorang gadis dan ibunya berdiri berdampingan di depan rumah mereka di bawah sinar matahari pagi.',
   'A girl and her mother stand together in front of their house in the morning sun.',
   'Seorang gadis dan ibunya berdiri di luar rumah dalam cahaya pagi yang hangat, api dan sang raksasa jauh di belakang mereka.',
   'A girl and her mother stand outside their house in warm morning light, the fire and the giant far behind them.'),
  -- [Phase 2] audio description and alt text describe the planned illustration.
  ('malin-kundang', 1,
   'Malin Kundang adalah anak seorang janda miskin di pesisir Sumatera Barat. Ia pergi merantau dan kembali sebagai saudagar kaya bersama istrinya. Ketika ibunya datang menyambut, Malin menyangkal dan mengusirnya. Sang ibu mengutuknya, dan Malin pun berubah menjadi batu. Cerita ini mengajarkan kita untuk menghormati orang tua.',
   'Malin Kundang was the son of a poor widow on the West Sumatran coast. He left to seek his fortune and came back as a wealthy merchant with his wife. When his mother came to greet him, Malin denied her and sent her away. The mother cursed him, and Malin turned to stone. The story teaches respect for parents.',
   'Pantai di pesisir Sumatera Barat dengan sebuah kapal dagang besar yang sedang berlabuh. Seorang perempuan tua berpakaian sederhana berhadapan dengan seorang pemuda berpakaian mewah di tepi pantai.',
   'A beach on the West Sumatran coast with a large merchant ship at anchor. An old woman in simple clothes faces a richly dressed young man on the shore.',
   'Seorang perempuan tua mengulurkan tangan kepada pemuda berpakaian mewah di pantai, dengan kapal besar di belakang mereka.',
   'An old woman reaches out to a richly dressed young man on a beach, with a large ship behind them.')
) as c (story_slug, chapter_no, text_id, text_en, audio_description_id, audio_description_en, image_alt_id, image_alt_en)
  on c.story_slug = s.slug
where s.review_status = 'draft'
on conflict (story_id, chapter_no) do update set
  text_id = excluded.text_id,
  text_en = excluded.text_en,
  audio_description_id = excluded.audio_description_id,
  audio_description_en = excluded.audio_description_en,
  image_alt_id = excluded.image_alt_id,
  image_alt_en = excluded.image_alt_en
where t.review_status = 'draft';

-- Recipes --------------------------------------------------------------------
-- All ten serve 4. Halal status stays 'unknown' until a source confirms it.
insert into public.recipes as t (region_id, slug, name_id, name_en, servings, minutes, dietary_tags)
select r.id, x.slug, x.name_id, x.name_en, 4, x.minutes, x.tags
from (values
  ('jawa', 'gudeg-yogyakarta', 'Gudeg Yogyakarta', 'Gudeg Yogyakarta (young jackfruit stew)', 240,
   array['vegetarian_option', 'contains_egg', 'contains_chicken', 'contains_coconut']),
  ('jawa', 'rawon', 'Rawon', 'Rawon (East Javanese black beef soup)', 90,
   array['contains_beef']),
  ('jawa', 'soto-ayam', 'Soto Ayam', 'Soto Ayam (chicken soup)', 75,
   array['contains_chicken', 'contains_egg']),
  ('jawa', 'pecel', 'Pecel', 'Pecel (vegetables with peanut sauce)', 40,
   array['vegetarian', 'contains_peanut']),
  ('minangkabau', 'rendang-daging', 'Rendang Daging', 'Beef Rendang', 240,
   array['contains_beef', 'contains_coconut']),
  ('minangkabau', 'dendeng-balado', 'Dendeng Balado', 'Dendeng Balado (sliced beef with chili)', 45,
   array['contains_beef']),
  ('minangkabau', 'sate-padang', 'Sate Padang', 'Sate Padang (beef satay in thick sauce)', 90,
   array['contains_beef', 'contains_peanut']),
  ('bugis', 'coto-makassar', 'Coto Makassar', 'Coto Makassar (beef soup)', 180,
   array['contains_beef', 'contains_peanut']),
  ('bugis', 'konro-bakar', 'Konro Bakar', 'Konro Bakar (grilled beef ribs)', 180,
   array['contains_beef']),
  ('bugis', 'barongko', 'Barongko', 'Barongko (steamed banana dessert)', 40,
   array['contains_egg', 'contains_coconut'])
) as x (region_slug, slug, name_id, name_en, minutes, tags)
join public.regions r on r.slug = x.region_slug
on conflict (slug) do update set
  region_id = excluded.region_id,
  name_id = excluded.name_id,
  name_en = excluded.name_en,
  servings = excluded.servings,
  minutes = excluded.minutes,
  dietary_tags = excluded.dietary_tags
where t.review_status = 'draft';

insert into public.recipe_ingredients as t (recipe_id, position, name_id, name_en, amount, unit)
select rc.id, i.position, i.name_id, i.name_en, i.amount, i.unit
from public.recipes rc
join (values
  ('gudeg-yogyakarta', 1, 'Nangka muda', 'Young jackfruit', 1::numeric, 'kg'),
  ('gudeg-yogyakarta', 2, 'Santan', 'Coconut milk', 500, 'ml'),
  ('gudeg-yogyakarta', 3, 'Gula merah', 'Palm sugar', 100, 'g'),
  ('gudeg-yogyakarta', 4, 'Bawang merah', 'Shallot', 6, 'piece'),
  ('gudeg-yogyakarta', 5, 'Bawang putih', 'Garlic', 4, 'clove'),
  ('gudeg-yogyakarta', 6, 'Daun salam', 'Indonesian bay leaf', 3, 'leaf'),
  ('gudeg-yogyakarta', 7, 'Lengkuas', 'Galangal', 2, 'cm'),
  ('gudeg-yogyakarta', 8, 'Ayam', 'Chicken', 4, 'piece'),
  ('gudeg-yogyakarta', 9, 'Telur', 'Egg', 4, 'piece'),

  ('rawon', 1, 'Daging sapi', 'Beef', 500, 'g'),
  ('rawon', 2, 'Kluwek, dihaluskan', 'Kluwek (black nut), mashed', 3, 'piece'),
  ('rawon', 3, 'Bawang merah', 'Shallot', 6, 'piece'),
  ('rawon', 4, 'Bawang putih', 'Garlic', 4, 'clove'),
  ('rawon', 5, 'Kemiri', 'Candlenut', 3, 'piece'),
  ('rawon', 6, 'Kunyit', 'Turmeric', 1, 'cm'),
  ('rawon', 7, 'Lengkuas', 'Galangal', 2, 'cm'),
  ('rawon', 8, 'Serai', 'Lemongrass', 1, 'stalk'),
  ('rawon', 9, 'Daun jeruk', 'Lime leaf', 4, 'leaf'),
  ('rawon', 10, 'Tauge, untuk penyajian', 'Bean sprouts, to serve', null, null),
  ('rawon', 11, 'Sambal, untuk penyajian', 'Sambal, to serve', null, null),

  ('soto-ayam', 1, 'Ayam', 'Chicken', 1, 'whole'),
  ('soto-ayam', 2, 'Bawang putih', 'Garlic', 4, 'clove'),
  ('soto-ayam', 3, 'Bawang merah', 'Shallot', 6, 'piece'),
  ('soto-ayam', 4, 'Jahe', 'Ginger', 2, 'cm'),
  ('soto-ayam', 5, 'Kunyit', 'Turmeric', 1, 'cm'),
  ('soto-ayam', 6, 'Serai', 'Lemongrass', 1, 'stalk'),
  ('soto-ayam', 7, 'Daun salam', 'Indonesian bay leaf', 2, 'leaf'),
  ('soto-ayam', 8, 'Soun', 'Glass noodles', null, null),
  ('soto-ayam', 9, 'Telur rebus', 'Boiled egg', null, null),
  ('soto-ayam', 10, 'Kecap manis', 'Sweet soy sauce', null, null),

  ('pecel', 1, 'Kangkung, direbus sebentar', 'Water spinach, blanched', null, null),
  ('pecel', 2, 'Tauge, direbus sebentar', 'Bean sprouts, blanched', null, null),
  ('pecel', 3, 'Kacang panjang, direbus sebentar', 'Long beans, blanched', null, null),
  ('pecel', 4, 'Kacang tanah, digoreng dan dihaluskan', 'Peanuts, fried and ground', 150, 'g'),
  ('pecel', 5, 'Cabai', 'Chili', 5, 'piece'),
  ('pecel', 6, 'Gula merah', 'Palm sugar', 50, 'g'),
  ('pecel', 7, 'Asam jawa', 'Tamarind', 1, 'tsp'),
  ('pecel', 8, 'Bawang putih', 'Garlic', 2, 'clove'),

  ('rendang-daging', 1, 'Daging sapi', 'Beef', 1, 'kg'),
  ('rendang-daging', 2, 'Santan', 'Coconut milk', 1, 'l'),
  ('rendang-daging', 3, 'Cabai merah', 'Red chili', 15, 'piece'),
  ('rendang-daging', 4, 'Bawang merah', 'Shallot', 10, 'piece'),
  ('rendang-daging', 5, 'Bawang putih', 'Garlic', 6, 'clove'),
  ('rendang-daging', 6, 'Jahe', 'Ginger', 3, 'cm'),
  ('rendang-daging', 7, 'Lengkuas', 'Galangal', 3, 'cm'),
  ('rendang-daging', 8, 'Kunyit', 'Turmeric', 2, 'cm'),
  ('rendang-daging', 9, 'Serai', 'Lemongrass', 2, 'stalk'),
  ('rendang-daging', 10, 'Daun kunyit', 'Turmeric leaf', null, null),
  ('rendang-daging', 11, 'Daun jeruk', 'Lime leaf', null, null),
  ('rendang-daging', 12, 'Daun salam', 'Indonesian bay leaf', null, null),

  ('dendeng-balado', 1, 'Dendeng sapi', 'Thin dried beef', 300, 'g'),
  ('dendeng-balado', 2, 'Cabai merah', 'Red chili', 10, 'piece'),
  ('dendeng-balado', 3, 'Bawang merah', 'Shallot', 6, 'piece'),
  ('dendeng-balado', 4, 'Tomat', 'Tomato', 1, 'piece'),
  ('dendeng-balado', 5, 'Jeruk nipis', 'Lime', 1, 'piece'),
  ('dendeng-balado', 6, 'Garam', 'Salt', null, 'to_taste'),
  ('dendeng-balado', 7, 'Gula', 'Sugar', null, 'to_taste'),

  ('sate-padang', 1, 'Daging sapi, dipotong dadu', 'Beef, cut into cubes', 500, 'g'),
  ('sate-padang', 2, 'Kacang tanah', 'Peanuts', 50, 'g'),
  ('sate-padang', 3, 'Kunyit', 'Turmeric', 1, 'cm'),
  ('sate-padang', 4, 'Ketumbar', 'Coriander', 1, 'tsp'),
  ('sate-padang', 5, 'Jintan', 'Cumin', 1, 'tsp'),
  ('sate-padang', 6, 'Tepung beras', 'Rice flour', 2, 'tbsp'),
  ('sate-padang', 7, 'Bawang goreng, untuk taburan', 'Fried shallots, to serve', null, null),

  ('coto-makassar', 1, 'Daging sapi dengan urat', 'Beef with tendon', 500, 'g'),
  ('coto-makassar', 2, 'Kacang tanah, disangrai dan dihaluskan', 'Peanuts, toasted and ground', 100, 'g'),
  ('coto-makassar', 3, 'Serai', 'Lemongrass', 2, 'stalk'),
  ('coto-makassar', 4, 'Lengkuas', 'Galangal', 3, 'cm'),
  ('coto-makassar', 5, 'Jahe', 'Ginger', 2, 'cm'),
  ('coto-makassar', 6, 'Kemiri', 'Candlenut', 3, 'piece'),
  ('coto-makassar', 7, 'Daun jeruk', 'Lime leaf', null, null),
  ('coto-makassar', 8, 'Bawang goreng, untuk taburan', 'Fried shallots, to serve', null, null),
  ('coto-makassar', 9, 'Ketupat, untuk penyajian', 'Ketupat (rice cake), to serve', null, null),

  ('konro-bakar', 1, 'Iga sapi', 'Beef ribs', 1, 'kg'),
  ('konro-bakar', 2, 'Kemiri', 'Candlenut', 5, 'piece'),
  ('konro-bakar', 3, 'Ketumbar', 'Coriander', 1, 'tsp'),
  ('konro-bakar', 4, 'Lengkuas', 'Galangal', 2, 'cm'),
  ('konro-bakar', 5, 'Asam jawa', 'Tamarind', 1, 'tsp'),
  ('konro-bakar', 6, 'Gula merah', 'Palm sugar', 1, 'tbsp'),
  ('konro-bakar', 7, 'Kecap manis', 'Sweet soy sauce', 2, 'tbsp'),

  ('barongko', 1, 'Pisang, dihaluskan', 'Bananas, mashed', 6, 'piece'),
  ('barongko', 2, 'Telur', 'Egg', 2, 'piece'),
  ('barongko', 3, 'Santan', 'Coconut milk', 200, 'ml'),
  ('barongko', 4, 'Gula', 'Sugar', 100, 'g'),
  ('barongko', 5, 'Garam, sejumput', 'Salt, a pinch', null, null)
) as i (recipe_slug, position, name_id, name_en, amount, unit) on i.recipe_slug = rc.slug
where rc.review_status = 'draft'
on conflict (recipe_id, position) do update set
  name_id = excluded.name_id,
  name_en = excluded.name_en,
  amount = excluded.amount,
  unit = excluded.unit;

insert into public.recipe_steps as t (recipe_id, step_no, text_id, text_en, timer_seconds)
select rc.id, s.step_no, s.text_id, s.text_en, s.timer_seconds
from public.recipes rc
join (values
  ('gudeg-yogyakarta', 1, 'Rebus nangka muda bersama santan, gula merah, dan bumbu.',
   'Simmer the jackfruit with coconut milk, palm sugar, and spices.', null::integer),
  ('gudeg-yogyakarta', 2, 'Masak dengan api kecil sekitar 3 sampai 4 jam sambil sesekali diaduk.',
   'Cook slowly for about 3 to 4 hours, stirring from time to time.', null),
  ('gudeg-yogyakarta', 3, 'Masukkan ayam dan telur, lalu masak hingga empuk.',
   'Add the chicken and eggs and cook until tender.', null),
  ('gudeg-yogyakarta', 4, 'Sajikan dengan nasi.', 'Serve with rice.', null),

  ('rawon', 1, 'Rebus daging sapi hingga empuk.', 'Boil the beef until tender.', null),
  ('rawon', 2, 'Haluskan bumbu dan kluwek, lalu tumis hingga harum.',
   'Blend the spices and kluwek, then fry until fragrant.', null),
  ('rawon', 3, 'Masukkan bumbu ke dalam kuah, lalu masak dengan api kecil selama 20 menit.',
   'Add the spice paste to the broth and simmer 20 minutes.', 1200),
  ('rawon', 4, 'Sajikan dengan tauge dan sambal.', 'Serve with bean sprouts and sambal.', null),

  ('soto-ayam', 1, 'Rebus ayam bersama bumbu dan daun salam.',
   'Boil the chicken with spices and daun salam.', null),
  ('soto-ayam', 2, 'Tumis bumbu yang sudah dihaluskan, lalu masukkan ke dalam kuah.',
   'Fry the blended spices, then add them to the broth.', null),
  ('soto-ayam', 3, 'Suwir ayam, lalu siapkan soun dan telur.',
   'Shred the chicken and prepare the noodles and eggs.', null),
  ('soto-ayam', 4, 'Sajikan selagi panas dengan pelengkap dan kecap manis.',
   'Serve hot with the toppings and soy sauce.', null),

  ('pecel', 1, 'Rebus sayuran sebentar.', 'Blanch the vegetables briefly.', null),
  ('pecel', 2, 'Haluskan kacang tanah bersama cabai, bawang putih, gula merah, dan asam jawa.',
   'Grind the peanuts with chili, garlic, palm sugar, and tamarind.', null),
  ('pecel', 3, 'Campur bumbu dengan sedikit air hangat hingga halus.',
   'Mix the sauce with a little warm water until smooth.', null),
  ('pecel', 4, 'Aduk sayuran dengan bumbu kacang.', 'Toss the vegetables with the sauce.', null),

  ('rendang-daging', 1, 'Haluskan cabai, bawang merah, bawang putih, jahe, lengkuas, dan kunyit.',
   'Blend the chili, shallot, garlic, ginger, galangal, and turmeric.', null),
  ('rendang-daging', 2, 'Masak daging dalam santan bersama bumbu halus dan daun-daunan.',
   'Simmer the beef in coconut milk with the paste and leaves.', null),
  ('rendang-daging', 3, 'Masak dengan api kecil selama 3 sampai 4 jam sambil diaduk, hingga kuahnya hampir kering.',
   'Cook on low heat for 3 to 4 hours, stirring, until the liquid is nearly dry.', null),
  ('rendang-daging', 4, 'Lanjutkan memasak hingga daging berwarna gelap dan terbalut bumbu.',
   'Continue until the beef is dark and coated.', null),

  ('dendeng-balado', 1, 'Goreng dendeng hingga renyah, lalu tiriskan.',
   'Fry the dendeng until crisp, then drain.', null),
  ('dendeng-balado', 2, 'Haluskan cabai, bawang merah, dan tomat.',
   'Blend the chili, shallot, and tomato.', null),
  ('dendeng-balado', 3, 'Tumis bumbu hingga harum, lalu masukkan dendeng.',
   'Stir-fry the paste until fragrant, then add the dendeng.', null),
  ('dendeng-balado', 4, 'Beri perasan air jeruk nipis.', 'Finish with lime juice.', null),

  ('sate-padang', 1, 'Bumbui daging, lalu tusuk dengan tusuk sate.', 'Marinate and skewer the beef.', null),
  ('sate-padang', 2, 'Bakar sate di atas bara arang.', 'Grill the skewers over charcoal.', null),
  ('sate-padang', 3, 'Buat kuah dari kacang tanah yang dihaluskan, bumbu, dan tepung beras.',
   'Make the sauce from ground peanut, spices, and rice flour.', null),
  ('sate-padang', 4, 'Sajikan sate dengan kuah yang hangat.', 'Serve the skewers in the warm sauce.', null),

  ('coto-makassar', 1, 'Rebus daging hingga sangat empuk, lalu buang buih dari kuahnya.',
   'Boil the beef until very tender, then skim the broth.', null),
  ('coto-makassar', 2, 'Haluskan bumbu dan tumis hingga harum, lalu masukkan ke dalam kuah.',
   'Blend the spices and fry until fragrant, then add to the broth.', null),
  ('coto-makassar', 3, 'Masukkan kacang tanah yang sudah dihaluskan agar kuah mengental.',
   'Stir in the ground peanuts to thicken.', null),
  ('coto-makassar', 4, 'Sajikan dengan ketupat dan bawang goreng.',
   'Serve with ketupat and fried shallot.', null),

  ('konro-bakar', 1, 'Rebus iga bersama bumbu hingga empuk.', 'Simmer the ribs with spices until tender.', null),
  ('konro-bakar', 2, 'Lumuri iga dengan asam jawa, gula merah, dan kecap manis.',
   'Marinate the ribs in tamarind, palm sugar, and sweet soy sauce.', null),
  ('konro-bakar', 3, 'Bakar hingga kecokelatan dan mengilap.', 'Grill until charred and glossy.', null),
  ('konro-bakar', 4, 'Sajikan selagi panas.', 'Serve hot.', null),

  ('barongko', 1, 'Campur pisang, telur, gula, santan, dan garam.',
   'Mix the banana, egg, sugar, coconut milk, and salt.', null),
  ('barongko', 2, 'Masukkan adonan ke dalam bungkusan daun pisang.', 'Spoon into banana leaf parcels.', null),
  ('barongko', 3, 'Kukus selama 20 sampai 30 menit.', 'Steam for 20 to 30 minutes.', null),
  ('barongko', 4, 'Sajikan setelah dingin.', 'Serve cooled.', null)
) as s (recipe_slug, step_no, text_id, text_en, timer_seconds) on s.recipe_slug = rc.slug
where rc.review_status = 'draft'
on conflict (recipe_id, step_no) do update set
  text_id = excluded.text_id,
  text_en = excluded.text_en,
  timer_seconds = excluded.timer_seconds;

-- Costume info cards ----------------------------------------------------------
-- The reference images are project placeholders (public/placeholders). Each
-- card needs a real reference image and a museum or regional source before
-- it goes live.
insert into public.costumes as t (region_id, slug, name_id, name_en, info_id, info_en, reference_image_url)
select r.id, x.slug, x.name_id, x.name_en, x.info_id, x.info_en, x.image
from (values
  ('jawa', 'pengantin-jawa', 'Pengantin Jawa', 'Javanese wedding attire',
   'Dikenakan pada upacara pernikahan Jawa. Setiap daerah memiliki gayanya sendiri. Pengantin perempuan: kebaya dan kain batik. Pengantin laki-laki: beskap dan blangkon.',
   'Worn at Javanese weddings. Each region has its own style. Bride: kebaya and batik kain. Groom: beskap and blangkon.',
   '/placeholders/costume-pengantin-jawa.svg'),
  ('minangkabau', 'baju-bundo-kanduang', 'Baju Bundo Kanduang', 'Bundo Kanduang dress',
   'Busana adat dari Sumatera Barat yang dikenakan pada upacara adat. Busana perempuan dengan kain songket, serta hiasan kepala suntiang untuk pengantin.',
   'A traditional dress from West Sumatra, worn at ceremonies. Women''s dress with songket cloth and a suntiang headdress for brides.',
   '/placeholders/costume-bundo-kanduang.svg'),
  ('bugis', 'baju-bodo', 'Baju Bodo', 'Baju Bodo',
   'Busana adat dari Sulawesi Selatan yang dikenal dengan bentuknya yang sederhana. Blus berpotongan segi empat yang dipadukan dengan sarung sutra (lipa sabbe).',
   'A traditional dress from South Sulawesi, known for its simple shape. Square-cut blouse worn with a silk sarong (lipa sabbe).',
   '/placeholders/costume-baju-bodo.svg')
) as x (region_slug, slug, name_id, name_en, info_id, info_en, image)
join public.regions r on r.slug = x.region_slug
on conflict (slug) do update set
  region_id = excluded.region_id,
  name_id = excluded.name_id,
  name_en = excluded.name_en,
  info_id = excluded.info_id,
  info_en = excluded.info_en,
  reference_image_url = excluded.reference_image_url
where t.review_status = 'draft';

-- Badges (FR-10). The first two come from the PRD; the third is a placeholder.
insert into public.badges (code, name_id, name_en, description_id, description_en, rule_key) values
  ('first_story_finished', 'Penjaga Kisah', 'Story Keeper',
   'Menyelesaikan cerita pertama sampai bab terakhir.', 'Finished the first story to its last chapter.',
   'story_completed'),
  ('first_recipe_cooked', 'Juru Masak Pemula', 'First Cook',
   'Memasak resep pertama.', 'Cooked a first recipe.',
   'recipe_cooked'),
  ('all_regions_visited', 'Penjelajah Nusantara', 'Nusantara Explorer',
   'Placeholder: mengunjungi semua halaman wilayah.', 'Placeholder: visited every region page.',
   'regions_visited')
on conflict (code) do nothing;
