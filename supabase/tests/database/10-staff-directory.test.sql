-- Staff directory (migration part 11): who can read which nicknames.
begin;
select no_plan();

select tests.create_user('11111111-1111-1111-1111-111111111111', 'reviewer_a');
select tests.create_user('22222222-2222-2222-2222-222222222222', 'owner_o');
select tests.create_user('33333333-3333-3333-3333-333333333333', 'member_m');
select tests.create_user('44444444-4444-4444-4444-444444444444', 'member_n');
insert into public.user_roles (user_id, role) values
  ('11111111-1111-1111-1111-111111111111', 'reviewer'),
  ('22222222-2222-2222-2222-222222222222', 'owner');

select tests.as_user('33333333-3333-3333-3333-333333333333');
select results_eq(
  'select username from public.profiles',
  array['member_m'],
  'a member still reads only their own profile'
);

select tests.as_user('11111111-1111-1111-1111-111111111111');
select set_eq(
  $$ select username from public.profiles where username in ('reviewer_a', 'owner_o', 'member_m', 'member_n') $$,
  array['reviewer_a', 'owner_o'],
  'a reviewer reads staff nicknames, not members'''
);
update public.profiles set username = 'renamed' where id = '22222222-2222-2222-2222-222222222222';
select is(
  (select username from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  'owner_o',
  'a reviewer cannot rename staff (RLS updates no rows)'
);

select tests.as_user('22222222-2222-2222-2222-222222222222');
select set_eq(
  $$ select username from public.profiles where username in ('reviewer_a', 'owner_o', 'member_m', 'member_n') $$,
  array['reviewer_a', 'owner_o', 'member_m', 'member_n'],
  'an owner reads every nickname, to grant roles by nickname'
);
select lives_ok(
  $$ insert into public.user_roles (user_id, role)
     select id, 'reviewer' from public.profiles where username = 'member_n' $$,
  'an owner grants a role to a member found by nickname'
);
update public.profiles set username = 'renamed_by_owner' where id = '33333333-3333-3333-3333-333333333333';
select tests.as_operator();
select is(
  (select username from public.profiles where id = '33333333-3333-3333-3333-333333333333'),
  'member_m',
  'reading every nickname does not let an owner rename members'
);

select tests.as_user('11111111-1111-1111-1111-111111111111');
select ok(
  exists (select 1 from public.profiles where username = 'member_n'),
  'a newly granted reviewer appears in the staff directory'
);

select tests.as_anon();
select throws_ok('select * from public.profiles', '42501', null, 'guests still cannot read profiles');

select tests.as_operator();
select * from finish();
rollback;
