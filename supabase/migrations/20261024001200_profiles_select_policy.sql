-- Phase 2, part 12: one SELECT policy on profiles instead of three.
--
-- Same rule as parts 1 and 11, merged because Postgres evaluates every
-- permissive policy on every row (Supabase performance advisor):
-- * everyone signed in reads their own profile;
-- * staff read the nicknames of other staff;
-- * owners read every nickname (to grant roles by nickname).

drop policy "profiles: read own" on public.profiles;
drop policy "profiles: staff read staff nicknames" on public.profiles;
drop policy "profiles: owner reads all nicknames" on public.profiles;

create policy "profiles: read own, staff directory, owner directory"
  on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or (select private.is_owner())
    or ((select private.is_staff()) and private.has_any_role(id))
  );
