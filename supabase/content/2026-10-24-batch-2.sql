-- Content batch 2 (Phase 2c, 2026-10-23). Researched and drafted by Claude
-- as the AI Workflow; the owner checks and approves in /review.
--
-- Run as a database operator after supabase/seed.sql. Everything is a draft:
-- new rows start as drafts, and re-running only updates rows that are still
-- drafts. Re-running is safe.
--
-- One region for each island that had none, each with one story, one recipe
-- and one traditional dress. Every item follows one checked source (cited at
-- the end, see docs/candidate-sources.md for what each page covers). Stories
-- are retold in our own words in both languages. Halal status stays unknown.
-- Dress images are left empty until there are licensed pictures.

-- 1. Regions ---------------------------------------------------------------------
insert into public.regions as t (slug, name_id, name_en, summary_id, summary_en, province_codes, sort_order) values
  ('batak', 'Batak (Sumatera Utara)', 'Batak (North Sumatra)',
   'Tanah Batak di sekitar Danau Toba, Sumatera Utara. Dari sini berasal legenda Danau Toba, arsik ikan mas, dan kain ulos.',
   'The Batak homeland around Lake Toba in North Sumatra. It is home to the legend of Lake Toba, arsik ikan mas and the ulos cloth.',
   array['ID-SU'], 4),
  ('sunda', 'Sunda (Jawa Barat)', 'Sunda (West Java)',
   'Tatar Sunda di Jawa Barat, kampung halaman legenda Sangkuriang, nasi timbel, dan kebaya Sunda.',
   'The Sundanese lands of West Java, home of the legend of Sangkuriang, nasi timbel and the Sundanese kebaya.',
   array['ID-JB'], 5),
  ('bali', 'Bali', 'Bali',
   'Pulau Bali, asal legenda Manik Angkeran tentang terbentuknya Selat Bali, ayam betutu, dan busana payas agung.',
   'The island of Bali, home of the legend of Manik Angkeran and the Bali Strait, ayam betutu and payas agung dress.',
   array['ID-BA'], 6),
  ('banjar', 'Banjar (Kalimantan Selatan)', 'Banjar (South Kalimantan)',
   'Tanah Banjar di Kalimantan Selatan, asal cerita Putri Junjung Buih, soto Banjar, dan busana pengantin Bagajah Gamuling Baular Lulut.',
   'The Banjar lands of South Kalimantan, home of the tale of Putri Junjung Buih, soto Banjar and the Bagajah Gamuling Baular Lulut bridal dress.',
   array['ID-KS'], 7),
  ('maluku', 'Maluku', 'Maluku',
   'Kepulauan Maluku di timur Indonesia, asal legenda Batu Berdaun, ikan kuah kuning, dan baju cele.',
   'The Maluku islands in eastern Indonesia, home of the legend of the Leaf Stone, ikan kuah kuning and the baju cele.',
   array['ID-MA'], 8),
  ('papua', 'Papua', 'Papua',
   'Tanah Papua di ujung timur Indonesia, asal dongeng Kasuari dan Dara Makota, papeda, dan rok rumbai.',
   'The land of Papua in the far east of Indonesia, home of the fable of the Cassowary and the Crowned Pigeon, papeda and the rok rumbai skirt.',
   array['ID-PA', 'ID-PB', 'ID-PD', 'ID-PE', 'ID-PS', 'ID-PT'], 9)
on conflict (slug) do update set
  name_id = excluded.name_id, name_en = excluded.name_en,
  summary_id = excluded.summary_id, summary_en = excluded.summary_en,
  province_codes = excluded.province_codes, sort_order = excluded.sort_order
where t.review_status = 'draft';

-- 2. Stories -----------------------------------------------------------------------
insert into public.stories as t (region_id, slug, title_id, title_en, summary_id, summary_en)
select r.id, x.slug, x.title_id, x.title_en, x.summary_id, x.summary_en
from (values
  ('batak', 'danau-toba', 'Asal Usul Danau Toba', 'The Origin of Lake Toba',
   'Seorang petani bernama Toba menikahi perempuan jelmaan ikan mas, dengan satu janji yang tidak boleh ia langgar.',
   'A farmer named Toba marries a woman who was once a golden fish, on one promise he must never break.'),
  ('sunda', 'sangkuriang', 'Sangkuriang', 'Sangkuriang',
   'Seorang pemuda tanpa sadar ingin menikahi ibunya sendiri, dan perahu yang ditendangnya menjadi Gunung Tangkuban Parahu.',
   'A young man unknowingly wants to marry his own mother, and the boat he kicks over becomes Mount Tangkuban Parahu.'),
  ('bali', 'manik-angkeran', 'Manik Angkeran dan Selat Bali', 'Manik Angkeran and the Bali Strait',
   'Putra seorang brahmana yang gemar berjudi mencuri dari Naga Besukih, dan ayahnya menorehkan selat yang memisahkan mereka.',
   'A brahmin''s gambling son steals from the dragon Naga Besukih, and his father draws a strait that parts them for ever.'),
  ('banjar', 'putri-junjung-buih', 'Putri Junjung Buih', 'Putri Junjung Buih',
   'Seorang bayi perempuan muncul dari buih Sungai Tabalong dan kelak menjadi ibu para raja di Kalimantan Selatan.',
   'A baby girl rises from the foam of the Tabalong River and becomes the mother of kings in South Kalimantan.'),
  ('maluku', 'batu-berdaun', 'Batu Berdaun', 'The Leaf Stone',
   'Seorang nenek yang lapar dan kecewa pergi ke sebuah batu berbentuk daun, dan cucu-cucunya terlambat menyesal.',
   'A hungry, disappointed grandmother goes to a leaf-shaped stone, and her grandchildren are sorry too late.'),
  ('papua', 'kasuari-dan-dara-makota', 'Kasuari dan Dara Makota', 'The Cassowary and the Crowned Pigeon',
   'Burung kasuari yang serakah ditantang lomba terbang oleh dara makota yang kecil, dan kesombongannya membuatnya kalah.',
   'A greedy cassowary is challenged to a flying race by a small crowned pigeon, and his pride makes him lose.')
) as x (region, slug, title_id, title_en, summary_id, summary_en)
join public.regions r on r.slug = x.region
on conflict (slug) do update set
  region_id = excluded.region_id,
  title_id = excluded.title_id, title_en = excluded.title_en,
  summary_id = excluded.summary_id, summary_en = excluded.summary_en
where t.review_status = 'draft';

insert into public.story_chapters as t (
  story_id, chapter_no, text_id, text_en,
  audio_description_id, audio_description_en, image_alt_id, image_alt_en)
