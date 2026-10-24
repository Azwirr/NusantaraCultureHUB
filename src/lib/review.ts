import "server-only";

import { createClient } from "@/lib/supabase/server";

import {
  CITATION_TYPES,
  REVIEW_ENTITIES,
  REVIEW_STATUSES,
  type ReviewEntityType,
  type ReviewStatus,
} from "./review-types";

export * from "./review-types";

/** Every read below runs as the signed-in reviewer: RLS decides what they see. */

export type DraftCounts = Record<ReviewEntityType, number>;
export type StatusCounts = Record<ReviewEntityType, Record<ReviewStatus, number>>;

export type QueueItem = {
  type: ReviewEntityType;
  id: string;
  /** Indonesian title (the source language of the archive). */
  title: string;
  titleEn: string | null;
  /** Story title for chapters, region name for everything else. */
  context: string | null;
  chapterNo: number | null;
  status: ReviewStatus;
  updatedAt: string;
};

type Named = { name_id: string; name_en: string | null } | null;

function asStatus(value: string): ReviewStatus {
  return (REVIEW_STATUSES as readonly string[]).includes(value) ? (value as ReviewStatus) : "draft";
}

/** All content the reviewer can see, newest change first (small MVP tables). */
export async function getQueue(): Promise<QueueItem[]> {
  const supabase = await createClient();
  const [regions, stories, chapters, recipes, costumes, ceremonies] = await Promise.all([
    supabase.from("regions").select("id, name_id, name_en, review_status, updated_at").limit(500),
    supabase
      .from("stories")
      .select("id, title_id, title_en, review_status, updated_at, regions(name_id, name_en)")
      .limit(500),
    supabase
      .from("story_chapters")
      .select("id, chapter_no, review_status, updated_at, stories(title_id, title_en)")
      .limit(1000),
    supabase
      .from("recipes")
      .select("id, name_id, name_en, review_status, updated_at, regions(name_id, name_en)")
      .limit(500),
    supabase
      .from("costumes")
      .select("id, name_id, name_en, review_status, updated_at, regions(name_id, name_en)")
      .limit(500),
    supabase
      .from("ceremonies")
      .select("id, name_id, name_en, review_status, updated_at, regions(name_id, name_en)")
      .limit(500),
  ]);
  for (const result of [regions, stories, chapters, recipes, costumes, ceremonies]) {
    if (result.error) throw new Error(`review queue: ${result.error.message}`);
  }

  const region = (row: { regions: Named }) => row.regions?.name_id ?? null;
  const items: QueueItem[] = [
    ...(regions.data ?? []).map((row) => ({
      type: "region" as const, id: row.id, title: row.name_id, titleEn: row.name_en,
      context: null, chapterNo: null, status: asStatus(row.review_status), updatedAt: row.updated_at,
    })),
    ...(stories.data ?? []).map((row) => ({
      type: "story" as const, id: row.id, title: row.title_id, titleEn: row.title_en,
      context: region(row), chapterNo: null, status: asStatus(row.review_status), updatedAt: row.updated_at,
    })),
    ...(chapters.data ?? []).map((row) => ({
      type: "chapter" as const, id: row.id, title: row.stories?.title_id ?? "", titleEn: row.stories?.title_en ?? null,
      context: row.stories?.title_id ?? null, chapterNo: row.chapter_no,
      status: asStatus(row.review_status), updatedAt: row.updated_at,
    })),
    ...(recipes.data ?? []).map((row) => ({
      type: "recipe" as const, id: row.id, title: row.name_id, titleEn: row.name_en,
      context: region(row), chapterNo: null, status: asStatus(row.review_status), updatedAt: row.updated_at,
    })),
    ...(costumes.data ?? []).map((row) => ({
      type: "costume" as const, id: row.id, title: row.name_id, titleEn: row.name_en,
      context: region(row), chapterNo: null, status: asStatus(row.review_status), updatedAt: row.updated_at,
    })),
    ...(ceremonies.data ?? []).map((row) => ({
      type: "ceremony" as const, id: row.id, title: row.name_id, titleEn: row.name_en,
      context: region(row), chapterNo: null, status: asStatus(row.review_status), updatedAt: row.updated_at,
    })),
  ];
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function countByStatus(items: QueueItem[]): StatusCounts {
  const counts = Object.fromEntries(
    (Object.keys(REVIEW_ENTITIES) as ReviewEntityType[]).map((type) => [
      type,
      Object.fromEntries(REVIEW_STATUSES.map((status) => [status, 0])),
    ]),
  ) as StatusCounts;
  for (const item of items) counts[item.type][item.status] += 1;
  return counts;
}

/**
 * Counts drafts per content type as the current user. Staff see real
 * numbers; anyone else sees zeros because RLS hides drafts from them.
 */
export async function getDraftCounts(): Promise<DraftCounts> {
  const counts = countByStatus(await getQueue());
  return Object.fromEntries(
    (Object.keys(counts) as ReviewEntityType[]).map((type) => [type, counts[type].draft]),
  ) as DraftCounts;
}

// ---------------------------------------------------------------------------
// One item
// ---------------------------------------------------------------------------

export type LinkedSource = {
  linkId: string;
  sourceId: string;
  title: string;
  url: string | null;
  license: string | null;
  credit: string | null;
};

export type SourceOption = { id: string; title: string; url: string | null };

export type HistoryEntry = {
  id: string;
  action: string;
  actor: string | null;
  actorType: string;
  reason: string | null;
  createdAt: string;
};

export type ReviewChild =
  | { kind: "chapter"; id: string; chapterNo: number; status: ReviewStatus }
  | {
      kind: "ingredient";
      id: string;
      position: number;
      name_id: string;
      name_en: string | null;
      amount: number | null;
      unit: string | null;
    }
  | { kind: "step"; id: string; stepNo: number; text_id: string | null; text_en: string | null };

export type ReviewItem = {
  type: ReviewEntityType;
  id: string;
  row: Record<string, unknown>;
  status: ReviewStatus;
  title: string;
  /** Parent story for chapters. */
  parent: { type: ReviewEntityType; id: string; title: string } | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdByMe: boolean;
  editedByMe: boolean;
  children: ReviewChild[];
  sources: LinkedSource[];
  history: HistoryEntry[];
};

/** Nicknames of staff by user id (staff may read staff nicknames, migration part 11). */
async function staffNames(ids: (string | null | undefined)[]): Promise<Map<string, string>> {
  const wanted = [...new Set(ids.filter((id): id is string => !!id))];
  if (!wanted.length) return new Map();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, username").in("id", wanted);
  return new Map((data ?? []).map((row) => [row.id, row.username]));
}

export async function getReviewItem(
  type: ReviewEntityType,
  id: string,
  currentUserId: string,
): Promise<ReviewItem | null> {
  const supabase = await createClient();
  const table = REVIEW_ENTITIES[type];
  const { data: row, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`review item: ${error.message}`);
  if (!row) return null;
  const record = row as Record<string, unknown>;

  const [children, parent, sourceLinks, history] = await Promise.all([
    loadChildren(type, id),
    type === "chapter"
      ? supabase.from("stories").select("id, title_id").eq("id", String(record.story_id)).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("content_sources")
      .select("id, source_id, sources(title, url, license, credit)")
      .eq("content_type", CITATION_TYPES[type])
      .eq("content_id", id),
    supabase
      .from("audit_log")
      .select("id, action, actor_id, actor_type, reason, created_at")
      .eq("entity", table)
      .eq("entity_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const createdBy = (record.created_by as string | null) ?? null;
  const updatedBy = (record.updated_by as string | null) ?? null;
  const names = await staffNames([createdBy, updatedBy, ...(history.data ?? []).map((entry) => entry.actor_id)]);

  const title =
    type === "story"
      ? String(record.title_id ?? "")
      : type === "chapter"
        ? `${parent.data?.title_id ?? ""} · ${record.chapter_no}`
        : String(record.name_id ?? "");

  return {
    type,
    id,
    row: record,
    status: asStatus(String(record.review_status)),
    title,
    parent: parent.data ? { type: "story", id: parent.data.id, title: parent.data.title_id } : null,
    createdBy: createdBy ? (names.get(createdBy) ?? null) : null,
    updatedBy: updatedBy ? (names.get(updatedBy) ?? null) : null,
    createdByMe: createdBy === currentUserId,
    editedByMe: updatedBy === currentUserId,
    children,
    sources: (sourceLinks.data ?? []).flatMap((link) =>
      link.sources
        ? [{
            linkId: link.id,
            sourceId: link.source_id,
            title: link.sources.title,
            url: link.sources.url,
            license: link.sources.license,
            credit: link.sources.credit,
          }]
        : [],
    ),
    history: (history.data ?? []).map((entry) => ({
      id: entry.id,
      action: entry.action,
      actor: entry.actor_id ? (names.get(entry.actor_id) ?? null) : null,
      actorType: entry.actor_type,
      reason: entry.reason,
      createdAt: entry.created_at,
    })),
  };
}

async function loadChildren(type: ReviewEntityType, id: string): Promise<ReviewChild[]> {
  const supabase = await createClient();
  if (type === "story") {
    const { data } = await supabase
      .from("story_chapters")
      .select("id, chapter_no, review_status")
      .eq("story_id", id)
      .order("chapter_no");
    return (data ?? []).map((row) => ({
      kind: "chapter", id: row.id, chapterNo: row.chapter_no, status: asStatus(row.review_status),
    }));
  }
  if (type === "recipe") {
    const [ingredients, steps] = await Promise.all([
      supabase
        .from("recipe_ingredients")
        .select("id, position, name_id, name_en, amount, unit")
        .eq("recipe_id", id)
        .order("position"),
      supabase.from("recipe_steps").select("id, step_no, text_id, text_en").eq("recipe_id", id).order("step_no"),
    ]);
    return [
      ...(ingredients.data ?? []).map((row) => ({ kind: "ingredient" as const, ...row })),
      ...(steps.data ?? []).map((row) => ({
        kind: "step" as const, id: row.id, stepNo: row.step_no, text_id: row.text_id, text_en: row.text_en,
      })),
    ];
  }
  return [];
}

/** Every source, for linking an existing one to an item. */
export async function getSourceOptions(): Promise<SourceOption[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("sources").select("id, title, url").order("title").limit(500);
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Audit log and roles
// ---------------------------------------------------------------------------

export type AuditEntry = HistoryEntry & {
  entity: string;
  entityId: string;
  details: Record<string, unknown>;
};

const TABLE_TO_TYPE = Object.fromEntries(
  Object.entries(REVIEW_ENTITIES).map(([type, table]) => [table, type]),
) as Record<string, ReviewEntityType>;

export function reviewTypeForTable(table: string): ReviewEntityType | null {
  return TABLE_TO_TYPE[table] ?? null;
}

export async function getAuditLog(limit = 100): Promise<AuditEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("id, action, actor_id, actor_type, entity, entity_id, reason, details, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`audit log: ${error.message}`);
  const rows = data ?? [];
  const names = await staffNames(rows.flatMap((row) => [row.actor_id, row.entity === "user_roles" ? row.entity_id : null]));
  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    actor: row.actor_id ? (names.get(row.actor_id) ?? null) : null,
    actorType: row.actor_type,
    reason: row.reason,
    createdAt: row.created_at,
    entity: row.entity,
    entityId: row.entity_id,
    details: {
      ...((row.details ?? {}) as Record<string, unknown>),
      ...(row.entity === "user_roles" ? { nickname: names.get(row.entity_id) ?? null } : {}),
    },
  }));
}

export type StaffMember = { userId: string; nickname: string | null; roles: ("reviewer" | "owner")[] };

/** Owners see every grant; RLS shows anyone else only their own. */
export async function getStaff(): Promise<StaffMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("user_roles").select("user_id, role").order("created_at");
  if (error) throw new Error(`staff: ${error.message}`);
  const names = await staffNames((data ?? []).map((row) => row.user_id));
  const byUser = new Map<string, StaffMember>();
  for (const row of data ?? []) {
    if (row.role !== "reviewer" && row.role !== "owner") continue;
    const member = byUser.get(row.user_id) ?? { userId: row.user_id, nickname: names.get(row.user_id) ?? null, roles: [] };
    member.roles.push(row.role);
    byUser.set(row.user_id, member);
  }
  return [...byUser.values()].sort((a, b) => (a.nickname ?? "").localeCompare(b.nickname ?? ""));
}
