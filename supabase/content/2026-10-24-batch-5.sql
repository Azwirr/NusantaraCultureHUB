-- Content batch 5 (2026-10-24): six more regions across the archipelago.
-- Each item below was drafted from sources Claude opened, and cites two
-- different websites (see docs/candidate-sources.md for what each covers).
-- Only drafts change. Re-running is safe.

-- 1. Regions ---------------------------------------------------------------------
insert into public.regions as t (slug, name_id, name_en, summary_id, summary_en, province_codes, sort_order) values
  ('betawi', 'Betawi (DKI Jakarta)', 'Betawi (Jakarta)',
   'Budaya Betawi di Jakarta, asal legenda Si Pitung, kerak telor, dan baju sadariah.',
   'Betawi culture of Jakarta, home of the legend of Si Pitung, kerak telor and the sadariah.',
   array['ID-JK'], 11),
  ('aceh', 'Aceh', 'Aceh',
   'Tanah Aceh di ujung barat Sumatera, asal legenda Putri Pukes, kuah beulangong, dan linto baro.',
   'The land of Aceh at the western tip of Sumatra, home of the legend of Putri Pukes, kuah beulangong and the linto baro.',
   array['ID-AC'], 12),
  ('toraja', 'Toraja (Sulawesi Selatan)', 'Toraja (South Sulawesi)',
   'Tana Toraja di Sulawesi Selatan, asal cerita La Dana dan Kerbaunya, pa''piong, dan baju pokko''.',
   'Tana Toraja in South Sulawesi, home of the tale of La Dana and his buffalo, pa''piong and baju pokko''.',
   array['ID-SN'], 13),
  ('dayak-ngaju', 'Dayak Ngaju (Kalimantan Tengah)', 'Dayak Ngaju (Central Kalimantan)',
   'Suku Dayak Ngaju di Kalimantan Tengah, dengan baju sangkarut.',
   'The Dayak Ngaju people of Central Kalimantan, with the baju sangkarut.',
   array['ID-KT'], 14),
  ('rote', 'Rote dan Flores (Nusa Tenggara Timur)', 'Rote and Flores (East Nusa Tenggara)',
   'Nusa Tenggara Timur: legenda Danau Kelimutu di Flores, sei sapi dari Timor, dan ti''i langga dari Rote.',
   'East Nusa Tenggara: the legend of Lake Kelimutu on Flores, sei sapi from Timor and the ti''i langga from Rote.',
   array['ID-NT'], 15),
  ('minahasa', 'Minahasa (Sulawesi Utara)', 'Minahasa (North Sulawesi)',
   'Tanah Minahasa di Sulawesi Utara, asal legenda Toar dan Lumimuut, dan tinutuan.',
   'The land of the Minahasa in North Sulawesi, home of the legend of Toar and Lumimuut, and tinutuan.',
   array['ID-SA'], 16)
on conflict (slug) do update set
  name_id = excluded.name_id, name_en = excluded.name_en,
  summary_id = excluded.summary_id, summary_en = excluded.summary_en,
  province_codes = excluded.province_codes, sort_order = excluded.sort_order
where t.review_status = 'draft';

