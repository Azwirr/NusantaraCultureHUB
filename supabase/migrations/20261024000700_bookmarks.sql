-- Phase 2, part 7: member bookmarks ("Simpan").
--
-- * One row per member and item. Members read, add and delete only their own
--   rows. The member id always comes from the session (column default plus
--   column grants), never from the client.
-- * A bookmark can only be added for content that is public at that moment,
--   so a member cannot bookmark a draft. A draft id and an id that does not
--   exist are refused with the same error, so nothing can be probed.
-- * When an item is later unpublished, its bookmark is hidden, not lost: the
--   read policy only returns bookmarks of public content, and the bookmark
--   shows again if the item is approved again.

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  content_type text not null check (content_type in ('story', 'recipe', 'costume')),
  content_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, content_type, content_id)
);
comment on table public.bookmarks is
  'Saved items per member. Only public content can be saved; unpublished items stay saved but hidden.';
create index bookmarks_user_recent_idx on public.bookmarks (user_id, created_at desc);

alter table public.bookmarks enable row level security;

revoke all on table public.bookmarks from anon, authenticated, service_role;

-- Members choose only what to save. user_id, id and created_at come from
-- their defaults, so a member can never write a row for someone else.
grant select, delete on table public.bookmarks to authenticated;
grant insert (content_type, content_id) on table public.bookmarks to authenticated;

create policy "bookmarks: read own for public content"
  on public.bookmarks for select to authenticated
  using (
    user_id = (select auth.uid())
    and private.content_is_public(content_type, content_id)
  );

create policy "bookmarks: add own for public content"
  on public.bookmarks for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and private.content_is_public(content_type, content_id)
  );

create policy "bookmarks: delete own"
  on public.bookmarks for delete to authenticated
  using (user_id = (select auth.uid()));
