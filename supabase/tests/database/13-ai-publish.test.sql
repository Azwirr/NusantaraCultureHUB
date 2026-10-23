-- AI publish (migration part 15): the AI Workflow publishes content that cites
-- 2 different websites, only through private.ai_publish, logged as ai_workflow.
begin;
select no_plan();

select tests.create_user('11111111-1111-1111-1111-111111111111', 'reviewer_a');
select tests.create_user('33333333-3333-3333-3333-333333333333', 'member_m');
insert into public.user_roles (user_id, role) values ('11111111-1111-1111-1111-111111111111', 'reviewer');

-- Drafted by the AI Workflow.
select tests.as_service();
insert into public.regions (id, slug, name_id, name_en, summary_id, summary_en) values
  ('a1000000-0000-0000-0000-000000000001', 'uji-ai', 'Uji AI', 'AI test', 'Ringkasan', 'Summary'),
  ('a1000000-0000-0000-0000-000000000002', 'uji-ai-kosong', 'Uji kosong', 'Empty test', 'Ringkasan', 'Summary');
insert into public.recipes (id, region_id, slug, name_id, name_en, servings, minutes) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'dua-situs', 'Dua situs', 'Two sites', 4, 30),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'satu-situs', 'Satu situs', 'One site', 4, 30),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'situs-sama', 'Situs sama', 'Same site', 4, 30);
insert into public.recipe_ingredients (recipe_id, position, name_id, name_en, amount, unit)
select id, 1, 'Garam', 'Salt', null, 'to_taste' from public.recipes where slug in ('dua-situs', 'satu-situs', 'situs-sama');
insert into public.recipe_steps (recipe_id, step_no, text_id, text_en)
select id, 1, 'Masak.', 'Cook.' from public.recipes where slug in ('dua-situs', 'satu-situs', 'situs-sama');
insert into public.costumes (id, region_id, slug, name_id, name_en, info_id, info_en) values
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'tanpa-gambar', 'Tanpa gambar', 'No image', 'Info', 'Info');
insert into public.stories (id, region_id, slug, title_id, title_en, summary_id, summary_en) values
  ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'cerita-uji', 'Cerita', 'Story', 'Ringkasan', 'Summary');
insert into public.story_chapters (story_id, chapter_no, text_id, text_en, audio_description_id, audio_description_en, image_alt_id, image_alt_en)
values ('d1000000-0000-0000-0000-000000000001', 1, 'Teks', 'Text', 'Deskripsi', 'Description', 'Alt', 'Alt');
insert into public.sources (id, title, url) values
  ('e1000000-0000-0000-0000-000000000001', 'A', 'https://www.example-a.id/one'),
  ('e1000000-0000-0000-0000-000000000002', 'B', 'https://example-b.id/two'),
  ('e1000000-0000-0000-0000-000000000003', 'A again', 'https://example-a.id/three');