-- 2. Stories --------------------------------------------------------------------
insert into public.stories as t (region_id, slug, title_id, title_en, summary_id, summary_en)
select r.id, x.slug, x.title_id, x.title_en, x.summary_id, x.summary_en
from (values
  ('betawi', 'si-pitung', 'Si Pitung', 'Si Pitung',
   'Pendekar Betawi yang melawan Belanda dan membagi hasil rampasannya kepada rakyat miskin.',
   'A Betawi warrior who fought the Dutch and shared what he took with poor people.'),
  ('aceh', 'putri-pukes', 'Putri Pukes', 'Putri Pukes',
   'Putri Gayo yang menoleh ke belakang saat meninggalkan negerinya, lalu menjadi batu di tepi Danau Laut Tawar.',
   'A Gayo princess who looks back as she leaves her homeland, and becomes stone beside Lake Laut Tawar.'),
  ('toraja', 'la-dana-dan-kerbaunya', 'La Dana dan Kerbaunya', 'La Dana and His Buffalo',
   'Si cerdik La Dana menukar daging pesta dengan seekor kerbau, lalu menipu temannya hingga kerbau itu menjadi miliknya.',
   'Clever La Dana trades the funeral meat for a live buffalo, then tricks his friend into giving it all to him.'),
  ('rote', 'danau-kelimutu', 'Danau Kelimutu', 'Lake Kelimutu',
   'Ata Bupu yang baik melindungi dua anak yatim dari penyihir Ata Polo, dan keempatnya menjadi danau tiga warna.',
   'The kind Ata Bupu protects two orphans from the sorcerer Ata Polo, and all four become the three-coloured lakes.'),
  ('minahasa', 'toar-dan-lumimuut', 'Toar dan Lumimuut', 'Toar and Lumimuut',
   'Putri Lumimuut dan putranya Toar, leluhur orang Minahasa, bertemu lewat tongkat yang mempertemukan jodoh.',
   'Princess Lumimuut and her son Toar, ancestors of the Minahasa people, meet through the staves that lead them to marriage.')
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
  ('si-pitung', 1,
   'Pitung, pemuda dari Rawa Belong di Jakarta Barat, belajar mengaji dan silat dari gurunya, Haji Naipin. Dengan latihan yang tekun ia menjadi sakti, tetapi tetap rendah hati dan peduli pada tetangganya.',
   'Pitung, a young man from Rawa Belong in West Jakarta, learned the Quran and silat from his teacher, Haji Naipin. Through hard practice he gained great power, but he stayed humble and cared for his neighbours.',
   'Seorang pemuda berdiri dengan sikap silat di halaman rumah sederhana di Betawi.',
   'A young man stands in silat pose in the yard of a simple Betawi house.',
   'Si Pitung berlatih silat di halaman rumahnya di Rawa Belong.',
   'Si Pitung practises silat in his yard in Rawa Belong.'),
  ('si-pitung', 2,
   'Ketika Belanda menindas rakyat kecil, Pitung bersama dua sahabatnya merampok rumah-rumah orang kaya yang bekerja sama dengan penjajah. Hasilnya dibagikan kepada warga miskin, yang menganggapnya pelindung.',
   'When the Dutch oppressed the common people, Pitung and two friends robbed the homes of wealthy men who worked with the colonial rulers. They shared the loot with poor villagers, who saw him as their protector.',
   'Tiga pemuda membagikan karung beras kepada warga di sebuah kampung di malam hari.',
   'Three young men hand out sacks of rice to villagers in a village at night.',
   'Si Pitung membagikan hasil rampasan kepada warga miskin.',
   'Si Pitung shares what he took with poor villagers.'),
  ('si-pitung', 3,
   'Belanda memburunya dan menyiksa orang-orang yang pernah ia tolong. Menurut legenda, Pitung kebal peluru biasa dan hanya bisa dikalahkan dengan peluru emas. Ia gugur, tetapi namanya tetap hidup di hati orang Betawi. Sejarawan masih memperdebatkan kisah hidupnya.',
   'The Dutch hunted him and tortured people he had helped. According to legend, Pitung could not be harmed by ordinary bullets and could only be defeated with a golden bullet. He died, but his name lives on in the hearts of the Betawi. Historians still debate his life story.',
   'Seorang polisi Belanda membidikkan senjata ke arah rumah kayu di malam hari.',
   'A Dutch policeman aims a rifle at a wooden house at night.',
   'Polisi Belanda memburu Si Pitung.',
   'The Dutch police hunt Si Pitung.'),
  ('putri-pukes', 1,
   'Putri Pukes, putri raja dari tanah Gayo, jatuh cinta kepada pangeran dari kerajaan lain. Jarak yang jauh membuat ayahnya berat hati, tetapi setelah putrinya memohon, sang raja merestui pernikahan itu.',
   'Putri Pukes, a princess of the Gayo lands, fell in love with a prince from another kingdom. The distance troubled her father, but after his daughter pleaded, the king gave his blessing to the marriage.',
   'Seorang putri berbusana adat Gayo berdiri di depan istana kayu, menatap ke arah jalan yang jauh.',
   'A princess in Gayo traditional dress stands before a wooden palace, looking down a distant road.',
   'Putri Pukes berdiri di depan istana kayu di tanah Gayo.',
   'Putri Pukes stands before a wooden palace in the Gayo lands.'),
  ('putri-pukes', 2,
   'Saat berangkat ke negeri suaminya, ibunya berpesan agar putrinya jangan pernah menoleh ke belakang. Dalam perjalanan, rindu kampung halaman membuat sang putri menoleh juga.',
   'As she set out for her husband''s land, her mother warned her never to look back. On the journey, homesickness made her turn to look at her homeland.',
   'Rombongan berjalan menyusuri jalan setapak di pegunungan. Seorang perempuan menoleh ke belakang.',
   'A procession walks a mountain path. A woman turns to look back.',
   'Putri Pukes menoleh ke belakang saat rombongan berjalan.',
   'Putri Pukes turns to look back as the procession walks on.'),
  ('putri-pukes', 3,
   'Petir menyambar dan hujan deras turun. Rombongan berteduh di gua, dan tubuh sang putri perlahan mengeras menjadi batu. Genangan air hujan itu dipercaya menjadi cikal bakal Danau Laut Tawar.',
   'Lightning struck and heavy rain fell. The group sheltered in a cave, and the princess''s body slowly hardened into stone. The rainwater that flooded the area is believed to have formed Lake Laut Tawar.',
   'Petir menyambar di atas pegunungan, dengan air hujan membanjiri lembah di bawahnya.',
   'Lightning strikes over the mountains, and rain floods the valley below.',
   'Petir dan hujan deras membentuk Danau Laut Tawar.',
   'Lightning and heavy rain form Lake Laut Tawar.'),
  ('la-dana-dan-kerbaunya', 1,
   'La Dana, anak petani dari Tana Toraja, dikenal cerdik sekaligus licik. Di sebuah upacara pemakaman, ia hanya mendapat paha belakang kerbau, sedangkan temannya mendapat hampir seluruh daging.',
   'La Dana, a farmer''s son from Tana Toraja, was known for being clever and sly. At a funeral feast he received only a hind leg of buffalo, while his friend received almost all the meat.',
   'Sebuah upacara pemakaman Toraja dengan rumah adat tongkonan dan daging kerbau dibagikan kepada tamu.',
   'A Toraja funeral with traditional tongkonan houses, where buffalo meat is shared with guests.',
   'Upacara pemakaman di Tana Toraja dengan daging kerbau untuk tamu.',
   'A Toraja funeral in Tana Toraja, with buffalo meat for the guests.'),
  ('la-dana-dan-kerbaunya', 2,
   'Iri hati, La Dana mengajak temannya menukar seluruh bagian daging dengan seekor kerbau hidup untuk dipelihara bersama, lalu dipotong ketika sudah gemuk. Tuan rumah menyetujui tukar-menukar itu.',
   'Filled with envy, La Dana suggested that they swap their meat for a live buffalo to raise together, and slaughter it once it was fat. The host agreed to the exchange.',
   'Dua pria membawa seekor kerbau kurus pulang ke sebuah rumah di kaki bukit.',
   'Two men lead a thin buffalo home to a house at the foot of a hill.',
   'La Dana dan temannya membawa pulang seekor kerbau hidup.',
   'La Dana and his friend take a live buffalo home.'),
  ('la-dana-dan-kerbaunya', 3,
   'La Dana terus mendesak agar kerbau segera dipotong. Temannya bersabar dan menjanjikan bagian yang lebih besar, tetapi setelah berkali-kali didesak ia marah dan menyerahkan seluruh kerbau kepada La Dana. Pesannya: kecerdikan sebaiknya dipakai untuk kebaikan, bukan untuk menipu.',
   'La Dana kept pressing for the buffalo to be slaughtered. His friend stayed patient and promised him a bigger share, but after repeated demands he lost his temper and gave the whole buffalo to La Dana. The message: cleverness should serve goodness, not deceit.',
   'Seekor kerbau gemuk berdiri di halaman, sementara seorang pria pulang dengan gembira.',
   'A fat buffalo stands in a yard while a man walks home happily.',
   'Kerbau gemuk diserahkan kepada La Dana.',
   'The fat buffalo is handed over to La Dana.'),
  ('danau-kelimutu', 1,
   'Di puncak Gunung Kelimutu, Konde Ratu dan rakyatnya hidup dalam damai. Di antara mereka ada dua orang sakti: Ata Bupu, yang baik hati dan suka melindungi orang lain, dan Ata Polo, penyihir jahat yang memakan manusia.',
   'On the peak of Mount Kelimutu, Konde Ratu and her people lived in peace. Among them were two powerful men: Ata Bupu, who was kind and protected others, and Ata Polo, a wicked sorcerer who ate people.',
   'Puncak gunung berkabut dengan tiga danau berwarna biru, merah dan hijau di kawahnya.',
   'A misty mountain peak with three lakes of blue, red and green in its craters.',
   'Puncak Kelimutu dengan tiga danau berwarna di kawahnya.',
   'The peak of Kelimutu, with three coloured lakes in its craters.'),
  ('danau-kelimutu', 2,
   'Dua anak yatim meminta perlindungan Ata Bupu. Ia menampung mereka di ladangnya, tempat Ata Polo tidak bisa menjangkau. Ketika Ata Polo menemukan mereka dan hendak memangsa, Ata Bupu menghadangnya.',
   'Two orphans asked Ata Bupu for protection. He sheltered them in his field, where Ata Polo could not reach them. When Ata Polo found them and tried to devour them, Ata Bupu stood in his way.',
   'Seorang pria berdiri di depan dua anak kecil, menghadang sosok bayangan gelap di ladang.',
   'A man stands in front of two small children, blocking a dark shadow in a field.',
   'Ata Bupu melindungi dua anak yatim dari Ata Polo.',
   'Ata Bupu protects two orphans from Ata Polo.'),
  ('danau-kelimutu', 3,
   'Ata Bupu membawa anak-anak itu ke bawah tanah untuk lari, tetapi keempatnya tertelan bumi. Dari tempat mereka dikubur muncul air biru (Ata Bupu), merah (Ata Polo), dan hijau (kedua anak). Hingga kini warga Pemo memberi sesajen dan meminta izin penjaga danau sebelum mendekat.',
   'Ata Bupu led the children underground to escape, but all four were swallowed by the earth. Where they were buried, water rose: blue for Ata Bupu, red for Ata Polo, and green for the children. To this day, the people of Pemo make offerings and ask the lake guardians'' permission before going near the lakes.',
   'Air biru, merah dan hijau di tiga danau yang berdampingan di bawah langit cerah.',
   'Blue, red and green water in three neighbouring lakes under a clear sky.',
   'Tiga danau berwarna biru, merah dan hijau di Kelimutu.',
   'Three lakes of blue, red and green at Kelimutu.'),
  ('toar-dan-lumimuut', 1,
   'Lumimuut, seorang putri yang terdampar di pantai Manandau, ditolong oleh Karema, perempuan sakti yang tinggal di hutan. Karema mengajarinya pengetahuan agar ia diterima masyarakat setempat.',
   'Lumimuut, a princess washed ashore at Manandau beach, was nursed back to health by Karema, a powerful woman who lived in the forest. Karema taught her what she needed to be accepted by the local people.',
   'Seorang perempuan terbaring di pasir pantai, sementara seorang wanita tua di sampingnya menolong.',
   'A woman lies on the sand of a beach while an older woman helps her.',
   'Lumimuut terdampar di pantai dan ditolong Karema.',
   'Lumimuut washes ashore and is helped by Karema.'),
  ('toar-dan-lumimuut', 2,
   'Lumimuut berdoa dan dikaruniai seorang putra bernama Toar. Karema memberi keduanya dua tongkat dengan panjang berbeda, lalu meminta mereka berjalan mengelilingi Gunung Wulur Mahatus. Karena tak bertemu siapa pun di jalan, mereka paham bahwa mereka berjodoh.',
   'Lumimuut prayed and was blessed with a son named Toar. Karema gave them two staves of different lengths and asked them to walk around Mount Wulur Mahatus. Since they met no one else on the way, they understood they were destined to marry.',
   'Seorang pria dan perempuan berjalan di sebuah jalan gunung sambil membawa tongkat panjang.',
   'A man and a woman walk a mountain road, each carrying a long staff.',
   'Toar dan Lumimuut berjalan mengelilingi gunung dengan tongkat.',
   'Toar and Lumimuut walk around the mountain with their staves.'),
  ('toar-dan-lumimuut', 3,
   'Keduanya menikah dan dikaruniai sembilan putra dan sembilan putri. Keturunan mereka disebut orang Minahasa, dan Manandau, yang kini Manado, dikenal sebagai tanah Toar dan Lumimuut. Ini hanya salah satu penjelasan tentang asal-usul orang Minahasa.',
   'The two married and had nine sons and nine daughters. Their descendants are known as the Minahasa people, and Manandau, now Manado, is called the land of Toar and Lumimuut. This is only one of several explanations of the origin of the Minahasa people.',
   'Sebuah keluarga besar duduk bersama di depan rumah panggung di tepi laut.',
   'A large family sits together in front of a stilt house by the sea.',
   'Keluarga Toar dan Lumimuut dengan keturunan mereka.',
   'Toar and Lumimuut''s family with their descendants.')
) as c (slug, no, text_id, text_en, ad_id, ad_en, alt_id, alt_en) on c.slug = s.slug
on conflict (story_id, chapter_no) do update set
  text_id = excluded.text_id, text_en = excluded.text_en,
  audio_description_id = excluded.audio_description_id, audio_description_en = excluded.audio_description_en,
  image_alt_id = excluded.image_alt_id, image_alt_en = excluded.image_alt_en
