-- Phase 1 foundation, part 5: review gate hardening (security review).
--
-- 1. Four-eyes: a caller with no auth user (the AI Workflow on the service
--    role, or an operator) never clears or replaces the recorded human editor.
--    Before this, an automated edit set updated_by to NULL, after which the
--    reviewer who last edited the row could approve it.
-- 2. Deleting an auth user: the ON DELETE SET NULL actions on created_by and
--    updated_by must get through the guards. Before this, the guards undid
--    them, so deleting staff failed or left ids of deleted users behind.
-- 3. content_sources: non-staff API callers are refused before any lookup,
--    so a member cannot probe whether a hidden draft id exists.
-- 4. Concurrency: ingredient, step and citation writes lock the parent
--    content row, so they cannot slip into content that is being approved
--    at the same moment (READ COMMITTED write skew).

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create function private.user_exists(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from auth.users where id = p_id);
$$;

-- True when a user reference is being cleared because that user was deleted
-- (the foreign key's ON DELETE SET NULL action). Nothing else may clear it.
create function private.is_deleted_user_cleared(p_old uuid, p_new uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_new is null and p_old is not null and not private.user_exists(p_old);
$$;

-- Like content_status, but takes a FOR SHARE lock on the content row. That
-- conflicts with the lock an approving UPDATE holds, so a citation change and
-- an approval of the same row are serialised instead of interleaved.
create function private.lock_content_status(p_type text, p_id uuid)
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
    else v_status := null;
  end case;
  return v_status;
end;
$$;

revoke all on function
  private.user_exists(uuid),
  private.is_deleted_user_cleared(uuid, uuid),
  private.lock_content_status(text, uuid)
  from public;
grant execute on function
  private.user_exists(uuid),
  private.is_deleted_user_cleared(uuid, uuid),
  private.lock_content_status(text, uuid)
  to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- guard_approval (same rules as part 4, with fixes 1 and 2)
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- Ingredients and steps: lock the recipe, stamp only human editors (1, 4)
-- ---------------------------------------------------------------------------

create or replace function private.guard_recipe_child()
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

  -- The lock waits for an approval in progress, then sees its result.
  select review_status into v_status from public.recipes where id = v_recipe_id for no key update;
  if v_status = 'approved' then
    raise exception 'the recipe is approved and locked; unpublish it before editing' using errcode = '23514';
  end if;

  -- Editing a child counts as editing the recipe: resubmit it if needed and
  -- record the human editor, so they cannot approve it themselves.
  if v_status in ('rejected', 'unpublished') then
    update public.recipes set review_status = 'draft' where id = v_recipe_id;
  end if;
  if v_uid is not null then
    update public.recipes set updated_by = v_uid where id = v_recipe_id;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- content_sources: staff only, locked lookups (3, 4)
-- ---------------------------------------------------------------------------

create or replace function private.guard_content_sources()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_row public.content_sources := case when tg_op = 'DELETE' then old else new end;
  v_status text;
begin
  -- Before any lookup, so the error never reveals whether an id exists.
  if current_user in ('anon', 'authenticated') and not private.is_staff() then
    raise exception 'only a reviewer or owner can change content sources' using errcode = '42501';
  end if;
  if tg_op = 'UPDATE' then
    raise exception 'content_sources rows cannot be updated; delete and insert instead' using errcode = '23514';
  end if;

  v_status := private.lock_content_status(v_row.content_type, v_row.content_id);
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

-- ---------------------------------------------------------------------------
-- sources: allow the deleted-user clear, locked lookups (2, 4)
-- ---------------------------------------------------------------------------

create or replace function private.guard_sources()
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

  -- The creator's account was deleted and nothing visible changes.
  if private.is_deleted_user_cleared(old.created_by, new.created_by)
     and (to_jsonb(new) - array['created_by', 'updated_at']) = (to_jsonb(old) - array['created_by', 'updated_at']) then
    return new;
  end if;

  new.created_by := old.created_by;
  new.created_at := old.created_at;
  new.updated_at := now();
  if exists (
    select 1 from public.content_sources cs
    where cs.source_id = old.id
      and private.lock_content_status(cs.content_type, cs.content_id) = 'approved'
  ) then
    raise exception 'this source is cited by approved content and is locked' using errcode = '23514';
  end if;
  return new;
end;
$$;
