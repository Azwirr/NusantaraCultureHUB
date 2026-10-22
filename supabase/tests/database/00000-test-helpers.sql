-- Test-only helpers for the pgTAP suite. Runs first (file name order) and is
-- committed so later files can use it. Local and CI databases only: never
-- run this against a hosted project.
--
-- The helpers impersonate API callers the same way PostgREST does: by
-- switching the database role and setting request.jwt.claims, which is what
-- auth.uid() reads.

create extension if not exists pgtap with schema extensions;

create schema if not exists tests;
grant usage on schema tests to anon, authenticated, service_role;

create or replace function tests.create_user(p_id uuid, p_username text)
returns uuid
language plpgsql
as $$
begin
  insert into auth.users (id, email, raw_user_meta_data, aud, role)
  values (
    p_id,
    p_username || '@example.test',
    jsonb_build_object('username', p_username),
    'authenticated',
    'authenticated'
  );
  return p_id;
end;
$$;

-- A signed-in member (any user; their rights come from user_roles).
create or replace function tests.as_user(p_id uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', jsonb_build_object('sub', p_id, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end;
$$;

-- A guest using the public (publishable) key.
create or replace function tests.as_anon()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  perform set_config('role', 'anon', true);
end;
$$;

-- The AI Workflow server module: service role, no auth user.
create or replace function tests.as_service()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
  perform set_config('role', 'service_role', true);
end;
$$;

-- Back to the database operator (postgres, no JWT) for setup and checks.
create or replace function tests.as_operator()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', '', true);
  perform set_config('role', 'postgres', true);
end;
$$;

-- Runs a review action as the given user, then returns to the operator.
create or replace function tests.review(p_user uuid, p_entity text, p_id uuid, p_action text, p_reason text default null)
returns text
language plpgsql
as $$
declare
  v_status text;
begin
  perform tests.as_user(p_user);
  v_status := public.review_content(p_entity, p_id, p_action, p_reason);
  perform tests.as_operator();
  return v_status;
end;
$$;

grant execute on all functions in schema tests to anon, authenticated, service_role;

select plan(1);
select ok(true, 'test helpers installed');
select * from finish();