where t.review_status = 'draft';

-- 3. Recipes --------------------------------------------------------------------------
insert into public.recipes as t (region_id, slug, name_id, name_en, servings, minutes, dietary_tags)
select r.id, x.slug, x.name_id, x.name_en, x.servings, x.minutes, x.tags
from (values
  ('betawi', 'kerak-telor', 'Kerak Telor', 'Kerak telor (Betawi egg cake)', 2, 45, array['contains_egg', 'contains_coconut', 'contains_seafood']),
  ('aceh', 'kuah-beulangong', 'Kuah Beulangong', 'Kuah beulangong (Aceh curry with young jackfruit)', null::integer, 120, array['contains_beef']),
  ('toraja', 'papiong', 'Pa''piong', 'Pa''piong (Toraja food cooked in bamboo)', null::integer, 90, array[]::text[]),
  ('rote', 'sei-sapi', 'Sei Sapi Sambal Luat', 'Sei sapi with sambal luat (smoked-style beef)', 2, 60, array['contains_beef']),
  ('minahasa', 'tinutuan', 'Tinutuan (Bubur Manado)', 'Tinutuan (Manado vegetable porridge)', 6, 60, array['contains_seafood'])
) as x (region, slug, name_id, name_en, servings, minutes, tags)
join public.regions r on r.slug = x.region
on conflict (slug) do update set
  region_id = excluded.region_id, name_id = excluded.name_id, name_en = excluded.name_en,
  servings = excluded.servings, minutes = excluded.minutes, dietary_tags = excluded.dietary_tags
