-- Ceremonies (adat, migration 20261025001800): the same review rules as every
-- other content type, plus the AI Workflow publish path and search.
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
  ('a3000000-0000-0000-0000-000000000001', 'wilayah-adat', 'Wilayah adat', 'Ceremony region', 'Ringkasan', 'Summary'),
  ('a3000000-0000-0000-0000-000000000002', 'wilayah-draf', 'Wilayah draf', 'Draft region', 'Ringkasan', 'Summary');
insert into public.sources (id, title, url) values
  ('e3000000-0000-0000-0000-000000000001', 'Kompas', 'https://www.kompas.com/adat/1'),
  ('e3000000-0000-0000-0000-000000000002', 'detik', 'https://www.detik.com/adat/2'),
  ('e3000000-0000-0000-0000-000000000003', 'Kompas lagi', 'https://regional.kompas.com/adat/3');

-- Reviewer A drafts a ceremony (so A cannot approve it).
select tests.as_user('11111111-1111-1111-1111-111111111111');
insert into public.ceremonies (id, region_id, slug, name_id, name_en, summary_id, summary_en, body_id, body_en) values
  ('c3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000001', 'upacara-kasadauji',
   'Upacara Kasadauji', 'Kasadauji Ceremony', 'Ringkasan', 'Summary', 'Teks', 'Text');
select tests.as_operator();

-- Drafts stay hidden from guests --------------------------------------------
select tests.as_anon();
select is_empty(
  'select 1 from public.ceremonies',
  'a guest sees no draft ceremony'
);
select tests.as_operator();

-- The ceremony cannot be approved while its region is a draft ---------------
select tests.as_user('22222222-2222-2222-2222-222222222222');
select throws_ok(
  $$ update public.ceremonies set review_status = 'approved' where id = 'c3000000-0000-0000-0000-000000000001' $$,
  '23514', null,
  'approval needs the region to be approved first'
);
select tests.as_operator();

-- A region approved by reviewer B ---------------------------------------------
select tests.review('22222222-2222-2222-2222-222222222222', 'region', 'a3000000-0000-0000-0000-000000000001', 'approve');

-- Approval needs a cited source -----------------------------------------------
select tests.as_user('22222222-2222-2222-2222-222222222222');
select throws_ok(
  $$ update public.ceremonies set review_status = 'approved' where id = 'c3000000-0000-0000-0000-000000000001' $$,
  '23514', null,
  'approval needs at least one cited source'
);
select tests.as_operator();

insert into public.content_sources (content_type, content_id, source_id) values
  ('ceremony', 'c3000000-0000-0000-0000-000000000001', 'e3000000-0000-0000-0000-000000000001');

-- Four-eyes: the creator cannot approve ---------------------------------------
select tests.as_user('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ update public.ceremonies set review_status = 'approved' where id = 'c3000000-0000-0000-0000-000000000001' $$,
  '42501', null,
  'a reviewer cannot approve a ceremony they created'
);
select tests.as_operator();

-- A member cannot approve ------------------------------------------------------
-- RLS hides the row from a member, so the update changes nothing.
select tests.as_user('33333333-3333-3333-3333-333333333333');
update public.ceremonies set review_status = 'approved' where id = 'c3000000-0000-0000-0000-000000000001';
select tests.as_operator();
select is(
  (select review_status from public.ceremonies where id = 'c3000000-0000-0000-0000-000000000001'),
  'draft',
  'a member cannot approve a ceremony'
);

-- Approval by another reviewer, then guests see it ----------------------------
select lives_ok(
  $$ select tests.review('22222222-2222-2222-2222-222222222222', 'ceremony', 'c3000000-0000-0000-0000-000000000001', 'approve') $$,
  'another reviewer approves the ceremony'
);
select tests.as_anon();
select isnt_empty(
  $$ select 1 from public.ceremonies where slug = 'upacara-kasadauji' $$,
  'a guest sees an approved ceremony'
);
select tests.as_operator();

