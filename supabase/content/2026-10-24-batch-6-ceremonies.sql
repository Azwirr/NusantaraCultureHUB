-- Content batch 6 (2026-10-24): nine customary ceremonies (adat), drafted from
-- docs/adat-data.md. Each one cites two different websites, both opened.
-- Only drafts change. Re-running is safe.
--
-- Held back from the text on purpose (sources disagree; see docs/adat-data.md):
-- the Pasola spear size, the Tiwah spirit-world name and cloth colour, the
-- Sekaten gamelan names, the Kasada legend names, and the Mapalus "palus" term.
-- Ngaben has no fixed time in its sources, so its timing is left empty.
--
-- Pasola is on Sumba, which had no region yet: a draft region "sumba" is added
-- for it. The owner approves regions before anything shows.

-- 1. Region ----------------------------------------------------------------------
insert into public.regions as t (slug, name_id, name_en, summary_id, summary_en, province_codes, sort_order) values
  ('sumba', 'Sumba (Nusa Tenggara Timur)', 'Sumba (East Nusa Tenggara)',
   'Pulau Sumba di Nusa Tenggara Timur, tempat pasola digelar di Sumba Barat.',
   'The island of Sumba in East Nusa Tenggara, where pasola is held in West Sumba.',
   array['ID-NT'], 17)
on conflict (slug) do update set
  name_id = excluded.name_id, name_en = excluded.name_en,
  summary_id = excluded.summary_id, summary_en = excluded.summary_en,
  province_codes = excluded.province_codes, sort_order = excluded.sort_order
where t.review_status = 'draft';

-- 2. Ceremonies ------------------------------------------------------------------
insert into public.ceremonies as t (
  region_id, slug, name_id, name_en, summary_id, summary_en,
  timing_id, timing_en, body_id, body_en)
select r.id, x.slug, x.name_id, x.name_en, x.summary_id, x.summary_en,
  x.timing_id, x.timing_en, x.body_id, x.body_en