where t.review_status = 'draft';

insert into public.recipe_ingredients as t (recipe_id, position, name_id, name_en, amount, unit)
select rc.id, i.position, i.name_id, i.name_en, i.amount, i.unit
from public.recipes rc
join (values
  -- Kerak telor (Kompas, 2021; 2 porsi)
  ('kerak-telor', 1, 'Beras ketan, rendam semalam dan tiriskan', 'Glutinous rice, soaked overnight and drained', 6::numeric, 'tbsp'),
  ('kerak-telor', 2, 'Telur bebek', 'Duck eggs', 2, 'piece'),
  ('kerak-telor', 3, 'Udang kering, rendam, sangrai, haluskan', 'Dried shrimp, soaked, toasted and ground', 2, 'tsp'),
  ('kerak-telor', 4, 'Kelapa parut setengah tua, sangrai', 'Semi-mature grated coconut, toasted', 2, 'tbsp'),
  ('kerak-telor', 5, 'Bawang goreng', 'Fried shallots', 1, 'tbsp'),
  ('kerak-telor', 6, 'Cabai merah, sangrai, haluskan', 'Red chilli, toasted and ground', 1, 'tbsp'),
  ('kerak-telor', 7, 'Garam', 'Salt', 1, 'tsp'),
  -- Kuah beulangong (Kompas, 2020; detikSumut, 2023)
  ('kuah-beulangong', 1, 'Daging sapi atau kambing', 'Beef or goat meat', 2, 'kg'),
  ('kuah-beulangong', 2, 'Nangka muda, potong', 'Young jackfruit, cut', 1, 'piece'),
  ('kuah-beulangong', 3, 'Cabai kering (bumbu halus)', 'Dried chilli (for the paste)', 200, 'g'),
  ('kuah-beulangong', 4, 'Cabai merah (bumbu halus)', 'Red chilli (for the paste)', 200, 'g'),
  ('kuah-beulangong', 5, 'Cabai rawit (bumbu halus)', 'Bird''s eye chilli (for the paste)', 100, 'g'),
  ('kuah-beulangong', 6, 'Ketumbar (bumbu halus)', 'Coriander seed (for the paste)', 100, 'g'),
  ('kuah-beulangong', 7, 'Kelapa gongseng (bumbu halus)', 'Toasted coconut (for the paste)', 200, 'g'),
  ('kuah-beulangong', 8, 'Bawang putih (bumbu halus)', 'Garlic (for the paste)', 50, 'g'),
  ('kuah-beulangong', 9, 'Jahe (bumbu halus)', 'Ginger (for the paste)', 50, 'g'),
  ('kuah-beulangong', 10, 'Kunyit (bumbu halus)', 'Turmeric (for the paste)', 50, 'g'),
  ('kuah-beulangong', 11, 'Kemiri (bumbu halus)', 'Candlenut (for the paste)', 50, 'g'),
  ('kuah-beulangong', 12, 'Bawang merah, iris', 'Shallots, sliced', 250, 'g'),
  ('kuah-beulangong', 13, 'Kelapa parut, 1 butir', 'Grated coconut, 1 coconut', 1, 'whole'),
  ('kuah-beulangong', 14, 'Pala', 'Nutmeg', 2, 'piece'),
  ('kuah-beulangong', 15, 'Kapulaga', 'Cardamom', 1, 'tbsp'),
  ('kuah-beulangong', 16, 'Bunga lawang', 'Star anise', 1, 'tbsp'),
  ('kuah-beulangong', 17, 'Serai dan daun kari', 'Lemongrass and curry leaves', null, 'to_taste'),
  ('kuah-beulangong', 18, 'Garam', 'Salt', null, 'to_taste'),
  -- Pa'piong (Kompas, 2014; Liputan6, 2025). Amounts are not given in the sources.
  ('papiong', 1, 'Daging babi, ayam, atau ikan', 'Pork, chicken or fish', null, 'to_taste'),
  ('papiong', 2, 'Daun mayana', 'Mayana leaves', null, 'to_taste'),
  ('papiong', 3, 'Kelapa parut', 'Grated coconut', null, 'to_taste'),
  ('papiong', 4, 'Bumbu: bawang merah, bawang putih, cabai, jahe, serai', 'Spices: shallots, garlic, chilli, ginger, lemongrass', null, 'to_taste'),
  ('papiong', 5, 'Daun pisang untuk membungkus', 'Banana leaves for wrapping', null, 'to_taste'),
  ('papiong', 6, 'Ruas bambu, sekitar 10 cm', 'Bamboo segments, about 10 cm across', null, 'to_taste'),
  -- Sei sapi sambal luat (Orami, 2025: 2 porsi, 1 jam; Kompas, 2020)
  ('sei-sapi', 1, 'Daging sapi', 'Beef', 300, 'g'),
  ('sei-sapi', 2, 'Kecap Inggris (English soy sauce)', 'English soy sauce', 6, 'tbsp'),
  ('sei-sapi', 3, 'Jeruk lemon', 'Lemon juice', 1, 'tsp'),
  ('sei-sapi', 4, 'Merica putih bubuk', 'Ground white pepper', 1, 'tsp'),
  ('sei-sapi', 5, 'Garam', 'Salt', 2, 'tsp'),
  ('sei-sapi', 6, 'Penyedap rasa', 'Seasoning powder', 0.5, 'tsp'),
  ('sei-sapi', 7, 'Bawang putih, parut', 'Garlic, grated', 4, 'clove'),
  ('sei-sapi', 8, 'Bawang merah, iris', 'Shallots, sliced', 4, 'piece'),
  ('sei-sapi', 9, 'Cabai kering, iris', 'Dried chilli, sliced', 4, 'piece'),
  ('sei-sapi', 10, 'Serai, memarkan', 'Lemongrass, bruised', 1, 'stalk'),
  ('sei-sapi', 11, 'Minyak wijen', 'Sesame oil', 1, 'tbsp'),
  ('sei-sapi', 12, 'Minyak goreng', 'Cooking oil', 3, 'tbsp'),
  ('sei-sapi', 13, 'Sambal luat: bawang putih, bawang merah, cabai merah, cabai rawit merah', 'Sambal luat: garlic, shallots, red chilli, red bird''s eye chilli', null, 'to_taste'),
  ('sei-sapi', 14, 'Gula dan garam untuk sambal', 'Sugar and salt for the sambal', null, 'to_taste'),
  ('sei-sapi', 15, 'Tomat, buang biji, potong dadu', 'Tomato, seeded and diced', 1, 'piece'),
  ('sei-sapi', 16, 'Daun bawang', 'Spring onion', 1, 'stalk'),
  ('sei-sapi', 17, 'Jeruk nipis, 1/4 buah, peras', 'Lime, a quarter, juiced', 0.25, 'piece'),
  -- Tinutuan (detikFood, 2022: 6 porsi, 60 menit)
  ('tinutuan', 1, 'Beras pulen', 'Short-grain rice', 100, 'g'),
  ('tinutuan', 2, 'Air', 'Water', 2.5, 'l'),
  ('tinutuan', 3, 'Daun salam', 'Bay leaves', 2, 'piece'),
  ('tinutuan', 4, 'Serai, memarkan', 'Lemongrass, bruised', 2, 'stalk'),
  ('tinutuan', 5, 'Jagung manis, potong', 'Sweet corn, cut', 1, 'piece'),
  ('tinutuan', 6, 'Labu kuning atau ubi kuning, potong dadu', 'Yellow pumpkin or sweet potato, diced', 250, 'g'),
  ('tinutuan', 7, 'Kangkung, bersihkan', 'Water spinach, cleaned', 1, 'bunch'),
  ('tinutuan', 8, 'Daun gedi, cincang', 'Gedi leaves, chopped', 3, 'leaf'),
  ('tinutuan', 9, 'Daun bawang, iris kasar', 'Spring onion, coarsely sliced', 1, 'stalk'),
  ('tinutuan', 10, 'Daun pandan, iris kasar', 'Pandan leaves, coarsely sliced', 2, 'leaf'),
  ('tinutuan', 11, 'Penyedap jamur', 'Mushroom seasoning', 2, 'tbsp'),
  ('tinutuan', 12, 'Garam', 'Salt', 1, 'tsp'),
  ('tinutuan', 13, 'Kemangi', 'Lemon basil', 1, 'bunch'),
  ('tinutuan', 14, 'Ikan asin jambal roti, goreng (pelengkap)', 'Salted jambal roti fish, fried (to serve)', null, 'to_taste')
) as i (slug, position, name_id, name_en, amount, unit) on i.slug = rc.slug
where rc.review_status = 'draft'
on conflict (recipe_id, position) do update set
  name_id = excluded.name_id, name_en = excluded.name_en, amount = excluded.amount, unit = excluded.unit;

