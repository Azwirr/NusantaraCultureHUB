-- Creates the two confirmed test accounts used by tests/e2e/signed-in.spec.ts.
-- For staging or local only, never production. Run once per environment as a
-- database operator, with the passwords you put in .env.local:
--
--   psql "$DB_URL" -v member_password='...' -v reviewer_password='...' \
--     -f supabase/scripts/create-e2e-users.sql
--
-- Then set in .env.local:
--   E2E_MEMBER_EMAIL=e2e-member@nusantara.test     E2E_MEMBER_PASSWORD=...
--   E2E_REVIEWER_EMAIL=e2e-reviewer@nusantara.test E2E_REVIEWER_PASSWORD=...
--
-- Accounts are inserted directly because hosted Supabase requires email
-- confirmation and its built-in mailer only sends to team members.

create temporary table e2e_accounts as
select gen_random_uuid() as id, email, username, password, role
from (values
  ('e2e-member@nusantara.test', 'e2e_member', :'member_password', null),
  ('e2e-reviewer@nusantara.test', 'e2e_reviewer', :'reviewer_password', 'reviewer')
) as a (email, username, password, role);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change)
select '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated', email,
  extensions.crypt(password, extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', jsonb_build_object('username', username),
  now(), now(), '', '', '', ''
from e2e_accounts;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select id::text, id, jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true), 'email', now(), now(), now()
from e2e_accounts;

-- An operator grant: allowed by guard_user_roles and written to audit_log.
insert into public.user_roles (user_id, role)
select id, role from e2e_accounts where role is not null;

drop table e2e_accounts;
