-- Phase 2d, part 15: the AI Workflow publishes well-documented content.
--
-- User decision (2026-10-23): when the user asks Claude to find content, Claude
-- may publish an item itself if it is widely documented as Indonesian
-- (Nusantara) heritage. "Widely documented" is checked here, not trusted:
-- * every story, recipe and dress cites at least 2 sources from 2 different
--   websites (a region needs at least one such item);
-- * every other rule still applies (assert_publishable: both languages, alt
--   text and audio descriptions, an approved region, a dress image);
-- * only private.ai_publish can do it, only the AI Workflow (operator or
--   service role, no auth user) can call it, and it can only approve;
-- * the audit log records it as 'ai_workflow', never as a person.
-- The owner can still unpublish anything from /review.

-- 1. The approval guard: one extra path, everything else as in part 13. -------
create or replace function private.guard_approval()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_reason text := nullif(btrim(coalesce(current_setting('app.review_reason', true), '')), '');
  -- Columns that are bookkeeping, not content.
  v_meta text[] := array['review_status', 'created_by', 'updated_by', 'created_at', 'updated_at'];
  v_content_changed boolean;
  -- Set only by private.ai_publish (members and guests cannot call it).
  v_ai_publish boolean := v_uid is null
    and current_user not in ('anon', 'authenticated')
    and coalesce(current_setting('app.ai_publish', true), '') = 'on';
begin
  if tg_op = 'INSERT' then
    if new.review_status is distinct from 'draft' then
      raise exception 'new % rows must start as draft', tg_table_name using errcode = '23514';
    end if;
    new.created_by := v_uid;
    new.updated_by := v_uid;
    new.created_at := now();
    new.updated_at := now();
    return new;
  end if;

  -- UPDATE. Authorship is immutable, except that deleting the auth user
  -- clears it through the foreign key.
  if not private.is_deleted_user_cleared(old.created_by, new.created_by) then
    new.created_by := old.created_by;
  end if;
  new.created_at := old.created_at;
  new.updated_at := now();
  v_content_changed := (to_jsonb(new) - v_meta) is distinct from (to_jsonb(old) - v_meta);

  if private.is_deleted_user_cleared(old.updated_by, new.updated_by) then
    null; -- the last editor's account was deleted
  elsif v_uid is null then
    -- The AI Workflow or an operator: keep the human editor on record, so
    -- the reviewer who last edited still cannot approve it.
    new.updated_by := old.updated_by;
  elsif v_content_changed then
    new.updated_by := v_uid;
  elsif new.updated_by is distinct from old.updated_by and new.updated_by is distinct from v_uid then
    -- A caller may only stamp itself as the editor (used by child-row edits).
    new.updated_by := old.updated_by;
  end if;

  if new.review_status is distinct from old.review_status then
    if v_content_changed then
      raise exception 'change content and review status in separate updates' using errcode = '23514';
    end if;
    if v_ai_publish then
      -- The AI Workflow may only publish; private.ai_publish checked the sources.
      if new.review_status <> 'approved' then
        raise exception 'the AI Workflow can only publish' using errcode = '42501';
      end if;
    elsif v_uid is null or not private.is_staff() then
      raise exception 'only a reviewer or owner can change review_status' using errcode = '42501';
    end if;

    case new.review_status
      when 'approved' then
        if old.review_status not in ('draft', 'unpublished') then
          raise exception 'cannot approve a % row', old.review_status using errcode = '23514';
        end if;
        -- Nobody approves what they created. Reviewers also never approve what
        -- they last edited; an owner may (Phase 2b: content is drafted by the
        -- AI Workflow from checked sources, and the owner corrects and approves).
        if v_uid = old.created_by then
          raise exception 'you cannot approve content you created' using errcode = '42501';
        end if;
        if v_uid = old.updated_by and not private.is_owner() then
          raise exception 'you cannot approve content you created or last edited' using errcode = '42501';
        end if;
        perform private.assert_publishable(tg_table_name, to_jsonb(new));
      when 'rejected' then
        if old.review_status <> 'draft' then
          raise exception 'only drafts can be rejected' using errcode = '23514';
        end if;
        if v_reason is null then
          raise exception 'a reason is required to reject' using errcode = '23514';
        end if;
      when 'unpublished' then
        if old.review_status <> 'approved' then
          raise exception 'only approved content can be unpublished' using errcode = '23514';
        end if;
        if v_reason is null then
          raise exception 'a reason is required to unpublish' using errcode = '23514';
        end if;
      when 'draft' then
        if old.review_status not in ('rejected', 'unpublished') then
          raise exception 'cannot move a % row back to draft', old.review_status using errcode = '23514';
        end if;
      else
        raise exception 'unknown review status %', new.review_status using errcode = '23514';
    end case;
    return new;
  end if;

  if v_content_changed then
    if old.review_status = 'approved' then
      raise exception 'approved % rows are locked; unpublish before editing', tg_table_name
        using errcode = '23514';
    end if;
    if old.review_status <> 'draft' then
      -- Rejected or unpublished: an edit resubmits it. Only staff may do
      -- that; the AI Workflow (no auth user) may only touch drafts.
      if v_uid is null or not private.is_staff() then
        raise exception 'only drafts can be edited without a reviewer session' using errcode = '42501';
      end if;
      new.review_status := 'draft';
    end if;
  end if;

  return new;
