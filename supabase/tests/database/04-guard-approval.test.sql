-- guard_approval and review_content.
-- Build plan check 6 / PRD check 4: approval from a caller without a reviewer
-- role is rejected, including callers with no auth user (the AI Workflow).
-- PRD check 5: no story approval while a chapter lacks alt text or an audio
-- description. Plus four-eyes review, reasons, locking and the audit trail.
begin;
select no_plan();

-- Fixture ---------------------------------------------------------------------
select tests.create_user('11111111-1111-1111-1111-111111111111', 'reviewer_a');
select tests.create_user('22222222-2222-2222-2222-222222222222', 'reviewer_b');
select tests.create_user('33333333-3333-3333-3333-333333333333', 'member_m');
insert into public.user_roles (user_id, role) values
  ('11111111-1111-1111-1111-111111111111', 'reviewer'),
  ('22222222-2222-2222-2222-222222222222', 'reviewer');

insert into public.regions (id, slug, name_id, name_en, summary_id, summary_en) values
  ('a0000000-0000-0000-0000-000000000001', 'wilayah-satu', 'Satu', 'One', 'Ringkasan', 'Summary'),
  ('a0000000-0000-0000-0000-000000000002', 'wilayah-dua', 'Dua', 'Two', 'Ringkasan', 'Summary'),
  ('a0000000-0000-0000-0000-000000000003', 'wilayah-tiga', 'Tiga', null, 'Ringkasan', 'Summary');
insert into public.sources (id, title) values ('f0000000-0000-0000-0000-000000000001', 'Source');
select tests.review('11111111-1111-1111-1111-111111111111', 'region', 'a0000000-0000-0000-0000-000000000001', 'approve');

-- Inserts always start as drafts ----------------------------------------------
select tests.as_user('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ insert into public.regions (slug, name_id, name_en, review_status) values ('langsung', 'Langsung', 'Direct', 'approved') $$,
  '23514', 'new regions rows must start as draft',
  'a reviewer cannot insert an already approved row'
);

select tests.as_service();
select throws_ok(
  $$ insert into public.stories (region_id, slug, title_id, review_status)
     values ('a0000000-0000-0000-0000-000000000001', 'ai-story', 'AI', 'approved') $$,
  '23514', 'new stories rows must start as draft',
  'the AI Workflow cannot insert an approved row'
);
select lives_ok(
  $$ insert into public.stories (id, region_id, slug, title_id)
     values ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'ai-draft', 'Draf AI') $$,
  'the AI Workflow can insert a draft'
);

-- Callers without a reviewer role cannot approve ------------------------------
select throws_ok(
  $$ update public.regions set review_status = 'approved' where id = 'a0000000-0000-0000-0000-000000000002' $$,
  '42501', 'only a reviewer or owner can change review_status',
  'PRD check 4: the AI Workflow (service role, no auth user) cannot approve'
);
select throws_ok(
  $$ update public.stories set review_status = 'approved' where id = 'b0000000-0000-0000-0000-000000000009' $$,
  '42501', 'only a reviewer or owner can change review_status',
  'the AI Workflow cannot approve its own draft'
);

select tests.as_operator();
select throws_ok(
  $$ update public.regions set review_status = 'approved' where id = 'a0000000-0000-0000-0000-000000000002' $$,
  '42501', 'only a reviewer or owner can change review_status',
  'build plan check 6: a caller with no auth user cannot approve, even as the database owner'
);

select tests.as_anon();
select throws_ok(
  $$ update public.regions set review_status = 'approved' where id = 'a0000000-0000-0000-0000-000000000002' $$,
  '42501', null,
  'a guest cannot update content'
);
select throws_ok(
  $$ select public.review_content('region', 'a0000000-0000-0000-0000-000000000002', 'approve') $$,
  '42501', null,
  'a guest cannot call review_content'
);

select tests.as_user('33333333-3333-3333-3333-333333333333');
select throws_ok(
  $$ select public.review_content('region', 'a0000000-0000-0000-0000-000000000002', 'approve') $$,
  'P0002', null,
  'a member cannot approve (the draft is invisible to them)'
);

