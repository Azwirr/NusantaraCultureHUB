-- Build plan check 4 / PRD check 3: a member cannot change a review status or
-- write user_roles. Only an owner grants roles. Members only touch their own
-- profile and progress.
begin;
select no_plan();

-- Fixture ---------------------------------------------------------------------
select tests.create_user('11111111-1111-1111-1111-111111111111', 'reviewer_a');
select tests.create_user('33333333-3333-3333-3333-333333333333', 'member_m');
select tests.create_user('44444444-4444-4444-4444-444444444444', 'owner_o');
select tests.create_user('55555555-5555-5555-5555-555555555555', 'member_n');

-- Bootstrap: the operator (postgres, no JWT) may create the first owner.
select lives_ok(
  $$ insert into public.user_roles (user_id, role) values
       ('44444444-4444-4444-4444-444444444444', 'owner'),
       ('11111111-1111-1111-1111-111111111111', 'reviewer') $$,
  'a database operator can bootstrap the first owner'
);

insert into public.regions (id, slug, name_id, name_en, summary_id, summary_en) values
  ('a0000000-0000-0000-0000-000000000001', 'wilayah-ok', 'Wilayah', 'Region', 'Ringkasan', 'Summary'),
  ('a0000000-0000-0000-0000-000000000002', 'wilayah-draf', 'Draf', 'Draft', 'Ringkasan', 'Summary');
insert into public.stories (id, region_id, slug, title_id, title_en, summary_id, summary_en) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'kisah-ok', 'Kisah', 'Story', 'Ringkasan', 'Summary'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'kisah-draf', 'Draf', 'Draft', 'Ringkasan', 'Summary');
insert into public.story_chapters (id, story_id, chapter_no, text_id, text_en,
  audio_description_id, audio_description_en, image_alt_id, image_alt_en) values
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 1,
   'Teks', 'Text', 'Deskripsi audio', 'Audio description', 'Teks alternatif', 'Alt text');
