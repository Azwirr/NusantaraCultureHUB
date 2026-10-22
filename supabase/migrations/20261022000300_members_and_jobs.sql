-- Phase 1 foundation, part 3: badges, member progress and AI job records.

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9_]{3,48}$'),
  name_id text not null check (char_length(name_id) <= 120),
  name_en text not null check (char_length(name_en) <= 120),
  description_id text check (char_length(description_id) <= 500),
  description_en text check (char_length(description_en) <= 500),
  -- Key of the server-side rule that awards the badge (FR-10, Phase 2).
  rule_key text not null check (rule_key ~ '^[a-z0-9_]{3,48}$'),
  created_at timestamptz not null default now()
);
comment on table public.badges is 'Badge definitions. Reference data, not reviewable content.';

create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete restrict,
  earned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, badge_id)
);
comment on table public.user_badges is 'Badges earned by members. Awarded by the server, never by the client.';

create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  story_id uuid not null references public.stories (id) on delete cascade,
  last_chapter_no integer not null default 0 check (last_chapter_no between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, story_id)
);

create table public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null check (job_type in ('chapter_draft', 'image_prompt', 'image', 'tts_audio')),
  target_type text not null check (target_type in ('region', 'story', 'story_chapter', 'recipe', 'costume')),
  target_id uuid not null,
  -- sha256 of the normalised input. One job per (type, input) is the cache:
  -- an identical request reuses the stored output instead of calling again.
  input_hash text not null check (input_hash ~ '^[0-9a-f]{64}$'),
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed')),
  output jsonb,
  error text check (char_length(error) <= 2000),
  model text check (char_length(model) <= 120),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_type, input_hash)
);
create index ai_jobs_target_idx on public.ai_jobs (target_type, target_id);

-- ---------------------------------------------------------------------------
-- updated_at stamping for tables without guard_approval
-- ---------------------------------------------------------------------------

create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger touch_updated_at before update on public.user_progress
  for each row execute function private.touch_updated_at();
create trigger touch_updated_at before update on public.ai_jobs
  for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS and grants
-- ---------------------------------------------------------------------------

alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.user_progress enable row level security;
alter table public.ai_jobs enable row level security;

revoke all on table public.badges, public.user_badges, public.user_progress, public.ai_jobs
  from anon, authenticated, service_role;

-- Badge definitions are reference data, shown to everyone. Only migrations
-- and the seed write them.
grant select on table public.badges to anon, authenticated, service_role;
create policy "badges: everyone reads definitions"
  on public.badges for select to anon, authenticated
  using (true);

-- Members read their own badges. Awarding happens server-side in Phase 2, so
-- members get no write access (otherwise they could award themselves).
grant select on table public.user_badges to authenticated;
grant select, insert on table public.user_badges to service_role;
create policy "user_badges: read own"
  on public.user_badges for select to authenticated
  using (user_id = (select auth.uid()));

-- Members keep their own progress, and only for stories that are public.
grant select, insert, update, delete on table public.user_progress to authenticated;
create policy "user_progress: read own"
  on public.user_progress for select to authenticated
  using (user_id = (select auth.uid()));
create policy "user_progress: insert own for approved stories"
  on public.user_progress for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.stories s where s.id = story_id and s.review_status = 'approved')
  );
create policy "user_progress: update own"
  on public.user_progress for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.stories s where s.id = story_id and s.review_status = 'approved')
  );
create policy "user_progress: delete own"
  on public.user_progress for delete to authenticated
  using (user_id = (select auth.uid()));

-- AI jobs run on the server only (service role). Staff can read their status.
grant select on table public.ai_jobs to authenticated;
grant select, insert, update on table public.ai_jobs to service_role;
create policy "ai_jobs: staff read"
  on public.ai_jobs for select to authenticated
  using ((select private.is_staff()));
