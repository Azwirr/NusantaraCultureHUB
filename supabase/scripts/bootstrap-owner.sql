-- Grants the FIRST owner. Run once per environment, by a database operator,
-- after that person has signed up in the app:
--
--   Local:   paste into the SQL editor of local Studio (http://127.0.0.1:54323), or
--            psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/scripts/bootstrap-owner.sql
--   Hosted:  paste into the SQL editor of the Supabase dashboard
--
-- Edit the email below first. This is the only role grant that bypasses the
-- app: guard_user_roles allows it because the operator has no JWT. After this,
-- owners grant and revoke reviewer/owner roles themselves, and every change is
-- written to audit_log. A service-role key cannot do this.

do $$
declare
  v_email constant text := 'owner@example.com';  -- <- change me
  v_user uuid;
begin
  select id into v_user from auth.users where lower(email) = lower(v_email);
  if v_user is null then
    raise exception 'No user with email %. Sign up in the app first.', v_email;
  end if;
  if exists (select 1 from public.user_roles where role = 'owner') then
    raise exception 'An owner already exists. Ask them to grant roles from the app.';
  end if;
  insert into public.user_roles (user_id, role) values (v_user, 'owner');
  raise notice 'Granted owner to %', v_email;
end;
$$;
