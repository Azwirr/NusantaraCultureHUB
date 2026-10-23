-- Phase 2, part 10: daily question quota for the grounded assistant
-- "Tanya Nusantara" (FR-15).
--
-- * One counter per member per day (Asia/Jakarta). No question text, answer
--   or other content is stored: only how many questions were asked.
-- * Members can read their own counter. Nobody writes it directly: the only
--   way to count a question is consume_assistant_question(), which takes the
--   member from the session and refuses once the daily limit is reached.
-- * The limit is fixed here (private.assistant_daily_limit), never passed in
--   by the caller.

create table public.assistant_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null,
  question_count integer not null default 0 check (question_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);
comment on table public.assistant_usage is
  'Questions asked per member per day. Counts only; no question text is stored.';

alter table public.assistant_usage enable row level security;

revoke all on table public.assistant_usage from anon, authenticated, service_role;
grant select on table public.assistant_usage to authenticated;

create policy "assistant_usage: read own"
  on public.assistant_usage for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Quota functions
-- ---------------------------------------------------------------------------

create function private.assistant_daily_limit()
returns integer
language sql
immutable
set search_path = ''
as $$
  select 20;
$$;

create function private.assistant_today()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'Asia/Jakarta')::date;
$$;

revoke all on function private.assistant_daily_limit(), private.assistant_today() from public;
grant execute on function private.assistant_daily_limit(), private.assistant_today()
  to authenticated, service_role;

-- Counts one question for the signed-in member. Returns allowed = false (and
-- counts nothing) once today's limit is reached. SECURITY DEFINER because
-- members cannot write the table; the member id comes only from auth.uid().
-- It lives in the private schema like every definer function; the public
-- wrapper below is what the API exposes.
create function private.consume_assistant_question()
returns table (allowed boolean, remaining integer, daily_limit integer)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_limit integer := private.assistant_daily_limit();
  v_count integer;
begin
  if v_uid is null then
    raise exception 'sign in to ask Tanya Nusantara' using errcode = '42501';
  end if;

  -- One statement, so two questions sent at the same moment cannot both
  -- slip past the limit.
  insert into public.assistant_usage as u (user_id, usage_date, question_count)
  values (v_uid, private.assistant_today(), 1)
  on conflict (user_id, usage_date) do update
    set question_count = u.question_count + 1, updated_at = now()
    where u.question_count < v_limit
  returning u.question_count into v_count;

  if v_count is null then
    return query select false, 0, v_limit;
  else
    return query select true, v_limit - v_count, v_limit;
  end if;
end;
$$;

revoke all on function private.consume_assistant_question() from public;
grant execute on function private.consume_assistant_question() to authenticated;

create function public.consume_assistant_question()
returns table (allowed boolean, remaining integer, daily_limit integer)
language sql
volatile
security invoker
set search_path = ''
as $$
  select * from private.consume_assistant_question();
$$;

-- Today's numbers for the signed-in member, without counting anything.
create function public.assistant_quota()
returns table (used integer, remaining integer, daily_limit integer)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    coalesce(u.question_count, 0),
    greatest(private.assistant_daily_limit() - coalesce(u.question_count, 0), 0),
    private.assistant_daily_limit()
  from (select 1) one
  left join public.assistant_usage u
    on u.user_id = (select auth.uid()) and u.usage_date = private.assistant_today();
$$;

revoke all on function public.consume_assistant_question(), public.assistant_quota() from public, anon;
grant execute on function public.consume_assistant_question(), public.assistant_quota() to authenticated;