insert into public.sources (id, title) values ('f0000000-0000-0000-0000-000000000001', 'Source');
insert into public.content_sources (content_type, content_id, source_id) values
  ('story', 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001');
select tests.review('11111111-1111-1111-1111-111111111111', 'region', 'a0000000-0000-0000-0000-000000000001', 'approve');
select tests.review('11111111-1111-1111-1111-111111111111', 'chapter', 'c0000000-0000-0000-0000-000000000001', 'approve');
select tests.review('11111111-1111-1111-1111-111111111111', 'story', 'b0000000-0000-0000-0000-000000000001', 'approve');

select is(
  (select username from public.profiles where id = '33333333-3333-3333-3333-333333333333'),
  'member_m',
  'signing up creates a profile with the chosen nickname'
);

-- Member: review status ----------------------------------------------------------
select tests.as_user('33333333-3333-3333-3333-333333333333');

select lives_ok(
  $$ update public.regions set review_status = 'unpublished' where id = 'a0000000-0000-0000-0000-000000000001' $$,
  'a member update on review_status runs but matches no row (RLS)'
);
select lives_ok(
  $$ update public.stories set review_status = 'approved' where id = 'b0000000-0000-0000-0000-000000000002' $$,
  'a member update on a draft runs but matches no row (RLS)'
);
select throws_ok(
  $$ select public.review_content('story', 'b0000000-0000-0000-0000-000000000002', 'approve') $$,
  'P0002', null,
  'review_content finds nothing for a member'
);

select tests.as_operator();
select is(
  (select review_status from public.regions where id = 'a0000000-0000-0000-0000-000000000001'),
  'approved',
  'the approved region is unchanged after the member attempt'
);
select is(
  (select review_status from public.stories where id = 'b0000000-0000-0000-0000-000000000002'),
  'draft',
  'the draft story is unchanged after the member attempt'
);

-- Member: user_roles ------------------------------------------------------------
select tests.as_user('33333333-3333-3333-3333-333333333333');

select throws_ok(
  $$ insert into public.user_roles (user_id, role) values ('33333333-3333-3333-3333-333333333333', 'reviewer') $$,
  '42501', null,
  'a member cannot grant themselves a role'
);
select throws_ok(
  $$ insert into public.user_roles (user_id, role) values ('33333333-3333-3333-3333-333333333333', 'owner') $$,
  '42501', null,
  'a member cannot make themselves owner'
);
select throws_ok(
  $$ update public.user_roles set role = 'owner' $$,
  '42501', null,
  'a member cannot update user_roles'
);
select lives_ok(
  $$ delete from public.user_roles where user_id = '44444444-4444-4444-4444-444444444444' $$,
  'a member delete on user_roles matches no row (RLS)'
);

-- Reviewer and service role cannot grant either --------------------------------
select tests.as_user('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ insert into public.user_roles (user_id, role) values ('55555555-5555-5555-5555-555555555555', 'reviewer') $$,
  '42501', null,
  'a reviewer cannot grant roles'
);

select tests.as_service();
select throws_ok(
  $$ insert into public.user_roles (user_id, role) values ('55555555-5555-5555-5555-555555555555', 'reviewer') $$,
  '42501', null,
  'the service role cannot grant roles'
);

select tests.as_operator();
select is(
  (select count(*)::int from public.user_roles),
  2,
  'user_roles is unchanged after the failed attempts'
);

-- Owner -------------------------------------------------------------------------
select tests.as_user('44444444-4444-4444-4444-444444444444');

select lives_ok(
  $$ insert into public.user_roles (user_id, role) values ('55555555-5555-5555-5555-555555555555', 'reviewer') $$,
  'an owner can grant the reviewer role'
);
select lives_ok(
  $$ delete from public.user_roles where user_id = '55555555-5555-5555-5555-555555555555' and role = 'reviewer' $$,
  'an owner can revoke the reviewer role'
);
select throws_ok(
  $$ delete from public.user_roles where user_id = '44444444-4444-4444-4444-444444444444' and role = 'owner' $$,
  '23514', 'cannot remove the last owner',
  'the last owner cannot be removed'
);

select tests.as_operator();
select results_eq(
  $$ select action, actor_id, entity_id, details ->> 'role' from public.audit_log
     where entity = 'user_roles' and actor_id = '44444444-4444-4444-4444-444444444444'
     order by created_at, action $$,
  $$ values
       ('role_grant'::text, '44444444-4444-4444-4444-444444444444'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, 'reviewer'::text),
       ('role_revoke'::text, '44444444-4444-4444-4444-444444444444'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, 'reviewer'::text) $$,
  'FR-13: role grants and revokes are audited with the actor'
);

-- Member data -------------------------------------------------------------------
select tests.as_user('33333333-3333-3333-3333-333333333333');

select lives_ok(
  $$ update public.profiles set username = 'member_renamed' where id = '33333333-3333-3333-3333-333333333333' $$,
  'a member can rename their own profile'
);
select lives_ok(
  $$ update public.profiles set username = 'hijacked' where id = '55555555-5555-5555-5555-555555555555' $$,
  'a member update on another profile matches no row'
);
select throws_ok(
  $$ insert into public.profiles (id, username) values ('55555555-5555-5555-5555-555555555555', 'impostor') $$,
  '42501', null,
  'a member cannot create profiles'
);
select throws_ok(
  $$ insert into public.user_badges (user_id, badge_id)
     select '33333333-3333-3333-3333-333333333333', id from public.badges limit 1 $$,
  '42501', null,
  'a member cannot award themselves a badge'
);
select lives_ok(
  $$ insert into public.user_progress (user_id, story_id, last_chapter_no)
     values ('33333333-3333-3333-3333-333333333333', 'b0000000-0000-0000-0000-000000000001', 1) $$,
  'a member can save progress on an approved story'
);
select throws_ok(
  $$ insert into public.user_progress (user_id, story_id, last_chapter_no)
     values ('33333333-3333-3333-3333-333333333333', 'b0000000-0000-0000-0000-000000000002', 1) $$,
  '42501', null,
  'a member cannot save progress on a draft story'
);
select throws_ok(
  $$ insert into public.user_progress (user_id, story_id, last_chapter_no)
     values ('55555555-5555-5555-5555-555555555555', 'b0000000-0000-0000-0000-000000000001', 1) $$,
  '42501', null,
  'a member cannot write progress for someone else'
);

select tests.as_operator();
select is(
  (select username from public.profiles where id = '55555555-5555-5555-5555-555555555555'),
  'member_n',
  'the other member''s profile is unchanged'
);

select * from finish();
rollback;
