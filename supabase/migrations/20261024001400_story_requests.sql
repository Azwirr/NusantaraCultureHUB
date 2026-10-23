-- Phase 2b, part 14: story requests.
--
-- Members cannot write content (they read, listen and save). To ask for a new
-- story, recipe or dress they post a short request. Requests are suggestions,
-- not content: they never reach the library, and staff decide what to research.
--
-- * A member adds their own requests, at most 5 per day (Asia/Jakarta).
-- * Everyone reads requests that are not hidden, through story_requests_list()
--   below. Only the requester's nickname is shown, never the member id.
-- * Staff change the status (open, planned, done, hidden). Nobody edits the
--   text after posting, and nobody deletes a request.

create table public.story_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 3 and 120),
  note text check (char_length(note) <= 500),
  status text not null default 'open' check (status in ('open', 'planned', 'done', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.story_requests is
  'Members ask for new content. Suggestions only; staff set the status.';
create index story_requests_recent_idx on public.story_requests (created_at desc);
create index story_requests_user_idx on public.story_requests (user_id, created_at desc);

alter table public.story_requests enable row level security;

revoke all on table public.story_requests from anon, authenticated, service_role;
-- Members choose only the text; staff change only the status.
grant insert (title, note) on table public.story_requests to authenticated;
grant update (status) on table public.story_requests to authenticated;
grant select on table public.story_requests to authenticated;

create policy "story_requests: members add their own"
  on public.story_requests for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'open');

create policy "story_requests: read own and staff read all"
  on public.story_requests for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_staff()));

create policy "story_requests: staff set status"
  on public.story_requests for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

-- Stamps updated_at and enforces the daily limit for members.
create function private.guard_story_requests()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.title := btrim(regexp_replace(new.title, '\s+', ' ', 'g'));
    new.note := nullif(btrim(new.note), '');
    if (
      select count(*) from public.story_requests
      where user_id = new.user_id
        and (created_at at time zone 'Asia/Jakarta')::date = private.assistant_today()
    ) >= 5 then
      raise exception 'daily request limit reached' using errcode = '54000';
    end if;
  else
    new.updated_at := now();
  end if;
  return new;
end;
$$;
revoke all on function private.guard_story_requests() from public;

create trigger guard_story_requests
  before insert or update on public.story_requests
  for each row execute function private.guard_story_requests();

-- The public list: visible requests with the nickname only, never the
-- member id. Definer function in the private schema (it reads profiles),
-- exposed through an invoker wrapper, like every definer function here.
create function private.list_story_requests(p_limit integer)
returns table (id uuid, title text, note text, status text, created_at timestamptz, nickname text)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.title, r.note, r.status, r.created_at, p.username
  from public.story_requests r
  left join public.profiles p on p.id = r.user_id
  where r.status <> 'hidden'
  order by (r.status = 'planned') desc, r.created_at desc
  limit least(greatest(coalesce(p_limit, 50), 1), 200);
$$;

revoke all on function private.list_story_requests(integer) from public;
grant execute on function private.list_story_requests(integer) to anon, authenticated;

create function public.story_requests_list(p_limit integer default 50)
returns table (id uuid, title text, note text, status text, created_at timestamptz, nickname text)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.list_story_requests(p_limit);
$$;

revoke all on function public.story_requests_list(integer) from public;
grant execute on function public.story_requests_list(integer) to anon, authenticated;
