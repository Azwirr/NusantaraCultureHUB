-- Local and staging seed (build plan foundation prompt, SEED DATA).
--
-- Source: docs/content-seed.md. Everything is a DRAFT (CLAUDE.md: content
-- stays draft until a reviewer approves it). Nothing here is verified yet:
-- the reviewer checks each item against a source before approving it.
--
-- Translation gaps are left NULL on purpose (for example Indonesian alt text,
-- audio descriptions and recipe steps). guard_approval refuses approval until
-- both languages are filled in, so the gaps cannot reach the public site.
--
-- The three regions are PLACEHOLDERS pending the team's decision (build plan,
-- "Three regions, three costumes, two legends").

-- Regions -------------------------------------------------------------------
insert into public.regions (slug, name_id, name_en, sort_order) values
  ('jawa', 'Jawa', 'Java', 1),
  ('minangkabau', 'Minangkabau', 'Minangkabau', 2),
  ('bugis', 'Bugis-Makassar (Sulawesi Selatan)', 'Bugis-Makassar (South Sulawesi)', 3);

-- Story 1: Timun Mas (five chapters, text only) -------------------------------
insert into public.stories (region_id, slug, title_id, title_en, summary_id, summary_en)
select id, 'timun-mas', 'Timun Mas', 'Timun Mas', null,
  'A poor widow makes a bargain with a giant, and her daughter outwits him with four magical seeds and objects.'
from public.regions where slug = 'jawa';

insert into public.story_chapters (story_id, chapter_no, text_id, text_en, audio_description_en, image_alt_en)
select s.id, c.chapter_no, c.text_id, c.text_en, c.audio_description_en, c.image_alt_en
from public.stories s
cross join (values
  (1,
   'Mbok Sirni adalah janda miskin yang tinggal di sebuah desa. Suatu hari ia bertemu Buto Ijo, raksasa yang menawarkan harta dengan satu syarat: anak yang kelak lahir harus diserahkan kepada sang raksasa.',
   'Mbok Sirni was a poor widow in a village. One day she met Buto Ijo, a giant who offered her wealth on one condition: the child she would one day have must be given to him.',
   'A small wooden house at dusk. An old woman stands at the door while a huge green figure stoops over the path.',
   'Mbok Sirni, a thin older woman, stands at her doorway as a tall green giant bends toward her in the evening light.'),
  (2,
   'Bertahun-tahun kemudian, Buto Ijo datang menagih janjinya. Mbok Sirni memohon, dan raksasa itu memberi waktu. Anak mereka, yang bersinar seperti emas, diberi nama Timun Mas.',
   'Years later, Buto Ijo came to claim his promise. Mbok Sirni pleaded, and the giant gave her time. Their daughter, who shone like gold, was named Timun Mas.',
   'A girl with a golden glow grows up in a small house while the giant waits outside.',
   'A young girl with golden skin glowing beside her mother, while a green giant looms at the edge of the frame.'),
  (3,
   'Ketika Timun Mas beranjak dewasa, Buto Ijo kembali. Sang ibu memberinya empat benda ajaib: biji timun, jarum, garam, dan cabai. Timun Mas pun berlari keluar dari rumah.',
   'When Timun Mas was grown, the giant returned. Her mother gave her four magic items: cucumber seeds, a needle, salt, and chili. Timun Mas ran from the house.',
   'A girl runs down a dirt path holding four small objects in her hands, while the giant chases her.',
   'A young girl runs along a path holding a small bag, with a giant striding after her.'),
  (4,
   'Buto Ijo mengejar. Timun Mas melempar biji timun, dan tumbuhlah ladang timun yang membuat raksasa itu tertahan. Lalu jarum menjadi hutan bambu, garam menjadi lautan, dan cabai menjadi api yang menghalangi sang raksasa.',
   'The giant gave chase. Timun Mas threw the cucumber seeds, and a cucumber field grew to slow him. Then the needle became a bamboo forest, the salt became a sea, and the chili became a fire that blocked the giant.',
   'Four magic changes in a row: a field of cucumbers, a dense bamboo forest, a shining sea, and a wall of flame.',
   'Four scenes in one picture: green cucumber vines, tall bamboo, a blue sea, and a line of orange flames, with the giant held back at the edge.'),
  (5,
   'Buto Ijo tidak dapat menyeberangi api itu dan tidak pernah kembali. Timun Mas pulang kepada ibunya, dan mereka hidup dengan tenang. Cerita ini mengajarkan bahwa kecerdikan dan keberanian dapat mengalahkan kekuatan yang besar.',
   'The giant could not cross the fire and never returned. Timun Mas went home to her mother, and they lived in peace. The story teaches that courage and cleverness can overcome great strength.',
   'A girl and her mother stand together in front of their house in the morning sun.',
   'A girl and her mother stand outside their house in warm morning light, the fire and the giant far behind them.')
) as c (chapter_no, text_id, text_en, audio_description_en, image_alt_en)
where s.slug = 'timun-mas';