select tests.as_operator();
select is(
  (select review_status from public.regions where id = 'a0000000-0000-0000-0000-000000000002'),
  'draft',
  'region two is still a draft after every refused attempt'
);

-- Four-eyes review --------------------------------------------------------------
select tests.as_user('11111111-1111-1111-1111-111111111111');
insert into public.regions (id, slug, name_id, name_en, summary_id, summary_en)
values ('a0000000-0000-0000-0000-000000000004', 'buatan-a', 'Buatan A', 'Made by A', 'Ringkasan', 'Summary');
select throws_ok(
  $$ select public.review_content('region', 'a0000000-0000-0000-0000-000000000004', 'approve') $$,
  '42501', 'you cannot approve content you created or last edited',
  'a reviewer cannot approve content they created'
);

select tests.as_user('22222222-2222-2222-2222-222222222222');
update public.regions set name_en = 'Two (edited by B)' where id = 'a0000000-0000-0000-0000-000000000002';
select throws_ok(
  $$ select public.review_content('region', 'a0000000-0000-0000-0000-000000000002', 'approve') $$,
  '42501', 'you cannot approve content you created or last edited',
  'a reviewer cannot approve content they last edited'
);
select is(
  public.review_content('region', 'a0000000-0000-0000-0000-000000000004', 'approve'),
  'approved',
  'another reviewer can approve it'
);

select tests.as_user('11111111-1111-1111-1111-111111111111');
select is(
  public.review_content('region', 'a0000000-0000-0000-0000-000000000002', 'approve'),
  'approved',
  'a reviewer who did not edit it can approve it'
);

