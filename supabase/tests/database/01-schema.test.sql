-- Structure and privilege checks: the 16 PRD tables plus the two Phase 2
-- member tables, RLS everywhere, guard_approval on every content table, no
-- deletes, no anon writes.
begin;
select no_plan();

select tables_are(
  'public',
  array[
    'profiles', 'user_roles', 'regions', 'stories', 'story_chapters', 'recipes',
    'recipe_ingredients', 'recipe_steps', 'costumes', 'sources', 'content_sources',
    'badges', 'user_badges', 'user_progress', 'ai_jobs', 'audit_log',
    -- Phase 2: saves (FR-02, Member role) and the assistant quota (FR-15).
    'bookmarks', 'assistant_usage',
    -- Phase 2b: story requests from members.
    'story_requests'
  ],
  'public schema has exactly the 16 PRD tables plus the Phase 2 member tables'
);

select is(
  (select count(*)::int
   from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity),
  0,
  'RLS is enabled on every public table'
);

select set_eq(
  $$ select c.relname::text from pg_trigger t join pg_class c on c.oid = t.tgrelid
     where t.tgname = 'guard_approval' and not t.tgisinternal $$,
  array['regions', 'stories', 'story_chapters', 'recipes', 'costumes'],
  'guard_approval is attached to every content table'
);

select is(
  (select count(*)::int from information_schema.role_table_grants
   where table_schema = 'public'
     and table_name in ('regions', 'stories', 'story_chapters', 'recipes', 'costumes', 'sources', 'audit_log', 'user_badges', 'ai_jobs')
     and privilege_type = 'DELETE'
     and grantee in ('anon', 'authenticated', 'service_role')),
  0,
  'no API role can delete reviewable content, sources, badges, AI jobs or the audit log'
);

select is(
  (select count(*)::int from information_schema.role_table_grants
   where table_schema = 'public' and grantee = 'anon'
     and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
  0,
  'anon has no write privilege on any public table'
);

select ok(
  not has_table_privilege('anon', 'public.user_roles', 'select')
  and not has_table_privilege('anon', 'public.audit_log', 'select')
  and not has_table_privilege('anon', 'public.profiles', 'select')
  and not has_table_privilege('anon', 'public.ai_jobs', 'select'),
  'anon cannot read roles, the audit log, profiles or AI jobs'
);

select ok(
  not has_table_privilege('authenticated', 'public.audit_log', 'insert')
  and not has_table_privilege('service_role', 'public.audit_log', 'insert'),
  'nobody writes the audit log directly'
);

select ok(
  not has_table_privilege('authenticated', 'public.user_roles', 'update'),
  'user_roles rows cannot be updated, only granted or revoked'
);

select ok(
  not has_table_privilege('authenticated', 'public.user_badges', 'insert'),
  'members cannot award themselves badges'
);

select ok(
  not has_table_privilege('anon', 'public.bookmarks', 'select')
  and not has_table_privilege('anon', 'public.assistant_usage', 'select')
  and not has_table_privilege('authenticated', 'public.assistant_usage', 'insert')
  and not has_table_privilege('authenticated', 'public.assistant_usage', 'update')
  and not has_table_privilege('authenticated', 'public.bookmarks', 'update'),
  'guests cannot read saves or quotas, and members cannot edit either directly'
);

select ok(
  not has_function_privilege('anon', 'public.review_content(text, uuid, text, text)', 'execute'),
  'anon cannot call review_content'
);

select ok(
  not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
  ),
  'no SECURITY DEFINER function is exposed in the public schema'
);

select * from finish();
rollback;
