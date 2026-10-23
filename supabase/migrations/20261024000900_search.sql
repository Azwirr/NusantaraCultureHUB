-- Phase 2, part 9: site search (FR-14), also the retrieval step of the
-- grounded assistant (FR-15).
--
-- * search_content is SECURITY INVOKER, so RLS judges the real caller, and it
--   also filters on review_status = 'approved' itself. Guests, members and
--   staff alike only ever get approved rows from it: staff review drafts in
--   the review queue, never through search.
-- * Full-text matching covers titles, summaries, approved chapter text,
--   ingredient names and costume info. Trigram matching on the names keeps
--   typos ("rendnag", "gudek") and partial words ("rend") findable.
-- * The 'simple' text search configuration is used on purpose: it treats
--   Indonesian and English the same and needs no stemming dictionaries.
-- * The query is plain data: it is trimmed, capped at 100 characters, and
--   LIKE wildcards in it are escaped.

create extension if not exists pg_trgm with schema extensions;

create function public.search_content(p_query text, p_locale text default 'id', p_limit integer default 20)
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
  'Searches approved stories, recipes, costumes and regions. Never returns drafts, for any caller.';

revoke all on function public.search_content(text, text, integer) from public;
grant execute on function public.search_content(text, text, integer) to anon, authenticated, service_role;
