-- Build plan check 3 / PRD check 2: guests (public key) and members see
-- approved rows only. Staff see drafts.
begin;
select no_plan();

-- Fixture ---------------------------------------------------------------------
select tests.create_user('11111111-1111-1111-1111-111111111111', 'reviewer_a');
select tests.create_user('33333333-3333-3333-3333-333333333333', 'member_m');
insert into public.user_roles (user_id, role) values ('11111111-1111-1111-1111-111111111111', 'reviewer');

insert into public.regions (id, slug, name_id, name_en) values
  ('a0000000-0000-0000-0000-000000000001', 'wilayah-ok', 'Wilayah', 'Region'),
  ('a0000000-0000-0000-0000-000000000002', 'wilayah-draf', 'Draf', 'Draft');

insert into public.stories (id, region_id, slug, title_id, title_en, summary_id, summary_en) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'kisah-ok', 'Kisah', 'Story', 'Ringkasan', 'Summary'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'kisah-draf', 'Draf', 'Draft', 'Ringkasan', 'Summary');

insert into public.story_chapters (id, story_id, chapter_no, text_id, text_en,
  audio_description_id, audio_description_en, image_alt_id, image_alt_en) values
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 1,
   'Teks', 'Text', 'Deskripsi audio', 'Audio description', 'Teks alternatif', 'Alt text'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 1,
   'Teks', 'Text', 'Deskripsi audio', 'Audio description', 'Teks alternatif', 'Alt text');

insert into public.recipes (id, region_id, slug, name_id, name_en, servings, minutes) values
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'resep-ok', 'Resep', 'Recipe', 4, 30),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'resep-draf', 'Draf', 'Draft', 4, 30);
insert into public.recipe_ingredients (recipe_id, position, name_id, name_en, amount, unit) values
  ('d0000000-0000-0000-0000-000000000001', 1, 'Garam', 'Salt', null, 'to_taste'),
  ('d0000000-0000-0000-0000-000000000002', 1, 'Gula', 'Sugar', 10, 'g');
insert into public.recipe_steps (recipe_id, step_no, text_id, text_en) values
  ('d0000000-0000-0000-0000-000000000001', 1, 'Aduk', 'Stir'),
  ('d0000000-0000-0000-0000-000000000002', 1, 'Aduk', 'Stir');

insert into public.costumes (id, region_id, slug, name_id, name_en) values
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'busana-draf', 'Busana', 'Costume');

insert into public.sources (id, title) values
  ('f0000000-0000-0000-0000-000000000001', 'Published source'),
  ('f0000000-0000-0000-0000-000000000002', 'Draft-only source');
insert into public.content_sources (content_type, content_id, source_id) values
  ('story', 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001'),
  ('recipe', 'd0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001'),
  ('recipe', 'd0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002');

-- Publish part of it as reviewer A (the operator created it, so A may approve).
select tests.review('11111111-1111-1111-1111-111111111111', 'region', 'a0000000-0000-0000-0000-000000000001', 'approve');
select tests.review('11111111-1111-1111-1111-111111111111', 'chapter', 'c0000000-0000-0000-0000-000000000001', 'approve');
select tests.review('11111111-1111-1111-1111-111111111111', 'chapter', 'c0000000-0000-0000-0000-000000000002', 'approve');
select tests.review('11111111-1111-1111-1111-111111111111', 'story', 'b0000000-0000-0000-0000-000000000001', 'approve');
select tests.review('11111111-1111-1111-1111-111111111111', 'recipe', 'd0000000-0000-0000-0000-000000000001', 'approve');

-- Guest -------------------------------------------------------------------------
select tests.as_anon();

select results_eq('select slug::text from public.regions', array['wilayah-ok'], 'guest sees only the approved region');
select results_eq('select slug::text from public.stories', array['kisah-ok'], 'guest sees only the approved story');
select results_eq(
  'select id from public.story_chapters',
  array['c0000000-0000-0000-0000-000000000001'::uuid],
  'guest sees an approved chapter only when its story is approved too'
);
select results_eq('select slug::text from public.recipes', array['resep-ok'], 'guest sees only the approved recipe');
select results_eq(
  'select distinct recipe_id from public.recipe_ingredients',
  array['d0000000-0000-0000-0000-000000000001'::uuid],
  'guest sees ingredients of approved recipes only'
);
select results_eq(
  'select distinct recipe_id from public.recipe_steps',
  array['d0000000-0000-0000-0000-000000000001'::uuid],
  'guest sees steps of approved recipes only'
);
select is_empty('select 1 from public.costumes', 'guest sees no draft costume');
select results_eq('select title from public.sources', array['Published source'], 'guest sees only sources cited by public content');
select is((select count(*)::int from public.content_sources), 2, 'guest sees source links of public content only');

select is(
  (select count(*)::int from (
     select review_status from public.regions
     union all select review_status from public.stories
     union all select review_status from public.story_chapters
     union all select review_status from public.recipes
     union all select review_status from public.costumes
   ) visible where review_status <> 'approved'),
  0,
  'PRD check 2: a guest with the public key sees no draft rows'
);

select throws_ok('select * from public.profiles', '42501', null, 'guest cannot read profiles');
select throws_ok('select * from public.user_roles', '42501', null, 'guest cannot read user_roles');
select throws_ok('select * from public.audit_log', '42501', null, 'guest cannot read the audit log');

-- Member ------------------------------------------------------------------------
select tests.as_user('33333333-3333-3333-3333-333333333333');

select results_eq('select slug::text from public.regions', array['wilayah-ok'], 'member sees only the approved region');
select is(
  (select count(*)::int from (
     select review_status from public.regions
     union all select review_status from public.stories
     union all select review_status from public.story_chapters
     union all select review_status from public.recipes
     union all select review_status from public.costumes
   ) visible where review_status <> 'approved'),
  0,
  'a member sees no draft rows'
);
select is_empty('select 1 from public.audit_log', 'a member reads no audit log rows');
select is_empty('select 1 from public.user_roles', 'a member without roles sees no role rows');
select is((select count(*)::int from public.profiles), 1, 'a member reads only their own profile');

-- Reviewer ----------------------------------------------------------------------
select tests.as_user('11111111-1111-1111-1111-111111111111');

-- Filtered to the fixture rows: the local seed adds its own drafts.
select is(
  (select count(*)::int from public.regions where slug in ('wilayah-ok', 'wilayah-draf')),
  2, 'a reviewer sees draft regions'
);
select is(
  (select count(*)::int from public.costumes where slug = 'busana-draf'),
  1, 'a reviewer sees draft costumes'
);
select is(
  (select count(*)::int from public.story_chapters
   where story_id in ('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002')),
  2, 'a reviewer sees chapters of draft stories'
);
select is(
  (select count(*)::int from public.sources where id in (
     'f0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002')),
  2, 'a reviewer sees every source'
);

select tests.as_operator();
select * from finish();
rollback;
