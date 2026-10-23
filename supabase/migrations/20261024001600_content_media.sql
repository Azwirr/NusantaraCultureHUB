-- Phase 2d, part 16: pictures and illustrations for approved content.
--
-- Approved rows are locked (guard_approval), so pictures live in their own
-- table instead of a column on the content row. A picture is public exactly
-- when the item it belongs to is public (private.content_is_public). Only
-- staff write it, and every picture carries its credit and licence.

create table public.content_media (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('region', 'story', 'story_chapter', 'recipe', 'costume')),
  content_id uuid not null,
  -- 'picture' (a photo) or 'illustration' (a drawing made for the item).
  kind text not null default 'picture' check (kind in ('picture', 'illustration')),
  url text not null check (char_length(url) between 1 and 2048 and url ~ '^(https://|/)'),
  alt_id text not null check (char_length(alt_id) between 1 and 300),
  alt_en text not null check (char_length(alt_en) between 1 and 300),
  credit text not null check (char_length(credit) between 1 and 300),
  licence text not null check (char_length(licence) between 1 and 80),
  sort_order integer not null default 0 check (sort_order between 0 and 100),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (content_type, content_id, sort_order)
);
comment on table public.content_media is
  'Pictures and illustrations for content. Public when the parent item is public; staff write, with a credit and licence on every row.';

alter table public.content_media enable row level security;

revoke all on table public.content_media from anon, authenticated;
grant select on table public.content_media to anon, authenticated;
grant insert, update, delete on table public.content_media to authenticated;

create policy "content_media: public read when the item is public"
  on public.content_media for select to anon, authenticated
  using ((select private.is_staff()) or private.content_is_public(content_type, content_id));

create policy "content_media: staff write"
  on public.content_media for all to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

