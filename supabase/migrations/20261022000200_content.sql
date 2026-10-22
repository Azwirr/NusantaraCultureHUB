-- Phase 1 foundation, part 2: cultural content tables.
--
-- Rules (CLAUDE.md, PRD sections 5 and 6, build plan foundation prompt):
-- * Every reviewable table carries one review_status. New rows are drafts.
-- * Public (anon and members) read approved rows only. Staff read everything.
-- * Paired Indonesian/English fields (name_id + name_en, ...). Translations may
--   be missing while a row is a draft; approval requires both (part 4).
-- * Nobody can delete reviewable content. Unpublish instead.
-- * No table stores user photos.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.regions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 64),
  name_id text not null check (char_length(name_id) <= 120),
  name_en text check (char_length(name_en) <= 120),
  sort_order integer not null default 0,
  review_status text not null default 'draft'
    check (review_status in ('draft', 'approved', 'rejected', 'unpublished')),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  region_id uuid references public.regions (id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 96),
  title_id text not null check (char_length(title_id) <= 200),
  title_en text check (char_length(title_en) <= 200),
  summary_id text check (char_length(summary_id) <= 2000),
  summary_en text check (char_length(summary_en) <= 2000),
  review_status text not null default 'draft'
    check (review_status in ('draft', 'approved', 'rejected', 'unpublished')),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index stories_region_idx on public.stories (region_id);

create table public.story_chapters (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete restrict,
  chapter_no integer not null check (chapter_no between 1 and 100),
  text_id text check (char_length(text_id) <= 20000),
  text_en text check (char_length(text_en) <= 20000),
  -- Read to screen-reader users before the chapter audio (PRD FR-04).
  audio_description_id text check (char_length(audio_description_id) <= 1000),
  audio_description_en text check (char_length(audio_description_en) <= 1000),
  image_alt_id text check (char_length(image_alt_id) <= 500),
  image_alt_en text check (char_length(image_alt_en) <= 500),
  -- https URLs or site-relative paths only, so no javascript: or data: URLs.
  image_url text check (image_url ~ '^(https://|/(?!/))' and char_length(image_url) <= 2048),
  audio_url text check (audio_url ~ '^(https://|/(?!/))' and char_length(audio_url) <= 2048),
  -- sha256 of chapter text + voice, so audio is generated once (FR-05).
  audio_hash text check (audio_hash ~ '^[0-9a-f]{64}$'),
  review_status text not null default 'draft'
    check (review_status in ('draft', 'approved', 'rejected', 'unpublished')),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (story_id, chapter_no)
);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  region_id uuid references public.regions (id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 96),
  name_id text not null check (char_length(name_id) <= 160),
  name_en text check (char_length(name_en) <= 160),
  servings integer check (servings between 1 and 100),
  minutes integer check (minutes between 1 and 10000),
  -- Controlled vocabulary so the UI can label tags in both languages.
  dietary_tags text[] not null default '{}' check (
    dietary_tags <@ array[
      'vegetarian', 'vegetarian_option', 'contains_egg', 'contains_beef', 'contains_chicken',
      'contains_peanut', 'contains_coconut', 'contains_seafood', 'contains_dairy', 'contains_gluten'
    ]::text[]
  ),
  -- A halal label may only be shown when this is verified_by_source.
  halal_status text not null default 'unknown' check (halal_status in ('unknown', 'verified_by_source')),
  review_status text not null default 'draft'
    check (review_status in ('draft', 'approved', 'rejected', 'unpublished')),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index recipes_region_idx on public.recipes (region_id);

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  position integer not null check (position between 1 and 200),
  name_id text not null check (char_length(name_id) <= 200),
  name_en text check (char_length(name_en) <= 200),
  amount numeric check (amount > 0 and amount < 100000),
  -- Unit codes are labelled per language in the UI dictionaries.
  unit text check (
    unit in ('g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cm', 'piece', 'clove', 'stalk', 'leaf', 'bunch', 'whole', 'to_taste')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recipe_id, position)
);

