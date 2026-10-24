# Candidate sources for the seed content

Oct 23, 2026 · Phase 2, M2

These are **suggestions, not citations**. Each page below was opened on 2026-10-23 and its title and publisher were confirmed, but nobody has checked the draft against it yet. A reviewer opens the page, decides whether it supports the draft, and only then clicks "Pakai sebagai sumber / Use as a source" in the review queue (`src/lib/candidate-sources.ts` feeds that list).

None of these is a cookbook or a museum catalogue. The content seed asks for a cookbook or family source for recipe amounts, and a museum or regional reference for costumes; these pages are a starting point only.

## Where a page disagrees with the draft

Fix the draft or choose another source before approving.

| Item | What differs |
| --- | --- |
| Timun Mas | detik's version: born from a golden cucumber, a hermit gives the items, and the fourth item is shrimp paste that becomes a sea of mud. Our draft: the mother gives the items, and chili becomes fire. |
| Gudeg | Egg and chicken are side dishes served with gudeg, not cooked in the pot. |
| Soto ayam | The Soto Lamongan page lists rice vermicelli (bihun), not glass noodles (soun). |
| Dendeng balado | RRI boils the beef, then fries it briefly; it uses lime leaves, not lime juice. |
| Sate Padang | The page does not mention rice flour or peanuts in the sauce. |
| Coto Makassar | CNN's recipe uses offal as well as beef. |
| Konro bakar | RRI names kluwek as a defining ingredient (missing from the draft) and a peanut sauce; it does not mention sweet soy sauce. |
| Barongko | Kompas TV says milk (susu), not coconut milk, and does not describe the steaming. |
| Bundo Kanduang | The journal abstract lists tangkuluak, baju kurung, kodek and sandang; it does not mention songket or the suntiang. |
| Pengantin Jawa | The GNFI page covers the groom's beskap only, not the bride's kebaya. |

## The list

