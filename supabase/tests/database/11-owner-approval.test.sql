-- Owner approval (migration part 13): an owner may approve content they last
-- edited; nobody approves what they created; reviewers keep four-eyes.
begin;
select no_plan();

select tests.create_user('11111111-1111-1111-1111-111111111111', 'reviewer_a');
select tests.create_user('22222222-2222-2222-2222-222222222222', 'owner_o');
insert into public.user_roles (user_id, role) values
  ('11111111-1111-1111-1111-111111111111', 'reviewer'),
  ('22222222-2222-2222-2222-222222222222', 'owner');

-- Drafted by the AI Workflow (no auth user), like Claude's research drafts.
select tests.as_service();
insert into public.regions (id, slug, name_id, name_en, summary_id, summary_en) values
  ('a0000000-0000-0000-0000-000000000001', 'draf-ai-1', 'Draf AI', 'AI draft', 'Ringkasan', 'Summary'),
  ('a0000000-0000-0000-0000-000000000002', 'draf-ai-2', 'Draf AI dua', 'AI draft two', 'Ringkasan', 'Summary');

-- The owner corrects a draft, then approves it alone.
select tests.as_user('22222222-2222-2222-2222-222222222222');
update public.regions set summary_en = 'Corrected summary' where id = 'a0000000-0000-0000-0000-000000000001';
select is(
  public.review_content('region', 'a0000000-0000-0000-0000-000000000001', 'approve'),
  'approved',
  'an owner approves a draft they corrected'
);

-- A reviewer who corrects a draft still needs someone else.
select tests.as_user('11111111-1111-1111-1111-111111111111');
update public.regions set summary_en = 'Reviewer edit' where id = 'a0000000-0000-0000-0000-000000000002';
select throws_ok(
  $$ select public.review_content('region', 'a0000000-0000-0000-0000-000000000002', 'approve') $$,
  '42501', 'you cannot approve content you created or last edited',
  'a reviewer cannot approve a draft they last edited'
);

-- Nobody approves what they created, owners included.
select tests.as_user('22222222-2222-2222-2222-222222222222');
insert into public.regions (id, slug, name_id, name_en, summary_id, summary_en)
values ('a0000000-0000-0000-0000-000000000003', 'buatan-owner', 'Buatan', 'Made', 'Ringkasan', 'Summary');
select throws_ok(
  $$ select public.review_content('region', 'a0000000-0000-0000-0000-000000000003', 'approve') $$,
  '42501', 'you cannot approve content you created',
  'an owner cannot approve content they created'
);

-- The AI Workflow still cannot approve anything.
select tests.as_service();
select throws_ok(
  $$ update public.regions set review_status = 'approved' where id = 'a0000000-0000-0000-0000-000000000002' $$,
  '42501', 'only a reviewer or owner can change review_status',
  'the AI Workflow cannot approve its own drafts'
);

select tests.as_operator();
select * from finish();
rollback;