create table public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  step_no integer not null check (step_no between 1 and 100),
  text_id text check (char_length(text_id) <= 4000),
  text_en text check (char_length(text_en) <= 4000),
  timer_seconds integer check (timer_seconds between 1 and 86400),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recipe_id, step_no)
);

create table public.costumes (
  id uuid primary key default gen_random_uuid(),
  region_id uuid references public.regions (id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 96),
  name_id text not null check (char_length(name_id) <= 160),
  name_en text check (char_length(name_en) <= 160),
  info_id text check (char_length(info_id) <= 4000),
  info_en text check (char_length(info_en) <= 4000),
  -- Try-on overlay layers and pose anchor points (used from Phase 2).
  layers jsonb not null default '[]'::jsonb check (jsonb_typeof(layers) = 'array'),
  anchor_points jsonb not null default '{}'::jsonb check (jsonb_typeof(anchor_points) = 'object'),
  reference_image_url text check (reference_image_url ~ '^(https://|/(?!/))' and char_length(reference_image_url) <= 2048),
  review_status text not null default 'draft'
    check (review_status in ('draft', 'approved', 'rejected', 'unpublished')),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index costumes_region_idx on public.costumes (region_id);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 300),
  url text check (url ~ '^https?://' and char_length(url) <= 2048),
  license text check (char_length(license) <= 200),
  credit text check (char_length(credit) <= 300),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_sources (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('region', 'story', 'story_chapter', 'recipe', 'costume')),
  content_id uuid not null,
  source_id uuid not null references public.sources (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (content_type, content_id, source_id)
);
create index content_sources_source_idx on public.content_sources (source_id);

-- ---------------------------------------------------------------------------
-- Visibility helpers
-- ---------------------------------------------------------------------------

