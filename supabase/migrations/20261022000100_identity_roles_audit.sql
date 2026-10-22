-- Phase 1 foundation, part 1: identity, roles and the audit log.
--
-- Security model (CLAUDE.md, PRD section 3):
-- * Roles live only in public.user_roles. Only an owner can write it; a
--   database operator (postgres, no JWT) may bootstrap the first owner.
-- * Every table enables RLS in this same migration.
-- * Grants are explicit. Each table first revokes everything from the API
--   roles, so behaviour is identical whether or not the project auto-exposes
--   new tables.

-- Helpers live in a schema the Data API does not expose, so they cannot be
-- called as RPC. They only ever look at auth.uid(), never a caller-chosen id.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Nickname only. No real names or emails are stored here (PRD privacy).
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  created_at timestamptz not null default now()
);
comment on table public.profiles is 'Member nickname, one row per auth user. Created by private.handle_new_user.';

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('reviewer', 'owner')),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
comment on table public.user_roles is 'The only source of reviewer and owner grants. Written by owners only.';

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  actor_type text not null check (actor_type in ('user', 'ai_workflow', 'system')),
  action text not null check (
    action in ('approve', 'reject', 'unpublish', 'revert_to_draft', 'role_grant', 'role_revoke')
  ),
  entity text not null,
  entity_id uuid not null,
  reason text check (reason is null or char_length(reason) <= 1000),
  -- Extra context, e.g. {"role": "reviewer"} for role changes.
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default now()
);
comment on table public.audit_log is 'Append-only record of review and role actions. Written only by triggers.';
create index audit_log_entity_idx on public.audit_log (entity, entity_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Role helpers (used by RLS policies and triggers)
-- ---------------------------------------------------------------------------

create function private.has_role(p_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = p_role
  );
$$;

create function private.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role('owner');
$$;

-- Reviewers and owners may read drafts and change review status
-- (build plan: guard_approval allows "reviewer or owner").
create function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role in ('reviewer', 'owner')
  );
$$;

revoke all on function private.has_role(text), private.is_owner(), private.is_staff() from public;
grant execute on function private.has_role(text), private.is_owner(), private.is_staff()
  to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- New users get a profile with their chosen nickname
-- ---------------------------------------------------------------------------

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text := lower(coalesce(new.raw_user_meta_data ->> 'username', ''));
  candidate text;
begin
  if base !~ '^[a-z0-9_]{3,24}$' then
    base := 'anggota';
  end if;
  candidate := base;
  -- Nicknames are unique. On a clash, keep the name and add a short suffix.
  loop
    insert into public.profiles (id, username)
    values (new.id, candidate)
    on conflict (username) do nothing;
    exit when found;
    candidate := left(base, 19) || '_' || substr(md5(gen_random_uuid()::text), 1, 4);
  end loop;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- user_roles guard and audit
-- ---------------------------------------------------------------------------

-- SECURITY INVOKER on purpose: current_user is then the real caller role
-- (anon, authenticated, service_role, or postgres for an operator).
create function private.guard_user_roles()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target public.user_roles := case when tg_op = 'DELETE' then old else new end;
begin
  if tg_op = 'UPDATE' then
    raise exception 'user_roles rows cannot be updated; revoke and grant instead'
      using errcode = '42501';
  end if;

  if current_user = 'authenticated' then
    if not private.is_owner() then
      raise exception 'only an owner can grant or revoke roles' using errcode = '42501';
    end if;
  elsif current_user in ('anon', 'service_role') then
    -- A leaked service key must not be able to grant roles.
    raise exception 'roles can only be changed by an owner' using errcode = '42501';
  end if;
  -- Any other role is a database operator (postgres via SQL or the CLI),
  -- which is how the first owner is bootstrapped.

  if tg_op = 'DELETE' and target.role = 'owner' and not exists (
    select 1 from public.user_roles
    where role = 'owner' and id <> target.id
  ) then
    raise exception 'cannot remove the last owner' using errcode = '23514';
  end if;

  return target;
end;
$$;

create trigger guard_user_roles
  before insert or update or delete on public.user_roles
  for each row execute function private.guard_user_roles();

create function private.audit_user_roles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.user_roles := case when tg_op = 'DELETE' then old else new end;
  actor uuid := (select auth.uid());
begin
  insert into public.audit_log (actor_id, actor_type, action, entity, entity_id, details)
  values (
    actor,
    case when actor is null then 'system' else 'user' end,
    case when tg_op = 'INSERT' then 'role_grant' else 'role_revoke' end,
    'user_roles',
    target.user_id,
    jsonb_build_object('role', target.role)
  );
  return null;
end;
$$;
revoke all on function private.audit_user_roles() from public;

create trigger audit_user_roles
  after insert or delete on public.user_roles
  for each row execute function private.audit_user_roles();

-- ---------------------------------------------------------------------------
-- RLS and grants
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_log enable row level security;

revoke all on table public.profiles, public.user_roles, public.audit_log
  from anon, authenticated, service_role;

-- profiles: a member reads and renames only their own row. Rows are created
-- by the auth trigger, never by the client.
grant select on table public.profiles to authenticated;
grant update (username) on table public.profiles to authenticated;
grant select on table public.profiles to service_role;

create policy "profiles: read own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- user_roles: everyone signed in may read their own grants (the app reads
-- roles server-side from here). Owners read and write all of them.
grant select, insert, delete on table public.user_roles to authenticated;
grant select on table public.user_roles to service_role;

create policy "user_roles: read own or owner"
  on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_owner()));

create policy "user_roles: owner grants"
  on public.user_roles for insert to authenticated
  with check ((select private.is_owner()));

create policy "user_roles: owner revokes"
  on public.user_roles for delete to authenticated
  using ((select private.is_owner()));

-- audit_log: staff read it (PRD: reviewers read the audit log). Nobody writes
-- it directly; only the SECURITY DEFINER audit triggers insert rows.
grant select on table public.audit_log to authenticated;

create policy "audit_log: staff read"
  on public.audit_log for select to authenticated
  using ((select private.is_staff()));
