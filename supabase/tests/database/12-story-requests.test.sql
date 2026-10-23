-- Story requests (migration part 14): members ask, staff set the status,
-- everyone sees visible requests with nicknames only.
begin;
select no_plan();

select tests.create_user('11111111-1111-1111-1111-111111111111', 'reviewer_a');
select tests.create_user('33333333-3333-3333-3333-333333333333', 'member_m');
select tests.create_user('44444444-4444-4444-4444-444444444444', 'member_n');
insert into public.user_roles (user_id, role) values ('11111111-1111-1111-1111-111111111111', 'reviewer');

-- Asking -------------------------------------------------------------------------
select tests.as_user('33333333-3333-3333-3333-333333333333');
select lives_ok(
  $$ insert into public.story_requests (title, note) values ('  Legenda   Danau Toba ', '  Dari Sumatera Utara  ') $$,
  'a member asks for a story'
);
select results_eq(
  $$ select title || '|' || note || '|' || status from public.story_requests $$,
  array['Legenda Danau Toba|Dari Sumatera Utara|open'],
  'the text is tidied and the request starts open'
);
select throws_ok(
  $$ insert into public.story_requests (title) values ('ab') $$,
  '23514', null,
  'a title needs at least 3 characters'
);
select throws_ok(
  $$ insert into public.story_requests (title, status) values ('Sudah direncanakan', 'planned') $$,
  '42501', null,
  'a member cannot choose the status'
);
select throws_ok(
  $$ insert into public.story_requests (user_id, title)
     values ('44444444-4444-4444-4444-444444444444', 'Atas nama orang lain') $$,
  '42501', null,
  'a member cannot post for someone else'
);
select throws_ok(
  $$ update public.story_requests set title = 'Diubah' $$,
  '42501', null,
  'a request cannot be edited after posting'
);
update public.story_requests set status = 'done';
select is(
  (select status from public.story_requests limit 1),
  'open',
  'a member cannot change the status (RLS updates no rows)'
);

-- The daily limit.
insert into public.story_requests (title) values ('Dua'), ('Tiga cerita'), ('Empat cerita'), ('Lima cerita');
select throws_ok(
  $$ insert into public.story_requests (title) values ('Enam cerita') $$,
  '54000', 'daily request limit reached',
  'at most 5 requests a day'
);

-- Reading --------------------------------------------------------------------------
select tests.as_user('44444444-4444-4444-4444-444444444444');
select is_empty('select 1 from public.story_requests', 'a member cannot read other members'' rows directly');
select is(
  (select nickname from public.story_requests_list() where title = 'Legenda Danau Toba'),
  'member_m',
  'the public list shows the nickname'
);

select tests.as_anon();
select is(
  (select count(*)::int from public.story_requests_list()),
  5,
  'guests see the visible requests'
);
select throws_ok('select * from public.story_requests', '42501', null, 'guests cannot read the table');
select throws_ok(
  $$ insert into public.story_requests (title) values ('Tamu') $$,
  '42501', null,
  'guests cannot ask'
);

-- Staff set the status ---------------------------------------------------------
select tests.as_user('11111111-1111-1111-1111-111111111111');
update public.story_requests set status = 'hidden' where title = 'Dua';
update public.story_requests set status = 'planned' where title = 'Legenda Danau Toba';
select tests.as_anon();
select is(
  (select count(*)::int from public.story_requests_list()),
  4,
  'hidden requests leave the public list'
);
select is(
  (select title from public.story_requests_list() limit 1),
  'Legenda Danau Toba',
  'planned requests come first'
);
select is(
  (select array_agg(column_name::text order by column_name) from information_schema.columns
   where table_schema = 'public' and table_name = 'story_requests_list'),
  null,
  'there is no public view that could expose member ids'
);

select tests.as_operator();
select * from finish();
rollback;
