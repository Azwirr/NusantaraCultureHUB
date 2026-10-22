-- Phase 1 foundation, part 4: the review gate.
--
-- guard_approval runs before every insert and update on regions, stories,
-- story_chapters, recipes and costumes. It is the database-level guarantee
-- behind PRD acceptance checks 3, 4 and 5 and build plan checks 4 and 6:
--
--   * New rows always start as draft. Authorship comes from the session.
--   * Only a signed-in reviewer or owner can change review_status. Callers
--     with no auth user (the AI Workflow on the service role, anon, an
--     operator) cannot, so the AI can never publish anything.
--   * Nobody approves their own work: not the creator, and not the last
--     person who edited the content.
--   * Reject and unpublish need a reason. Approval needs both languages and,
--     for stories, recipes and costumes, a cited source.
--   * Approved rows are locked. Unpublish first, then edit. Editing a rejected
--     or unpublished row sends it back to draft for a fresh review.
--
-- Allowed transitions:
--   draft -> approved | rejected
--   approved -> unpublished
--   unpublished -> approved | draft
--   rejected -> draft

-- ---------------------------------------------------------------------------
-- Approval preconditions
-- ---------------------------------------------------------------------------

create function private.is_blank(p_value text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_value is null or btrim(p_value) = '';
$$;

-- Raises when a row is not ready to be published. SECURITY DEFINER so it sees
-- every child row regardless of the caller's RLS view; it only reads.
create function private.assert_publishable(p_table text, p_row jsonb)
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
    when 'regions' then array['name_id', 'name_en']
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

revoke all on function private.is_blank(text), private.assert_publishable(text, jsonb) from public;
grant execute on function private.is_blank(text), private.assert_publishable(text, jsonb)
  to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- guard_approval
-- ---------------------------------------------------------------------------

-- SECURITY INVOKER: it must judge the real caller. It calls the SECURITY
-- DEFINER helpers above for anything that needs a full view of the data.
create function private.guard_approval()
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

  -- UPDATE. Authorship is immutable.
  new.created_by := old.created_by;
  new.created_at := old.created_at;
  new.updated_at := now();
  v_content_changed := (to_jsonb(new) - v_meta) is distinct from (to_jsonb(old) - v_meta);

  if v_content_changed then
    new.updated_by := v_uid;
  elsif new.updated_by is distinct from old.updated_by and new.updated_by is distinct from v_uid then
    -- A caller may only stamp itself as the editor (used by child-row edits).
    new.updated_by := old.updated_by;
  end if;

  if new.review_status is distinct from old.review_status then
    if v_content_changed then
      raise exception 'change content and review status in separate updates' using errcode = '23514';
    end if;
    if v_uid is null or not private.is_staff() then
      raise exception 'only a reviewer or owner can change review_status' using errcode = '42501';
    end if;

    case new.review_status
      when 'approved' then
        if old.review_status not in ('draft', 'unpublished') then
          raise exception 'cannot approve a % row', old.review_status using errcode = '23514';
        end if;
        if v_uid = old.created_by or v_uid = old.updated_by then
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

create trigger guard_approval before insert or update on public.regions
  for each row execute function private.guard_approval();
create trigger guard_approval before insert or update on public.stories
  for each row execute function private.guard_approval();
create trigger guard_approval before insert or update on public.story_chapters
  for each row execute function private.guard_approval();
create trigger guard_approval before insert or update on public.recipes
  for each row execute function private.guard_approval();
create trigger guard_approval before insert or update on public.costumes
  for each row execute function private.guard_approval();

-- ---------------------------------------------------------------------------
-- Audit every review status change (FR-13)
-- ---------------------------------------------------------------------------

create function private.audit_review_change()
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
    case when v_uid is null then 'system' else 'user' end,
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

create trigger audit_review_change after update on public.regions
  for each row when (old.review_status is distinct from new.review_status)
  execute function private.audit_review_change();
create trigger audit_review_change after update on public.stories
  for each row when (old.review_status is distinct from new.review_status)
  execute function private.audit_review_change();
create trigger audit_review_change after update on public.story_chapters
  for each row when (old.review_status is distinct from new.review_status)
  execute function private.audit_review_change();
create trigger audit_review_change after update on public.recipes
  for each row when (old.review_status is distinct from new.review_status)
  execute function private.audit_review_change();
create trigger audit_review_change after update on public.costumes
  for each row when (old.review_status is distinct from new.review_status)
  execute function private.audit_review_change();

-- ---------------------------------------------------------------------------
-- Ingredients and steps follow their recipe's lock
-- ---------------------------------------------------------------------------

create function private.guard_recipe_child()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_recipe_id uuid := case when tg_op = 'DELETE' then old.recipe_id else new.recipe_id end;
  v_status text;
begin
  if tg_op = 'UPDATE' and new.recipe_id is distinct from old.recipe_id then
    raise exception 'ingredients and steps cannot move between recipes' using errcode = '23514';
  end if;

  select review_status into v_status from public.recipes where id = v_recipe_id;
  if v_status = 'approved' then
    raise exception 'the recipe is approved and locked; unpublish it before editing' using errcode = '23514';
  end if;

  -- Editing a child counts as editing the recipe: resubmit it if needed and
  -- record the editor, so they cannot approve it themselves.
  if v_status in ('rejected', 'unpublished') then
    update public.recipes set review_status = 'draft' where id = v_recipe_id;
  end if;
  update public.recipes set updated_by = v_uid where id = v_recipe_id;

  if tg_op = 'DELETE' then
    return old;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger guard_recipe_child before insert or update or delete on public.recipe_ingredients
  for each row execute function private.guard_recipe_child();
create trigger guard_recipe_child before insert or update or delete on public.recipe_steps
  for each row execute function private.guard_recipe_child();

-- ---------------------------------------------------------------------------
-- Sources: citations of public content cannot change silently
-- ---------------------------------------------------------------------------

create function private.content_status(p_type text, p_id uuid)
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
  end;
$$;
revoke all on function private.content_status(text, uuid) from public;
grant execute on function private.content_status(text, uuid) to anon, authenticated, service_role;

create function private.guard_content_sources()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_row public.content_sources := case when tg_op = 'DELETE' then old else new end;
  v_status text := private.content_status(v_row.content_type, v_row.content_id);
begin
  if tg_op = 'UPDATE' then
    raise exception 'content_sources rows cannot be updated; delete and insert instead' using errcode = '23514';
  end if;
  if v_status is null then
    raise exception 'no % with id %', v_row.content_type, v_row.content_id using errcode = '23503';
  end if;
  if v_status = 'approved' then
    raise exception 'the % is approved and locked; unpublish it before changing its sources', v_row.content_type
      using errcode = '23514';
  end if;
  return v_row;
end;
$$;

create trigger guard_content_sources before insert or update or delete on public.content_sources
  for each row execute function private.guard_content_sources();

create function private.guard_sources()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := (select auth.uid());
    new.created_at := now();
    new.updated_at := now();
    return new;
  end if;
  new.created_by := old.created_by;
  new.created_at := old.created_at;
  new.updated_at := now();
  if exists (
    select 1 from public.content_sources cs
    where cs.source_id = old.id
      and private.content_status(cs.content_type, cs.content_id) = 'approved'
  ) then
    raise exception 'this source is cited by approved content and is locked' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger guard_sources before insert or update on public.sources
  for each row execute function private.guard_sources();

-- ---------------------------------------------------------------------------
-- review_content: the one entry point the review API calls
-- ---------------------------------------------------------------------------

-- SECURITY INVOKER: it runs as the calling reviewer, so RLS and
-- guard_approval judge the real user. It only adds the reason (read by the
-- triggers above) and turns the action name into a status.
create function public.review_content(p_entity text, p_id uuid, p_action text, p_reason text default null)
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
