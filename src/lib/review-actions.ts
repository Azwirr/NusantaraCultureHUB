"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";

import { getSessionUser, isStaff } from "@/lib/auth";
import { CONTENT_TAG } from "@/lib/content-tags";
import { mapReviewError, type ReviewError } from "@/lib/review-errors";
import { DIETARY_TAGS, INGREDIENT_UNITS, PROVINCE_CODES, REQUIRED_ID_COLUMNS, REVIEW_FIELDS } from "@/lib/review-fields";
import { CITATION_TYPES, isReviewAction, isReviewEntityType, REVIEW_ENTITIES } from "@/lib/review-types";
import type { TablesUpdate } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

// Every action runs as the signed-in reviewer. The checks here only give
// clear messages; RLS and guard_approval in the database decide for real.

export type ReviewFormState =
  | { status: "idle" }
  | { status: "done"; result?: string }
  | ({ status: "error" } & ReviewError);

const uuid = z.guid();

function fail(error: ReviewError): ReviewFormState {
  return { status: "error", ...error };
}

async function staffOrFail(): Promise<ReviewFormState | null> {
  const user = await getSessionUser();
  return isStaff(user) ? null : fail({ code: "forbidden" });
}

function target(formData: FormData) {
  const type = formData.get("type");
  const id = formData.get("id");
  if (!isReviewEntityType(type) || !uuid.safeParse(id).success) return null;
  return { type, id: String(id) };
}

/** Approve, reject (with a reason) or unpublish (with a reason). */
export async function runReviewAction(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const denied = await staffOrFail();
  if (denied) return denied;
  const item = target(formData);
  const action = formData.get("action");
  if (!item || !isReviewAction(action)) return fail({ code: "invalid_input" });

  const reason = String(formData.get("reason") ?? "").trim().slice(0, 1000) || null;
  if ((action === "reject" || action === "unpublish") && !reason) return fail({ code: "reason_required" });

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("review_content", {
    p_entity: item.type,
    p_id: item.id,
    p_action: action,
    p_reason: reason ?? undefined,
  });
  if (error) return fail(mapReviewError(error));

  // Public pages read approved content from the cache; drop it now.
  updateTag(CONTENT_TAG);
  refresh();
  return { status: "done", result: data };
}

function text(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\r\n/g, "\n").trim();
  return trimmed === "" ? null : trimmed;
}

/** Saves the edited fields of one item. Only changed columns are written. */
export async function saveReviewFields(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const denied = await staffOrFail();
  if (denied) return denied;
  const item = target(formData);
  if (!item) return fail({ code: "invalid_input" });

  const supabase = await createClient();
  const table = REVIEW_ENTITIES[item.type];
  const { data: current, error: readError } = await supabase.from(table).select("*").eq("id", item.id).maybeSingle();
  if (readError) return fail(mapReviewError(readError));
  if (!current) return fail({ code: "not_found" });
  const row = current as Record<string, unknown>;

  const patch: Record<string, unknown> = {};
  const invalid: string[] = [];
  const { pairs, singles } = REVIEW_FIELDS[item.type];

  for (const pair of pairs) {
    for (const column of [pair.id, pair.en]) {
      const value = text(formData, column);
      if (value && value.length > pair.max) invalid.push(column);
      else if (!value && REQUIRED_ID_COLUMNS.has(column)) invalid.push(column);
      else if (value !== (row[column] ?? null)) patch[column] = value;
    }
  }

  for (const field of singles) {
    const column = field.column;
    let value: unknown;
    switch (field.kind) {
      case "number": {
        const raw = text(formData, column);
        const parsed = raw === null ? null : Number(raw);
        if (parsed !== null && (!Number.isInteger(parsed) || parsed < field.min || parsed > field.max)) {
          invalid.push(column);
          continue;
        }
        // sort_order is NOT NULL: keep the old value when cleared.
        value = parsed ?? (column === "sort_order" ? row[column] : null);
        break;
      }
      case "url": {
        const raw = text(formData, column);
        if (raw && !/^(https:\/\/|\/(?!\/))/.test(raw)) {
          invalid.push(column);
          continue;
        }
        value = raw;
        break;
      }
      case "codes": {
        const codes = (text(formData, column) ?? "")
          .split(/[\s,]+/)
          .map((code) => code.toUpperCase())
          .filter(Boolean);
        if (codes.some((code) => !(PROVINCE_CODES as readonly string[]).includes(code))) {
          invalid.push(column);
          continue;
        }
        value = [...new Set(codes)];
        break;
      }
      case "select": {
        const raw = text(formData, column);
        if (!raw || !field.options.includes(raw)) {
          invalid.push(column);
          continue;
        }
        value = raw;
        break;
      }
      case "tags": {
        const tags = formData.getAll(column).map(String);
        if (tags.some((tag) => !(DIETARY_TAGS as readonly string[]).includes(tag))) {
          invalid.push(column);
          continue;
        }
        value = DIETARY_TAGS.filter((tag) => tags.includes(tag));
        break;
      }
    }
    if (JSON.stringify(value ?? null) !== JSON.stringify(row[column] ?? null)) patch[column] = value;
  }

  if (invalid.length) return fail({ code: "invalid_input", fields: invalid });

  if (Object.keys(patch).length) {
    // The table is chosen at run time; the columns come only from REVIEW_FIELDS.
    const { error } = await supabase.from(table).update(patch as never).eq("id", item.id);
    if (error) return fail(mapReviewError(error));
  }

  if (item.type === "recipe") {
    const childError = await saveRecipeChildren(item.id, formData);
    if (childError) return childError;
  }

  refresh();
  return { status: "done", result: Object.keys(patch).length ? "saved" : "unchanged" };
}

