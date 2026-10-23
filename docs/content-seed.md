# Content Seed: Stories, Recipes, Costumes

Oct 22, 2026 · @Azwir

This is the MVP content: two stories, ten recipes, and three costume cards. Everything is draft until a reviewer checks it against a source.

## Sources to verify

I have not checked these against outside sources. The reviewer must do this before anything is published.

| Item | What to check | Where to check |
| --- | --- | --- |
| Timun Mas | Plot and ending match the version you choose | A published Javanese folk tale collection |
| Malin Kundang | Plot and ending match the version you choose | A West Sumatran legend collection |
| Recipes (10) | Ingredients, amounts, and steps | A cookbook or family source, credited in the sources table |
| Costume cards (3) | Names, parts, and meanings | A museum or regional reference, with a reference image |
| Halal status | Set only with a source | A certifying body or the source recipe |

## Story 1: Timun Mas (Jawa)

Region: Jawa. Category: Curated. Summary (EN): A widow receives cucumber seeds from a giant, and her daughter, Timun Mas, escapes him with four magic bundles from a hermit.

Updated 2026-10-23 (Phase 2b) to follow the cited source, [detikJateng, "Kisah Timun Mas, Cerita Rakyat dari Jawa Tengah"](https://www.detik.com/jateng/budaya/d-6264915/kisah-timun-mas-cerita-rakyat-dari-jawa-tengah) (2022), retold in our own words. The audio descriptions and alt text are in `supabase/content/2026-10-23-batch-1.sql`. The first draft (the mother gives the items, chili becomes fire) is replaced.

### Chapter 1

**ID:** Di sebuah desa hiduplah Mbok Randa, seorang janda yang sangat ingin memiliki anak. Suatu hari raksasa bernama Buto Ijo memberinya biji timun, dengan satu syarat: anak itu harus diserahkan kepadanya ketika berusia enam tahun.

**EN:** In a village lived Mbok Randa, a widow who longed for a child. One day a giant named Buto Ijo gave her cucumber seeds on one condition: the child must be handed over to him at the age of six.

### Chapter 2

**ID:** Mbok Randa menanam biji itu. Tumbuhlah sebuah timun besar berwarna keemasan, dan di dalamnya ada seorang bayi perempuan. Ia memberinya nama Timun Mas dan merawatnya dengan penuh kasih.

**EN:** Mbok Randa planted the seeds. A large golden cucumber grew, and inside it was a baby girl. She named her Timun Mas and raised her with great love.

### Chapter 3

**ID:** Ketika Timun Mas berusia enam tahun, Buto Ijo datang menagih janji. Mbok Randa meminta waktu, lalu pergi kepada seorang pertapa. Pertapa itu memberinya empat bungkusan kecil: biji timun, jarum, garam, dan terasi. Saat raksasa kembali, Timun Mas berlari membawa bungkusan itu.

**EN:** When Timun Mas turned six, Buto Ijo came to claim his promise. Mbok Randa asked for time and went to a hermit, who gave her four small bundles: cucumber seeds, needles, salt and shrimp paste. When the giant returned, Timun Mas ran off with the bundles.

### Chapter 4

**ID:** Timun Mas menebar biji timun, dan tumbuhlah ladang timun yang menjerat raksasa. Lalu ia melempar jarum, yang menjadi rumpun bambu yang tajam. Kemudian ia menabur garam, yang menjadi lautan luas, tetapi raksasa itu masih bisa berenang menyeberanginya.

**EN:** Timun Mas scattered the cucumber seeds, and a cucumber field sprang up and tangled the giant. Then she threw the needles, which became sharp bamboo thickets. Next she scattered the salt, which became a wide sea, but the giant still swam across.

### Chapter 5

**ID:** Terakhir, Timun Mas melempar terasi. Terasi itu berubah menjadi lautan lumpur, dan Buto Ijo tenggelam di dalamnya. Timun Mas pulang kepada ibunya, dan mereka hidup bahagia. Cerita ini mengajarkan bahwa kecerdikan dan keberanian dapat mengalahkan kekuatan yang besar.

**EN:** Last, Timun Mas threw the shrimp paste. It became a sea of mud, and Buto Ijo sank into it. Timun Mas went home to her mother, and they lived happily. The story teaches that cleverness and courage can overcome great strength.

## Story 2: Malin Kundang (Minangkabau)

Region: Minangkabau. Category: Curated. Text only, no audio in the MVP. Summary (EN): A young man leaves his poor mother, becomes rich at sea, and is cursed when he refuses to acknowledge her.

**ID:** Malin Kundang adalah anak seorang janda miskin di pesisir Sumatera Barat. Ia pergi merantau dan kembali sebagai saudagar kaya bersama istrinya. Ketika ibunya datang menyambut, Malin menyangkal dan mengusirnya. Sang ibu mengutuknya, dan Malin pun berubah menjadi batu.

**EN:** Malin Kundang was the son of a poor widow on the West Sumatran coast. He left to seek his fortune and came back as a wealthy merchant with his wife. When his mother came to greet him, Malin denied her and sent her away. The mother cursed him, and Malin turned to stone.

The story teaches respect for parents. Check the version and the ending against the chosen source before publishing.

## Recipes

All ten have 4 servings. Amounts are starting points and need checking against the source. Halal status is unknown for all ten until a source confirms it. Steps are in English, and the Indonesian step text can follow in the translation pass.

### Jawa

**1. Gudeg Yogyakarta** (vegetarian option available). Time: 240 min. Tags: contains egg.

- Nangka muda (young jackfruit), 1 kg
- Santan (coconut milk), 500 ml
- Gula merah (palm sugar), 100 g
- Bawang merah (shallot), 6; bawang putih (garlic), 4
- Daun salam (bay leaf), 3; lengkuas (galangal), 2 cm
- Ayam (chicken), 4 pieces; telur (egg), 4

1. Simmer the jackfruit with coconut milk, palm sugar, and spices.
2. Cook slowly for about 3 to 4 hours, stirring from time to time.
3. Add the chicken and eggs and cook until tender.
4. Serve with rice.

**2. Rawon** (East Java). Time: 90 min. Tags: contains beef.

- Daging sapi (beef), 500 g
- Kluwek (black nut), 3, mashed
- Bawang merah 6, bawang putih 4, kemiri (candlenut) 3, kunyit (turmeric) 1 cm, lengkuas 2 cm
- Serai (lemongrass), 1 stalk; daun jeruk (lime leaf), 4
- Tauge (bean sprouts) and sambal to serve

1. Boil the beef until tender.
2. Blend the spices and kluwek, then fry until fragrant.
3. Add the spice paste to the broth and simmer 20 minutes.
4. Serve with bean sprouts and sambal.

**3. Soto Ayam** (chicken soup). Time: 75 min. Tags: contains egg.

- Ayam (chicken), 1 whole
- Bawang putih 4, bawang merah 6, jahe (ginger) 2 cm, kunyit 1 cm
- Serai 1 stalk, daun salam 2
- Soun (glass noodles), telur rebus (boiled egg), kecap manis (sweet soy sauce)

1. Boil the chicken with spices and daun salam.
2. Fry the blended spices, then add them to the broth.
3. Shred the chicken and prepare the noodles and eggs.
4. Serve hot with the toppings and soy sauce.

**4. Pecel** (vegetarian). Time: 40 min. Tags: vegetarian, contains peanut.

- Kangkung, tauge, kacang panjang (long beans), blanched
- Kacang tanah (peanut), 150 g, fried and ground
- Cabai (chili), 5; gula merah 50 g; asam jawa (tamarind) 1 tsp; bawang putih 2

1. Blanch the vegetables briefly.
2. Grind the peanuts with chili, garlic, palm sugar, and tamarind.
3. Mix the sauce with a little warm water until smooth.
4. Toss the vegetables with the sauce.

### Minangkabau

**5. Rendang Daging** (beef rendang). Time: 240 min. Tags: contains beef.

- Daging sapi (beef), 1 kg
- Santan (coconut milk), 1 L
- Cabai merah (red chili), 15; bawang merah 10; bawang putih 6; jahe 3 cm; lengkuas 3 cm; kunyit 2 cm
- Serai 2 stalks, daun kunyit, daun jeruk, daun salam

1. Blend the chili, shallot, garlic, ginger, galangal, and turmeric.
2. Simmer the beef in coconut milk with the paste and leaves.
3. Cook on low heat for 3 to 4 hours, stirring, until the liquid is nearly dry.
4. Continue until the beef is dark and coated.

**6. Dendeng Balado** (sliced beef with chili). Time: 45 min. Tags: contains beef.

- Dendeng sapi (thin dried beef), 300 g
- Cabai merah 10, bawang merah 6, tomat (tomato) 1
- Jeruk nipis (lime), 1; garam (salt) and gula (sugar) to taste

1. Fry the dendeng until crisp, then drain.
2. Blend the chili, shallot, and tomato.
3. Stir-fry the paste until fragrant, then add the dendeng.
4. Finish with lime juice.

**7. Sate Padang** (beef satay in thick sauce). Time: 90 min. Tags: contains beef, contains peanut.

- Daging sapi, 500 g, cut into cubes
- Kacang tanah (peanut), 50 g
- Kunyit 1 cm, ketumbar (coriander) 1 tsp, jintan (cumin) 1 tsp
- Tepung beras (rice flour), 2 tbsp; bawang goreng (fried shallot) to serve

1. Marinate and skewer the beef.
2. Grill the skewers over charcoal.
3. Make the sauce from ground peanut, spices, and rice flour.
4. Serve the skewers in the warm sauce.

### Bugis-Makassar (Sulawesi Selatan)

**8. Coto Makassar** (beef soup). Time: 180 min. Tags: contains beef, contains peanut.

- Daging sapi with tendon, 500 g
- Kacang tanah (peanut), 100 g, toasted and ground
- Serai 2 stalks, lengkuas 3 cm, jahe 2 cm, kemiri 3
- Daun jeruk, bawang goreng, ketupat (rice cake) to serve

1. Boil the beef until very tender, then skim the broth.
2. Blend the spices and fry until fragrant, then add to the broth.
3. Stir in the ground peanuts to thicken.
4. Serve with ketupat and fried shallot.

**9. Konro Bakar** (grilled beef ribs). Time: 180 min. Tags: contains beef.

- Iga sapi (beef ribs), 1 kg
- Kemiri 5, ketumbar 1 tsp, lengkuas 2 cm
- Asam jawa (tamarind) 1 tsp, gula merah 1 tbsp, kecap manis 2 tbsp

1. Simmer the ribs with spices until tender.
2. Marinate the ribs in tamarind, palm sugar, and sweet soy sauce.
3. Grill until charred and glossy.
4. Serve hot.

**10. Barongko** (steamed banana dessert). Time: 40 min. Tags: contains egg, contains coconut.

- Pisang (banana), 6, mashed
- Telur (egg), 2; santan (coconut milk), 200 ml; gula (sugar), 100 g; garam, a pinch

1. Mix the banana, egg, sugar, coconut milk, and salt.
2. Spoon into banana leaf parcels.
3. Steam for 20 to 30 minutes.
4. Serve cooled.

## Costume info cards

Each card needs a reference image and a check against a museum or regional source before it goes live.

| Costume | Region | Parts (EN) | Info card (EN) |
| --- | --- | --- | --- |
| Pengantin Jawa | Jawa | Bride: kebaya and batik kain. Groom: beskap and blangkon. | Worn at Javanese weddings. Each region has its own style. |
| Baju Bundo Kanduang | Minangkabau | Women's dress with songket cloth and a suntiang headdress for brides. | A traditional dress from West Sumatra, worn at ceremonies. |
| Baju Bodo | Bugis (Sulawesi Selatan) | Square-cut blouse worn with a silk sarong (lipa sabbe). | A traditional dress from South Sulawesi, known for its simple shape. |

## Batch 2: one region per island (Phase 2c)

Drafted by Claude from checked sources on 2026-10-23 and loaded as drafts by `supabase/content/2026-10-24-batch-2.sql`. The full text (both languages, audio descriptions and alt text) lives in that file; sources and reviewer notes are in docs/candidate-sources.md.

| Island | Region | Story (4 chapters) | Recipe | Dress |
| --- | --- | --- | --- | --- |
| Sumatera | Batak (Sumatera Utara) | Asal Usul Danau Toba | Arsik ikan mas | Ulos |
| Jawa | Sunda (Jawa Barat) | Sangkuriang | Nasi timbel isi ayam | Kebaya Sunda |
| Bali & Nusa Tenggara | Bali | Manik Angkeran dan Selat Bali | Ayam betutu | Payas agung |
| Kalimantan | Banjar (Kalimantan Selatan) | Putri Junjung Buih | Soto Banjar | Bagajah Gamuling Baular Lulut |
| Maluku | Maluku | Batu Berdaun | Ikan kakap kuah kuning | Baju cele |
| Papua | Papua | Kasuari dan Dara Makota | Papeda | Rok rumbai |

Sulawesi already has Bugis-Makassar. No recipe is marked halal, and the dress items have no image yet.

## Audio and visuals

This doc gives you the text, audio descriptions, alt text, and image prompts. It does not contain audio files or final illustrations. Generating those needs an image tool and a voice service, and it is best done after the text is approved.

**Audio (Timun Mas, five chapters):** Generate each chapter from its Indonesian text with the app's TTS. Cache each file by hash, so each chapter is generated once. Use Web Speech as the fallback. Story 2 has no audio in the MVP.

**Image prompts (Timun Mas):**

| Chapter | Image prompt |
| --- | --- |
| 1 | Warm village house at dusk, an old widow at the door, a tall green giant bending down. Hand-drawn ink sketch with soft wash. |
| 2 | A young girl with a golden glow beside her mother, the giant at the edge of the frame. Ink sketch with soft wash. |
| 3 | An old hermit hands four small bundles to a widow; a girl runs along a dirt path, the giant chasing behind. Ink sketch. |
| 4 | Three panels in one picture: tangling cucumber vines, a sharp bamboo thicket, and a wide sea the giant swims across. Ink sketch. |
| 5 | The giant sinking into a sea of mud; a mother and daughter outside their house in morning light. Ink sketch with soft wash. |

Use one style for all five chapters. Check each picture for accuracy, then approve it in the review queue.
