-- Phase 2, part 11: nicknames for the review queue (FR-11, FR-13).
--
-- Members can only read their own profile (part 1). The review queue needs a
-- little more, and only for staff:
-- * Reviewers and owners read the nicknames of other staff, so the audit log
--   and the queue can say who created, edited or approved something.
-- * Owners read every nickname, so they can grant a role by nickname
--   (/review/roles). The grant itself is still the owner's own insert into
--   user_roles, judged by RLS and guard_user_roles.
-- Profiles hold a nickname only (PRD privacy), so nothing else is exposed.

create function private.has_any_role(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.user_roles where user_id = p_user);
$$;

revoke all on function private.has_any_role(uuid) from public;
grant execute on function private.has_any_role(uuid) to authenticated;

create policy "profiles: staff read staff nicknames"
  on public.profiles for select to authenticated
  using ((select private.is_staff()) and private.has_any_role(id));

create policy "profiles: owner reads all nicknames"
  on public.profiles for select to authenticated
  using ((select private.is_owner()));