/** Ingredient and step rows arrive as ingredient.<id>.<column> and step.<id>.<column>. */
async function saveRecipeChildren(recipeId: string, formData: FormData): Promise<ReviewFormState | null> {
  const supabase = await createClient();
  const [ingredients, steps] = await Promise.all([
    supabase.from("recipe_ingredients").select("id, name_id, name_en, amount, unit").eq("recipe_id", recipeId),
    supabase.from("recipe_steps").select("id, text_id, text_en").eq("recipe_id", recipeId),
  ]);

  for (const ingredient of ingredients.data ?? []) {
    const prefix = `ingredient.${ingredient.id}.`;
    if (!formData.has(`${prefix}name_id`)) continue;
    const nameId = text(formData, `${prefix}name_id`);
    const nameEn = text(formData, `${prefix}name_en`);
    const amountRaw = text(formData, `${prefix}amount`);
    const amount = amountRaw === null ? null : Number(amountRaw.replace(",", "."));
    const unit = text(formData, `${prefix}unit`);
    if (
      !nameId || nameId.length > 200 || (nameEn?.length ?? 0) > 200 ||
      (amount !== null && !(amount > 0 && amount < 100000)) ||
      (unit !== null && !(INGREDIENT_UNITS as readonly string[]).includes(unit))
    ) {
      return fail({ code: "invalid_input", fields: [`${prefix}name_id`] });
    }
    const patch: TablesUpdate<"recipe_ingredients"> = {};
    if (nameId !== ingredient.name_id) patch.name_id = nameId;
    if (nameEn !== ingredient.name_en) patch.name_en = nameEn;
    if (amount !== (ingredient.amount === null ? null : Number(ingredient.amount))) patch.amount = amount;
    if (unit !== ingredient.unit) patch.unit = unit;
    if (Object.keys(patch).length) {
      const { error } = await supabase.from("recipe_ingredients").update(patch).eq("id", ingredient.id);
      if (error) return fail(mapReviewError(error));
    }
  }

  for (const step of steps.data ?? []) {
    const prefix = `step.${step.id}.`;
    if (!formData.has(`${prefix}text_id`)) continue;
    const textId = text(formData, `${prefix}text_id`);
    const textEn = text(formData, `${prefix}text_en`);
    if ((textId?.length ?? 0) > 4000 || (textEn?.length ?? 0) > 4000) {
      return fail({ code: "invalid_input", fields: [`${prefix}text_id`] });
    }
    const patch: TablesUpdate<"recipe_steps"> = {};
    if (textId !== step.text_id) patch.text_id = textId;
    if (textEn !== step.text_en) patch.text_en = textEn;
    if (Object.keys(patch).length) {
      const { error } = await supabase.from("recipe_steps").update(patch).eq("id", step.id);
      if (error) return fail(mapReviewError(error));
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

const sourceSchema = z.object({
  title: z.string().trim().min(1).max(300),
  url: z
    .string()
    .trim()
    .max(2048)
    .regex(/^https?:\/\//)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  license: z.string().trim().max(200).optional(),
  credit: z.string().trim().max(300).optional(),
});

/** Creates a source and cites it for this item in one step. */
export async function addSource(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const denied = await staffOrFail();
  if (denied) return denied;
  const item = target(formData);
  const parsed = sourceSchema.safeParse({
    title: formData.get("title") ?? "",
    url: formData.get("url") ?? "",
    license: formData.get("license") || undefined,
    credit: formData.get("credit") || undefined,
  });
  if (!item || !parsed.success) {
    return fail({ code: "invalid_input", fields: parsed.success ? [] : parsed.error.issues.map((i) => String(i.path[0])) });
  }

  const supabase = await createClient();
  const { data: source, error } = await supabase
    .from("sources")
    .insert({
      title: parsed.data.title,
      url: parsed.data.url ?? null,
      license: parsed.data.license || null,
      credit: parsed.data.credit || null,
    })
    .select("id")
    .single();
  if (error || !source) return fail(mapReviewError(error));

  const { error: linkError } = await supabase
    .from("content_sources")
    .insert({ content_type: CITATION_TYPES[item.type], content_id: item.id, source_id: source.id });
  if (linkError) return fail(mapReviewError(linkError));

  refresh();
  return { status: "done", result: "added" };
}

/** Cites an existing source for this item. */
export async function linkSource(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const denied = await staffOrFail();
  if (denied) return denied;
  const item = target(formData);
  const sourceId = formData.get("source_id");
  if (!item || !uuid.safeParse(sourceId).success) return fail({ code: "invalid_input" });

  const supabase = await createClient();
  const { error } = await supabase
    .from("content_sources")
    .insert({ content_type: CITATION_TYPES[item.type], content_id: item.id, source_id: String(sourceId) });
  if (error) return fail(mapReviewError(error));
  refresh();
  return { status: "done", result: "linked" };
}

/** Removes one citation (the source itself stays for other items). */
export async function unlinkSource(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const denied = await staffOrFail();
  if (denied) return denied;
  const linkId = formData.get("link_id");
  if (!uuid.safeParse(linkId).success) return fail({ code: "invalid_input" });

  const supabase = await createClient();
  const { data, error } = await supabase.from("content_sources").delete().eq("id", String(linkId)).select("id");
  if (error) return fail(mapReviewError(error));
  if (!data?.length) return fail({ code: "not_found" });
  refresh();
  return { status: "done", result: "unlinked" };
}

// ---------------------------------------------------------------------------
// Roles (owner only; RLS and guard_user_roles enforce it)
// ---------------------------------------------------------------------------

const nicknameSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,24}$/);
const roleSchema = z.enum(["reviewer", "owner"]);

export async function grantRole(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const user = await getSessionUser();
  if (!user?.roles.includes("owner")) return fail({ code: "forbidden" });
  const nickname = nicknameSchema.safeParse(formData.get("nickname"));
  const role = roleSchema.safeParse(formData.get("role"));
  if (!nickname.success || !role.success) return fail({ code: "invalid_input", fields: ["nickname"] });

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("id").eq("username", nickname.data).maybeSingle();
  if (!profile) return fail({ code: "nickname_not_found", fields: ["nickname"] });

  const { error } = await supabase.from("user_roles").insert({ user_id: profile.id, role: role.data });
  if (error) return fail(mapReviewError(error));
  refresh();
  return { status: "done", result: "granted" };
}

export async function revokeRole(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const user = await getSessionUser();
  if (!user?.roles.includes("owner")) return fail({ code: "forbidden" });
  const userId = formData.get("user_id");
  const role = roleSchema.safeParse(formData.get("role"));
  if (!uuid.safeParse(userId).success || !role.success) return fail({ code: "invalid_input" });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", String(userId))
    .eq("role", role.data)
    .select("id");
  if (error) return fail(mapReviewError(error));
  if (!data?.length) return fail({ code: "not_found" });
  refresh();
  return { status: "done", result: "revoked" };
}
