-- Nickname step for members who did not choose a nickname at sign-up.
--
-- Google sign-in sends no nickname, and an email sign-up whose nickname is
-- already taken gets a suffixed one. Both kinds of profile start with
-- nickname_set = false, and the app asks the member to choose a nickname.
-- The Google name and photo stay in auth.users only: they are never copied
-- into profiles (PRD privacy: members use a nickname).

alter table public.profiles add column nickname_set boolean not null default false;
comment on column public.profiles.nickname_set is
  'True once the member chose this nickname (at sign-up or on /me). Set by triggers only.';

-- Existing members chose their nickname at sign-up if it matches what they sent.
update public.profiles p
set nickname_set = true
from auth.users u
where u.id = p.id and u.raw_user_meta_data ->> 'username' = p.username;

-- Same as part 1, except that the nickname counts as chosen only when the
-- sign-up supplied a valid one and it was still free.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text := lower(coalesce(new.raw_user_meta_data ->> 'username', ''));
  chosen boolean := true;
  candidate text;
begin
  if base !~ '^[a-z0-9_]{3,24}$' then
    base := 'anggota';
    chosen := false;
  end if;
  candidate := base;
  -- Nicknames are unique. On a clash, keep the name, add a short suffix and
  -- ask the member to choose again.
  loop
    insert into public.profiles (id, username, nickname_set)
    values (new.id, candidate, chosen)
    on conflict (username) do nothing;
    exit when found;
    chosen := false;
    candidate := left(base, 19) || '_' || substr(md5(gen_random_uuid()::text), 1, 4);
  end loop;
  return new;
end;
$$;

-- Members may only update their username (column grant from part 1). Any
-- such update is the member choosing a nickname, so it marks it as set.
-- Operators (no JWT) can still reset the flag, e.g. for tests.
create function private.mark_nickname_set()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' then
    new.nickname_set := true;
  end if;
  return new;
end;
$$;

create trigger mark_nickname_set
  before update on public.profiles
  for each row execute function private.mark_nickname_set();