select s.id, c.no, c.text_id, c.text_en, c.ad_id, c.ad_en, c.alt_id, c.alt_en
from public.stories s
join (values
  -- Asal Usul Danau Toba (detikSumut, 2023, version 1).
  ('danau-toba', 1,
   'Dahulu kala hiduplah Toba, seorang pemuda yatim piatu yang bertani dan kadang memancing di sungai. Suatu sore ia mendapat seekor ikan mas besar dengan sisik yang berkilau. Saat ia melepas kailnya, ikan itu berubah menjadi seorang perempuan yang cantik.',
   'Long ago there lived Toba, an orphaned young man who farmed and sometimes fished in the river. One afternoon he caught a large golden fish with shimmering scales. As he took out the hook, the fish turned into a beautiful woman.',
   'Seorang pemuda berdiri di tepi sungai dengan pancing. Di depannya, seekor ikan keemasan berubah menjadi seorang perempuan.',
   'A young man stands by a river with a fishing rod. In front of him, a golden fish turns into a woman.',
   'Toba di tepi sungai menatap ikan mas yang berubah menjadi perempuan cantik.',
   'Toba by the river, watching a golden fish turn into a beautiful woman.'),
  ('danau-toba', 2,
   'Toba jatuh cinta dan ingin menikahinya. Perempuan itu setuju dengan satu syarat: Toba tidak boleh menceritakan asal-usulnya kepada siapa pun. Mereka menikah, hidup bahagia, dan dikaruniai seorang putra bernama Samosir.',
   'Toba fell in love and wanted to marry her. She agreed on one condition: he must never tell anyone where she came from. They married, lived happily, and had a son named Samosir.',
   'Sebuah rumah kayu di kaki bukit. Sepasang suami istri duduk bersama seorang anak laki-laki kecil.',
   'A wooden house at the foot of a hill. A husband and wife sit with a small boy.',
   'Toba, istrinya, dan putra mereka Samosir di depan rumah kayu.',
   'Toba, his wife and their son Samosir outside a wooden house.'),
  ('danau-toba', 3,
   'Suatu hari ibunya menyuruh Samosir mengantar makan siang untuk ayahnya di ladang. Di jalan Samosir lapar dan memakan bekal itu. Ketika ia tiba dengan wadah kosong, Toba marah dan membentaknya sebagai anak ikan. Janjinya pun terlanggar.',
   'One day his mother sent Samosir to take lunch to his father in the field. On the way Samosir grew hungry and ate it. When he arrived with an empty container, Toba was furious and shouted that he was a fish''s child. The promise was broken.',
   'Di ladang, seorang ayah yang marah menunjuk wadah makanan yang kosong di tangan anaknya.',
   'In a field, an angry father points at the empty food container in his son''s hands.',
   'Toba memarahi Samosir yang membawa wadah makan siang kosong di ladang.',
   'Toba scolds Samosir, who holds an empty lunch container, in the field.'),
  ('danau-toba', 4,
   'Sang ibu sangat sedih. Langit menjadi gelap dan hujan lebat turun tanpa henti. Air hujan menggenang menjadi danau yang luas, yang kini dikenal sebagai Danau Toba. Pulau di tengahnya disebut Pulau Samosir.',
   'The mother was heartbroken. The sky turned dark and heavy rain fell without stopping. The rain filled a wide lake, known today as Lake Toba. The island in its middle is called Samosir Island.',
   'Hujan deras turun di atas lembah yang perlahan berubah menjadi danau luas dengan sebuah pulau di tengahnya.',
   'Heavy rain falls on a valley that slowly becomes a wide lake with an island in the middle.',
   'Danau Toba yang luas di bawah langit mendung, dengan Pulau Samosir di tengahnya.',
   'The wide Lake Toba under a cloudy sky, with Samosir Island in the middle.'),
  -- Sangkuriang (detikJabar, 2024).
  ('sangkuriang', 1,
   'Dayang Sumbi sedang menenun ketika torak benangnya jatuh. Karena lelah, ia berjanji: siapa pun yang mengambilkannya, bila perempuan akan menjadi saudaranya, dan bila laki-laki akan menjadi suaminya. Anjingnya yang setia, Si Tumang, mengambilkan torak itu. Si Tumang sebenarnya jelmaan, dan Dayang Sumbi menepati janjinya. Lahirlah Sangkuriang.',
   'Dayang Sumbi was weaving when her thread spool fell. Tired, she made a promise: whoever fetched it would become her sister if a woman, or her husband if a man. Her loyal dog, Si Tumang, brought the spool. Si Tumang was really a man in animal form, and Dayang Sumbi kept her word. Sangkuriang was born.',
   'Seorang perempuan duduk di depan alat tenun, sementara seekor anjing hitam membawa torak benang di mulutnya.',
   'A woman sits at a loom while a black dog carries a thread spool in its mouth.',
   'Dayang Sumbi di alat tenunnya dan Si Tumang yang membawa torak benang.',
   'Dayang Sumbi at her loom and Si Tumang carrying the spool.'),
  ('sangkuriang', 2,
   'Setelah dewasa, Sangkuriang berburu bersama Si Tumang. Di hutan ia bertemu seorang nenek tua dan menyuruh Si Tumang menyerangnya. Si Tumang menolak, dan Sangkuriang membunuhnya. Ketika tahu, Dayang Sumbi memukul kepala Sangkuriang dengan centong nasi hingga berbekas luka. Sangkuriang pun pergi merantau ke timur dan berguru.',
   'When he grew up, Sangkuriang went hunting with Si Tumang. In the forest he met an old woman and ordered Si Tumang to attack her. Si Tumang refused, and Sangkuriang killed him. When Dayang Sumbi found out, she struck Sangkuriang on the head with a rice scoop, leaving a scar. Sangkuriang left for the east to study.',
   'Seorang pemuda dengan busur berdiri di hutan yang gelap. Kemudian seorang ibu mengangkat centong nasi dengan wajah sedih dan marah.',
   'A young man with a bow stands in a dark forest. Then a mother raises a rice scoop, sad and angry.',
   'Sangkuriang muda di hutan bersama Si Tumang sebelum peristiwa yang membuatnya diusir.',
   'Young Sangkuriang in the forest with Si Tumang, before the deed that sends him away.'),
  ('sangkuriang', 3,
   'Bertahun-tahun kemudian Sangkuriang kembali dan bertemu seorang perempuan cantik. Ia jatuh cinta tanpa tahu bahwa perempuan itu ibunya sendiri. Dayang Sumbi mengenali bekas luka di kepalanya. Untuk menolak, ia meminta syarat yang mustahil: bendunglah Sungai Ci Tarum dan buatlah sebuah perahu, semuanya dalam satu malam.',
   'Years later Sangkuriang came back and met a beautiful woman. He fell in love, not knowing she was his own mother. Dayang Sumbi recognised the scar on his head. To refuse him, she set an impossible task: dam the Ci Tarum River and build a boat, all in one night.',
   'Seorang perempuan menatap bekas luka di kepala seorang pemuda dengan terkejut.',
   'A woman stares in shock at a scar on a young man''s head.',
   'Dayang Sumbi mengenali bekas luka di kepala Sangkuriang.',
   'Dayang Sumbi recognises the scar on Sangkuriang''s head.'),
  ('sangkuriang', 4,
   'Sangkuriang hampir menyelesaikannya. Dayang Sumbi lalu mengibaskan selendang putih sehingga tampak seperti fajar telah tiba. Sangkuriang mengira malam sudah berakhir dan ia gagal. Dengan marah ia menendang perahu yang belum selesai hingga terbalik. Perahu itu menjadi Gunung Tangkuban Parahu, yang dari arah selatan tampak seperti perahu tertelungkup.',
   'Sangkuriang had almost finished. Then Dayang Sumbi waved a white scarf so that it looked as if dawn had come. Sangkuriang thought the night was over and that he had failed. In anger he kicked the unfinished boat, and it turned upside down. The boat became Mount Tangkuban Parahu, which looks like an upturned boat when seen from the south.',
   'Cahaya putih seperti fajar di ufuk timur. Sebuah perahu besar terbalik dan perlahan menjadi gunung.',
   'A white glow like dawn on the eastern horizon. A large boat flips over and slowly becomes a mountain.',
   'Gunung Tangkuban Parahu yang bentuknya seperti perahu terbalik.',
   'Mount Tangkuban Parahu, shaped like an upturned boat.'),
  -- Manik Angkeran (Good News From Indonesia, 2024).
  ('manik-angkeran', 1,
   'Di Kerajaan Daha hiduplah seorang brahmana bernama Sidi Mantra. Putranya, Manik Angkeran, tumbuh menjadi pemuda yang gagah, tetapi gemar berjudi. Ia terus bertaruh sampai harta keluarganya habis dan utangnya menumpuk.',
   'In the kingdom of Daha lived a brahmin named Sidi Mantra. His son, Manik Angkeran, grew into a handsome young man, but he loved to gamble. He kept betting until the family''s wealth was gone and his debts piled up.',
   'Seorang brahmana tua berjubah putih menatap sedih putranya yang duduk di depan papan judi.',
   'An old brahmin in white robes looks sadly at his son, who sits before a gambling board.',
   'Sidi Mantra dan putranya Manik Angkeran di rumah mereka di Daha.',
   'Sidi Mantra and his son Manik Angkeran at home in Daha.'),
  ('manik-angkeran', 2,
   'Sidi Mantra berpuasa dan berdoa. Ia mendengar suara yang menyuruhnya pergi ke kawah Gunung Agung, tempat Naga Besukih menjaga harta. Di sana sang naga menggeliat, dan intan serta permata berjatuhan dari sisiknya. Sidi Mantra melunasi utang putranya dan melarangnya berjudi lagi.',
   'Sidi Mantra fasted and prayed. He heard a voice telling him to go to the crater of Mount Agung, where the dragon Naga Besukih guarded a treasure. There the dragon stirred, and diamonds and jewels fell from its scales. Sidi Mantra paid his son''s debts and forbade him to gamble again.',
   'Di kawah gunung yang berasap, seekor naga besar menggeliat dan permata berkilau berjatuhan dari sisiknya.',
   'In a smoking mountain crater, a great dragon stirs and glittering jewels fall from its scales.',
   'Naga Besukih di kawah Gunung Agung di hadapan Sidi Mantra.',
   'Naga Besukih in the crater of Mount Agung before Sidi Mantra.'),
  ('manik-angkeran', 3,
   'Namun Manik Angkeran kembali berjudi sampai harta itu habis, dan ayahnya menolak membantu lagi. Seorang teman memberi tahu tempat sang naga. Manik Angkeran pergi ke Gunung Agung, dan ketika naga itu menggeliat, ia menghunus pedang lalu memotong ekornya. Naga Besukih murka dan membunuhnya.',
   'But Manik Angkeran gambled again until the treasure was gone, and his father refused to help any more. A friend told him where the dragon lived. Manik Angkeran went to Mount Agung, and when the dragon stirred, he drew a sword and cut off its tail. Naga Besukih was enraged and killed him.',
   'Seorang pemuda mengangkat pedang di dekat ekor naga yang berhiaskan permata, di tepi kawah yang gelap.',
   'A young man raises a sword near the jewelled tail of a dragon, at the edge of a dark crater.',
   'Manik Angkeran mengangkat pedang di dekat ekor Naga Besukih.',
   'Manik Angkeran raises his sword near Naga Besukih''s tail.'),
  ('manik-angkeran', 4,
   'Sidi Mantra meminta maaf kepada sang naga dan memohon agar putranya dihidupkan kembali. Naga Besukih mengabulkannya. Dalam perjalanan pulang, Sidi Mantra menancapkan tongkatnya ke tanah. Dari situ keluar mata air yang terus meluas menjadi selat yang memisahkan ayah dan anak. Selat itu dipercaya sebagai Selat Bali, yang memisahkan Jawa dan Bali.',
   'Sidi Mantra apologised to the dragon and begged for his son''s life. Naga Besukih granted it. On the way home, Sidi Mantra struck his staff into the ground. Water sprang up and kept widening into a strait that parted father and son. People believe it is the Bali Strait, which separates Java and Bali.',
   'Seorang brahmana menancapkan tongkat ke tanah, dan air memancar lalu melebar menjadi laut di antara dua daratan.',
   'A brahmin plants his staff in the ground, and water springs up and widens into a sea between two lands.',
   'Sidi Mantra menancapkan tongkat, dan air mulai memisahkan dua daratan.',
   'Sidi Mantra plants his staff, and water begins to part two lands.'),
  -- Putri Junjung Buih (detikKalimantan, 2025).
  ('putri-junjung-buih', 1,
   'Negara Dipa di Kalimantan Selatan adalah kerajaan yang makmur, dipimpin dua bersaudara, Mpu Mandastana dan Lambung Mangkurat. Lama keduanya belum dikaruniai anak. Mpu Mandastana bertapa dan mendapat petunjuk agar istrinya makan bunga kastuba. Istrinya pun melahirkan putra kembar, Bambang Patmaraga dan Bambang Sukmaraga.',
   'Negara Dipa in South Kalimantan was a prosperous kingdom ruled by two brothers, Mpu Mandastana and Lambung Mangkurat. For a long time neither had children. Mpu Mandastana meditated and was told his wife should eat kastuba flowers. She then gave birth to twin sons, Bambang Patmaraga and Bambang Sukmaraga.',
   'Dua bangsawan bersaudara berdiri di balairung istana kayu di tepi sungai.',
   'Two noble brothers stand in the hall of a wooden palace beside a river.',
   'Mpu Mandastana dan Lambung Mangkurat di istana Negara Dipa.',
   'Mpu Mandastana and Lambung Mangkurat in the palace of Negara Dipa.'),
  ('putri-junjung-buih', 2,
   'Lambung Mangkurat bertapa di hutan, tetapi tidak mendapat petunjuk. Dalam perjalanan pulang menyusuri Sungai Tabalong, ia melihat air berbuih dan terbelah. Dari dasar sungai muncul seorang bayi perempuan berkulit keemasan. Ia mengangkatnya menjadi anak dan menamainya Putri Junjung Buih.',
   'Lambung Mangkurat meditated in the forest but received no sign. On his way home along the Tabalong River, he saw the water foam and part. A golden-skinned baby girl rose from the riverbed. He adopted her and named her Putri Junjung Buih.',
   'Di tengah sungai yang berbuih, seorang bayi bercahaya keemasan muncul di atas buih.',
   'In the middle of a foaming river, a baby glowing golden rises on the foam.',
   'Bayi Putri Junjung Buih muncul dari buih Sungai Tabalong.',
   'The baby Putri Junjung Buih rises from the foam of the Tabalong River.'),
  ('putri-junjung-buih', 3,
   'Bayi itu dapat berbicara. Ia meminta empat puluh gadis untuk menenun kain langgundi dan empat puluh pemuda untuk membangun sebuah balai. Setelah semuanya dipenuhi, ia pindah ke Dipa, dan panen menjadi melimpah. Ketika ia dewasa, kedua putra kembar jatuh cinta kepadanya. Mereka berebut hingga keduanya meninggal, dan sang putri sangat berduka.',
   'The baby could speak. She asked for forty young women to weave a langgundi cloth and forty young men to build a pavilion. Once this was done, she moved to Dipa, and the harvests grew plentiful. When she grew up, both twins fell in love with her. They fought over her until both died, and the princess grieved deeply.',
   'Para gadis menenun di sebuah balai besar, sementara padi menguning di sawah sekitarnya.',
   'Young women weave in a large pavilion while rice ripens in the fields around it.',
   'Empat puluh gadis menenun kain langgundi untuk Putri Junjung Buih.',
   'Forty young women weave a langgundi cloth for Putri Junjung Buih.'),
  ('putri-junjung-buih', 4,
   'Lambung Mangkurat bertapa lagi dan mendapat petunjuk bahwa jodoh sang putri adalah Raden Suryatana, pangeran Majapahit di seberang laut. Sang pangeran lahir dengan tangan dan kaki yang tidak lengkap, sehingga Majapahit sempat ragu melepasnya. Putri Junjung Buih berdoa agar ia tiba dengan selamat bila memang jodohnya, dan ia pun tiba. Sang putri menerimanya apa adanya, dan putra-putra mereka kelak menjadi raja-raja besar.',
   'Lambung Mangkurat meditated again and learned that the princess was destined to marry Raden Suryatana, a prince of Majapahit across the sea. The prince was born without complete hands and feet, so Majapahit hesitated to let him go. Putri Junjung Buih prayed that he would arrive safely if he was truly her match, and he did. She accepted him as he was, and their sons later became great kings.',
   'Sebuah kapal berlayar mendekati pantai, dan seorang putri menyambut seorang pangeran dengan senyum.',
   'A ship sails toward the shore, and a princess welcomes a prince with a smile.',
   'Putri Junjung Buih menyambut Raden Suryatana yang datang dari Majapahit.',
   'Putri Junjung Buih welcomes Raden Suryatana from Majapahit.'),
  -- Batu Berdaun (Good News From Indonesia, 2025).
  ('batu-berdaun', 1,
   'Di sebuah desa di pesisir Maluku hiduplah seorang nenek bersama dua cucunya yang yatim piatu, yang sulung berusia sebelas tahun dan yang bungsu lima tahun. Nenek mencari hasil hutan dan menangkap ikan di pantai, tetapi hasilnya tidak pernah cukup.',
   'In a coastal village in Maluku lived a grandmother with her two orphaned grandchildren, the elder eleven years old and the younger five. The grandmother gathered forest produce and fished at the beach, but it was never quite enough.',
   'Sebuah rumah panggung kecil di tepi pantai. Seorang nenek berjalan pulang membawa keranjang, diikuti dua anak.',
   'A small house on stilts by the beach. A grandmother walks home with a basket, followed by two children.',
   'Nenek dan dua cucunya di depan rumah mereka di pesisir Maluku.',
   'The grandmother and her two grandchildren outside their house on the Maluku coast.'),
  ('batu-berdaun', 2,
   'Suatu hari nenek memasang bubu di pantai dan menangkap seekor kepiting besar. Ia menyuruh kedua cucunya membawa pulang dan memasaknya, dan berpesan agar capitnya disisakan untuknya, karena ia harus kembali bekerja di hutan.',
   'One day the grandmother set a trap at the beach and caught a large crab. She told the children to take it home and cook it, and to save the claw for her, because she had to go back to work in the forest.',
   'Seorang nenek mengangkat bubu dari air dangkal, dan seekor kepiting besar ada di dalamnya.',
   'A grandmother lifts a trap from shallow water, with a large crab inside.',
   'Nenek menyerahkan kepiting besar kepada kedua cucunya di pantai.',
   'The grandmother hands the large crab to her two grandchildren on the beach.'),
  ('batu-berdaun', 3,
   'Anak-anak memasak dan makan kepiting itu dengan lahap. Sambil menunggu, si bungsu lapar lagi dan meminta capit yang tersisa. Kakaknya mengingatkan bahwa itu untuk nenek, tetapi akhirnya ia memberikannya. Nenek pulang dengan pucat, lemah, dan lapar, dan tidak ada makanan untuknya.',
   'The children cooked the crab and ate it eagerly. While they waited, the younger one grew hungry again and asked for the leftover claw. The elder reminded them it was for their grandmother, but in the end gave it up. The grandmother came home pale, weak and hungry, and there was no food left for her.',
   'Dua anak duduk di dekat tungku dengan piring kosong, sementara nenek berdiri lelah di ambang pintu.',
   'Two children sit by the stove with empty plates while their grandmother stands tired in the doorway.',
   'Nenek yang lelah pulang dan mendapati piring kosong.',
   'The tired grandmother comes home to find empty plates.'),
  ('batu-berdaun', 4,
   'Dengan kecewa nenek pergi ke sebuah bukit. Di depan batu besar berbentuk daun, ia menumpahkan kesedihannya dan meminta batu itu menelannya. Batu itu terbelah, menariknya ke dalam, lalu menutup kembali. Ketika kedua cucunya tiba, mereka hanya melihat secarik kain nenek terjepit di antara batu. Mereka menangis dan menyesal.',
   'Disappointed, the grandmother went to a hill. Before a large leaf-shaped stone, she poured out her sorrow and asked the stone to swallow her. The stone split open, drew her inside and closed again. When the children arrived, they saw only a scrap of her cloth caught between the stones. They cried and were sorry.',
   'Sebuah batu besar berbentuk daun di atas bukit, dengan secarik kain terjepit di celahnya. Dua anak menangis di depannya.',
   'A large leaf-shaped stone on a hill, with a scrap of cloth caught in its crack. Two children cry in front of it.',
   'Kedua cucu menangis di depan Batu Berdaun di atas bukit.',
   'The two grandchildren cry before the Leaf Stone on the hill.'),
  -- Kasuari dan Dara Makota (detikJogja, 2025).
  ('kasuari-dan-dara-makota', 1,
   'Di hutan Papua hiduplah seekor burung kasuari yang serakah. Ia mengambil semua buah, baik yang di pohon maupun yang jatuh ke tanah, sehingga burung lain tidak kebagian. Karena itu tidak ada burung yang mau berteman dengannya.',
   'In the forest of Papua lived a greedy cassowary. He took all the fruit, both on the trees and on the ground, so the other birds got none. Because of this, no bird wanted to be his friend.',
   'Seekor kasuari besar berdiri di bawah pohon buah, dikelilingi burung-burung kecil yang kecewa.',
   'A large cassowary stands under a fruit tree, surrounded by disappointed small birds.',
   'Kasuari yang serakah menumpuk buah-buahan di hutan.',
   'The greedy cassowary piles up fruit in the forest.'),
  ('kasuari-dan-dara-makota', 2,
   'Dara makota mengusulkan sebuah lomba terbang untuk memberi pelajaran. Bila kasuari kalah, ia harus berhenti berbuat curang kepada burung lain. Kasuari menerima tantangan itu. Banyak yang ragu, karena tubuh dara makota kecil, tetapi ia tetap maju.',
   'The crowned pigeon proposed a flying race to teach him a lesson. If the cassowary lost, he had to stop cheating the other birds. The cassowary accepted. Many doubted the crowned pigeon, who was small, but she still took up the challenge.',
   'Seekor burung dara bermahkota biru berdiri berhadapan dengan kasuari yang jauh lebih besar.',
   'A blue crowned pigeon stands facing a much larger cassowary.',
   'Dara makota menantang kasuari berlomba terbang.',
   'The crowned pigeon challenges the cassowary to a flying race.'),
  ('kasuari-dan-dara-makota', 3,
   'Saat lomba dimulai, kasuari terbang cepat sambil mengejek lawannya. Ia terlalu sering menoleh ke belakang, lalu menabrak sebatang pohon hingga sayapnya patah. Kasuari jatuh dan tidak bisa terbang lagi, sementara dara makota terus melesat jauh.',
   'When the race began, the cassowary flew fast while mocking his rival. He looked back too often and crashed into a tree, breaking his wings. The cassowary fell and could not fly again, while the crowned pigeon flew on far ahead.',
   'Seekor kasuari menabrak batang pohon, sementara burung kecil terbang tinggi di atas hutan.',
   'A cassowary crashes into a tree trunk while a small bird flies high above the forest.',
   'Kasuari jatuh setelah menabrak pohon, dan dara makota terbang di kejauhan.',
   'The cassowary falls after hitting a tree, and the crowned pigeon flies on in the distance.'),
  ('kasuari-dan-dara-makota', 4,
   'Kasuari menyadari kesalahannya dan malu karena telah berbuat curang. Sejak itu ia berubah menjadi lebih baik, tetapi ia hanya bisa mencari makan di tanah.',
   'The cassowary saw his mistake and was ashamed of his cheating. From then on he changed for the better, but he could only look for food on the ground.',
   'Seekor kasuari berjalan pelan di lantai hutan, berbagi buah dengan burung-burung lain.',
   'A cassowary walks slowly on the forest floor, sharing fruit with other birds.',
   'Kasuari mencari makan di tanah dan berbagi dengan burung lain.',
   'The cassowary looks for food on the ground and shares with other birds.')
) as c (slug, no, text_id, text_en, ad_id, ad_en, alt_id, alt_en) on c.slug = s.slug
on conflict (story_id, chapter_no) do update set
  text_id = excluded.text_id, text_en = excluded.text_en,
  audio_description_id = excluded.audio_description_id, audio_description_en = excluded.audio_description_en,
  image_alt_id = excluded.image_alt_id, image_alt_en = excluded.image_alt_en