insert into public.recipe_steps as t (recipe_id, step_no, text_id, text_en, timer_seconds)
select rc.id, s.step_no, s.text_id, s.text_en, s.timer_seconds
from public.recipes rc
join (values
  ('kerak-telor', 1, 'Kocok telur bebek bersama udang kering halus, bumbu halus, bawang goreng, dan kelapa sangrai hingga rata.',
    'Beat the duck eggs with the ground dried shrimp, spice paste, fried shallots and toasted coconut until smooth.', null::integer),
  ('kerak-telor', 2, 'Panaskan wajan dadar antilengket, tuang separuh beras ketan, ratakan, dan masak hingga setengah matang.',
    'Heat a non-stick pan, pour in half the glutinous rice, spread it out and cook until half done.', null),
  ('kerak-telor', 3, 'Tuang separuh adonan telur di atas ketan, ratakan sambil ditekan. Balik setelah bagian bawah matang.',
    'Pour half the egg mixture over the rice, pressing it flat. Flip once the underside is cooked.', null),
  ('kerak-telor', 4, 'Angkat dan sajikan selagi panas.',
    'Lift it out and serve while hot.', null),
  ('kuah-beulangong', 1, 'Haluskan semua bumbu, lalu oleskan ke daging bersama kelapa sangrai dan parut. Tambahkan sedikit air hingga daging terendam.',
    'Grind all the spices, then coat the meat with them together with the toasted and grated coconut. Add a little water to cover the meat.', null),
  ('kuah-beulangong', 2, 'Masak daging dengan api kecil hingga cukup empuk, tambahkan air secukupnya, lalu masukkan nangka muda yang sudah dipotong.',
    'Simmer the meat over low heat until fairly tender, add enough water, then add the chopped young jackfruit.', 7200),
  ('kuah-beulangong', 3, 'Terus masak sambil diaduk dan dicicipi hingga daging matang dan rasanya pas, lalu matikan api.',
    'Keep cooking, stirring and tasting, until the meat is cooked and the flavour is right. Then turn off the heat.', null),
  ('papiong', 1, 'Campur daging atau ikan dengan daun mayana, kelapa parut, dan bumbu. Bungkus dalam daun pisang.',
    'Mix the meat or fish with the mayana leaves, grated coconut and spices. Wrap in banana leaves.', null),
  ('papiong', 2, 'Masukkan bungkusan ke dalam ruas bambu, lalu tutup ujungnya dengan daun pisang.',
    'Put the packets into the bamboo segments and seal the ends with banana leaves.', null),
  ('papiong', 3, 'Bakar bambu di atas bara sambil dimiringkan 30 sampai 40 derajat hingga kulit bambu menghitam dan matang sekitar 1,5 jam.',
    'Grill the bamboo over embers, tilted at 30 to 40 degrees, until the bamboo blackens and the food is cooked, about 1.5 hours.', 5400),
  ('papiong', 4, 'Pastikan matang: tusuk sedikit bambu, jika lemak keluar masakan sudah siap.',
    'Check it is cooked: pierce the bamboo slightly, and when fat runs out it is ready.', null),
  ('sei-sapi', 1, 'Potong daging tipis-tipis, lumuri dengan bahan marinasi, dan diamkan 30 menit.',
    'Slice the beef thinly, coat it with the marinade, and leave it for 30 minutes.', 1800),
  ('sei-sapi', 2, 'Sangrai daging tanpa minyak hingga kecokelatan, lalu sisihkan.',
    'Dry-sear the beef in a pan until browned, then set aside.', null),
  ('sei-sapi', 3, 'Tumis bawang putih, bawang merah, cabai kering, dan serai dengan minyak goreng hingga harum. Tambahkan minyak wijen, lalu masukkan daging dan aduk.',
    'Fry the garlic, shallots, dried chilli and lemongrass in cooking oil until fragrant. Add the sesame oil, then return the beef and toss.', null),
  ('sei-sapi', 4, 'Haluskan sambal luat secara kasar, campur dengan tomat, air jeruk nipis, dan daun bawang.',
    'Pound the sambal luat coarsely, mix with the tomato, lime juice and spring onion.', null),
  ('sei-sapi', 5, 'Sajikan daging dengan sambal luat.',
    'Serve the beef with the sambal luat.', null),
  ('tinutuan', 1, 'Cuci beras hingga bersih dan tiriskan. Didihkan air dengan daun salam dan serai.',
    'Rinse the rice well and drain it. Bring the water to a boil with the bay leaves and lemongrass.', null),
  ('tinutuan', 2, 'Masukkan beras dan masak hingga butirannya pecah dan bubur mulai mengental.',
    'Add the rice and cook until the grains break down and the porridge starts to thicken.', null),
  ('tinutuan', 3, 'Masukkan jagung dan labu kuning atau ubi, masak hingga empuk dan bubur mengental.',
    'Add the corn and pumpkin or sweet potato, and cook until soft and thick.', null),
  ('tinutuan', 4, 'Masukkan kangkung, daun gedi, daun bawang, daun pandan, penyedap jamur, dan garam. Masak hingga sayuran layu.',
    'Add the water spinach, gedi leaves, spring onion, pandan, mushroom seasoning and salt. Cook until the vegetables are tender.', null),
  ('tinutuan', 5, 'Masukkan kemangi sesaat sebelum dimatikan, lalu sajikan hangat dengan ikan asin goreng dan sambal.',
    'Add the kemangi just before turning off the heat, then serve warm with fried salted fish and sambal.', null)
) as s (slug, step_no, text_id, text_en, timer_seconds) on s.slug = rc.slug
where rc.review_status = 'draft'
on conflict (recipe_id, step_no) do update set
  text_id = excluded.text_id, text_en = excluded.text_en, timer_seconds = excluded.timer_seconds;