-- True when a piece of content is publicly visible. SECURITY DEFINER so the
-- answer does not depend on the caller's own RLS view.
create function private.content_is_public(p_type text, p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case p_type
    when 'region' then exists (
      select 1 from public.regions where id = p_id and review_status = 'approved')
    when 'story' then exists (
      select 1 from public.stories where id = p_id and review_status = 'approved')
    when 'story_chapter' then exists (
      select 1 from public.story_chapters c
      join public.stories s on s.id = c.story_id
      where c.id = p_id and c.review_status = 'approved' and s.review_status = 'approved')
    when 'recipe' then exists (
      select 1 from public.recipes where id = p_id and review_status = 'approved')
    when 'costume' then exists (
      select 1 from public.costumes where id = p_id and review_status = 'approved')
    else false
  end;
$$;

create function private.source_is_public(p_source_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.content_sources cs
    where cs.source_id = p_source_id
      and private.content_is_public(cs.content_type, cs.content_id)
  );
$$;

revoke all on function private.content_is_public(text, uuid), private.source_is_public(uuid) from public;
grant execute on function private.content_is_public(text, uuid), private.source_is_public(uuid)
  to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.regions enable row level security;
alter table public.stories enable row level security;
alter table public.story_chapters enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;
alter table public.costumes enable row level security;
alter table public.sources enable row level security;
alter table public.content_sources enable row level security;

-- Reviewable tables: approved rows are public, staff see and write all rows.
-- There is deliberately no DELETE policy.
create policy "regions: public read approved"
  on public.regions for select to anon, authenticated
  using (review_status = 'approved' or (select private.is_staff()));
create policy "regions: staff insert"
  on public.regions for insert to authenticated with check ((select private.is_staff()));
create policy "regions: staff update"
  on public.regions for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

create policy "stories: public read approved"
  on public.stories for select to anon, authenticated
  using (review_status = 'approved' or (select private.is_staff()));
create policy "stories: staff insert"
  on public.stories for insert to authenticated with check ((select private.is_staff()));
create policy "stories: staff update"
  on public.stories for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

-- A chapter is public only when it and its story are both approved.
create policy "story_chapters: public read approved"
  on public.story_chapters for select to anon, authenticated
  using (
    (review_status = 'approved' and exists (
      select 1 from public.stories s where s.id = story_id and s.review_status = 'approved'))
    or (select private.is_staff())
  );
create policy "story_chapters: staff insert"
  on public.story_chapters for insert to authenticated with check ((select private.is_staff()));
create policy "story_chapters: staff update"
  on public.story_chapters for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

create policy "recipes: public read approved"
  on public.recipes for select to anon, authenticated
  using (review_status = 'approved' or (select private.is_staff()));
create policy "recipes: staff insert"
  on public.recipes for insert to authenticated with check ((select private.is_staff()));
create policy "recipes: staff update"
  on public.recipes for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

-- Ingredients and steps follow their recipe's visibility.
create policy "recipe_ingredients: public read with approved recipe"
  on public.recipe_ingredients for select to anon, authenticated
  using (
    exists (select 1 from public.recipes r where r.id = recipe_id and r.review_status = 'approved')
    or (select private.is_staff())
  );
create policy "recipe_ingredients: staff insert"
  on public.recipe_ingredients for insert to authenticated with check ((select private.is_staff()));
create policy "recipe_ingredients: staff update"
  on public.recipe_ingredients for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "recipe_ingredients: staff delete"
  on public.recipe_ingredients for delete to authenticated using ((select private.is_staff()));

create policy "recipe_steps: public read with approved recipe"
  on public.recipe_steps for select to anon, authenticated
  using (
    exists (select 1 from public.recipes r where r.id = recipe_id and r.review_status = 'approved')
    or (select private.is_staff())
  );
create policy "recipe_steps: staff insert"
  on public.recipe_steps for insert to authenticated with check ((select private.is_staff()));
create policy "recipe_steps: staff update"
  on public.recipe_steps for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "recipe_steps: staff delete"
  on public.recipe_steps for delete to authenticated using ((select private.is_staff()));

create policy "costumes: public read approved"
  on public.costumes for select to anon, authenticated
  using (review_status = 'approved' or (select private.is_staff()));
create policy "costumes: staff insert"
  on public.costumes for insert to authenticated with check ((select private.is_staff()));
create policy "costumes: staff update"
  on public.costumes for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

-- Sources carry no status of their own: one is public while it cites at
-- least one piece of public content.
create policy "sources: public read when cited by approved content"
  on public.sources for select to anon, authenticated
  using ((select private.is_staff()) or private.source_is_public(id));
create policy "sources: staff insert"
  on public.sources for insert to authenticated with check ((select private.is_staff()));
create policy "sources: staff update"
  on public.sources for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

create policy "content_sources: public read for approved content"
  on public.content_sources for select to anon, authenticated
  using ((select private.is_staff()) or private.content_is_public(content_type, content_id));
create policy "content_sources: staff insert"
  on public.content_sources for insert to authenticated with check ((select private.is_staff()));
create policy "content_sources: staff delete"
  on public.content_sources for delete to authenticated using ((select private.is_staff()));

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

revoke all on table
  public.regions, public.stories, public.story_chapters, public.recipes,
  public.recipe_ingredients, public.recipe_steps, public.costumes,
  public.sources, public.content_sources
  from anon, authenticated, service_role;

grant select on table
  public.regions, public.stories, public.story_chapters, public.recipes,
  public.recipe_ingredients, public.recipe_steps, public.costumes,
  public.sources, public.content_sources
  to anon, authenticated;

-- Staff edit content through RLS-checked writes. No DELETE on reviewable
-- tables for anyone.
grant insert, update on table
  public.regions, public.stories, public.story_chapters, public.recipes,
  public.recipe_ingredients, public.recipe_steps, public.costumes, public.sources
  to authenticated;
grant delete on table public.recipe_ingredients, public.recipe_steps to authenticated;
grant insert, delete on table public.content_sources to authenticated;

-- The AI Workflow server module (Phase 2+) writes drafts with the service
-- role. RLS does not apply to it, so guard_approval (part 4) is what keeps
-- it inside draft status.
grant select, insert, update on table
  public.regions, public.stories, public.story_chapters, public.recipes,
  public.recipe_ingredients, public.recipe_steps, public.costumes,
  public.sources, public.content_sources
  to service_role;