select tests.as_operator();
select is(
  (select created_by from public.regions where id = 'a0000000-0000-0000-0000-000000000004'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'created_by is stamped from the session'
);

-- Bilingual completeness, reasons, transitions --------------------------------
select tests.as_user('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ select public.review_content('region', 'a0000000-0000-0000-0000-000000000003', 'approve') $$,
  '23514', 'cannot approve regions: missing name_en',
  'approval needs both languages'
);
-- Region intros (migration part 8) are visible text too.
select tests.as_operator();
insert into public.regions (id, slug, name_id, name_en, summary_id)
values ('a0000000-0000-0000-0000-000000000005', 'tanpa-ringkasan', 'Tanpa', 'Without', 'Ringkasan saja');
select tests.as_user('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ select public.review_content('region', 'a0000000-0000-0000-0000-000000000005', 'approve') $$,
  '23514', 'cannot approve regions: missing summary_en',
  'a region needs its intro in both languages'
);
select throws_ok(
  $$ update public.regions set province_codes = array['ID-XX'] where id = 'a0000000-0000-0000-0000-000000000005' $$,
  '23514', null,
  'only real ISO 3166-2:ID province codes are accepted'
);
select lives_ok(
  $$ update public.regions set province_codes = array['ID-SB', 'ID-PD'] where id = 'a0000000-0000-0000-0000-000000000005' $$,
  'current province codes, including the 2022 Papua provinces, are accepted'
);

select throws_ok(
  $$ select public.review_content('region', 'a0000000-0000-0000-0000-000000000003', 'reject') $$,
  '23514', 'a reason is required to reject',
  'reject needs a reason'
);
select throws_ok(
  $$ select public.review_content('region', 'a0000000-0000-0000-0000-000000000003', 'reject', '   ') $$,
  '23514', 'a reason is required to reject',
  'a blank reason does not count'
);
select is(
  public.review_content('region', 'a0000000-0000-0000-0000-000000000003', 'reject', 'Needs the English name'),
  'rejected',
  'reject with a reason works'
);
select throws_ok(
  $$ select public.review_content('region', 'a0000000-0000-0000-0000-000000000003', 'unpublish', 'x') $$,
  '23514', 'only approved content can be unpublished',
  'only approved content can be unpublished'
);
select throws_ok(
  $$ select public.review_content('region', 'a0000000-0000-0000-0000-000000000001', 'approve') $$,
  '23514', 'content is already approved',
  'approving twice is refused'
);
select throws_ok(
  $$ select public.review_content('region', 'a0000000-0000-0000-0000-000000000001', 'publish') $$,
  '22023', 'unknown review action',
  'unknown actions are refused'
);
select throws_ok(
  $$ select public.review_content('regions; drop table x', 'a0000000-0000-0000-0000-000000000001', 'approve') $$,
  '22023', 'unknown content type',
  'unknown content types are refused'
);

-- Editing a rejected row resubmits it as a draft.
select tests.as_user('22222222-2222-2222-2222-222222222222');
update public.regions set name_en = 'Three' where id = 'a0000000-0000-0000-0000-000000000003';
select tests.as_operator();
select is(
  (select review_status from public.regions where id = 'a0000000-0000-0000-0000-000000000003'),
  'draft',
  'editing a rejected row sends it back to draft'
);

-- Approved rows are locked.
select tests.as_user('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ update public.regions set name_en = 'Changed' where id = 'a0000000-0000-0000-0000-000000000001' $$,
  '23514', 'approved regions rows are locked; unpublish before editing',
  'approved content cannot be edited'
);
select throws_ok(
  $$ select public.review_content('region', 'a0000000-0000-0000-0000-000000000001', 'unpublish') $$,
  '23514', 'a reason is required to unpublish',
  'unpublish needs a reason'
);
select is(
  public.review_content('region', 'a0000000-0000-0000-0000-000000000001', 'unpublish', 'Checking the source again'),
  'unpublished',
  'unpublish with a reason works'
);
select is(
  public.review_content('region', 'a0000000-0000-0000-0000-000000000001', 'approve'),
  'approved',
  'unpublished content can be approved again'
);

-- The AI Workflow may only edit drafts.
select tests.as_service();
select throws_ok(
  $$ update public.regions set name_en = 'AI edit' where id = 'a0000000-0000-0000-0000-000000000001' $$,
  '23514', null,
  'the AI Workflow cannot edit approved content'
);

-- Stories: PRD check 5 ------------------------------------------------------------
select tests.as_operator();
insert into public.stories (id, region_id, slug, title_id, title_en, summary_id, summary_en) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'kisah', 'Kisah', 'Story', 'Ringkasan', 'Summary');
insert into public.story_chapters (id, story_id, chapter_no, text_id, text_en,
  audio_description_id, audio_description_en, image_alt_id, image_alt_en) values
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 1,
   'Teks', 'Text', 'Deskripsi audio', 'Audio description', 'Teks alternatif', 'Alt text'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 2,
   'Teks', 'Text', 'Deskripsi audio', 'Audio description', null, 'Alt text only in English');
insert into public.content_sources (content_type, content_id, source_id) values
  ('story', 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001');

select tests.as_user('11111111-1111-1111-1111-111111111111');
select is(
  public.review_content('chapter', 'c0000000-0000-0000-0000-000000000001', 'approve'),
  'approved',
  'a complete chapter can be approved'
);
select throws_ok(
  $$ select public.review_content('chapter', 'c0000000-0000-0000-0000-000000000002', 'approve') $$,
  '23514', 'cannot approve story_chapters: missing image_alt_id',
  'a chapter without alt text cannot be approved'
);
select throws_ok(
  $$ select public.review_content('story', 'b0000000-0000-0000-0000-000000000001', 'approve') $$,
  '23514', 'cannot approve story: every chapter needs alt text and an audio description',
  'PRD check 5: a story cannot be approved while a chapter lacks alt text'
);

update public.story_chapters set image_alt_id = 'Teks alternatif'
where id = 'c0000000-0000-0000-0000-000000000002';
update public.story_chapters set audio_description_en = ' '
where id = 'c0000000-0000-0000-0000-000000000002';
select throws_ok(
  $$ select public.review_content('story', 'b0000000-0000-0000-0000-000000000001', 'approve') $$,
  '23514', 'cannot approve story: every chapter needs alt text and an audio description',
  'PRD check 5: a story cannot be approved while a chapter lacks an audio description'
);

update public.story_chapters set audio_description_en = 'Audio description'
where id = 'c0000000-0000-0000-0000-000000000002';
select throws_ok(
  $$ select public.review_content('story', 'b0000000-0000-0000-0000-000000000001', 'approve') $$,
  '23514', 'cannot approve story: approve every chapter first',
  'a story needs every chapter approved first'
);

-- A edited chapter 2, so reviewer B approves it; then the story can go live.
select tests.as_user('22222222-2222-2222-2222-222222222222');
select is(
  public.review_content('chapter', 'c0000000-0000-0000-0000-000000000002', 'approve'),
  'approved',
  'another reviewer approves the fixed chapter'
);
select is(
  public.review_content('story', 'b0000000-0000-0000-0000-000000000001', 'approve'),
  'approved',
  'a complete, sourced story with approved chapters can be approved'
);

-- Recipes: sources, languages, halal, locked children -----------------------------
select tests.as_operator();
insert into public.recipes (id, region_id, slug, name_id, name_en, servings, minutes, halal_status) values
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'resep', 'Resep', 'Recipe', 4, 30, 'verified_by_source');
insert into public.recipe_ingredients (recipe_id, position, name_id, name_en) values
  ('d0000000-0000-0000-0000-000000000001', 1, 'Garam', 'Salt');
