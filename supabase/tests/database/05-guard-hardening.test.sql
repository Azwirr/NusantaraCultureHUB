-- Regression tests for the review gate hardening (migration part 5):
-- four-eyes after automated edits, deleting staff accounts, and probing
-- hidden ids through content_sources.
begin;
select no_plan();

-- Fixture ---------------------------------------------------------------------
select tests.create_user('11111111-1111-1111-1111-111111111111', 'reviewer_a');
select tests.create_user('22222222-2222-2222-2222-222222222222', 'reviewer_b');
select tests.create_user('33333333-3333-3333-3333-333333333333', 'member_m');
select tests.create_user('66666666-6666-6666-6666-666666666666', 'reviewer_gone');
insert into public.user_roles (user_id, role) values
  ('11111111-1111-1111-1111-111111111111', 'reviewer'),
  ('22222222-2222-2222-2222-222222222222', 'reviewer'),
  ('66666666-6666-6666-6666-666666666666', 'reviewer');

insert into public.regions (id, slug, name_id, name_en, summary_id, summary_en) values
  ('a0000000-0000-0000-0000-000000000001', 'wilayah-satu', 'Satu', 'One', 'Ringkasan', 'Summary'),
  ('a0000000-0000-0000-0000-000000000002', 'wilayah-dua', 'Dua', 'Two', 'Ringkasan', 'Summary');
insert into public.sources (id, title) values ('f0000000-0000-0000-0000-000000000001', 'Source');
select tests.review('11111111-1111-1111-1111-111111111111', 'region', 'a0000000-0000-0000-0000-000000000001', 'approve');

-- 1. Four-eyes survives automated edits -----------------------------------------
select tests.as_user('11111111-1111-1111-1111-111111111111');
update public.regions set name_en = 'Two (edited by A)' where id = 'a0000000-0000-0000-0000-000000000002';

select tests.as_service();
update public.regions set sort_order = 5 where id = 'a0000000-0000-0000-0000-000000000002';
update public.regions set updated_by = null where id = 'a0000000-0000-0000-0000-000000000002';

select tests.as_operator();
select is(
  (select updated_by from public.regions where id = 'a0000000-0000-0000-0000-000000000002'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'an AI Workflow edit or an explicit NULL does not clear the human editor'
);

select tests.as_user('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ select public.review_content('region', 'a0000000-0000-0000-0000-000000000002', 'approve') $$,
  '42501', 'you cannot approve content you created or last edited',
  'the reviewer who edited cannot approve after an AI Workflow touch'
);
select tests.as_user('22222222-2222-2222-2222-222222222222');
select is(
  public.review_content('region', 'a0000000-0000-0000-0000-000000000002', 'approve'),
  'approved',
  'another reviewer still can'
);

-- Same through a recipe step.
select tests.as_operator();
insert into public.recipes (id, region_id, slug, name_id, name_en, servings, minutes) values
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'resep', 'Resep', 'Recipe', 4, 30);
insert into public.recipe_ingredients (recipe_id, position, name_id, name_en) values
  ('d0000000-0000-0000-0000-000000000001', 1, 'Garam', 'Salt');
insert into public.recipe_steps (id, recipe_id, step_no, text_id, text_en) values
  ('d1000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 1, 'Aduk', 'Stir');
insert into public.content_sources (content_type, content_id, source_id) values
  ('recipe', 'd0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001');

select tests.as_user('11111111-1111-1111-1111-111111111111');
update public.recipe_steps set text_en = 'Stir well' where id = 'd1000000-0000-0000-0000-000000000001';
select tests.as_service();
update public.recipe_steps set timer_seconds = 60 where id = 'd1000000-0000-0000-0000-000000000001';

select tests.as_user('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ select public.review_content('recipe', 'd0000000-0000-0000-0000-000000000001', 'approve') $$,
  '42501', 'you cannot approve content you created or last edited',
  'a step edit still blocks its editor after an AI Workflow edit of the same step'
);

-- 2. Staff accounts can be deleted ----------------------------------------------
select tests.as_user('66666666-6666-6666-6666-666666666666');
insert into public.regions (id, slug, name_id, name_en, summary_id, summary_en)
values ('a0000000-0000-0000-0000-000000000003', 'buatan-gone', 'Buatan', 'Made', 'Ringkasan', 'Summary');
insert into public.sources (id, title) values ('f0000000-0000-0000-0000-000000000002', 'Source by gone');

select tests.as_operator();
insert into public.costumes (id, region_id, slug, name_id, name_en, info_id, info_en, reference_image_url) values
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'busana', 'Busana', 'Costume',
   'Info', 'Info', '/placeholders/costume-baju-bodo.svg');
insert into public.content_sources (content_type, content_id, source_id) values
  ('costume', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002');
select tests.review('11111111-1111-1111-1111-111111111111', 'costume', 'e0000000-0000-0000-0000-000000000001', 'approve');

select tests.as_user('22222222-2222-2222-2222-222222222222');
update public.regions set created_by = null where id = 'a0000000-0000-0000-0000-000000000003';
select tests.as_operator();
select is(
  (select created_by from public.regions where id = 'a0000000-0000-0000-0000-000000000003'),
  '66666666-6666-6666-6666-666666666666'::uuid,
  'while the author exists, nobody can clear created_by'
);

select lives_ok(
  $$ delete from auth.users where id = '66666666-6666-6666-6666-666666666666' $$,
  'a reviewer who created content and a cited source can be deleted'
);
select ok(
  (select created_by is null and updated_by is null from public.regions where id = 'a0000000-0000-0000-0000-000000000003'),
  'their authorship is cleared by the foreign key'
);
select is(
  (select created_by from public.sources where id = 'f0000000-0000-0000-0000-000000000002'),
  null::uuid,
  'the cited source''s creator is cleared too'
);
select is(
  (select count(*)::int from (
     select created_by as u from public.regions union all select updated_by from public.regions
     union all select created_by from public.sources
   ) refs where u is not null and not exists (select 1 from auth.users where id = u)),
  0,
  'no content points at a deleted user'
);

-- 3. Members cannot probe hidden ids through content_sources --------------------
select tests.as_user('33333333-3333-3333-3333-333333333333');
select throws_ok(
  $$ insert into public.content_sources (content_type, content_id, source_id)
     values ('region', 'a0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001') $$,
  '42501', 'only a reviewer or owner can change content sources',
  'a member linking to an existing draft gets the same refusal...'
);
select throws_ok(
  $$ insert into public.content_sources (content_type, content_id, source_id)
     values ('region', 'a0000000-0000-0000-0000-0000000000ff', 'f0000000-0000-0000-0000-000000000001') $$,
  '42501', 'only a reviewer or owner can change content sources',
  '...as for an id that does not exist'
);

select tests.as_operator();
select * from finish();
rollback;