-- Recipes 1 and 5 of the content seed ----------------------------------------
-- Halal status stays 'unknown' until a source confirms it.
insert into public.recipes (region_id, slug, name_id, name_en, servings, minutes, dietary_tags)
select r.id, x.slug, x.name_id, x.name_en, 4, x.minutes, x.tags
from (values
  ('jawa', 'gudeg-yogyakarta', 'Gudeg Yogyakarta', 'Gudeg Yogyakarta (young jackfruit stew)', 240,
   array['vegetarian_option', 'contains_egg']),
  ('minangkabau', 'rendang-daging', 'Rendang Daging', 'Beef Rendang', 240,
   array['contains_beef'])
) as x (region_slug, slug, name_id, name_en, minutes, tags)
join public.regions r on r.slug = x.region_slug;

insert into public.recipe_ingredients (recipe_id, position, name_id, name_en, amount, unit)
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
  ('rendang-daging', 12, 'Daun salam', 'Indonesian bay leaf', null, null)
) as i (recipe_slug, position, name_id, name_en, amount, unit) on i.recipe_slug = rc.slug;

-- Steps are English only in the content seed; Indonesian follows in the
-- translation pass.
insert into public.recipe_steps (recipe_id, step_no, text_id, text_en)
select rc.id, s.step_no, null, s.text_en
from public.recipes rc
join (values
  ('gudeg-yogyakarta', 1, 'Simmer the jackfruit with coconut milk, palm sugar, and spices.'),
  ('gudeg-yogyakarta', 2, 'Cook slowly for about 3 to 4 hours, stirring from time to time.'),
  ('gudeg-yogyakarta', 3, 'Add the chicken and eggs and cook until tender.'),
  ('gudeg-yogyakarta', 4, 'Serve with rice.'),
  ('rendang-daging', 1, 'Blend the chili, shallot, garlic, ginger, galangal, and turmeric.'),
  ('rendang-daging', 2, 'Simmer the beef in coconut milk with the paste and leaves.'),
  ('rendang-daging', 3, 'Cook on low heat for 3 to 4 hours, stirring, until the liquid is nearly dry.'),
  ('rendang-daging', 4, 'Continue until the beef is dark and coated.')
) as s (recipe_slug, step_no, text_en) on s.recipe_slug = rc.slug;

-- Costume info cards (placeholder images) -------------------------------------
insert into public.costumes (region_id, slug, name_id, name_en, info_id, info_en, reference_image_url)
select r.id, x.slug, x.name_id, x.name_en, null, x.info_en, x.image
from (values
  ('jawa', 'pengantin-jawa', 'Pengantin Jawa', 'Javanese wedding attire',
   'Worn at Javanese weddings. Each region has its own style. Bride: kebaya and batik kain. Groom: beskap and blangkon.',
   '/placeholders/costume-pengantin-jawa.svg'),
  ('minangkabau', 'baju-bundo-kanduang', 'Baju Bundo Kanduang', 'Bundo Kanduang dress',
   'A traditional dress from West Sumatra, worn at ceremonies. Women''s dress with songket cloth and a suntiang headdress for brides.',
   '/placeholders/costume-bundo-kanduang.svg'),
  ('bugis', 'baju-bodo', 'Baju Bodo', 'Baju Bodo',
   'A traditional dress from South Sulawesi, known for its simple shape. Square-cut blouse worn with a silk sarong (lipa sabbe).',
   '/placeholders/costume-baju-bodo.svg')
) as x (region_slug, slug, name_id, name_en, info_en, image)
join public.regions r on r.slug = x.region_slug;

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
   'regions_visited');