where t.review_status = 'draft';

-- 3. Recipes -------------------------------------------------------------------------
insert into public.recipes as t (region_id, slug, name_id, name_en, servings, minutes, dietary_tags)
select r.id, x.slug, x.name_id, x.name_en, x.servings, x.minutes, x.tags
from (values
  ('batak', 'arsik-ikan-mas', 'Arsik Ikan Mas', 'Arsik ikan mas (Batak spiced carp)', 3, 90, array[]::text[]),
  ('sunda', 'nasi-timbel', 'Nasi Timbel Isi Ayam', 'Nasi timbel with chicken (rice in banana leaf)', null, null, array['contains_chicken', 'contains_coconut']),
  ('bali', 'ayam-betutu', 'Ayam Betutu', 'Ayam betutu (Balinese spiced chicken)', 5, 180, array['contains_chicken']),
  ('banjar', 'soto-banjar', 'Soto Banjar', 'Soto Banjar (Banjar chicken soup)', 5, 60, array['contains_chicken', 'contains_egg']),
  ('maluku', 'ikan-kuah-kuning', 'Ikan Kakap Kuah Kuning', 'Snapper in yellow broth', null, null, array['contains_seafood']),
  ('papua', 'papeda', 'Papeda', 'Papeda (sago porridge)', null, null, array['vegetarian'])
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
  -- Arsik ikan mas (Fimela, 2022).
  ('arsik-ikan-mas', 1, 'Ikan mas', 'Carp (ikan mas)', 1::numeric, 'kg'),
  ('arsik-ikan-mas', 2, 'Daun bawang lokio, buang akarnya', 'Lokio spring onions, roots removed', 150, 'g'),
  ('arsik-ikan-mas', 3, 'Kacang panjang, potong-potong', 'Long beans, cut into pieces', 150, 'g'),
  ('arsik-ikan-mas', 4, 'Bunga kecombrang, belah empat', 'Torch ginger buds, quartered', 3, 'piece'),
  ('arsik-ikan-mas', 5, 'Bawang putih (bumbu halus)', 'Garlic (for the paste)', 8, 'clove'),
  ('arsik-ikan-mas', 6, 'Bawang merah (bumbu halus)', 'Shallots (for the paste)', 10, 'piece'),
  ('arsik-ikan-mas', 7, 'Cabai rawit (bumbu halus)', 'Bird''s eye chillies (for the paste)', 10, 'piece'),
  ('arsik-ikan-mas', 8, 'Cabai keriting (bumbu halus)', 'Curly red chillies (for the paste)', 5, 'piece'),
  ('arsik-ikan-mas', 9, 'Kemiri (bumbu halus)', 'Candlenuts (for the paste)', 8, 'piece'),
  ('arsik-ikan-mas', 10, 'Jahe, ruas (bumbu halus)', 'Ginger, knobs (for the paste)', 2, 'piece'),
  ('arsik-ikan-mas', 11, 'Serai, bagian putih, iris (bumbu halus)', 'Lemongrass, white part, sliced (for the paste)', 1, 'stalk'),
  ('arsik-ikan-mas', 12, 'Serai, memarkan', 'Lemongrass, bruised', 5, 'stalk'),
  ('arsik-ikan-mas', 13, 'Lengkuas, ruas, memarkan', 'Galangal, knob, bruised', 1, 'piece'),
  ('arsik-ikan-mas', 14, 'Asam gelugur', 'Asam gelugur (dried tamarind slices)', 3, 'piece'),
  ('arsik-ikan-mas', 15, 'Asam cekala (patikala)', 'Asam cekala (torch ginger fruit)', 5, 'piece'),
  ('arsik-ikan-mas', 16, 'Andaliman, memarkan', 'Andaliman (Batak pepper), bruised', 2, 'tbsp'),
  ('arsik-ikan-mas', 17, 'Gula', 'Sugar', 2, 'tsp'),
  ('arsik-ikan-mas', 18, 'Garam dan jeruk nipis', 'Salt and lime', null, 'to_taste'),
  -- Nasi timbel isi ayam (Liputan6, 2024).
  ('nasi-timbel', 1, 'Minyak goreng', 'Cooking oil', 2, 'tbsp'),
  ('nasi-timbel', 2, 'Bawang merah, iris tipis', 'Shallots, thinly sliced', 5, 'piece'),
  ('nasi-timbel', 3, 'Bawang putih, iris tipis', 'Garlic, thinly sliced', 2, 'clove'),
  ('nasi-timbel', 4, 'Jahe, haluskan', 'Ginger, crushed', 1, 'cm'),
  ('nasi-timbel', 5, 'Serai, bagian putih, memarkan', 'Lemongrass, white part, bruised', 1, 'stalk'),
  ('nasi-timbel', 6, 'Dada ayam tanpa tulang, potong dadu kecil', 'Boneless chicken breast, diced', 250, 'g'),
  ('nasi-timbel', 7, 'Santan dari 1 butir kelapa', 'Coconut milk (from 1 coconut)', 400, 'ml'),
  ('nasi-timbel', 8, 'Beras', 'Rice', 150, 'g'),
  ('nasi-timbel', 9, 'Daun pandan, simpulkan', 'Pandan leaves, knotted', 1, 'bunch'),
  ('nasi-timbel', 10, 'Daun pisang, celup air panas lalu keringkan', 'Banana leaves, dipped in hot water and dried', null, 'to_taste'),
  -- Ayam betutu (Orami, 2024).
  ('ayam-betutu', 1, 'Ayam kampung utuh', 'Whole free-range chicken', 1, 'whole'),
  ('ayam-betutu', 2, 'Cabai merah besar, buang bijinya (bumbu halus)', 'Large red chillies, seeded (for the paste)', 15, 'piece'),
  ('ayam-betutu', 3, 'Bawang merah (bumbu halus)', 'Shallots (for the paste)', 100, 'g'),
  ('ayam-betutu', 4, 'Bawang putih (bumbu halus)', 'Garlic (for the paste)', 7, 'clove'),
  ('ayam-betutu', 5, 'Kunyit (bumbu halus)', 'Turmeric (for the paste)', 6, 'cm'),
  ('ayam-betutu', 6, 'Jahe (bumbu halus)', 'Ginger (for the paste)', 5, 'cm'),
  ('ayam-betutu', 7, 'Lengkuas (bumbu halus)', 'Galangal (for the paste)', 5, 'cm'),
  ('ayam-betutu', 8, 'Kemiri (bumbu halus)', 'Candlenuts (for the paste)', 5, 'piece'),
  ('ayam-betutu', 9, 'Serai bakar, bagian putih (bumbu halus)', 'Grilled lemongrass, white part (for the paste)', 2, 'stalk'),
  ('ayam-betutu', 10, 'Ketumbar (bumbu halus)', 'Coriander seed (for the paste)', 1, 'tsp'),
  ('ayam-betutu', 11, 'Merica (bumbu halus)', 'Pepper (for the paste)', 0.5, 'tsp'),
  ('ayam-betutu', 12, 'Garam', 'Salt', 2, 'tsp'),
  ('ayam-betutu', 13, 'Serai, memarkan', 'Lemongrass, bruised', 2, 'stalk'),
  ('ayam-betutu', 14, 'Daun salam', 'Indonesian bay leaves', 2, 'leaf'),
  ('ayam-betutu', 15, 'Daun jeruk', 'Kaffir lime leaves', 4, 'leaf'),
  ('ayam-betutu', 16, 'Daun pisang untuk membungkus', 'Banana leaves for wrapping', null, 'to_taste'),
  ('ayam-betutu', 17, 'Minyak goreng dan gula', 'Cooking oil and sugar', null, 'to_taste'),
  -- Soto Banjar (Orami, 2023).
  ('soto-banjar', 1, 'Ayam kampung, potong 4', 'Free-range chicken, cut in 4', 1, 'whole'),
  ('soto-banjar', 2, 'Air untuk merebus', 'Water for the broth', 1.5, 'l'),
  ('soto-banjar', 3, 'Bawang putih, iris lalu goreng (bumbu halus)', 'Garlic, sliced and fried (for the paste)', 7, 'clove'),
  ('soto-banjar', 4, 'Bawang merah (bumbu halus)', 'Shallots (for the paste)', 15, 'piece'),
  ('soto-banjar', 5, 'Jahe (bumbu halus)', 'Ginger (for the paste)', 4, 'cm'),
  ('soto-banjar', 6, 'Pala bubuk', 'Ground nutmeg', 0.5, 'tsp'),
  ('soto-banjar', 7, 'Merica putih bubuk', 'Ground white pepper', 1, 'tsp'),
  ('soto-banjar', 8, 'Kemiri sangrai', 'Toasted candlenuts', 3, 'piece'),
  ('soto-banjar', 9, 'Pekak (bunga lawang)', 'Star anise (pekak)', 2, 'piece'),
  ('soto-banjar', 10, 'Cengkih', 'Cloves', 2, 'piece'),
  ('soto-banjar', 11, 'Kapulaga', 'Cardamom pods', 3, 'piece'),
  ('soto-banjar', 12, 'Kayu manis', 'Cinnamon', 3, 'cm'),
  ('soto-banjar', 13, 'Minyak goreng untuk menumis', 'Cooking oil for frying', 2, 'tbsp'),
  ('soto-banjar', 14, 'Air untuk memblender bumbu', 'Water for blending the paste', 200, 'ml'),
  ('soto-banjar', 15, 'Soun, rendam air', 'Glass noodles, soaked', 125, 'g'),
  ('soto-banjar', 16, 'Ketupat, potong-potong', 'Ketupat rice cakes, cut', 4, 'piece'),
  ('soto-banjar', 17, 'Telur rebus, belah dua', 'Boiled eggs, halved', 2, 'piece'),
  ('soto-banjar', 18, 'Perkedel', 'Potato fritters (perkedel)', 4, 'piece'),
  ('soto-banjar', 19, 'Seledri, iris', 'Celery, sliced', 2, 'stalk'),
  ('soto-banjar', 20, 'Daun bawang, iris', 'Spring onions, sliced', 2, 'stalk'),
  ('soto-banjar', 21, 'Jeruk nipis', 'Lime', 1, 'piece'),
  ('soto-banjar', 22, 'Garam, gula, bawang goreng, dan sambal', 'Salt, sugar, fried shallots and sambal', null, 'to_taste'),
  -- Ikan kakap kuah kuning (Kompas TV, 2020).
  ('ikan-kuah-kuning', 1, 'Ikan kakap, potong 3', 'Snapper, each cut in 3', 3, 'whole'),
  ('ikan-kuah-kuning', 2, 'Bawang merah (bumbu halus)', 'Shallots (for the paste)', 10, 'piece'),
  ('ikan-kuah-kuning', 3, 'Bawang putih (bumbu halus)', 'Garlic (for the paste)', 7, 'clove'),
  ('ikan-kuah-kuning', 4, 'Kemiri (bumbu halus)', 'Candlenuts (for the paste)', 4, 'piece'),
  ('ikan-kuah-kuning', 5, 'Merica bubuk (bumbu halus)', 'Ground pepper (for the paste)', 1, 'tbsp'),
  ('ikan-kuah-kuning', 6, 'Kunyit, seruas jari (bumbu halus)', 'Turmeric, finger-length (for the paste)', 1, 'piece'),
  ('ikan-kuah-kuning', 7, 'Jahe, seruas jari (bumbu halus)', 'Ginger, finger-length (for the paste)', 1, 'piece'),
  ('ikan-kuah-kuning', 8, 'Cabai besar atau rawit (bumbu halus)', 'Large or bird''s eye chillies (for the paste)', 4, 'piece'),
  ('ikan-kuah-kuning', 9, 'Lengkuas, seruas jari, memarkan', 'Galangal, finger-length, bruised', 1, 'piece'),
  ('ikan-kuah-kuning', 10, 'Serai, memarkan', 'Lemongrass, bruised', 3, 'stalk'),
  ('ikan-kuah-kuning', 11, 'Daun salam', 'Indonesian bay leaves', 3, 'leaf'),
  ('ikan-kuah-kuning', 12, 'Daun jeruk', 'Kaffir lime leaves', 3, 'leaf'),
  ('ikan-kuah-kuning', 13, 'Tomat, iris', 'Tomatoes, sliced', 4, 'piece'),
  ('ikan-kuah-kuning', 14, 'Belimbing wuluh, iris', 'Bilimbi, sliced', 10, 'piece'),
  ('ikan-kuah-kuning', 15, 'Daun kemangi', 'Lemon basil', null, 'to_taste'),
  ('ikan-kuah-kuning', 16, 'Minyak goreng, garam, dan air', 'Cooking oil, salt and water', null, 'to_taste'),
  -- Papeda (Merah Putih, 2018).
  ('papeda', 1, 'Tepung sagu', 'Sago starch', 100, 'g'),
  ('papeda', 2, 'Air (300 ml untuk melarutkan sagu, sisanya direbus)', 'Water (300 ml to mix the sago, the rest boiled)', 1000, 'ml'),
  ('papeda', 3, 'Garam', 'Salt', 0.5, 'tsp'),
  ('papeda', 4, 'Gula', 'Sugar', 0.5, 'tsp')
) as i (slug, position, name_id, name_en, amount, unit) on i.slug = rc.slug
where rc.review_status = 'draft'
on conflict (recipe_id, position) do update set
  name_id = excluded.name_id, name_en = excluded.name_en, amount = excluded.amount, unit = excluded.unit;

