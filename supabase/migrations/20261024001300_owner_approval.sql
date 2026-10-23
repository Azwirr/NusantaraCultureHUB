-- Phase 2b, part 13: an owner may approve content they last edited.
--
-- User decision (2026-10-23): Claude researches and drafts content from
-- checked sources (as the AI Workflow, so it is never the creator of record
-- as a person), and the owner checks, corrects and approves it alone.
-- * Nobody, owners included, approves a row they created.
-- * Reviewers still never approve a row they last edited (four-eyes).
-- * Callers with no auth user (the AI Workflow) still cannot approve.
-- Everything else is the same as part 5.

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
