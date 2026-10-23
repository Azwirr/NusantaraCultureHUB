-- Search (migration part 9): search_content finds approved content by title,
-- text, ingredient and typo, in the visitor's language, and never returns a
-- draft to anyone, staff included.
begin;
select no_plan();

-- Fixture ---------------------------------------------------------------------
select tests.create_user('11111111-1111-1111-1111-111111111111', 'reviewer_a');
select tests.create_user('33333333-3333-3333-3333-333333333333', 'member_m');
insert into public.user_roles (user_id, role) values ('11111111-1111-1111-1111-111111111111', 'reviewer');

insert into public.regions (id, slug, name_id, name_en, summary_id, summary_en) values
  ('a0000000-0000-0000-0000-000000000001', 'uji-pesisir', 'Pesisir Uji', 'Test Coast',
   'Wilayah uji di pesisir.', 'A test region on the coast.'),
  ('a0000000-0000-0000-0000-000000000002', 'uji-gunung', 'Gunung Uji', 'Test Mountain',
   'Wilayah draf.', 'A draft region.');

insert into public.stories (id, region_id, slug, title_id, title_en, summary_id, summary_en) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'kancil-uji',
   'Kancil Cerdik Uji', 'The Clever Test Mousedeer', 'Kancil menyeberangi sungai.', 'A mousedeer crosses a river.'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'kancil-draf',
   'Kancil Draf Uji', 'Draft Test Mousedeer', 'Draf.', 'Draft.');
insert into public.story_chapters (id, story_id, chapter_no, text_id, text_en,
  audio_description_id, audio_description_en, image_alt_id, image_alt_en) values
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 1,
   'Kancil menipu buaya yang berbaris.', 'The mousedeer tricks a row of crocodiles.',
   'Deskripsi', 'Description', 'Alt', 'Alt'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 1,
   'Teks rahasia zirkonium.', 'Secret zirconium text.', 'Deskripsi', 'Description', 'Alt', 'Alt');

insert into public.recipes (id, region_id, slug, name_id, name_en, servings, minutes) values
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'gulai-uji',
   'Gulai Ikan Uji', 'Test Fish Curry', 4, 30),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'gulai-draf',
   'Gulai Draf Uji', 'Draft Test Curry', 4, 30);
insert into public.recipe_ingredients (recipe_id, position, name_id, name_en) values
  ('d0000000-0000-0000-0000-000000000001', 1, 'Lengkuas', 'Galangal'),
  ('d0000000-0000-0000-0000-000000000002', 1, 'Zirkonium', 'Zirconium');
insert into public.recipe_steps (recipe_id, step_no, text_id, text_en) values
  ('d0000000-0000-0000-0000-000000000001', 1, 'Aduk', 'Stir'),
  ('d0000000-0000-0000-0000-000000000002', 1, 'Aduk', 'Stir');

insert into public.costumes (id, region_id, slug, name_id, name_en, info_id, info_en, reference_image_url) values
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'busana-draf',
   'Busana Kancil Draf', 'Draft Mousedeer Costume', 'Info', 'Info', '/x.svg');

insert into public.sources (id, title) values ('f0000000-0000-0000-0000-000000000001', 'Source');
insert into public.content_sources (content_type, content_id, source_id) values
  ('story', 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001'),
  ('recipe', 'd0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001');

select tests.review('11111111-1111-1111-1111-111111111111', 'region', 'a0000000-0000-0000-0000-000000000001', 'approve');
select tests.review('11111111-1111-1111-1111-111111111111', 'chapter', 'c0000000-0000-0000-0000-000000000001', 'approve');
select tests.review('11111111-1111-1111-1111-111111111111', 'story', 'b0000000-0000-0000-0000-000000000001', 'approve');
select tests.review('11111111-1111-1111-1111-111111111111', 'recipe', 'd0000000-0000-0000-0000-000000000001', 'approve');
-- An approved chapter of a draft story stays hidden too.
select tests.review('11111111-1111-1111-1111-111111111111', 'chapter', 'c0000000-0000-0000-0000-000000000002', 'approve');

-- What can be found -------------------------------------------------------------
select tests.as_anon();
select results_eq(
  $$ select slug from public.search_content('kancil') $$,
  array['kancil-uji'],
  'a guest finds the approved story and never the draft story or draft costume'
);
select results_eq(
  $$ select slug from public.search_content('buaya') $$,
  array['kancil-uji'],
  'chapter text of an approved story is searchable'
);
select results_eq(
  $$ select slug from public.search_content('lengkuas') $$,
  array['gulai-uji'],
  'ingredient names are searchable'
);
select results_eq(
  $$ select slug from public.search_content('gulia ikan') $$,
  array['gulai-uji'],
  'a typo still finds the recipe (trigram match)'
);
select results_eq(
  $$ select slug from public.search_content('gul') $$,
  array['gulai-uji'],
  'part of a word finds the recipe'
);
select results_eq(
  $$ select slug from public.search_content('pesisir') $$,
  array['uji-pesisir'],
  'approved regions are searchable'
);
select is_empty(
  $$ select 1 from public.search_content('zirkonium') $$,
  'text that exists only in drafts finds nothing'
);
select is_empty($$ select 1 from public.search_content('gunung') $$, 'a draft region finds nothing');
select is_empty($$ select 1 from public.search_content('   ') $$, 'a blank query returns nothing');
select is_empty($$ select 1 from public.search_content(null) $$, 'a null query returns nothing');

-- Language ----------------------------------------------------------------------
select is(
  (select title from public.search_content('mousedeer', 'en')),
  'The Clever Test Mousedeer',
  'English visitors get the English title'
);
select is(
  (select title || ' / ' || region_name from public.search_content('mousedeer', 'id')),
  'Kancil Cerdik Uji / Pesisir Uji',
  'Indonesian visitors get the Indonesian title and region name'
);
select is(
  (select summary from public.search_content('kancil', 'en')),
  'A mousedeer crosses a river.',
  'the summary follows the language'
);

-- Input handling ------------------------------------------------------------------
select is_empty(
  $$ select 1 from public.search_content('%') $$,
  'a LIKE wildcard is matched literally'
);
select lives_ok(
  $$ select * from public.search_content('<script>alert(1)</script>'' or 1=1; --') $$,
  'markup and SQL in the query are plain data'
);
select is(
  (select count(*)::int from public.search_content('uji', 'id', 1)),
  1,
  'the limit is respected'
);
select is(
  (select count(*)::int from public.search_content('uji', 'id', 1000)),
  3,
  'a huge limit is capped and still returns only public rows'
);

-- Nobody gets drafts --------------------------------------------------------------
select tests.as_user('33333333-3333-3333-3333-333333333333');
select is_empty($$ select 1 from public.search_content('draf') $$, 'a member gets no drafts');

select tests.as_user('11111111-1111-1111-1111-111111111111');
select is_empty(
  $$ select 1 from public.search_content('draf') $$,
  'a reviewer gets no drafts from search either (drafts live in the review queue)'
);
select results_eq(
  $$ select slug from public.search_content('kancil') $$,
  array['kancil-uji'],
  'a reviewer gets the same public results as a guest'
);

-- Unpublishing removes an item from search at once.
select tests.as_operator();
select tests.review('11111111-1111-1111-1111-111111111111', 'recipe', 'd0000000-0000-0000-0000-000000000001', 'unpublish', 'Recheck');
select tests.as_anon();
select is_empty($$ select 1 from public.search_content('gulai') $$, 'unpublished content disappears from search');

select tests.as_operator();
select * from finish();
rollback;
