-- Assistant quota (migration part 10): a daily count per member, consumed
-- only through consume_assistant_question(), with no question text stored.
begin;
select no_plan();

select tests.create_user('33333333-3333-3333-3333-333333333333', 'member_m');
select tests.create_user('44444444-4444-4444-4444-444444444444', 'member_n');

-- Who may ask -------------------------------------------------------------------
select tests.as_anon();
select throws_ok(
  'select * from public.consume_assistant_question()',
  '42501', null,
  'a guest cannot use the assistant quota'
);

select tests.as_service();
select throws_ok(
  'select * from public.consume_assistant_question()',
  '42501', null,
  'the service role (no auth user) cannot consume a question'
);

-- Counting ------------------------------------------------------------------------
select tests.as_user('33333333-3333-3333-3333-333333333333');
select is(
  (select row(used, remaining, daily_limit)::text from public.assistant_quota()),
  '(0,20,20)',
  'a new member has the full daily quota'
);
select is(
  (select row(allowed, remaining)::text from public.consume_assistant_question()),
  '(t,19)',
  'the first question is allowed and counted'
);
select is(
  (select used from public.assistant_quota()),
  1,
  'the quota reports one question used'
);

-- Use up the rest of today's questions.
select is(
  -- A function in the select list runs once per row.
  (select count(*) filter (where allowed)::int
   from (select (public.consume_assistant_question()).allowed from generate_series(1, 19)) asked),
  19,
  'questions are allowed up to the daily limit'
);
select is(
  (select row(allowed, remaining)::text from public.consume_assistant_question()),
  '(f,0)',
  'the question over the limit is refused'
);
select is(
  (select question_count from public.assistant_usage),
  20,
  'a refused question is not counted'
);

-- Members are independent.
select tests.as_user('44444444-4444-4444-4444-444444444444');
select is(
  (select allowed from public.consume_assistant_question()),
  true,
  'another member still has their own quota'
);
select is(
  (select count(*)::int from public.assistant_usage),
  1,
  'a member reads only their own counter'
);

-- Members cannot change counters -------------------------------------------------
select tests.as_user('33333333-3333-3333-3333-333333333333');
select throws_ok(
  $$ update public.assistant_usage set question_count = 0 $$,
  '42501', null,
  'a member cannot reset their counter'
);
select throws_ok(
  $$ delete from public.assistant_usage $$,
  '42501', null,
  'a member cannot delete their counter'
);
select throws_ok(
  $$ insert into public.assistant_usage (user_id, usage_date, question_count)
     values ('33333333-3333-3333-3333-333333333333', current_date + 1, 0) $$,
  '42501', null,
  'a member cannot insert a counter'
);

-- A new day starts a new count ----------------------------------------------------
select tests.as_operator();
update public.assistant_usage set usage_date = usage_date - 1
where user_id = '33333333-3333-3333-3333-333333333333';
select tests.as_user('33333333-3333-3333-3333-333333333333');
select is(
  (select row(allowed, remaining)::text from public.consume_assistant_question()),
  '(t,19)',
  'the quota resets the next day'
);

-- Privacy -----------------------------------------------------------------------
select tests.as_operator();
select is(
  (select array_agg(column_name::text order by column_name) from information_schema.columns
   where table_schema = 'public' and table_name = 'assistant_usage'),
  array['created_at', 'question_count', 'updated_at', 'usage_date', 'user_id'],
  'only counts are stored, never question text'
);

select * from finish();
rollback;