from (values
  ('sumba', 'pasola', 'Pasola', 'Pasola',
   'Perlombaan berkuda dengan lembing kayu dari Sumba Barat, digelar di awal musim tanam dan terkait dengan panen nyale.',
   'A mounted contest with wooden spears from West Sumba, held at the start of the planting season and tied to the nyale harvest.',
   'Setahun sekali di awal musim tanam. Di Kecamatan Lamboya pada Februari; di Wanokaka, Laboya Barat, dan Gaura pada Maret. Tanggalnya ditentukan oleh rato dari fase bulan dan tanda alam.',
   'Once a year at the start of the planting season: in February in Lamboya, and in March in Wanokaka, Laboya Barat and Gaura. The date is set by the rato from the moon and natural signs.',
   'Pasola diawali upacara nyale, ungkapan syukur atas panen dan atas cacing laut (nyale) yang muncul di pantai saat bulan purnama. Nyale yang gemuk dan sehat dianggap pertanda baik, dan pasola hanya boleh digelar setelah nyale didapat. Dua kelompok penunggang kuda, masing-masing lebih dari seratus pemuda, saling melempar lembing kayu. Ujung lembingnya tumpul, tetapi permainan ini tetap bisa berakibat fatal. Darah yang tertumpah dipandang sebagai lambang kesuburan dan panen yang baik. Dalam kepercayaan Marapu, pasola juga ungkapan syukur atas kemakmuran dan permohonan maaf. Menurut legenda setempat, pasola menjadi tanda perdamaian antara dua orang yang pernah berselisih.',
   'Pasola starts with the nyale ceremony, a thanks for the harvest and for the sea worms that appear on the beaches under the full moon. Plump, healthy worms are a sign of good luck, and pasola is held only after the nyale have been gathered. Two groups of more than a hundred young riders throw blunt wooden spears at each other. The contest can still be fatal, and blood spilled in it is seen as a sign of fertility and a good harvest. It is part of the Marapu ritual, a thanksgiving for prosperity and a request for forgiveness. In the local legend, pasola also marks peace between two men who had fallen out.'),
  ('bali', 'ngaben', 'Ngaben', 'Ngaben',
   'Upacara kremasi umat Hindu Bali yang melepaskan roh dari ikatan duniawi dan mengembalikan lima unsur tubuh ke asalnya.',
   'The Balinese Hindu cremation ceremony. It frees the soul from worldly ties and returns the five elements of the body to their source.',
   NULL, NULL,
   'Ngaben, atau pitra yadnya, adalah prosesi pembakaran jenazah. Tubuh tersusun dari lima unsur (panca maha bhuta): pertiwi (padat), apah (cair), teja (panas), bayu (angin), dan akasa (ruang). Roh (atma) menghidupkan unsur-unsur itu, sehingga saat seseorang meninggal hanya tubuhnya yang mati. Upacara ini membebaskan roh dari ikatan duniawi agar dapat mencapai alam atas dan menunggu kelahiran kembali, serta menunjukkan bahwa keluarga telah merelakan kepergiannya. Keluarga memulai dengan ngulapin, memohon izin dan restu di pura dalem, lalu meseh lawang di persimpangan jalan atau tepi kuburan untuk memperbaiki tubuh yang rusak. Api yang membakar jenazah lebih dulu diisi mantra. Dengan tungku tradisional, pembakaran memakan waktu 4 sampai 6 jam. Abu dimasukkan ke dalam kelapa muda dan dilarung ke laut atau ke air yang mengalir ke laut.',
   'Ngaben, also called pitra yadnya, is the cremation of the dead. The body is made of five elements (panca maha bhuta): earth, water, heat, wind and space. The soul animates them, so only the body dies. The ceremony frees the soul from worldly ties so that it can reach the upper realm and await rebirth, and it shows that the family has let go. The family begins with ngulapin, asking permission and blessing at the Pura Dalem, then meseh lawang at a crossroads or the edge of the cemetery to restore any damage to the body. The fire is first charged with a mantra, then burns the body. A traditional pyre takes four to six hours. The ashes are placed in a young coconut and scattered in the sea, or in water that flows to it.'),
  ('dayak-ngaju', 'tiwah', 'Tiwah', 'Tiwah',
   'Upacara kematian adat Dayak Ngaju, penganut Kaharingan, untuk mengantar roh orang yang meninggal dan membersihkan keluarga dari kemalangan.',
   'The death ritual of the Dayak Ngaju, who follow Kaharingan. It sends the spirit of the dead on its journey and clears misfortune from the family.',
   'Berlangsung 3, 4, 7, atau 40 hari, tergantung skala dan jumlah keluarga yang ikut.',
   'Lasts 3, 4, 7 or 40 days, depending on its scale and the number of families taking part.',
   'Tiwah dilakukan suku Dayak Ngaju di Kalimantan Tengah yang menganut Kaharingan. Tulang orang yang meninggal dikumpulkan, dibersihkan, dibungkus kain, dan dibawa ke balai tiwah dalam arak-arakan. Pada hari ke-4 tulang diambil dari makam; pada hari ke-7 disimpan dalam sandung (rumah tulang) atau pantar. Hewan kurban seperti ayam, babi, sapi, atau kerbau diikat pada sapundu, tiang ulin yang diukir, lalu disembelih menurut adat. Bagi masyarakat Dayak Ngaju, tiwah adalah kewajiban: ritual ini mengantar roh ke alamnya dan membersihkan keluarga dari kemalangan. Menurut Kompas, biayanya minimal Rp 50 juta hingga Rp 100 juta, dan sering ditanggung bersama beberapa keluarga. Tiwah yang besar juga menunjukkan kekayaan dan status sosial keluarga.',
   'The Dayak Ngaju of Central Kalimantan, who follow the Kaharingan faith, hold Tiwah as a death ritual. The bones of the dead are gathered, cleaned, wrapped in cloth and carried to the Tiwah hall in procession. On day four the remains are taken from the grave, and on day seven they are placed in a sandung (bone house) or a pantar. Sacrificial animals (chicken, pig, cow or buffalo) are tied to sapundu, carved ironwood posts, and slaughtered according to custom. For the Dayak Ngaju, Tiwah is an obligation: it sends the spirit on its journey and clears misfortune from the family. According to Kompas, a Tiwah costs at least Rp 50 to 100 million, and several families often share the cost. A large Tiwah also shows the family''s wealth and social standing.'),
  ('jawa', 'sekaten', 'Sekaten', 'Sekaten',
   'Perayaan Maulid Nabi Muhammad di Keraton Yogyakarta dan Surakarta, ditutup dengan Grebeg Mulud.',
   'The celebration of the Prophet Muhammad''s birthday at the royal courts of Yogyakarta and Surakarta, closed by Grebeg Mulud.',
   'Tanggal 5 sampai 11 Mulud (Rabi''ul Awal) dalam kalender Jawa, ditutup Grebeg Mulud pada 12 Mulud.',
   'From 5 to 11 Mulud (Rabi''ul Awal) in the Javanese calendar, closed by Grebeg Mulud on 12 Mulud.',
   'Sekaten dikaitkan dengan Sunan Kalijaga, yang pada masa Kerajaan Demak memakai gamelan dan lagu-lagunya untuk menarik orang banyak, lalu mengajak mereka mengucap syahadat. Perayaan ini dijalankan dengan sungguh-sungguh: para pemain gamelan berpuasa dan menyucikan diri, dan gamelan tidak dimainkan pada malam Jumat maupun sebelum salat Jumat siang. Gamelan keraton dibawa ke Masjid Gedhe dan dimainkan enam hari berturut-turut, dengan jeda untuk salat, lalu kembali ke keraton pada malam 11 Mulud. Pada pagi 12 Mulud, prajurit keraton mengarak gunungan, sesaji berbentuk gunung dari nasi, makanan, dan buah, untuk dibagikan. Orang-orang meyakini gunungan membawa berkah dan keselamatan.',
   'Sekaten marks the birth of the Prophet Muhammad. Sunan Kalijaga is credited with starting it in the Demak era: he used gamelan music and songs to draw crowds, then guided people to recite the creed of faith. The palace gamelan are brought to the Grand Mosque and played for six days, with breaks for prayer, and they are not played on Friday nights. The players fast and purify themselves beforehand. The ceremony ends on 12 Mulud with Grebeg Mulud: palace soldiers carry gunungan, cone-shaped offerings of rice, food and fruit, from the palace to the mosque and nearby places. People believe the offerings bring blessings, health and safety.'),
  ('sunda', 'seren-taun', 'Seren Taun', 'Seren Taun',
   'Syukuran panen padi masyarakat Sunda: menyerahkan hasil panen tahun ini ke tahun berikutnya.',
   'The Sundanese rice harvest thanksgiving, a handover of this year''s harvest to the next.',
   'Setiap tahun. Di Cigugur, Kuningan, acara utama jatuh pada 22 Rayagung (Dzulhijjah). Tata caranya berbeda di tiap komunitas.',
   'Every year. In Cigugur, Kuningan, the main event falls on 22 Rayagung (Dzulhijjah). Practice differs between communities.',
   'Nama Seren Taun berasal dari kata seren, yang berarti menyerahkan, dan taun, yang berarti tahun. Upacara ini mengucap syukur atas panen padi dan menyerahkan hasilnya dari tahun lalu ke tahun baru. Padi dimuliakan sebagai Nyi Pohaci Sanghyang Sri (Dewi Sri), dewi padi dan kesuburan. Padi ibu (pare ambu) disimpan di lumbung utama dengan kain putih, dan padi bapak (pare abah) dengan kain hitam, lambang persatuan perempuan dan laki-laki serta harapan akan kebahagiaan keluarga. Di Kampung Urug, Bogor, nasi dikubur sebagai sesaji bagi roh penjaga kesuburan tanah. Tradisi ini masih dijalankan komunitas Kasepuhan seperti Ciptagelar dan Banten Kidul, serta di Kanekes (Baduy), Kampung Naga, dan Cigugur. Sumber menyebut tradisi ini mungkin berasal dari masa Kerajaan Pajajaran.',
   'Seren Taun is a Sundanese thanksgiving for the rice harvest. Its name joins seren, to hand over, and taun, year: the previous year''s harvest is handed over to the next. The rice is honoured as Nyi Pohaci Sanghyang Sri (Dewi Sri), goddess of rice and fertility. Mother rice (pare ambu) is kept in the main granary under white cloth, and father rice (pare abah) under black cloth, representing the union of female and male and the hope for family happiness. In Kampung Urug, Bogor, cooked rice is buried as an offering to the spirits that protect the soil. The tradition continues in Kasepuhan communities such as Ciptagelar and Banten Kidul, and in Kanekes (Baduy), Kampung Naga and Cigugur. Sources say it may date back to the Pajajaran kingdom.'),
  ('jawa', 'yadnya-kasada', 'Yadnya Kasada', 'Yadnya Kasada',
   'Upacara suku Tengger di Gunung Bromo, Jawa Timur: sesaji hasil bumi dan ternak dilemparkan ke kawah sebagai ungkapan syukur.',
   'The Tengger people''s ceremony at Mount Bromo, East Java: farm produce and livestock are cast into the crater as thanks.',
   'Pada hari ke-15 bulan Kasada dalam kalender Tengger. Pada 2026 dilaksanakan dini hari 1 Juni 2026 di Pura Luhur Poten.',
   'On the 15th day of the Kasada month in the Tengger calendar. In 2026 it took place in the early hours of 1 June 2026 at Pura Luhur Poten.',
   'Yadnya Kasada adalah upacara tahunan suku Tengger untuk mengucap syukur kepada Sang Hyang Widhi dan menghormati leluhur. Hasil bumi, tanaman, dan ternak dibawa sebagai sesaji dari Poten ke kawah Bromo dalam prosesi lelabuhan, didoakan dengan mantra, lalu dilemparkan ke kawah. Rangkaian upacara juga mencakup doa, pemberkatan air, dan slametan (kenduri) di akhir acara. Asal-usulnya berakar pada legenda sepasang suami istri yang lama tidak punya anak dan berjanji mempersembahkan anak terakhir ke kawah. Setelah mereka lupa janji itu, anak bungsu mereka hilang, lalu berpesan agar keturunannya membawa sesaji pada malam ke-15 bulan Kasada. Nama Tengger dikatakan berasal dari nama kedua tokoh itu.',
   'Yadnya Kasada is the yearly ceremony of the Tengger people at Mount Bromo. It gives thanks to Sang Hyang Widhi and honours the ancestors. Farm produce, crops and livestock are carried from Poten to the crater in a procession (lelabuhan), chanted over with mantras and cast into the crater. The ceremony also includes prayers, a blessing of water and a village feast (slametan). Its origin is a legend of a childless couple who promised their last child to the crater. After they forgot the promise, the youngest child vanished and asked that offerings be brought each year. The name Tengger is said to come from the names of the couple.'),
  ('minahasa', 'mapalus', 'Mapalus', 'Mapalus',
   'Tradisi gotong royong orang Minahasa: kelompok kerja bergilir untuk berkebun, pesta, dan duka.',
   'The Minahasa tradition of mutual cooperation: work groups that take turns in farming, celebrations and funerals.',
   NULL, NULL,
   'Mapalus adalah gotong royong dalam kelompok yang diatur menurut kebutuhan dan kesepakatan anggotanya, dan masih dijalankan di kota maupun kabupaten di Sulawesi Utara. Tradisi ini berakar pada falsafah Sitou Timou Tumou Tou, yang berarti hidup dan bekerja bersama untuk saling menolong. Bentuknya mencakup pertanian (bentuk asalnya, karena sebagian besar orang Minahasa adalah petani), pesta pernikahan dan perayaan, serta upacara kematian yang diatur lewat perkumpulan desa atau keluarga. Aturannya saling menguntungkan: anggota yang diberi tugas harus hadir dan bekerja tepat waktu, dan anggota yang tidak hadir tanpa alasan dapat dikeluarkan dari kegiatan berikutnya. Anggota yang sakit membayar sejumlah uang yang disepakati atau mencari pengganti. Kelompok juga mengumpulkan peralatan bersama, seperti tenda dan perlengkapan memasak.',
   'Mapalus is mutual cooperation within groups that organise their work by need and by agreement. It is still practised across North Sulawesi and is highly valued by the Minahasa people. It is rooted in the philosophy Sitou Timou Tumou Tou, which Good News From Indonesia describes as living and working together to help one another. The groups cover farming (its original form), weddings and celebrations, and funerals arranged through village or family associations. Members who are given a task must attend and work on time, and members who miss without a reason can be excluded from later work. A sick member pays an agreed sum or finds a replacement. Groups also share equipment such as tents and cooking gear.'),
  ('papua', 'bakar-batu', 'Bakar Batu', 'Bakar Batu',
   'Pesta adat Papua: makanan dimasak di atas dan di dalam lubang berisi batu panas, sebagai wujud syukur, penyambutan tamu, dan perdamaian.',
   'A Papuan feast in which food is cooked on and in a pit of heated stones, as thanks, to welcome guests and to make peace.',
   NULL, NULL,
   'Bakar batu adalah tradisi masyarakat Papua untuk bersyukur kepada Tuhan dan mempererat kebersamaan. Ia digelar untuk menyambut kabar baik seperti kelahiran dan pernikahan adat, saat pengangkatan kepala suku, untuk menyambut tamu, menghormati leluhur, dan sebelum berperang. Tradisi ini juga dipakai untuk memulihkan perdamaian setelah konflik antarsuku. Batu dikumpulkan dari sungai atau gunung, lalu lelaki menggali lubang dan memanaskan batu dengan api dari kayu selama beberapa jam. Perempuan menyiapkan makanan seperti ubi, singkong, sayuran, dan daging yang dibungkus daun pisang atau pandan. Batu panas, daun, dan makanan disusun berlapis di dalam lubang, ditimbun tanah, dan dibiarkan hingga matang. Jenis dagingnya mengikuti adat setempat: kelompok pegunungan dahulu memanggang babi, dan kini banyak komunitas memakai kambing, sapi, atau ayam. Makanan dibagi rata tanpa membedakan status.',
   'Bakar batu is a Papuan tradition of thanks to God and of togetherness. It is held to celebrate good news such as births and traditional weddings, when a chief is installed, to welcome guests, to honour ancestors, and before going to war. It is also used to restore peace after conflict between groups. Men gather stones from rivers or mountains, dig a pit and heat the stones in a wood fire for several hours. Women prepare food such as sweet potato, cassava, vegetables and meat, wrapped in banana or pandan leaves. Hot stones, leaves and food are layered in the pit, which is covered with soil and left until cooked. The meat follows local custom: highland groups once roasted pork, and many communities now use goat, cattle or chicken out of respect for other beliefs. Everyone shares the food equally, regardless of status.'),
  ('toraja', 'manene', 'Ma''nene', 'Ma''nene',
   'Ritual masyarakat Toraja untuk menghormati leluhur: jenazah di makam dibersihkan dan diganti pakaiannya.',
   'The Toraja ritual honouring ancestors: the bodies in the family tomb are cleaned and dressed in new clothes.',
   'Setiap tiga tahun sekali, setelah panen, diputuskan melalui musyawarah adat. Dahulu dilakukan setiap tahun.',
   'Every three years, after the harvest, decided through customary deliberation. It used to be held every year.',
   'Ma''nene adalah ritual keluarga Toraja untuk menghormati leluhur. Keluarga membawa jenazah keluar dari makam, membersihkannya dengan sikat atau kain, lalu memakaikan pakaian baru. Jenazah dijemur tiga hingga tujuh hari, kemudian dikembalikan ke peti dan makam batu. Ritual diawali doa dalam bahasa Toraja kuno. Keluarga menyembelih babi dan kerbau, dan jumlah babi disesuaikan dengan jumlah jenazah di makam. Ritual ditutup dengan ma''sisemba, adu kaki. Ritual ini juga memperkenalkan anggota keluarga yang lebih muda kepada leluhurnya. Namanya dimaknai sebagai membungkus kembali. Menurut legenda, tradisi ini bermula dari seorang pemburu, Pong Rumase, yang jenazahnya ditemukan oleh seorang pemuda lalu dihormati. Biayanya besar dan banyak keluarga kini tinggal jauh dari Toraja, sehingga ritual ini digelar lebih jarang.',
   'Ma''nene is a Toraja family ritual to honour ancestors. The family brings the bodies out of the tomb, cleans them with brushes or cloth, and dresses them in new clothes. They are sunned for three to seven days, then returned to their coffins and the stone tomb. The ritual opens with a prayer in old Toraja, and families sacrifice pigs and buffalo; the number of pigs matches the bodies in the tomb. It ends with ma''sisemba, a leg-fighting contest. The ritual also introduces younger relatives to their ancestors. Kompas gives the name the meaning of wrapping again. A legend tells of a hunter, Pong Rumase, whose remains were found by a young man and then honoured. The ritual is costly, and many families now live outside Toraja, so it is held less often than it once was.')
) as x (region, slug, name_id, name_en, summary_id, summary_en, timing_id, timing_en, body_id, body_en)
join public.regions r on r.slug = x.region
on conflict (slug) do update set
  region_id = excluded.region_id, name_id = excluded.name_id, name_en = excluded.name_en,
  summary_id = excluded.summary_id, summary_en = excluded.summary_en,
  timing_id = excluded.timing_id, timing_en = excluded.timing_en,
  body_id = excluded.body_id, body_en = excluded.body_en