insert into public.recipe_steps as t (recipe_id, step_no, text_id, text_en, timer_seconds)
select rc.id, s.step_no, s.text_id, s.text_en, s.timer_seconds
from public.recipes rc
join (values
  ('arsik-ikan-mas', 1, 'Siangi ikan, buang isi perut, lalu belah dua. Cuci bersih, lalu lumuri dengan perasan jeruk nipis dan garam.',
   'Scale and gut the fish, then split it in half. Rinse well and rub with lime juice and salt.', null::integer),
  ('arsik-ikan-mas', 2, 'Haluskan bumbu halus, lalu lumuri ikan dengan sedikit bumbu.',
   'Blend the paste ingredients until smooth, then coat the fish with a little of it.', null),
  ('arsik-ikan-mas', 3, 'Susun serai, lengkuas, asam gelugur, asam cekala, kecombrang, dan andaliman di dasar panci.',
   'Lay the lemongrass, galangal, asam gelugur, asam cekala, torch ginger and andaliman on the bottom of a pot.', null),
  ('arsik-ikan-mas', 4, 'Letakkan ikan di atasnya, tuang sisa bumbu, lalu ratakan.',
   'Place the fish on top, pour over the rest of the paste and spread it evenly.', null),
  ('arsik-ikan-mas', 5, 'Tuang air hingga ikan terendam. Tutup panci dan masak dengan api kecil sampai sedang.',
   'Add water to cover the fish. Cover the pot and simmer over low to medium heat.', null),
  ('arsik-ikan-mas', 6, 'Setelah air tinggal setengah dan bumbu matang, masukkan daun bawang lokio dan masak hingga air hampir habis. Sajikan dengan nasi hangat.',
   'When the liquid has reduced by half and the seasoning tastes done, add the lokio spring onions and cook until the liquid is almost gone. Serve with warm rice.', null),
  ('nasi-timbel', 1, 'Panaskan minyak, tumis bawang merah, bawang putih, jahe, dan serai hingga harum. Masukkan ayam dan aduk rata.',
   'Heat the oil and fry the shallots, garlic, ginger and lemongrass until fragrant. Add the chicken and stir well.', null),
  ('nasi-timbel', 2, 'Tuang santan dan masak sambil diaduk hingga mendidih.',
   'Pour in the coconut milk and cook, stirring, until it boils.', null),
  ('nasi-timbel', 3, 'Masukkan beras dan daun pandan. Aduk terus hingga santan meresap, angkat, lalu kukus hingga nasi matang.',
   'Add the rice and pandan leaves. Keep stirring until the coconut milk is absorbed, then take off the heat and steam until the rice is cooked.', null),
  ('nasi-timbel', 4, 'Setelah agak dingin, ambil 4 sendok makan nasi, letakkan di atas daun pisang, gulung seperti lontong, dan semat kedua ujungnya dengan lidi.',
   'Once slightly cooled, put 4 tablespoons of rice on a banana leaf, roll it up like lontong and pin both ends with bamboo skewers.', null),
  ('nasi-timbel', 5, 'Saat akan disajikan, kukus kembali selama 5 menit hingga hangat.',
   'Before serving, steam the parcels for 5 minutes until hot.', 300),
  ('ayam-betutu', 1, 'Tumis bumbu halus hingga harum dan matang, lalu sisihkan.',
   'Fry the spice paste until fragrant and cooked, then set aside.', null),
  ('ayam-betutu', 2, 'Lumuri seluruh bagian ayam dengan bumbu tumis hingga rata.',
   'Coat the whole chicken evenly with the fried paste.', null),
  ('ayam-betutu', 3, 'Bungkus ayam dengan daun pisang bersama daun jeruk, daun salam, dan serai. Agar matang merata, bungkus lagi dengan aluminium foil.',
   'Wrap the chicken in banana leaves with the kaffir lime leaves, bay leaves and lemongrass. For even cooking, wrap it again in aluminium foil.', null),
  ('ayam-betutu', 4, 'Kukus bungkusan ayam selama sekitar 2 jam.',
   'Steam the parcel for about 2 hours.', 7200),
  ('ayam-betutu', 5, 'Panggang ayam yang sudah dikukus pada suhu 185°C selama sekitar 30 menit.',
   'Bake the steamed chicken at 185°C for about 30 minutes.', 1800),
  ('ayam-betutu', 6, 'Sajikan dengan nasi putih hangat, lalapan, dan bawang goreng.',
   'Serve with warm white rice, fresh vegetables and fried shallots.', null),
  ('soto-banjar', 1, 'Didihkan air, masukkan potongan ayam, lalu rebus hingga empuk.',
   'Bring the water to a boil, add the chicken pieces and simmer until tender.', null),
  ('soto-banjar', 2, 'Haluskan bumbu dengan 200 ml air. Tumis bersama pekak, kayu manis, cengkih, dan kapulaga hingga harum.',
   'Blend the paste with the 200 ml of water. Fry it with the star anise, cinnamon, cloves and cardamom until fragrant.', null),
  ('soto-banjar', 3, 'Masukkan bumbu ke dalam kaldu ayam, didihkan lagi, lalu beri garam dan gula secukupnya.',
   'Stir the paste into the chicken broth, bring back to a boil and season with salt and sugar.', null),
  ('soto-banjar', 4, 'Angkat ayam, suwir dagingnya, dan sisihkan.',
   'Lift out the chicken, shred the meat and set aside.', null),
  ('soto-banjar', 5, 'Tata ketupat, soun, perkedel, telur, dan ayam suwir di mangkuk.',
   'Arrange the ketupat, glass noodles, perkedel, egg and shredded chicken in bowls.', null),
  ('soto-banjar', 6, 'Siram dengan kuah panas, taburi seledri, daun bawang, dan bawang goreng. Sajikan dengan sambal dan perasan jeruk nipis.',
   'Ladle over the hot broth and top with celery, spring onions and fried shallots. Serve with sambal and a squeeze of lime.', null),
  ('ikan-kuah-kuning', 1, 'Potong setiap ikan menjadi 3 bagian dan cuci bersih. Iris tomat dan belimbing wuluh.',
   'Cut each fish into 3 pieces and rinse well. Slice the tomatoes and bilimbi.', null),
  ('ikan-kuah-kuning', 2, 'Haluskan bawang merah, bawang putih, kemiri, merica, jahe, kunyit, dan cabai. Memarkan serai dan lengkuas.',
   'Grind the shallots, garlic, candlenuts, pepper, ginger, turmeric and chillies. Bruise the lemongrass and galangal.', null),
  ('ikan-kuah-kuning', 3, 'Tumis bumbu halus dengan sedikit minyak. Masukkan serai, lengkuas, daun jeruk, daun salam, dan ikan. Beri garam dan air, lalu masak sekitar 20 menit hingga mendidih.',
   'Fry the paste in a little oil. Add the lemongrass, galangal, lime leaves, bay leaves and fish. Season with salt, add water and simmer for about 20 minutes until boiling.', 1200),
  ('ikan-kuah-kuning', 4, 'Setelah mendidih, masukkan kemangi, belimbing wuluh, dan tomat.',
   'Once boiling, add the lemon basil, bilimbi and tomatoes.', null),
  ('ikan-kuah-kuning', 5, 'Tuang papeda ke mangkuk, siram dengan kuah kuning dan ikan, lalu sajikan hangat.',
   'Pour papeda into a bowl, ladle over the yellow broth and fish, and serve warm.', null),
  ('papeda', 1, 'Larutkan tepung sagu dengan 300 ml air, lalu tambahkan garam dan gula.',
   'Mix the sago starch with 300 ml of the water, then add the salt and sugar.', null),
  ('papeda', 2, 'Didihkan sisa air.',
   'Bring the rest of the water to a boil.', null),
  ('papeda', 3, 'Tuang air mendidih ke dalam larutan sagu sambil diaduk perlahan agar matang merata.',
   'Pour the boiling water into the sago mixture, stirring slowly so it cooks evenly.', null),
  ('papeda', 4, 'Bila belum matang merata, masak dengan api kecil sambil terus diaduk.',
   'If it is not cooked through, cook it over low heat, stirring all the time.', null),
  ('papeda', 5, 'Papeda matang saat berubah bening. Angkat dan sajikan hangat, biasanya bersama ikan kuah kuning.',
   'Papeda is done when it turns clear. Serve it warm, usually with fish in yellow broth.', null)
) as s (slug, step_no, text_id, text_en, timer_seconds) on s.slug = rc.slug
where rc.review_status = 'draft'
on conflict (recipe_id, step_no) do update set
  text_id = excluded.text_id, text_en = excluded.text_en, timer_seconds = excluded.timer_seconds;