-- 4. Traditional dress (costume placeholder drawing until pictures are added) --------------
insert into public.costumes as t (region_id, slug, name_id, name_en, info_id, info_en, reference_image_url)
select r.id, x.slug, x.name_id, x.name_en, x.info_id, x.info_en, '/placeholders/costume-generic.svg'
from (values
  ('betawi', 'baju-sadariah', 'Baju Sadariah', 'Baju sadariah',
   'Pakaian adat Betawi untuk laki-laki: baju koko berlengan panjang yang longgar, dipakai dengan celana kain motif batik, sarung, dan peci. Dipakai pada upacara adat, kegiatan keagamaan, dan acara resmi seperti pernikahan. Busananya mencerminkan kesederhanaan, kesopanan, dan keagamaan.',
   'Traditional Betawi dress for men: a loose, long-sleeved baju koko worn with patterned batik trousers, a sarong and a peci. Worn at traditional ceremonies, religious events and formal occasions such as weddings. It reflects simplicity, modesty and faith.'),
  ('aceh', 'linto-baro', 'Linto Baro', 'Linto baro',
   'Pakaian adat pengantin pria Aceh: baju meukasah berwarna hitam dengan sulaman benang emas, celana sileue, kain sarung (iwan), dan meukeutop sebagai penutup kepala. Rencong melambangkan keberanian dan kehormatan. Warna hitam melambangkan keteguhan dan wibawa, sulaman emas melambangkan kebesaran. Dipakai pada pernikahan adat.',
   'Traditional Acehnese groom''s dress: a black meukasah jacket with gold thread embroidery, sileue trousers, an iwan sarong, and a meukeutop headpiece. The rencong dagger stands for courage and honour. Black stands for steadfastness and dignity, gold for grandeur. Worn at traditional weddings.'),
  ('toraja', 'baju-pokko', 'Baju Pokko''', 'Baju pokko''',
   'Pakaian adat perempuan Toraja: lengan pendek dengan warna merah, kuning, dan putih. Dihiasi manik-manik di dada, gelang, dan ikat pinggang (kandure). Warna kuning melambangkan sinar matahari, merah darah dan kehidupan, putih tulang, dan hitam kematian. Dipakai pada acara resmi, pernikahan, pemakaman, dan tari Ma''gellu. Pasangan pria: Seppa Tallung.',
   'Traditional Toraja dress for women: short sleeves in red, yellow and white, with beadwork on the chest, bracelets and a belt (kandure). Yellow stands for sunlight, red for blood and life, white for bone, and black for death. Worn at official events, weddings, funerals and the Ma''gellu dance. The men''s counterpart is the Seppa Tallung.'),
  ('dayak-ngaju', 'baju-sangkarut', 'Baju Sangkarut', 'Baju sangkarut',
   'Rompi tanpa lengan khas laki-laki Dayak Ngaju, Kalimantan Tengah, dibuat dari serat kulit kayu (nyamu atau lemba) atau beludru, dihiasi kerang, kulit trenggiling, kancing, dan manik-manik, dengan motif enggang dan pohon hayat. Dahulu dipakai panglima dalam perang; kini dipakai pada pernikahan, penyambutan tamu, dan upacara tiwah. Pasangan perempuannya disebut Baju Deder.',
   'A sleeveless vest worn by Dayak Ngaju men of Central Kalimantan, made of bark fibre (nyamu or lemba) or velvet, decorated with shells, pangolin skin, buttons and beads, with hornbill and tree-of-life motifs. Once worn by war leaders; today worn at weddings, to welcome guests and at tiwah rituals. The women''s counterpart is the Baju Deder.'),
  ('rote', 'tii-langga', 'Ti''i Langga', 'Ti''i langga',
   'Topi anyaman daun lontar khas Rote, Nusa Tenggara Timur, terutama dikenakan laki-laki. Jambulnya setinggi 40 sampai 60 cm dengan sembilan tingkat; 18 lekukan melambangkan nusak di Rote, dan garis lurusnya melambangkan keseimbangan. Simbol kejantanan, kehormatan, dan kepemimpinan. Dipakai pada tarian adat dan pernikahan.',
   'A lontar-leaf hat from Rote, East Nusa Tenggara, worn mainly by men. Its crest stands 40 to 60 cm high in nine tiers; the 18 notches stand for the kingdoms of Rote, and the straight line for balance. A symbol of manhood, honour and leadership. Worn at traditional dances and weddings.')
) as x (region, slug, name_id, name_en, info_id, info_en)
join public.regions r on r.slug = x.region
on conflict (slug) do update set
  region_id = excluded.region_id, name_id = excluded.name_id, name_en = excluded.name_en,
  info_id = excluded.info_id, info_en = excluded.info_en, reference_image_url = excluded.reference_image_url
