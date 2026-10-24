-- Phase 3b: ceremonies (adat), a new reviewable content type.
--
-- User decision (2026-10-24): customary ceremonies and rites (upacara adat)
-- are content, like stories, recipes and dress. Same rules everywhere:
-- * a new row starts as draft; only a reviewer or owner approves it, and
--   nobody approves what they created or last edited (guard_approval);
-- * public reads return approved rows only (RLS);
-- * approval needs both languages, a region that is already approved, and at
--   least one cited source. The AI Workflow may also publish it, through
--   private.ai_publish, which needs sources from 2 different websites.
-- * Every change of review status is audited (audit_review_change).
-- Ceremonies cannot be saved by members yet (bookmarks are unchanged).

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table public.ceremonies (
  id uuid primary key default gen_random_uuid(),
  region_id uuid references public.regions (id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 96),
  name_id text not null check (char_length(name_id) <= 160),
  name_en text check (char_length(name_en) <= 160),
  summary_id text check (char_length(summary_id) <= 2000),
  summary_en text check (char_length(summary_en) <= 2000),
  -- When it is held, as the sources say it (a month, a calendar day, a cycle).
  timing_id text check (char_length(timing_id) <= 500),
  timing_en text check (char_length(timing_en) <= 500),
  -- The explanation: what happens, why, and who takes part.
  body_id text check (char_length(body_id) <= 8000),
  body_en text check (char_length(body_en) <= 8000),
  review_status text not null default 'draft'
    check (review_status in ('draft', 'approved', 'rejected', 'unpublished')),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ceremonies_region_idx on public.ceremonies (region_id);

comment on table public.ceremonies is
  'Customary ceremonies and rites (adat). Public only when approved; the region must be approved too.';

-- Ceremony is a valid content type for citations and pictures.
alter table public.content_sources drop constraint content_sources_content_type_check;
alter table public.content_sources add constraint content_sources_content_type_check
  check (content_type in ('region', 'story', 'story_chapter', 'recipe', 'costume', 'ceremony'));

alter table public.content_media drop constraint content_media_content_type_check;
alter table public.content_media add constraint content_media_content_type_check
  check (content_type in ('region', 'story', 'story_chapter', 'recipe', 'costume', 'ceremony'));

-- ---------------------------------------------------------------------------
-- Visibility and status helpers (extended for ceremonies)
-- ---------------------------------------------------------------------------

create or replace function private.content_is_public(p_type text, p_id uuid)
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
    when 'ceremony' then exists (
      select 1 from public.ceremonies where id = p_id and review_status = 'approved')
    else false
  end;
$$;

create or replace function private.content_status(p_type text, p_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case p_type
    when 'region' then (select review_status from public.regions where id = p_id)
    when 'story' then (select review_status from public.stories where id = p_id)
    when 'story_chapter' then (select review_status from public.story_chapters where id = p_id)
    when 'recipe' then (select review_status from public.recipes where id = p_id)
    when 'costume' then (select review_status from public.costumes where id = p_id)
    when 'ceremony' then (select review_status from public.ceremonies where id = p_id)
  end;
$$;

create or replace function private.lock_content_status(p_type text, p_id uuid)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_status text;
begin
  case p_type
    when 'region' then select review_status into v_status from public.regions where id = p_id for share;
    when 'story' then select review_status into v_status from public.stories where id = p_id for share;
    when 'story_chapter' then select review_status into v_status from public.story_chapters where id = p_id for share;
    when 'recipe' then select review_status into v_status from public.recipes where id = p_id for share;
    when 'costume' then select review_status into v_status from public.costumes where id = p_id for share;
    when 'ceremony' then select review_status into v_status from public.ceremonies where id = p_id for share;
    else v_status := null;
  end case;
  return v_status;
end;
$$;

-- ---------------------------------------------------------------------------
-- Approval preconditions (part 15 of the review gate, plus ceremonies)
-- ---------------------------------------------------------------------------

create or replace function private.assert_publishable(p_table text, p_row jsonb)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_id uuid := (p_row ->> 'id')::uuid;
  v_region uuid := (p_row ->> 'region_id')::uuid;
  v_content_type text;
  v_missing text[] := '{}';
  v_field text;
begin
  -- Both languages must be present for every visible text field.
  -- Ceremony timing is optional: some rites have no fixed date in the sources.
  foreach v_field in array case p_table
    when 'regions' then array['name_id', 'name_en', 'summary_id', 'summary_en']
    when 'stories' then array['title_id', 'title_en', 'summary_id', 'summary_en']
    when 'story_chapters' then array[
      'text_id', 'text_en', 'image_alt_id', 'image_alt_en',
      'audio_description_id', 'audio_description_en']
    when 'recipes' then array['name_id', 'name_en']
    when 'costumes' then array['name_id', 'name_en', 'info_id', 'info_en', 'reference_image_url']
    when 'ceremonies' then array['name_id', 'name_en', 'summary_id', 'summary_en', 'body_id', 'body_en']
    else array[]::text[]
  end loop
    if private.is_blank(p_row ->> v_field) then
      v_missing := v_missing || v_field;
    end if;
  end loop;

  if cardinality(v_missing) > 0 then
    raise exception 'cannot approve %: missing %', p_table, array_to_string(v_missing, ', ')
      using errcode = '23514';
  end if;

  -- Content shown under a region needs that region to be public first.
  if p_table in ('stories', 'recipes', 'costumes', 'ceremonies') then
    if v_region is null or not exists (
      select 1 from public.regions where id = v_region and review_status = 'approved'
    ) then
      raise exception 'cannot approve %: its region must be approved first', p_table
        using errcode = '23514';
    end if;
  end if;

  if p_table = 'stories' then
    if not exists (select 1 from public.story_chapters where story_id = v_id) then
      raise exception 'cannot approve story: it has no chapters' using errcode = '23514';
    end if;
    -- PRD acceptance check 5: no approval while any chapter lacks alt text
    -- or an audio description, in either language.
    if exists (
      select 1 from public.story_chapters
      where story_id = v_id and (
        private.is_blank(image_alt_id) or private.is_blank(image_alt_en)
        or private.is_blank(audio_description_id) or private.is_blank(audio_description_en))
    ) then
      raise exception 'cannot approve story: every chapter needs alt text and an audio description'
        using errcode = '23514';
    end if;
    if exists (
      select 1 from public.story_chapters where story_id = v_id and review_status <> 'approved'
    ) then
      raise exception 'cannot approve story: approve every chapter first' using errcode = '23514';
    end if;
  end if;

  if p_table = 'recipes' then
    if (p_row ->> 'servings') is null or (p_row ->> 'minutes') is null then
      raise exception 'cannot approve recipe: servings and minutes are required' using errcode = '23514';
    end if;
    if not exists (select 1 from public.recipe_ingredients where recipe_id = v_id)
       or not exists (select 1 from public.recipe_steps where recipe_id = v_id) then
      raise exception 'cannot approve recipe: it needs ingredients and steps' using errcode = '23514';
    end if;
    if exists (
      select 1 from public.recipe_ingredients
      where recipe_id = v_id and (private.is_blank(name_id) or private.is_blank(name_en))
    ) or exists (
      select 1 from public.recipe_steps
      where recipe_id = v_id and (private.is_blank(text_id) or private.is_blank(text_en))
    ) then
      raise exception 'cannot approve recipe: every ingredient and step needs both languages'
        using errcode = '23514';
    end if;
  end if;

  -- Stories, recipes, dress and ceremonies are checked against a source before
  -- they go live. This also means a recipe can never be published as
  -- verified_by_source halal without a cited source.
  v_content_type := case p_table
    when 'stories' then 'story' when 'recipes' then 'recipe' when 'costumes' then 'costume'
    when 'ceremonies' then 'ceremony'
  end;
  if v_content_type is not null and not exists (
    select 1 from public.content_sources
    where content_type = v_content_type and content_id = v_id
  ) then
    raise exception 'cannot approve %: cite at least one source', p_table using errcode = '23514';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- review_content: the review API entry point (ceremony added)
-- ---------------------------------------------------------------------------

create or replace function public.review_content(p_entity text, p_id uuid, p_action text, p_reason text default null)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_table text := case p_entity
    when 'region' then 'regions'
    when 'story' then 'stories'
    when 'chapter' then 'story_chapters'
    when 'recipe' then 'recipes'
    when 'costume' then 'costumes'
    when 'ceremony' then 'ceremonies'
  end;
  v_target text := case p_action
    when 'approve' then 'approved'
    when 'reject' then 'rejected'
    when 'unpublish' then 'unpublished'
  end;
  v_current text;
  v_result text;
begin
  if v_table is null then
    raise exception 'unknown content type' using errcode = '22023';
  end if;
  if v_target is null then
    raise exception 'unknown review action' using errcode = '22023';
  end if;
  if p_reason is not null and char_length(p_reason) > 1000 then
    raise exception 'reason is too long' using errcode = '22023';
  end if;

  execute format('select review_status from public.%I where id = $1', v_table)
    into v_current using p_id;
  if v_current is null then
    raise exception 'content not found' using errcode = 'P0002';
  end if;
  if v_current = v_target then
    raise exception 'content is already %', v_target using errcode = '23514';
  end if;

  perform set_config('app.review_reason', coalesce(p_reason, ''), true);
  execute format('update public.%I set review_status = $1 where id = $2 returning review_status', v_table)
    into v_result using v_target, p_id;
  perform set_config('app.review_reason', '', true);

  if v_result is null then
    raise exception 'content not found' using errcode = 'P0002';
  end if;
  return v_result;
end;
$$;

revoke all on function public.review_content(text, uuid, text, text) from public, anon;
grant execute on function public.review_content(text, uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- The AI Workflow publishes ceremonies too (2+ websites, as for every type)
-- ---------------------------------------------------------------------------

create or replace function private.ai_publish(p_entity text, p_id uuid, p_reason text)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_table text := case p_entity
    when 'region' then 'regions'
    when 'story' then 'stories'
    when 'recipe' then 'recipes'
    when 'costume' then 'costumes'
    when 'ceremony' then 'ceremonies'
  end;
  v_current text;
begin
  if (select auth.uid()) is not null or current_user in ('anon', 'authenticated') then
    raise exception 'only the AI Workflow can use ai_publish' using errcode = '42501';
  end if;
  if v_table is null then
    raise exception 'unknown content type (chapters are published with their story)' using errcode = '22023';
  end if;
  if private.is_blank(p_reason) or char_length(p_reason) > 1000 then
    raise exception 'say what was checked (1 to 1000 characters)' using errcode = '22023';
  end if;

  execute format('select review_status from public.%I where id = $1', v_table) into v_current using p_id;
  if v_current is null then
    raise exception 'content not found' using errcode = 'P0002';
  end if;
  if v_current = 'approved' then
    return 'approved';
  end if;

  if p_entity = 'region' then
    if not exists (
      select 1 from (
        select 'story' as t, id from public.stories where region_id = p_id
        union all select 'recipe', id from public.recipes where region_id = p_id
        union all select 'costume', id from public.costumes where region_id = p_id
        union all select 'ceremony', id from public.ceremonies where region_id = p_id
      ) item
      where private.source_sites(item.t, item.id) >= 2
    ) then
      raise exception 'cannot publish region: none of its items cites 2 different websites' using errcode = '23514';
    end if;
  elsif private.source_sites(p_entity, p_id) < 2 then
    raise exception 'cannot publish %: it needs sources from at least 2 different websites', p_entity
      using errcode = '23514';
  end if;

  perform set_config('app.ai_publish', 'on', true);
  perform set_config('app.review_reason', p_reason, true);
  if p_entity = 'story' then
    update public.story_chapters set review_status = 'approved'
    where story_id = p_id and review_status in ('draft', 'unpublished');
  end if;
  execute format('update public.%I set review_status = ''approved'' where id = $1', v_table) using p_id;
  perform set_config('app.ai_publish', '', true);
  perform set_config('app.review_reason', '', true);
  return 'approved';
end;
$$;

comment on function private.ai_publish(text, uuid, text) is
  'AI Workflow only: publishes a region, story (with its chapters), recipe, dress or ceremony that cites 2+ different websites. Logged as ai_workflow.';

-- ---------------------------------------------------------------------------
-- Search includes approved ceremonies
-- ---------------------------------------------------------------------------

create or replace function public.search_content(p_query text, p_locale text default 'id', p_limit integer default 20)
returns table (
  content_type text,
  id uuid,
  slug text,
  title text,
  summary text,
  region_slug text,
  region_name text,
  rank real
)
language sql
stable
security invoker
set search_path = ''
as $$
  with input as (
    select
      raw.q,
      p_locale = 'en' as en,
      websearch_to_tsquery('simple'::regconfig, raw.q) as tsq,
      '%' || replace(replace(replace(raw.q, '\', '\\'), '%', '\%'), '_', '\_') || '%' as pattern
    from (select left(btrim(regexp_replace(coalesce(p_query, ''), '\s+', ' ', 'g')), 100) as q) raw
  ),
  docs as (
    select
      'story'::text as content_type, s.id, s.slug, s.title_id, s.title_en,
      s.summary_id, s.summary_en, s.region_id,
      concat_ws(' ', s.title_id, s.title_en) as names,
      concat_ws(' ', s.title_id, s.title_en, s.summary_id, s.summary_en, (
        select string_agg(concat_ws(' ', c.text_id, c.text_en), ' ')
        from public.story_chapters c
        where c.story_id = s.id and c.review_status = 'approved'
      )) as body
    from public.stories s
    where s.review_status = 'approved'
    union all
    select
      'recipe', r.id, r.slug, r.name_id, r.name_en, null, null, r.region_id,
      concat_ws(' ', r.name_id, r.name_en),
      concat_ws(' ', r.name_id, r.name_en, (
        select string_agg(concat_ws(' ', i.name_id, i.name_en), ' ')
        from public.recipe_ingredients i
        where i.recipe_id = r.id
      ))
    from public.recipes r
    where r.review_status = 'approved'
    union all
    select
      'costume', c.id, c.slug, c.name_id, c.name_en, c.info_id, c.info_en, c.region_id,
      concat_ws(' ', c.name_id, c.name_en),
      concat_ws(' ', c.name_id, c.name_en, c.info_id, c.info_en)
    from public.costumes c
    where c.review_status = 'approved'
    union all
    select
      'ceremony', c.id, c.slug, c.name_id, c.name_en, c.summary_id, c.summary_en, c.region_id,
      concat_ws(' ', c.name_id, c.name_en),
      concat_ws(' ', c.name_id, c.name_en, c.summary_id, c.summary_en, c.timing_id, c.timing_en, c.body_id, c.body_en)
    from public.ceremonies c
    where c.review_status = 'approved'
    union all
    select
      'region', g.id, g.slug, g.name_id, g.name_en, g.summary_id, g.summary_en, null,
      concat_ws(' ', g.name_id, g.name_en),
      concat_ws(' ', g.name_id, g.name_en, g.summary_id, g.summary_en)
    from public.regions g
    where g.review_status = 'approved'
  ),
  scored as (
    select
      d.*,
      to_tsvector('simple'::regconfig, d.body) @@ i.tsq as fts_match,
      ts_rank(to_tsvector('simple'::regconfig, d.body), i.tsq) as fts_rank,
      extensions.word_similarity(i.q, d.names) as name_similarity,
      d.names ilike i.pattern as name_contains
    from docs d
    cross join input i
    where i.q <> ''
  )
  select
    s.content_type,
    s.id,
    s.slug,
    case when i.en then coalesce(nullif(btrim(s.title_en), ''), s.title_id) else s.title_id end,
    case
      when i.en then coalesce(nullif(btrim(s.summary_en), ''), s.summary_id)
      else coalesce(nullif(btrim(s.summary_id), ''), s.summary_en)
    end,
    g.slug,
    case when i.en then coalesce(nullif(btrim(g.name_en), ''), g.name_id) else g.name_id end,
    (s.fts_rank + s.name_similarity + case when s.name_contains then 0.5 else 0 end)::real
  from scored s
  cross join input i
  left join public.regions g on g.id = s.region_id and g.review_status = 'approved'
  where s.fts_match or s.name_contains or s.name_similarity >= 0.4
  order by 8 desc, 4
  limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;

comment on function public.search_content(text, text, integer) is
  'Searches approved stories, recipes, costumes, ceremonies and regions. Never returns drafts, for any caller.';

-- ---------------------------------------------------------------------------
-- Table security: RLS, review gate, audit, grants (the same as costumes)
-- ---------------------------------------------------------------------------

alter table public.ceremonies enable row level security;

-- Approved rows are public, staff see and write all rows. No DELETE policy.
create policy "ceremonies: public read approved"
  on public.ceremonies for select to anon, authenticated
  using (review_status = 'approved' or (select private.is_staff()));
create policy "ceremonies: staff insert"
  on public.ceremonies for insert to authenticated with check ((select private.is_staff()));
create policy "ceremonies: staff update"
  on public.ceremonies for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

create trigger guard_approval before insert or update on public.ceremonies
  for each row execute function private.guard_approval();

create trigger audit_review_change after update on public.ceremonies
  for each row when (old.review_status is distinct from new.review_status)
  execute function private.audit_review_change();

revoke all on table public.ceremonies from anon, authenticated, service_role;
grant select on table public.ceremonies to anon, authenticated;
grant insert, update on table public.ceremonies to authenticated;
grant select, insert, update on table public.ceremonies to service_role;