-- Timing is optional; both languages of the text are not ----------------------
insert into public.ceremonies (id, region_id, slug, name_id, name_en, summary_id, summary_en, body_id, body_en) values
  ('c3000000-0000-0000-0000-000000000002', 'a3000000-0000-0000-0000-000000000001', 'tanpa-inggris',
   'Tanpa Inggris', null, 'Ringkasan', 'Summary', 'Teks', 'Text');
insert into public.content_sources (content_type, content_id, source_id) values
  ('ceremony', 'c3000000-0000-0000-0000-000000000002', 'e3000000-0000-0000-0000-000000000001');
select tests.as_user('22222222-2222-2222-2222-222222222222');
select throws_ok(
  $$ update public.ceremonies set review_status = 'approved' where id = 'c3000000-0000-0000-0000-000000000002' $$,
  '23514', null,
  'approval needs the English name'
);
select tests.as_operator();

-- Approved ceremonies are locked ----------------------------------------------
select tests.as_user('22222222-2222-2222-2222-222222222222');
select throws_ok(
  $$ update public.ceremonies set summary_id = 'Diubah' where id = 'c3000000-0000-0000-0000-000000000001' $$,
  '23514', null,
  'an approved ceremony is locked until it is unpublished'
);
select tests.as_operator();

-- The review trail names the reviewer -----------------------------------------
select is(
  (select count(*)::int from public.audit_log
   where entity = 'ceremonies' and entity_id = 'c3000000-0000-0000-0000-000000000001' and action = 'approve'),
  1,
  'the approval is written to the audit log'
);

-- Search: approved ceremonies only --------------------------------------------
insert into public.ceremonies (id, region_id, slug, name_id, name_en, summary_id, summary_en, body_id, body_en) values
  ('c3000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000001', 'draf-kasadauji',
   'Draf Kasadauji', 'Draft Kasadauji', 'Ringkasan', 'Summary', 'Teks', 'Text');
select tests.as_anon();
select is(
  (select count(*)::int from public.search_content('Kasadauji', 'id', 20) where content_type = 'ceremony'),
  1,
  'search returns the approved ceremony and never the draft'
);
select tests.as_operator();

-- The AI Workflow publishes with 2 different websites -------------------------
insert into public.content_sources (content_type, content_id, source_id) values
  ('ceremony', 'c3000000-0000-0000-0000-000000000003', 'e3000000-0000-0000-0000-000000000001'),
  ('ceremony', 'c3000000-0000-0000-0000-000000000003', 'e3000000-0000-0000-0000-000000000003');
select tests.as_service();
select throws_ok(
  $$ select private.ai_publish('ceremony', 'c3000000-0000-0000-0000-000000000003', 'dua sumber, satu situs') $$,
  '23514', null,
  'the AI Workflow needs 2 different websites for a ceremony'
);
select tests.as_operator();

insert into public.content_sources (content_type, content_id, source_id) values
  ('ceremony', 'c3000000-0000-0000-0000-000000000003', 'e3000000-0000-0000-0000-000000000002');
select tests.as_service();
select is(
  private.ai_publish('ceremony', 'c3000000-0000-0000-0000-000000000003', 'Kompas dan detik diperiksa'),
  'approved',
  'the AI Workflow publishes a ceremony that cites 2 websites'
);
select tests.as_operator();

-- Nobody can delete a ceremony ------------------------------------------------
select ok(
  not has_table_privilege('anon', 'public.ceremonies', 'delete')
  and not has_table_privilege('authenticated', 'public.ceremonies', 'delete')
  and not has_table_privilege('service_role', 'public.ceremonies', 'delete'),
  'no API role can delete a ceremony'
);

select ok(
  exists (
    select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid
    where c.relname = 'ceremonies' and t.tgname = 'guard_approval' and not t.tgisinternal
  ),
  'guard_approval is attached to ceremonies'
);

select * from finish();
rollback;
