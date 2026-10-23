-- Pictures (Phase 2d, 2026-10-23): openly licensed Wikimedia Commons photos
-- for approved items. Each licence and author was read on its file page; see
-- docs/image-credits.md. Re-running is safe (the unique key stops duplicates).
--
-- Run as a database operator after migration 20261024001600_content_media.sql.

insert into public.content_media (content_type, content_id, kind, url, alt_id, alt_en, credit, licence, sort_order)
select x.type, c.id, 'picture', x.url, x.alt_id, x.alt_en, x.credit, x.licence, 0
from (values
  -- Traditional dress
  ('costume', 'ulos', 'https://commons.wikimedia.org/wiki/Special:FilePath/Pakaian_adat_batak_(ulos).jpg',
   'Pakaian adat Batak dari kain ulos', 'Batak traditional dress made of ulos cloth',
   'Ning Gusti, Wikimedia Commons', 'CC0 1.0'),
  ('costume', 'kebaya-sunda', 'https://commons.wikimedia.org/wiki/Special:FilePath/Kebaya_in_Bandung.jpg',
   'Kebaya yang dipotret di Bandung, Jawa Barat', 'A kebaya photographed in Bandung, West Java',
   'Irwandy Mazwir (Flickr), Wikimedia Commons', 'CC BY 2.0'),
  ('costume', 'baju-bodo', 'https://commons.wikimedia.org/wiki/Special:FilePath/Baju_Bodo.jpg',
   'Baju bodo, pakaian adat Bugis', 'Baju bodo, traditional dress of the Bugis',
   'Fery Indrawan (Flickr), Wikimedia Commons', 'CC BY 2.0'),
  ('costume', 'baju-bundo-kanduang', 'https://commons.wikimedia.org/wiki/Special:FilePath/Pakaian_Bundo_Kanduang.jpg',
   'Pakaian Bundo Kanduang dari Tanah Datar', 'Bundo Kanduang clothing from Tanah Datar',
   'Anggi Silvia, Wikimedia Commons', 'CC BY-SA 4.0'),
  -- Recipes
  ('recipe', 'rendang-daging', 'https://commons.wikimedia.org/wiki/Special:FilePath/Nasi_Padang_With_beef_rendang.jpg',
   'Rendang daging sapi dengan nasi putih', 'Beef rendang with white rice',
   'Dr.Francostein1975, Wikimedia Commons', 'CC BY-SA 4.0'),
  ('recipe', 'gudeg-yogyakarta', 'https://commons.wikimedia.org/wiki/Special:FilePath/Gudeg_Sagan_Yogyakarta.jpg',
   'Gudeg Sagan, Yogyakarta', 'Gudeg from Sagan, Yogyakarta',
   'Pinerineks, Wikimedia Commons', 'CC BY-SA 4.0'),
  ('recipe', 'arsik-ikan-mas', 'https://commons.wikimedia.org/wiki/Special:FilePath/Arsik_Ikan_Mas_1.jpg',
   'Arsik ikan mas, masakan Batak', 'Arsik ikan mas, a Batak dish',
   'Gunawan Kartapranata, Wikimedia Commons', 'CC BY-SA 4.0'),
  ('recipe', 'ayam-betutu', 'https://commons.wikimedia.org/wiki/Special:FilePath/Ayam_Betutu_Bali.jpg',
   'Ayam dan bebek betutu, Bali', 'Ayam and bebek betutu from Bali',
   'Gunawan Kartapranata, Wikimedia Commons', 'CC BY-SA 4.0'),
  ('recipe', 'soto-banjar', 'https://commons.wikimedia.org/wiki/Special:FilePath/Soto_Banjar.JPG',
   'Soto Banjar dengan lontong dan perkedel', 'Soto Banjar with lontong and perkedel',
   'Gunawan Kartapranata, Wikimedia Commons', 'CC BY-SA 3.0'),
  ('recipe', 'soto-ayam', 'https://commons.wikimedia.org/wiki/Special:FilePath/Soto_ayam_lamongan.jpg',
   'Soto ayam gaya Lamongan', 'Lamongan-style chicken soup',
   'Shinta amalia, Wikimedia Commons', 'CC BY-SA 4.0'),
  ('recipe', 'rawon', 'https://commons.wikimedia.org/wiki/Special:FilePath/Nasi_Rawon_B.JPG',
   'Nasi rawon dari Nguling, Probolinggo', 'Nasi rawon from Nguling, Probolinggo',
   'ESCapade, Wikimedia Commons', 'CC BY-SA 3.0'),
  ('recipe', 'pecel', 'https://commons.wikimedia.org/wiki/Special:FilePath/Pecel_Solo.JPG',
   'Pecel dengan saus kacang, Solo', 'Pecel with peanut sauce, Solo',
   'Gunawan Kartapranata, Wikimedia Commons', 'CC BY-SA 3.0'),
  ('recipe', 'coto-makassar', 'https://commons.wikimedia.org/wiki/Special:FilePath/Coto_Makassar.jpg',
   'Coto Makassar, sup daging kerbau', 'Coto Makassar, a buffalo-meat soup',
   'Cahyo Ramadhani, Wikimedia Commons', 'CC BY-SA 3.0'),
  ('recipe', 'konro-bakar', 'https://commons.wikimedia.org/wiki/Special:FilePath/Konro_Bakar_4.jpg',
   'Konro bakar, iga sapi bakar khas Makassar', 'Konro bakar, grilled beef ribs from Makassar',
   'Gunawan Kartapranata, Wikimedia Commons', 'CC BY-SA 4.0'),
  ('recipe', 'sate-padang', 'https://commons.wikimedia.org/wiki/Special:FilePath/Sate_Padang2.JPG',
   'Sate Padang dengan kuahnya', 'Sate Padang with its sauce',
   'Sakurai Midori, Wikimedia Commons', 'CC BY 3.0'),
  ('recipe', 'dendeng-balado', 'https://commons.wikimedia.org/wiki/Special:FilePath/Dendeng_balado.JPG',
   'Dendeng balado, daging goreng pedas', 'Dendeng balado, fried spicy beef',
   'Midori, Wikimedia Commons', 'CC BY-SA 3.0')
) as x (type, slug, url, alt_id, alt_en, credit, licence)
join lateral (
  select id from public.costumes where x.type = 'costume' and slug = x.slug
  union all select id from public.recipes where x.type = 'recipe' and slug = x.slug
) c on true
on conflict (content_type, content_id, sort_order) do nothing;