insert into public.content_sources (content_type, content_id, source_id) values
  ('recipe', 'b1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001'),
  ('recipe', 'b1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002'),
  ('recipe', 'b1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001'),
  ('recipe', 'b1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001'),
  ('recipe', 'b1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000003'),
  ('costume', 'c1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001'),
  ('costume', 'c1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002'),
  ('story', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001'),
  ('story', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002');

-- A website is its registrable domain.
select tests.as_service();
select results_eq(
  $$ select private.site_of(u) from unnest(array[
       'https://regional.kompas.com/read/1', 'https://www.kompas.com/food/2', 'https://food.detik.com/x',
       'https://www.detik.com/y', 'https://ejournal.unp.ac.id/z', 'http://www.indonesia.travel:443/a'
     ]) u $$,
  array['kompas.com', 'kompas.com', 'detik.com', 'detik.com', 'unp.ac.id', 'indonesia.travel'],
  'subdomains of one website count as one site'
);

-- Nobody else can call it.
select tests.as_user('33333333-3333-3333-3333-333333333333');
select throws_ok(
  $$ select private.ai_publish('region', 'a1000000-0000-0000-0000-000000000001', 'checked') $$,
  '42501', null,
  'a member cannot use ai_publish'
);
select tests.as_user('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ select private.ai_publish('region', 'a1000000-0000-0000-0000-000000000001', 'checked') $$,
  '42501', null,
  'a reviewer cannot use ai_publish'
);
select tests.as_anon();
select throws_ok(
  $$ select private.ai_publish('region', 'a1000000-0000-0000-0000-000000000001', 'checked') $$,
  '42501', null,
  'a guest cannot use ai_publish'
);

select tests.as_service();
select throws_ok(
  $$ select private.ai_publish('recipe', 'b1000000-0000-0000-0000-000000000001', '  ') $$,
  '22023', null,
  'the AI Workflow must say what it checked'
);
select throws_ok(
  $$ select private.ai_publish('chapter', 'd1000000-0000-0000-0000-000000000001', 'checked') $$,
  '22023', null,
  'chapters are published with their story, not alone'
);
select throws_ok(
  $$ select private.ai_publish('recipe', 'b1000000-0000-0000-0000-000000000001', 'checked') $$,
  '23514', 'cannot approve recipes: its region must be approved first',
  'the region must be public first'
);
select throws_ok(
  $$ select private.ai_publish('region', 'a1000000-0000-0000-0000-000000000002', 'checked') $$,
  '23514', 'cannot publish region: none of its items cites 2 different websites',
  'a region with no well-sourced item stays a draft'
);
select is(
  private.ai_publish('region', 'a1000000-0000-0000-0000-000000000001', 'Region checked against its items'),
  'approved',
  'a region with a well-sourced item is published'
);
select is(
  private.ai_publish('recipe', 'b1000000-0000-0000-0000-000000000001', 'Two sites checked'),
  'approved',
  'an item citing 2 different websites is published'
);
select throws_ok(
  $$ select private.ai_publish('recipe', 'b1000000-0000-0000-0000-000000000002', 'checked') $$,
  '23514', 'cannot publish recipe: it needs sources from at least 2 different websites',
  'one website is not enough'
);
select throws_ok(
  $$ select private.ai_publish('recipe', 'b1000000-0000-0000-0000-000000000003', 'checked') $$,
  '23514', 'cannot publish recipe: it needs sources from at least 2 different websites',
  'two pages on the same website (with or without www) count once'
);
select throws_ok(
  $$ select private.ai_publish('costume', 'c1000000-0000-0000-0000-000000000001', 'checked') $$,
  '23514', null,
  'every other publish rule still applies (a dress needs an image)'
);
select is(
  private.ai_publish('story', 'd1000000-0000-0000-0000-000000000001', 'Story checked'),
  'approved',
  'a well-sourced story is published'
);
select is(
  (select review_status from public.story_chapters where story_id = 'd1000000-0000-0000-0000-000000000001'),
  'approved',
  'its chapters are published with it'
);
select is(
  coalesce(current_setting('app.ai_publish', true), ''),
  '',
  'the publish flag does not outlive the call'
);
select throws_ok(
  $$ update public.recipes set review_status = 'approved' where id = 'b1000000-0000-0000-0000-000000000002' $$,
  '42501', 'only a reviewer or owner can change review_status',
  'a direct update by the AI Workflow is still refused'
);

select tests.as_operator();
select results_eq(
  $$ select actor_type || '|' || action || '|' || coalesce(reason, '') from public.audit_log
     where entity_id = 'b1000000-0000-0000-0000-000000000001' $$,
  array['ai_workflow|approve|Two sites checked'],
  'the audit log names the AI Workflow and what it checked'
);
select is(
  (select count(*)::int from public.audit_log where entity_id in (
    'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001'
  ) and actor_id is null and actor_type = 'ai_workflow'),
  3,
  'no person is recorded as the approver'
);

select * from finish();
rollback;