insert into public.recipe_steps (recipe_id, step_no, text_id, text_en) values
  ('d0000000-0000-0000-0000-000000000001', 1, null, 'Stir');

select tests.as_user('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ select public.review_content('recipe', 'd0000000-0000-0000-0000-000000000001', 'approve') $$,
  '23514', 'cannot approve recipe: every ingredient and step needs both languages',
  'a recipe step without Indonesian text blocks approval'
);

select tests.as_operator();
update public.recipe_steps set text_id = 'Aduk' where recipe_id = 'd0000000-0000-0000-0000-000000000001';

select tests.as_user('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ select public.review_content('recipe', 'd0000000-0000-0000-0000-000000000001', 'approve') $$,
  '23514', 'cannot approve recipes: cite at least one source',
  'a recipe marked verified_by_source halal cannot be published without a cited source'
);

select tests.as_operator();
insert into public.content_sources (content_type, content_id, source_id) values
  ('recipe', 'd0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001');

select tests.as_user('11111111-1111-1111-1111-111111111111');
select is(
  public.review_content('recipe', 'd0000000-0000-0000-0000-000000000001', 'approve'),
  'approved',
  'a complete, sourced recipe can be approved'
);
select throws_ok(
  $$ insert into public.recipe_ingredients (recipe_id, position, name_id, name_en)
     values ('d0000000-0000-0000-0000-000000000001', 2, 'Gula', 'Sugar') $$,
  '23514', 'the recipe is approved and locked; unpublish it before editing',
  'ingredients of an approved recipe are locked'
);
select throws_ok(
  $$ delete from public.content_sources where content_id = 'd0000000-0000-0000-0000-000000000001' $$,
  '23514', null,
  'sources of approved content cannot be unlinked'
);
select throws_ok(
  $$ update public.sources set title = 'Rewritten' where id = 'f0000000-0000-0000-0000-000000000001' $$,
  '23514', 'this source is cited by approved content and is locked',
  'a source cited by approved content is locked'
);

-- Audit trail (FR-13) -------------------------------------------------------------
select tests.as_operator();
select is(
  (select reason from public.audit_log
   where entity = 'regions' and entity_id = 'a0000000-0000-0000-0000-000000000003' and action = 'reject'),
  'Needs the English name',
  'a rejection is audited with its reason'
);
select is(
  (select actor_id from public.audit_log
   where entity = 'regions' and entity_id = 'a0000000-0000-0000-0000-000000000001' and action = 'unpublish'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'an unpublish is audited with its actor'
);
select ok(
  exists (select 1 from public.audit_log
          where entity = 'regions' and entity_id = 'a0000000-0000-0000-0000-000000000003'
            and action = 'revert_to_draft'),
  'an automatic return to draft is audited'
);
select is(
  (select count(*)::int from public.audit_log where action = 'approve' and entity = 'story_chapters'),
  2,
  'every chapter approval is audited'
);

select * from finish();
rollback;