end;
$$;

-- 2. The audit log names the AI Workflow. ---------------------------------------
create or replace function private.audit_review_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  insert into public.audit_log (actor_id, actor_type, action, entity, entity_id, reason, details)
  values (
    v_uid,
    case
      when v_uid is not null then 'user'
      when coalesce(current_setting('app.ai_publish', true), '') = 'on' then 'ai_workflow'
      else 'system'
    end,
    case new.review_status
      when 'approved' then 'approve'
      when 'rejected' then 'reject'
      when 'unpublished' then 'unpublish'
      else 'revert_to_draft'
    end,
    tg_table_name,
    new.id,
    nullif(btrim(coalesce(current_setting('app.review_reason', true), '')), ''),
    jsonb_build_object('from', old.review_status, 'to', new.review_status)
  );
  return null;
end;
$$;
revoke all on function private.audit_review_change() from public;

-- 3. The number of different websites an item cites. ----------------------------
-- A website is its registrable domain, so regional.kompas.com and kompas.com
-- count once, and so do food.detik.com and detik.com. Second-level country
-- domains keep three labels (antaranews.com, but kemdikbud.go.id, unp.ac.id).
create function private.site_of(p_url text)
returns text
language sql
immutable
set search_path = ''
as $$
  with host as (
    select string_to_array(lower(split_part(split_part(split_part(p_url, '://', 2), '/', 1), ':', 1)), '.') as l
  )
  select case
    when cardinality(l) >= 3 and char_length(l[cardinality(l)]) = 2
      and l[cardinality(l) - 1] in ('co', 'ac', 'go', 'or', 'web', 'my', 'sch', 'net', 'com', 'org', 'gov', 'edu')
      then array_to_string(l[cardinality(l) - 2:cardinality(l)], '.')
    else array_to_string(l[greatest(cardinality(l) - 1, 1):cardinality(l)], '.')
  end
  from host;
$$;
revoke all on function private.site_of(text) from public, anon, authenticated;
grant execute on function private.site_of(text) to service_role;

create function private.source_sites(p_type text, p_id uuid)
returns integer
language sql
stable
set search_path = ''
as $$
  select count(distinct private.site_of(s.url))::integer
  from public.content_sources cs
  join public.sources s on s.id = cs.source_id
  where cs.content_type = p_type and cs.content_id = p_id and s.url is not null;
$$;
revoke all on function private.source_sites(text, uuid) from public, anon, authenticated;
grant execute on function private.source_sites(text, uuid) to service_role;

-- 4. The one way the AI Workflow publishes. --------------------------------------
create function private.ai_publish(p_entity text, p_id uuid, p_reason text)
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
revoke all on function private.ai_publish(text, uuid, text) from public, anon, authenticated;
grant execute on function private.ai_publish(text, uuid, text) to service_role;

comment on function private.ai_publish(text, uuid, text) is
  'AI Workflow only: publishes a region, story (with its chapters), recipe or dress that cites 2+ different websites. Logged as ai_workflow.';