| Item | Page | Publisher |
| --- | --- | --- |
| Timun Mas | [Kisah Timun Mas, Cerita Rakyat dari Jawa Tengah](https://www.detik.com/jateng/budaya/d-6264915/kisah-timun-mas-cerita-rakyat-dari-jawa-tengah) | detikJateng, 2022 |
| Malin Kundang | [Kisah Legenda Malin Kundang dari Sumatera Barat](https://www.detik.com/sumut/budaya/d-6958903/kisah-legenda-malin-kundang-dari-sumatera-barat-beserta-pesan-moralnya) | detikSumut, 2023 |
| Gudeg | [Gudeg Yogyakarta](https://www.indonesia.travel/id/id/destination/java/yogyakarta/gudeg/) | Kementerian Pariwisata |
| Gudeg | [Asal usul sejarah gudeg](https://www.antaranews.com/berita/4742285/asal-usul-sejarah-gudeg-kuliner-legendaris-dari-yogyakarta) | ANTARA, 2025 |
| Rawon | [Rawon: Sejarah, Bahan, dan Ciri Khasnya](https://www.indonesia.travel/id-id/destination/java/east-java/rawon/) | Kementerian Pariwisata |
| Soto ayam | [Soto Lamongan](https://www.indonesia.travel/id-id/destination/java/east-java/soto-lamongan/) | Kementerian Pariwisata |
| Pecel | [Asal usul nasi pecel](https://www.antaranews.com/berita/4742269/asal-usul-nasi-pecel-kuliner-tradisional-yang-jadi-ikon-nusantara) | ANTARA, 2025 |
| Rendang | [Mengenal Rendang dan Tempat Untuk Menikmatinya](https://www.indonesia.travel/id/id/travel-ideas/gastronomy/rendang-the-legendary-dish-from-west-sumatra/) | Kementerian Pariwisata |
| Dendeng balado | [Minangkabau's Dendeng Balado](https://rri.co.id/en/culinary/1379284/minangkabau-s-dendeng-balado-for-iftar-and-sahoor-menu) | RRI, 2025 |
| Sate Padang | [Sate Padang: History, Types](https://www.indonesia.travel/uae-ar/travel-ideas/gastronomy/fakta-menarik-di-balik-nikmatnya-sate-padang) | Kementerian Pariwisata |
| Coto Makassar | [Resep Coto Makassar Asli](https://www.cnnindonesia.com/gaya-hidup/20240212132201-267-1061455/resep-coto-makassar-asli-hidangan-kaya-rempah-yang-nikmat) | CNN Indonesia, 2024 |
| Konro bakar | [Sop Konro: Makassar's Legendary Beef Rib Soup](https://rri.co.id/voice-of-indonesia/culinary/2737271/sop-konro-makassars-legendary-beef-rib-soup) | RRI, 2026 |
| Barongko | [Berburu Takjil Barongko](https://www.kompas.tv/article/171901/berburu-takjil-barongko-kue-khas-makassar) | Kompas TV, 2021 |
| Baju Bodo | [Baju Bodo: Sejarah, Makna Warna, Bentuk](https://www.indonesia.travel/id/id/travel-ideas/culture/baju-bodo/) | Kementerian Pariwisata |
| Bundo Kanduang | [Tinjauan Pakaian Adat Bundo Kanduang di Koto Tinggi](https://ejournal.unp.ac.id/index.php/serupa/article/view/3218) | Serupa (UNP), 2014 |
| Pengantin Jawa | [Mengenal Beskap dan Asal-usulnya](https://www.goodnewsfromindonesia.id/infographic/mengenal-beskap-dan-asal-usulnya) | GNFI, 2025 |

Not reachable from here: the Kemendikbud intangible-heritage register (`warisanbudaya.kemdikbud.go.id`, DNS failure) and the Museum Adityawarman catalogue (blocked). Both are better sources for heritage status and costumes; check them from a browser.

## Batch 2 (Phase 2c, 2026-10-23)

One new region per island, loaded as drafts by `supabase/content/2026-10-24-batch-2.sql`. Each item follows the page below. Notes for the reviewer:

| Item | Note |
| --- | --- |
| Asal Usul Danau Toba | Follows version 1 on the detik page. The page says there are other versions. |
| Sangkuriang | The detik page is the source; the old woman in the forest is his grandmother in that version, which the draft leaves unnamed. |
| Manik Angkeran | GNFI cites *108 Cerita Rakyat Terbaik Asli Nusantara* (Visimedia, 2010). Sidi Mantra uses a staff, not a bell. |
| Putri Junjung Buih | detik cites *Cerita Rakyat Asli Indonesia: Chapter 3* (Monika Cri Maharani). Other versions set it in Amuntai. |
| Batu Berdaun | GNFI cites *Rangkuman 100 Cerita Rakyat Indonesia* (Irwan Rouf, Shenia Ananda). The page does not name the island. |
| Kasuari dan Dara Makota | A short fable in a detik list of 34 tales. |
| Arsik ikan mas | Fimela lists long beans but its steps do not say when to add them; the draft lists them only as an ingredient. |
| Nasi timbel | Liputan6 gives no servings or time, so the recipe page shows amounts without the servings stepper. |
| Ayam betutu | Orami's home version (steam, then bake). The draft leaves out instant stock powder. indonesia.travel covers the traditional styles. |
| Soto Banjar | Orami's recipe; the draft leaves out bouillon powder. "Pekak" is translated as star anise: please check. |
| Ikan kuah kuning | Kompas TV gives no servings, time or sago amounts. |
| Papeda | Merah Putih gives no servings. |
| Payas agung | The GNFI page is short: gold colour, tall crown, make-up, weddings and religious rites. It does not describe the groom. |
| Bagajah Gamuling Baular Lulut | The detik page covers the bride only (udat, karang jagung). The UNESA journal study (Zada and Maspiyah, 2020) is a better source if someone can open the PDF. |
| Baju cele, Rok rumbai, Ulos, Kebaya Sunda | Each follows one page; all four have no image yet. |

| Item | Page | Publisher |
| --- | --- | --- |
| Asal Usul Danau Toba | [2 Versi Cerita Asal Usul Danau Toba](https://www.detik.com/sumut/wisata/d-6761917/2-versi-cerita-asal-usul-danau-toba) | detikSumut, 2023 |
| Sangkuriang | [Legenda Sangkuriang, Cara Leluhur Rekam Letusan Gunung Sunda](https://www.detik.com/jabar/budaya/d-7347460/legenda-sangkuriang-cara-leluhur-rekam-letusan-gunung-sunda) | detikJabar, 2024 |
| Manik Angkeran | [Legenda Manik Angkeran](https://www.goodnewsfromindonesia.id/indonesiana/legenda/legenda-manik-angkeran-kisah-yang-dipercaya-menjadi-asal-usul-selat-bali) | GNFI, 2024 |
| Putri Junjung Buih | [Cerita Rakyat Putri Junjung Buih](https://www.detik.com/kalimantan/budaya/d-7974187/cerita-rakyat-putri-junjung-buih-dari-kalimantan-selatan) | detikKalimantan, 2025 |
| Batu Berdaun | [Legenda Batu Berdaun dari Maluku](https://www.goodnewsfromindonesia.id/2025/05/01/legenda-batu-berdaun-dari-maluku-kisah-seorang-nenek-yang-kecewa-dengan-cucunya) | GNFI, 2025 |
| Kasuari dan Dara Makota | [34 Cerita Rakyat Pendek](https://www.detik.com/jogja/budaya/d-7810100/34-cerita-rakyat-pendek-lengkap-dari-seluruh-daerah-indonesia) | detikJogja, 2025 |
| Arsik ikan mas | [Resep Arsik Ikan Mas khas Sumatra Utara](https://www.fimela.com/lifestyle/read/4345129/resep-arsik-ikan-mas-khas-sumatra-utara) | Fimela, 2022 |
| Nasi timbel | [4 Resep Nasi Timbel](https://www.liputan6.com/hot/read/5711835/4-resep-nasi-timbel-yang-enak-dan-gurih-kuliner-jadul-khas-sunda) | Liputan6, 2024 |
| Ayam betutu | [10 Resep Ayam Betutu Khas Bali](https://www.orami.co.id/magazine/resep-ayam-betutu) | Orami, 2024 |
| Ayam betutu | [Ayam Betutu: Kuliner Wajib di Bali](https://www.indonesia.travel/id-id/travel-ideas/gastronomy/ayam-betutuu/) | Kementerian Pariwisata |
| Soto Banjar | [6 Resep Soto Banjar](https://www.orami.co.id/magazine/resep-soto-banjar) | Orami, 2023 |
| Ikan kuah kuning | [Resep Papeda, Menu Legendaris dari Maluku](https://www.kompas.tv/entertainment/76860/resep-papeda-menu-legendaris-dari-maluku-tempat-glenn-fredly-berasal) | Kompas TV, 2020 |
| Papeda | [Papeda dan Kuah Kuning](https://merahputih.com/post/read/papeda-dan-kuah-kuning-menu-legendaris-masyarakat-papua) | Merah Putih, 2018 |
| Ulos | [Kain Ulos: Makna, Asal Usul, dan Ragam](https://www.indonesia.travel/id/id/travel-ideas/culture/kain-tenun-ulos-khas-batak) | Kementerian Pariwisata |
| Kebaya Sunda | [7 Baju Adat Sunda](https://www.detik.com/jabar/budaya/d-6889232/7-baju-adat-sunda-mulai-dari-kebaya-hingga-menak) | detikJabar, 2023 |
| Payas agung | [Mengenal Baju Adat Bali](https://www.goodnewsfromindonesia.id/2024/10/03/mengenal-baju-adat-bali-cerminan-budaya-yang-tak-lekang-oleh-waktu) | GNFI, 2024 |
| Bagajah Gamuling Baular Lulut | [4 Baju Adat Kalimantan Selatan](https://www.detik.com/kalimantan/budaya/d-8172884/4-baju-adat-kalimantan-selatan-warisan-budaya-banjar-yang-tetap-lestari) | detikKalimantan, 2025 |
| Baju cele | [Ragam rupa pakaian adat Maluku](https://www.antaranews.com/berita/4292483/ragam-rupa-pakaian-adat-maluku) | ANTARA, 2024 |
| Rok rumbai | [Mengenal Baju Adat Papua](https://www.goodnewsfromindonesia.id/2024/11/12/mengenal-baju-adat-papua-simbol-keindahan-dan-kearifan-lokal) | GNFI, 2024 |

## Batch 4 (2026-10-24)

Loaded and published by `supabase/content/2026-10-24-batch-4.sql` and `2026-10-24-publish-2.sql`. Every item cites two different websites.

| Item | Sources | Notes |
| --- | --- | --- |
| Region: Sasak (Lombok, NTB) | its three items below | New region on the Bali & Nusa Tenggara island page. |
| Putri Mandalika | [GNFI, 2026](https://www.goodnewsfromindonesia.id/indonesiana/legenda/cerita-rakyat-putri-mandalika-legenda-di-balik-tradisi-bau-nyale-dan-kemegahan-sirkuit-lombok); [Mongabay, 2017](https://mongabay.co.id/2017/02/22/liputan-bau-nyale-puluhan-ribu-warga-ke-laut-mencari-cacing-laut-jelmaan-putri/) | Names of the king and queen follow GNFI; other versions differ. |
| Putri Tandampalik | [detikSulsel, 2022](https://www.detik.com/sulsel/budaya/d-6036473/8-cerita-rakyat-sulawesi-selatan-beserta-pesan-moralnya); [Gramedia](https://www.gramedia.com/literasi/menyelami-7-cerita-rakyat-sulawesi-selatan-yang-sarat-falsafah-hidup/) | The white buffalo and Wajo come from detik; Gramedia confirms the exile, healing and marriage. One GNFI page places the tale in Central Sulawesi; most sources say Luwu, South Sulawesi. |
| Batu Berdaun (second source) | [REINHA, 2018](https://www.reinha.com/2018/10/29/cerita-rakyat-maluku-kisah-batu-berdaun/) | Matches the GNFI version; adds that a neighbour takes the children in. |
| Kasuari dan Dara Makota (second source) | [Analisadaily, 2014](https://analisadaily.com/berita/arsip/2014/9/14/63761/kasuari-dan-dara-mahkota/) | In this version the birds break each other's wings before the race; the draft follows detik (the cassowary crashes into a tree). |
| Ayam taliwang | [Liputan6, 2026](https://www.liputan6.com/lifestyle/read/8307016/resep-ayam-taliwang); [detikBali, 2024](https://www.detik.com/bali/kuliner/d-7221636/asal-usul-dan-resep-ayam-taliwang-kuliner-pedas-gurih-khas-lombok) | Amounts, 4 servings and about 95 minutes follow Liputan6. |
| Baju lambung | [Orami, 2024](https://www.orami.co.id/magazine/pakaian-adat-suku-sasak); [detikTravel, 2021](https://travel.detik.com/domestic-destination/d-5870658/baju-lambung-crop-top-adat-perempuan-khas-suku-sasak); [indonesia.travel](https://www.indonesia.travel/us/en/travel-ideas/culture/pakaian-lambung/) | Sources differ on who wears it (girls or mothers); the draft leaves that out. Placeholder drawing only. |

Still drafts: nasi timbel, ikan kuah kuning and papeda. The pages that give servings and time describe different recipes from the ones drafted.
