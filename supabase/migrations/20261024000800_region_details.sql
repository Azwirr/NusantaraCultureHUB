-- Phase 2, part 8: region intros and map codes.
--
-- * summary_id / summary_en: the short introduction at the top of a region
--   page. Approval now needs both, like every other visible text field.
-- * province_codes: the ISO 3166-2:ID provinces a region covers, used by the
--   navigation map on /regions (a map for finding pages, not a map game).
--   Only the 38 current codes are accepted. A province may belong to more
--   than one cultural region; the map then lists every region it opens.

alter table public.regions
  add column summary_id text check (char_length(summary_id) <= 2000),
  add column summary_en text check (char_length(summary_en) <= 2000),
  add column province_codes text[] not null default '{}' check (
    province_codes <@ array[
      'ID-AC', 'ID-SU', 'ID-SB', 'ID-RI', 'ID-KR', 'ID-JA', 'ID-BE', 'ID-SS', 'ID-BB', 'ID-LA',
      'ID-BT', 'ID-JK', 'ID-JB', 'ID-JT', 'ID-YO', 'ID-JI', 'ID-BA', 'ID-NB', 'ID-NT',
      'ID-KB', 'ID-KT', 'ID-KS', 'ID-KI', 'ID-KU',
      'ID-SA', 'ID-GO', 'ID-ST', 'ID-SR', 'ID-SN', 'ID-SG',
      'ID-MA', 'ID-MU', 'ID-PA', 'ID-PB', 'ID-PD', 'ID-PE', 'ID-PS', 'ID-PT'
    ]::text[]
  );

comment on column public.regions.province_codes is
  'ISO 3166-2:ID province codes covered by this cultural region, for the /regions map.';

-- Same checks as part 4, except that regions now also need both summaries.
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
  foreach v_field in array case p_table
    when 'regions' then array['name_id', 'name_en', 'summary_id', 'summary_en']
    when 'stories' then array['title_id', 'title_en', 'summary_id', 'summary_en']
    when 'story_chapters' then array[
      'text_id', 'text_en', 'image_alt_id', 'image_alt_en',
      'audio_description_id', 'audio_description_en']
    when 'recipes' then array['name_id', 'name_en']
    when 'costumes' then array['name_id', 'name_en', 'info_id', 'info_en', 'reference_image_url']
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
  if p_table in ('stories', 'recipes', 'costumes') then
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

  -- Stories, recipes and costumes are checked against a source before they
  -- go live (content seed: "Sources to verify"). This also means a recipe can
  -- never be published as verified_by_source halal without a cited source.
  v_content_type := case p_table
    when 'stories' then 'story' when 'recipes' then 'recipe' when 'costumes' then 'costume'
  end;
  if v_content_type is not null and not exists (
    select 1 from public.content_sources
    where content_type = v_content_type and content_id = v_id
  ) then
    raise exception 'cannot approve %: cite at least one source', p_table using errcode = '23514';
  end if;
end;
$$;