where t.review_status = 'draft';

-- 3. Sources ---------------------------------------------------------------------
-- Two different websites per ceremony (the AI Workflow checks this). The
-- credit is the author and date as the page gives them.
create temporary table batch_sources (slug text, title text, url text, credit text) on commit drop;
insert into batch_sources values
  ('pasola', 'Tradisi Pasola di Sumba Barat: Sejarah hingga Waktu Pelaksanaan', 'https://www.detik.com/bali/budaya/d-7332105/tradisi-pasola-di-sumba-barat-sejarah-hingga-waktu-pelaksanaan', 'Husna Putri Maharani, detikBali, 9 May 2024'),
  ('pasola', 'Tradisi Pasola di Balik Permainan dan Atraksi Masyarakat Sumba Barat', 'https://www.liputan6.com/regional/read/5093936/tradisi-pasola-di-balik-permainan-dan-atraksi-masyarakat-sumba-barat', 'Liputan6, 13 October 2022'),
  ('ngaben', 'Ngaben: Asal-usul, Tujuan, Prosesi, dan Macamnya', 'https://www.kompas.com/stori/read/2021/09/22/140000779/ngaben-asal-usul-tujuan-prosesi-dan-macamnya', 'Verelladevanka Adryamarthanino, Kompas.com, 22 September 2021'),
  ('ngaben', 'Upacara Ngaben: Proses Bakar Jenazah sebagai Jalan Menuju Nirwana', 'https://www.goodnewsfromindonesia.id/2021/06/20/upacara-ngaben-proses-bakar-jenazah-sebagai-jalan-menuju-nirwana', 'Iip M. Aditiya, Good News From Indonesia, 20 June 2021'),
  ('tiwah', 'Mengenal Ritual Tiwah, Upacara Kematian Adat Dayak Ngaju', 'https://www.detik.com/kalimantan/budaya/d-8121888/mengenal-ritual-tiwah-upacara-kematian-adat-dayak-ngaju', 'Bayu Ardi Isnanto, detikKalimantan, 20 September 2025'),
  ('tiwah', 'Ritual Tiwah Dayak Ngaju: Asal Daerah, Pengertian, Makna, Tahapan, dan Biaya', 'https://regional.kompas.com/read/2022/03/01/140906178/ritual-tiwah-dayak-ngaju-asal-daerah-pengertian-makna-tahapan-dan-biaya?page=all', 'Kompas.com, 1 March 2022'),
  ('sekaten', 'Apa Itu Tradisi Sekaten: Ini Sejarah, Tujuan, hingga Prosesinya', 'https://www.detik.com/jogja/budaya/d-6945024/apa-itu-tradisi-sekaten-ini-sejarah-tujuan-hingga-prosesinya', 'Galardialga Kustanto, detikJogja, 22 September 2023'),
  ('sekaten', 'Mengenal Sejarah dan Proses Upacara Sekaten', 'https://www.kompas.com/skola/read/2023/02/07/200000169/mengenal-sejarah-dan-proses-upacara-sekaten', 'Ani Rachman, Kompas.com (Skola), 7 February 2023'),
  ('seren-taun', 'Seren Taun: Sejarah, Makna, dan Unsur Upacara Panen Masyarakat Sunda', 'https://www.goodnewsfromindonesia.id/2023/11/04/seren-taun-sejarah-makna-dan-unsur-upacara-panen-masyarakat-sunda', 'Siti Padilah, Good News From Indonesia, 4 November 2023'),
  ('seren-taun', 'Mengenal Lebih Dekat Tradisi Seren Taun di Tanah Pasundan', 'https://www.detik.com/jabar/budaya/d-7912542/mengenal-lebih-dekat-tradisi-seren-taun-di-tanah-pasundan', 'Dian Nugraha Ramdani, detikJabar, 14 May 2025'),
  ('yadnya-kasada', 'Upacara Yadnya Kasada 2026 di Bromo: Sejarah dan Makna Tradisi Suci Suku Tengger', 'https://travel.kompas.com/read/2026/06/03/180000127/upacara-yadnya-kasada-2026-di-bromo-ini-sejarah-dan-makna-tradisi-suci-suku', 'Ella Triana, Kompas.com, 3 June 2026'),
  ('yadnya-kasada', 'Sejarah Yadnya Kasada Suku Tengger, Apa Saja Kegiatannya', 'https://www.detik.com/jatim/budaya/d-7397348/sejarah-yadnya-kasada-suku-tengger-apa-saja-kegiatannya', 'Ardian Dwi Kurnia, detikJatim, 19 June 2024'),
  ('mapalus', 'Mengenal Mapalus, Budaya Gotong Royong di Minahasa', 'https://regional.kompas.com/read/2022/11/17/142537278/mengenal-mapalus-budaya-gotong-royong-di-minahasa?page=all', 'Dini Daniswari, Kompas.com, 17 November 2022'),
  ('mapalus', 'Budaya Mapalus, Bukti Solidaritas Orang Minahasa', 'https://www.goodnewsfromindonesia.id/2022/12/29/budaya-mapalus-bukti-solidaritas-orang-minahasa', 'Afdal Hasan, Good News From Indonesia, 29 December 2022'),
  ('bakar-batu', '5 Upacara Adat Papua, Ada Bakar Batu', 'https://regional.kompas.com/read/2023/08/04/164317978/5-upacara-adat-papua-ada-bakar-batu?page=all', 'Kompas.com, 4 August 2023'),
  ('bakar-batu', 'Bakar Batu: Upacara Adat Papua yang Sarat Makna Budaya', 'https://www.liputan6.com/regional/read/5962863/bakar-batu-upacara-adat-papua-sarat-makna-budaya', 'Panji Prayitno, Liputan6, 21 March 2025'),
  ('manene', 'Tradisi Ma''nene: Ritual Unik Toraja yang Mengganti Pakaian Jenazah', 'https://www.kompas.com/skola/read/2025/08/27/133000469/tradisi-ma-nene-ritual-unik-toraja-yang-mengganti-pakaian-jenazah', 'Silmi Nurul Utami, Kompas.com, 27 August 2025'),
  ('manene', 'Mengenal Ritual Ma''nene Suku Toraja, Tradisi Membersihkan Mumi Leluhur', 'https://www.detik.com/sulsel/budaya/d-6271010/mengenal-ritual-manene-suku-toraja-tradisi-membersihkan-mumi-leluhur', 'Rachmat Ariadi, detikSulsel, 3 September 2022');

insert into public.sources (title, url, credit)
select distinct b.title, b.url, b.credit from batch_sources b
where not exists (select 1 from public.sources s where s.url = b.url);

insert into public.content_sources (content_type, content_id, source_id)
select 'ceremony', c.id, s.id
from batch_sources b
join public.sources s on s.url = b.url
join public.ceremonies c on c.slug = b.slug
where c.review_status = 'draft'
on conflict (content_type, content_id, source_id) do nothing;
