-- Nickname step (migration part 6): who must choose a nickname, and how
-- choosing one marks it as set.
begin;
select no_plan();

-- An email sign-up with a free nickname.
select tests.create_user('11111111-1111-1111-1111-111111111111', 'budi_jawa');
select is(
  (select nickname_set from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  true,
  'an email sign-up that chose a free nickname needs no nickname step'
);

-- A second sign-up asking for the same nickname gets a suffixed one.
select tests.create_user('22222222-2222-2222-2222-222222222222', 'budi_jawa');
select ok(
  (select username ~ '^budi_jawa_[0-9a-f]{4}$' and not nickname_set
   from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  'a taken nickname is suffixed and the member is asked to choose again'
);

-- A Google sign-in: no nickname, only the Google profile in auth metadata.
insert into auth.users (id, email, raw_user_meta_data, aud, role)
values ('33333333-3333-3333-3333-333333333333', 'siti@example.test',
        '{"full_name": "Siti Real Name", "avatar_url": "https://example.test/a.png"}', 'authenticated', 'authenticated');
select ok(
  (select username ~ '^anggota(_[0-9a-f]{4})?$' and not nickname_set
   from public.profiles where id = '33333333-3333-3333-3333-333333333333'),
  'a Google member gets a placeholder nickname and the nickname step'
);
select is(
  (select count(*)::int from public.profiles where username ilike '%siti%'),
  0,
  'the Google name is not copied into profiles'
);

-- Choosing a nickname.
select tests.as_user('33333333-3333-3333-3333-333333333333');
select throws_ok(
  $$ update public.profiles set nickname_set = true where id = '33333333-3333-3333-3333-333333333333' $$,
  '42501', null,
  'a member cannot set the flag directly'
);
select throws_ok(
  $$ update public.profiles set username = 'budi_jawa' where id = '33333333-3333-3333-3333-333333333333' $$,
  '23505', null,
  'a taken nickname is refused'
);
select throws_ok(
  $$ update public.profiles set username = 'Siti Real Name' where id = '33333333-3333-3333-3333-333333333333' $$,
  '23514', null,
  'a nickname with spaces or capitals is refused'
);
select lives_ok(
  $$ update public.profiles set username = 'siti_kecil' where id = '33333333-3333-3333-3333-333333333333' $$,
  'a member chooses a free nickname'
);

select tests.as_operator();
select ok(
  (select username = 'siti_kecil' and nickname_set from public.profiles where id = '33333333-3333-3333-3333-333333333333'),
  'choosing a nickname marks it as set'
);

-- Keeping the current nickname also counts as choosing it.
select tests.as_user('22222222-2222-2222-2222-222222222222');
update public.profiles set username = username where id = '22222222-2222-2222-2222-222222222222';
select tests.as_operator();
select is(
  (select nickname_set from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  true,
  'confirming the suggested nickname also completes the step'
);

-- Operators can reset the flag (used to re-test the step).
update public.profiles set nickname_set = false where id = '11111111-1111-1111-1111-111111111111';
select is(
  (select nickname_set from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  false,
  'an operator can reset the flag'
);

select * from finish();
rollback;
