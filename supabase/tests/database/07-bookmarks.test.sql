-- Bookmarks (migration part 7): members save public content only, see and
-- remove only their own saves, and unpublished items are hidden, not lost.
begin;
select no_plan();

-- Fixture ---------------------------------------------------------------------
select tests.create_user('11111111-1111-1111-1111-111111111111', 'reviewer_a');
select tests.create_user('33333333-3333-3333-3333-333333333333', 'member_m');
select tests.create_user('44444444-4444-4444-4444-444444444444', 'member_n');
insert into public.user_roles (user_id, role) values ('11111111-1111-1111-1111-111111111111', 'reviewer');

insert into public.regions (id, slug, name_id, name_en, summary_id, summary_en) values
  ('a0000000-0000-0000-0000-000000000001', 'wilayah-ok', 'Wilayah', 'Region', 'Ringkasan', 'Summary');
insert into public.recipes (id, region_id, slug, name_id, name_en, servings, minutes) values
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'resep-ok', 'Resep', 'Recipe', 4, 30),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'resep-draf', 'Draf', 'Draft', 4, 30);
insert into public.recipe_ingredients (recipe_id, position, name_id, name_en) values
  ('d0000000-0000-0000-0000-000000000001', 1, 'Garam', 'Salt');
insert into public.recipe_steps (recipe_id, step_no, text_id, text_en) values
  ('d0000000-0000-0000-0000-000000000001', 1, 'Aduk', 'Stir');
insert into public.sources (id, title) values ('f0000000-0000-0000-0000-000000000001', 'Source');
insert into public.content_sources (content_type, content_id, source_id) values
  ('recipe', 'd0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001');

select tests.review('11111111-1111-1111-1111-111111111111', 'region', 'a0000000-0000-0000-0000-000000000001', 'approve');
select tests.review('11111111-1111-1111-1111-111111111111', 'recipe', 'd0000000-0000-0000-0000-000000000001', 'approve');

-- Saving ------------------------------------------------------------------------
select tests.as_user('33333333-3333-3333-3333-333333333333');
select lives_ok(
  $$ insert into public.bookmarks (content_type, content_id) values ('recipe', 'd0000000-0000-0000-0000-000000000001') $$,
  'a member saves an approved recipe'
);
select results_eq(
  'select user_id from public.bookmarks',
  array['33333333-3333-3333-3333-333333333333'::uuid],
  'the saved row belongs to the member from the session'
);
select throws_ok(
  $$ insert into public.bookmarks (content_type, content_id) values ('recipe', 'd0000000-0000-0000-0000-000000000001') $$,
  '23505', null,
  'the same item cannot be saved twice'
);
select throws_ok(
  $$ insert into public.bookmarks (content_type, content_id) values ('recipe', 'd0000000-0000-0000-0000-000000000002') $$,
  '42501', null,
  'a member cannot save a draft'
);
select throws_ok(
  $$ insert into public.bookmarks (content_type, content_id) values ('recipe', 'd0000000-0000-0000-0000-0000000000ff') $$,
  '42501', null,
  'an id that does not exist gets the same refusal as a draft, so nothing can be probed'
);
select throws_ok(
  $$ insert into public.bookmarks (content_type, content_id) values ('region', 'a0000000-0000-0000-0000-000000000001') $$,
  '23514', null,
  'only stories, recipes and costumes can be saved'
);
select throws_ok(
  $$ insert into public.bookmarks (user_id, content_type, content_id)
     values ('44444444-4444-4444-4444-444444444444', 'recipe', 'd0000000-0000-0000-0000-000000000001') $$,
  '42501', null,
  'a member cannot write a save for someone else'
);
select throws_ok(
  $$ update public.bookmarks set content_id = 'd0000000-0000-0000-0000-000000000002' $$,
  '42501', null,
  'saves cannot be edited'
);

-- Staff cannot save drafts either: saves are for public content only.
select tests.as_user('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ insert into public.bookmarks (content_type, content_id) values ('recipe', 'd0000000-0000-0000-0000-000000000002') $$,
  '42501', null,
  'a reviewer cannot save a draft'
);

-- Privacy -------------------------------------------------------------------------
select tests.as_user('44444444-4444-4444-4444-444444444444');
select is_empty('select 1 from public.bookmarks', 'a member does not see other members'' saves');
delete from public.bookmarks;
select tests.as_operator();
select is((select count(*)::int from public.bookmarks), 1, 'a member cannot delete someone else''s saves');

select tests.as_anon();
select throws_ok('select * from public.bookmarks', '42501', null, 'a guest cannot read saves');
select throws_ok(
  $$ insert into public.bookmarks (content_type, content_id) values ('recipe', 'd0000000-0000-0000-0000-000000000001') $$,
  '42501', null,
  'a guest cannot save'
);

-- Unpublished items are hidden, not lost ------------------------------------------
select tests.as_operator();
select tests.review('11111111-1111-1111-1111-111111111111', 'recipe', 'd0000000-0000-0000-0000-000000000001', 'unpublish', 'Checking the source');

select tests.as_user('33333333-3333-3333-3333-333333333333');
select is_empty('select 1 from public.bookmarks', 'a save of unpublished content is hidden from the member');
select tests.as_operator();
select is((select count(*)::int from public.bookmarks), 1, 'the hidden save is kept');

select tests.review('11111111-1111-1111-1111-111111111111', 'recipe', 'd0000000-0000-0000-0000-000000000001', 'approve');
select tests.as_user('33333333-3333-3333-3333-333333333333');
select is((select count(*)::int from public.bookmarks), 1, 'the save shows again once the item is approved again');

-- Removing ----------------------------------------------------------------------
delete from public.bookmarks where content_id = 'd0000000-0000-0000-0000-000000000001';
select is_empty('select 1 from public.bookmarks', 'a member removes their own save');

select tests.as_operator();
select is(
  (select count(*)::int from information_schema.columns
   where table_schema = 'public' and table_name = 'bookmarks'),
  5,
  'bookmarks hold ids and a time only'
);

select * from finish();
rollback;