-- 4. Traditional dress -----------------------------------------------------------
insert into public.costumes as t (region_id, slug, name_id, name_en, info_id, info_en, reference_image_url)
select r.id, x.slug, x.name_id, x.name_en, x.info_id, x.info_en, null
from (values
  ('batak', 'ulos', 'Ulos', 'Ulos',
   'Kain tenun tradisional suku Batak dari Sumatera Utara. Ditenun tangan oleh perempuan dengan alat tenun gedogan, dari benang kapas dan pewarna alami. Ulos diberikan dalam upacara mangulosi pada kelahiran, pernikahan, dan kematian, dan dipakai sebagai selendang, sarung, atau ikat kepala. Jenisnya antara lain Sibolang, Ragi Hotang, dan Ragidup.',
   'The traditional woven cloth of the Batak people of North Sumatra. Women weave it by hand on a gedogan loom from cotton thread and natural dyes. Ulos is given in the mangulosi ceremony at births, weddings and funerals, and worn as a shawl, sarong or headband. Types include Sibolang, Ragi Hotang and Ragidup.'),
  ('sunda', 'kebaya-sunda', 'Kebaya Sunda', 'Sundanese kebaya',
   'Kebaya perempuan Sunda dari Jawa Barat. Kerahnya berbentuk huruf U, dan potongannya lebih panjang dari kebaya daerah lain, hingga menutupi pinggul dan paha. Warnanya cenderung cerah, seperti kuning, merah, dan ungu, dan dipadukan dengan kain jarik bermotif Jawa Barat serta kalung, cincin, dan gelang.',
   'The Sundanese women''s kebaya from West Java. It has a U-shaped neckline and is cut longer than kebaya from other regions, covering the hips and thighs. It tends toward bright colours such as yellow, red and purple, and is worn with a jarik cloth in a West Java pattern and a necklace, ring and bracelet.'),
  ('bali', 'payas-agung', 'Payas Agung', 'Payas agung',
   'Busana adat Bali untuk upacara besar, terutama pernikahan dan upacara keagamaan. Dahulu khusus dikenakan kaum bangsawan, kini menjadi bagian dari banyak upacara adat di Bali. Ciri khasnya warna emas yang dominan, mahkota yang tinggi, dan riasan yang mencolok.',
   'Balinese traditional dress for major ceremonies, especially weddings and religious rites. Once reserved for the nobility, it is now part of many traditional ceremonies in Bali. It is known for its dominant gold colour, tall crown and striking make-up.'),
  ('banjar', 'bagajah-gamuling-baular-lulut', 'Bagajah Gamuling Baular Lulut', 'Bagajah Gamuling Baular Lulut',
   'Busana pengantin adat Banjar dari Kalimantan Selatan, yang kuat dipengaruhi budaya Hindu pada masa silam. Dikenakan dalam upacara pernikahan adat. Pengantin perempuan memakai kemben yang disebut udat, dihiasi untaian bunga melati yang disebut karang jagung.',
   'A Banjar bridal dress from South Kalimantan, strongly shaped by Hindu culture in the past. It is worn at traditional weddings. The bride wears a kemben called udat, decorated with a jasmine garland called karang jagung.'),
  ('maluku', 'baju-cele', 'Baju Cele', 'Baju cele',
   'Busana adat Maluku bermotif garis geometris atau kotak-kotak kecil dengan warna cerah, umumnya merah. Laki-laki memakainya seperti jas di atas kemeja dengan celana panjang hitam. Perempuan memadukannya dengan kain salele yang dililit hingga lutut dan lenso di bahu. Dipakai pada upacara adat seperti pelantikan raja, cuci negeri, panas pela, dan pernikahan.',
   'Maluku traditional dress with geometric stripes or small checks in bright colours, mostly red. Men wear it like a jacket over a shirt with black trousers. Women wear it with a salele cloth wrapped to the knee and a lenso handkerchief on the shoulder. It is worn at ceremonies such as a king''s installation, cuci negeri, panas pela and weddings.'),
  ('papua', 'rok-rumbai', 'Rok Rumbai', 'Rok rumbai (fibre skirt)',
   'Rok perempuan Papua dari serat alami seperti daun sagu atau serat pandan yang disusun berlapis. Dipadukan dengan kalung manik-manik dan hiasan kepala dari bulu burung. Busana adat Papua dipakai dalam upacara, penyambutan tamu, dan tarian adat, dan menjadi penanda identitas.',
   'A Papuan women''s skirt made of layered natural fibres such as sago leaves or pandan. It is worn with bead necklaces and a headpiece of bird feathers. Papuan traditional dress is worn at ceremonies, to welcome guests and in traditional dances, and marks identity.')
) as x (region, slug, name_id, name_en, info_id, info_en)
join public.regions r on r.slug = x.region
on conflict (slug) do update set
  region_id = excluded.region_id, name_id = excluded.name_id, name_en = excluded.name_en,
  info_id = excluded.info_id, info_en = excluded.info_en