where t.review_status = 'draft';

-- 5. Sources ---------------------------------------------------------------------
create temporary table batch_sources (content_type text, slug text, title text, url text, credit text) on commit drop;
insert into batch_sources values
  ('story', 'si-pitung', 'Legenda Si Pitung, Jagoan Betawi yang Lantang Melawan Penjajah', 'https://www.goodnewsfromindonesia.id/2024/09/23/legenda-si-pitung-jagoan-betawi-yang-lantang-melawan-penjajah', 'Irfan Jumadil Aslam, Good News From Indonesia, 23 September 2024'),
  ('story', 'si-pitung', 'Riwayat Legenda Betawi Si Pitung yang Masih Jadi Teka-teki', 'https://travel.detik.com/travel-news/d-6346638/riwayat-legenda-betawi-si-pitung-yang-masih-jadi-teka-teki', 'Putu Intan, detikTravel, 13 October 2022'),
  ('recipe', 'kerak-telor', 'Resep Kerak Telor Khas Betawi, Jajan Tradisional dari Telur Bebek', 'https://www.kompas.com/food/read/2021/03/29/080400575/resep-kerak-telor-khas-betawi-jajan-tradisional-dari-telur-bebek', 'Yuharrani Aisyah, Kompas.com, 29 March 2021'),
  ('recipe', 'kerak-telor', 'Resep Kerak Telor Betawi, Kudapan Legendaris yang Renyah Harum', 'https://food.detik.com/telur/d-6352681/resep-kerak-telor-betawi-kudapan-legendaris-yang-renyah-harum', 'odi, detikFood, 18 October 2022'),
  ('costume', 'baju-sadariah', 'Baju Sadariah, Busana Tradisional Khas Betawi', 'https://www.indonesia.travel/us/en/travel-ideas/culture/baju-sadariah', 'Kementerian Pariwisata RI (indonesia.travel)'),
  ('costume', 'baju-sadariah', 'Mengenal sejarah dan filosofi baju adat Betawi', 'https://www.antaranews.com/berita/4292439/mengenal-sejarah-dan-filosofi-baju-adat-betawi', 'Putri Atika Chairulia, ANTARA News, 28 August 2024'),
  ('story', 'putri-pukes', 'Legenda Putri Pukes dan Danau Laut Tawar, Cerita Rakyat dari Tanah Gayo Aceh', 'https://www.goodnewsfromindonesia.id/2024/08/20/legenda-putri-pukes-dan-danau-laut-tawar-cerita-rakyat-dari-tanah-gayo-aceh', 'Irfan Jumadil Aslam, Good News From Indonesia, 20 August 2024'),
  ('story', 'putri-pukes', 'Danau Laut Tawar Aceh dan Legenda Putri Pukes', 'https://www.kompas.com/stori/read/2022/07/19/090000779/danau-laut-tawar-aceh-dan-legenda-putri-pukes', 'Lukman Hadi Subroto, Kompas.com, 19 July 2022'),
  ('recipe', 'kuah-beulangong', 'Resep Kuah Beulangong Kuliner Khas Aceh untuk Perayaan Maulid Nabi Muhammad', 'https://www.kompas.com/food/read/2020/10/29/110800075/resep-kuah-beulangong-kuliner-khas-aceh-untuk-perayaan-maulid-nabi-muhammad', 'Syifa Nuri Khairunnisa, Kompas.com, 29 October 2020'),
  ('recipe', 'kuah-beulangong', 'Sejarah Kuah Beulangong, Makanan Khas Aceh yang Disajikan saat Maulid Nabi', 'https://www.detik.com/sumut/kuliner/d-6945093/sejarah-kuah-beulangong-makanan-khas-aceh-yang-disajikan-saat-maulid-nabi', 'Angelina Giyanti Purba, detikSumut, 23 September 2023'),
  ('costume', 'linto-baro', 'Baju Linto Baro: Pakaian Adat Pengantin Aceh', 'https://www.indonesia.travel/us/en/travel-ideas/culture/baju-linto-baro/', 'Kementerian Pariwisata RI (indonesia.travel)'),
  ('costume', 'linto-baro', 'Mengenal Linto Baro, Lambang Kebesaran dan Keagungan Lelaki Aceh dalam Balutan Adat', 'https://www.liputan6.com/regional/read/6045920/mengenal-linto-baro-lambang-kebesaran-dan-keagungan-lelaki-aceh-dalam-balutan-adat', 'Panji Prayitno, Liputan6, 10 June 2025'),
  ('story', 'la-dana-dan-kerbaunya', 'La Dana dan Kerbaunya, Legenda dari Tanah Toraja', 'https://www.goodnewsfromindonesia.id/2024/04/03/la-dana-dan-kerbaunya-legenda-dari-tanah-toraja', 'Nukma Amelia Safitri Sagita, Good News From Indonesia, 3 April 2024'),
  ('story', 'la-dana-dan-kerbaunya', 'Cerita Rakyat Sulawesi Selatan La Dana dan Kerbaunya, Kisah si Anak Licik', 'https://www.detik.com/sulsel/budaya/d-6346685/cerita-rakyat-sulawesi-selatan-la-dana-dan-kerbaunya-kisah-si-anak-licik', 'Edward Ridwan, detikSulsel, 14 October 2022'),
  ('recipe', 'papiong', 'Pa''piong dari Negeri Atas', 'https://travel.kompas.com/read/2014/06/04/0831553/Pa.piong.dari.Negeri.Atas?page=all', 'Mawar Kusuma and Dwi As Setianingsih, Kompas.com, 4 June 2014'),
  ('recipe', 'papiong', 'Pa''piong, Kuliner Adat Toraja yang Dimasak dalam Bambu', 'https://www.liputan6.com/regional/read/6056736/papiong-kuliner-adat-toraja-yang-dimasak-dalam-bambu', 'Switzy Sabandar, Liputan6, 24 June 2025'),
  ('costume', 'baju-pokko', 'Mengenal Baju Pokko'', Pakaian Adat Toraja untuk Wanita yang Sarat Makna', 'https://www.detik.com/sulsel/berita/d-6923671/mengenal-baju-pokko-pakaian-adat-toraja-untuk-wanita-yang-sarat-makna', 'Yaslinda Utari Kasim, detikSulsel, 10 September 2023'),
  ('costume', 'baju-pokko', 'Baju Pokko, Baju Adat Suku Toraja untuk Perempuan', 'https://www.kompas.com/sulawesi-selatan/read/2025/01/20/201502688/baju-pokko-baju-adat-suku-toraja-untuk-perempuan', 'Kompas.com, 20 January 2025'),
  ('costume', 'baju-sangkarut', 'Baju Sangkarut, Rompi Khas Bagi Pria Dayak Ngaju', 'https://www.detik.com/kalimantan/budaya/d-8026792/baju-sangkarut-rompi-khas-bagi-pria-dayak-ngaju', 'Nadhifa Aurellia Wirawan, detikKalimantan, 24 July 2025'),
  ('costume', 'baju-sangkarut', 'Baju Sangkurat, Pakaian Adat Kalimantan Tengah', 'https://www.kompas.com/skola/read/2021/02/24/162000869/baju-sangkurat-pakaian-adat-kalimantan-tengah', 'Ari Welianto, Kompas.com, 24 February 2021'),
  ('story', 'danau-kelimutu', 'Legenda Danau Kelimutu, Cerita Adanya Tiga Warna Air Danau', 'https://regional.kompas.com/read/2022/06/02/223041878/legenda-danau-kelimutu-cerita-adanya-tiga-warna-air-danau?page=all', 'Kompas.com, 2 June 2022'),
  ('story', 'danau-kelimutu', 'Legenda Danau Kelimutu, Si Danau 3 Warna', 'https://www.detik.com/edu/detikpedia/d-7419365/legenda-danau-kelimutu-si-danau-3-warna', 'Luthfi Zian Nasifah, detikEdu, 3 July 2024'),
  ('recipe', 'sei-sapi', 'Resep Sei Sapi Sambal Luat yang Pedas Harum untuk Menu BBQ', 'https://www.orami.co.id/magazine/resep-sei-sapi', 'Tim Konten Orami, 5 June 2025'),
  ('recipe', 'sei-sapi', 'Cara Membuat Sei Sapi Khas NTT, Bisa untuk Ide Bisnis Kuliner', 'https://www.kompas.com/food/read/2020/07/07/131326675/cara-membuat-sei-sapi-khas-ntt-bisa-untuk-ide-bisnis-kuliner', 'Yana Gabriella Wijaya, Kompas.com, 7 July 2020'),
  ('costume', 'tii-langga', 'Ti''i Langga Topi Ikonik Khas Rote NTT: Sejarah, Makna, hingga Cara Pembuatan', 'https://www.detik.com/bali/nusra/d-8092030/tii-langga-topi-ikonik-khas-rote-ntt-sejarah-makna-hingga-cara-pembuatan', 'Ni Made Gita Julianti, detikBali, 2 September 2025'),
  ('costume', 'tii-langga', 'Mengenal Ti''i Langga, Topi Tradisional Orang Rote', 'https://regional.kompas.com/read/2022/09/27/202034678/mengenal-tii-langga-topi-tradisional-orang-rote?page=all', 'Dini Daniswari, Kompas.com, 27 September 2022'),
  ('story', 'toar-dan-lumimuut', 'Cerita Putri Lumimuut dan Asal-Usul Etnis Minahasa, Begini Kaitannya', 'https://www.liputan6.com/regional/read/5055759/cerita-putri-lumimuut-dan-asal-usul-etnis-minahasa-begini-kaitannya', 'Switzy Sabandar, Liputan6, 31 August 2022'),
  ('story', 'toar-dan-lumimuut', 'Legenda Putri Lumimuut, Asal-usul Etnis Minahasa', 'https://regional.kompas.com/read/2022/07/01/063401078/legenda-putri-lumimuut-asal-usul-etnis-minahasa?page=all', 'Kompas.com, 1 July 2022'),
  ('recipe', 'tinutuan', 'Cara Membuat Tinutuan, Bubur Manado Untuk Sarapan Sehat', 'https://food.detik.com/sayur/d-6228398/cara-membuat-tinutuan-bubur-manado-untuk-sarapan-sehat', 'Odilia WS, detikFood, 12 August 2022'),
  ('recipe', 'tinutuan', 'Resep Tinutuan, Bubur Campur Khas Manado', 'https://www.kompas.com/food/read/2024/08/29/122949175/resep-tinutuan-bubur-campur-khas-manado', 'Suci Wulandari Putri Chaniago, Kompas.com, 29 August 2024');

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