where t.review_status = 'draft';

-- 5. Sources -------------------------------------------------------------------------
create temporary table batch_sources (content_type text, slug text, title text, url text, credit text) on commit drop;
insert into batch_sources values
  ('story', 'danau-toba', '2 Versi Cerita Asal Usul Danau Toba', 'https://www.detik.com/sumut/wisata/d-6761917/2-versi-cerita-asal-usul-danau-toba', 'Michael Ogest, detikSumut, 9 June 2023'),
  ('story', 'sangkuriang', 'Legenda Sangkuriang, Cara Leluhur Rekam Letusan Gunung Sunda', 'https://www.detik.com/jabar/budaya/d-7347460/legenda-sangkuriang-cara-leluhur-rekam-letusan-gunung-sunda', 'Dian Nugraha Ramdani, detikJabar, 20 May 2024'),
  ('story', 'manik-angkeran', 'Legenda Manik Angkeran, Kisah yang Dipercaya Menjadi Asal Usul Selat Bali', 'https://www.goodnewsfromindonesia.id/indonesiana/legenda/legenda-manik-angkeran-kisah-yang-dipercaya-menjadi-asal-usul-selat-bali', 'Irfan Jumadil Aslam, Good News From Indonesia, 25 November 2024'),
  ('story', 'putri-junjung-buih', 'Cerita Rakyat Putri Junjung Buih dari Kalimantan Selatan', 'https://www.detik.com/kalimantan/budaya/d-7974187/cerita-rakyat-putri-junjung-buih-dari-kalimantan-selatan', 'Bayu Ardi Isnanto, detikKalimantan, 21 June 2025'),
  ('story', 'batu-berdaun', 'Legenda Batu Berdaun dari Maluku, Kisah Seorang Nenek yang Kecewa dengan Cucunya', 'https://www.goodnewsfromindonesia.id/2025/05/01/legenda-batu-berdaun-dari-maluku-kisah-seorang-nenek-yang-kecewa-dengan-cucunya', 'Irfan Jumadil Aslam, Good News From Indonesia, 1 May 2025'),
  ('story', 'kasuari-dan-dara-makota', '34 Cerita Rakyat Pendek Lengkap dari Seluruh Daerah Indonesia', 'https://www.detik.com/jogja/budaya/d-7810100/34-cerita-rakyat-pendek-lengkap-dari-seluruh-daerah-indonesia', 'Ulvia Nur Azizah, detikJogja, 6 March 2025'),
  ('recipe', 'arsik-ikan-mas', 'Resep Arsik Ikan Mas khas Sumatra Utara', 'https://www.fimela.com/lifestyle/read/4345129/resep-arsik-ikan-mas-khas-sumatra-utara', 'Fimela, 13 June 2022'),
  ('recipe', 'nasi-timbel', '4 Resep Nasi Timbel yang Enak dan Gurih, Kuliner Jadul khas Sunda', 'https://www.liputan6.com/hot/read/5711835/4-resep-nasi-timbel-yang-enak-dan-gurih-kuliner-jadul-khas-sunda', 'Ayu Rifka Sitoresmi, Liputan6, 27 September 2024'),
  ('recipe', 'ayam-betutu', '10 Resep Ayam Betutu Khas Bali, Rempah dan Aromanya Kuat!', 'https://www.orami.co.id/magazine/resep-ayam-betutu', 'Orami, 15 May 2024'),
  ('recipe', 'ayam-betutu', 'Ayam Betutu: Kuliner Wajib di Bali dan Rekomendasinya', 'https://www.indonesia.travel/id-id/travel-ideas/gastronomy/ayam-betutuu/', 'Kementerian Pariwisata RI (indonesia.travel)'),
  ('recipe', 'soto-banjar', '6 Resep Soto Banjar Khas Kalimantan Selatan, Yuk Coba!', 'https://www.orami.co.id/magazine/resep-soto-banjar', 'Orami, 16 July 2023'),
  ('recipe', 'ikan-kuah-kuning', 'Resep Papeda, Menu Legendaris dari Maluku Tempat Glenn Fredly Berasal', 'https://www.kompas.tv/entertainment/76860/resep-papeda-menu-legendaris-dari-maluku-tempat-glenn-fredly-berasal', 'Ade Indra Kusuma, Kompas TV, 19 April 2020'),
  ('recipe', 'papeda', 'Papeda dan Kuah Kuning, Menu Legendaris Masyarakat Papua', 'https://merahputih.com/post/read/papeda-dan-kuah-kuning-menu-legendaris-masyarakat-papua', 'Zulfikar Sy, Merah Putih, 19 April 2018'),
  ('costume', 'ulos', 'Kain Ulos: Makna, Asal Usul, dan Ragam Kain Ulos', 'https://www.indonesia.travel/id/id/travel-ideas/culture/kain-tenun-ulos-khas-batak', 'Kementerian Pariwisata RI (indonesia.travel)'),
  ('costume', 'kebaya-sunda', '7 Baju Adat Sunda, Mulai dari Kebaya Hingga Menak', 'https://www.detik.com/jabar/budaya/d-6889232/7-baju-adat-sunda-mulai-dari-kebaya-hingga-menak', 'Rindang Krisnawati, detikJabar, 22 August 2023'),
  ('costume', 'payas-agung', 'Mengenal Baju Adat Bali, Cerminan Budaya yang Tak Lekang oleh Waktu', 'https://www.goodnewsfromindonesia.id/2024/10/03/mengenal-baju-adat-bali-cerminan-budaya-yang-tak-lekang-oleh-waktu', 'Zihan Berliana Ram Ghani, Good News From Indonesia, 3 October 2024'),
  ('costume', 'bagajah-gamuling-baular-lulut', '4 Baju Adat Kalimantan Selatan, Warisan Budaya Banjar yang Tetap Lestari', 'https://www.detik.com/kalimantan/budaya/d-8172884/4-baju-adat-kalimantan-selatan-warisan-budaya-banjar-yang-tetap-lestari', 'Bayu Ardi Isnanto, detikKalimantan, 24 October 2025'),
  ('costume', 'baju-cele', 'Ragam rupa pakaian adat Maluku', 'https://www.antaranews.com/berita/4292483/ragam-rupa-pakaian-adat-maluku', 'Sri Dewi Larasati, ANTARA News, 28 August 2024'),
  ('costume', 'rok-rumbai', 'Mengenal Baju Adat Papua, Simbol Keindahan dan Kearifan Lokal', 'https://www.goodnewsfromindonesia.id/2024/11/12/mengenal-baju-adat-papua-simbol-keindahan-dan-kearifan-lokal', 'Mona Lestari Utami, Good News From Indonesia, 12 November 2024');

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
