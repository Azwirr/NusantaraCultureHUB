import "server-only";

import { connection } from "next/server";

import { createPublicClient } from "./supabase/public";
import { createClient } from "./supabase/server";

export type StoryRequest = {
  id: string;
  title: string;
  note: string | null;
  status: "open" | "planned" | "done" | "hidden";
  createdAt: string;
  nickname: string | null;
};

const STATUSES = ["open", "planned", "done", "hidden"] as const;
const asStatus = (value: string): StoryRequest["status"] =>
  (STATUSES as readonly string[]).includes(value) ? (value as StoryRequest["status"]) : "open";

/** Visible requests (planned first) with nicknames only. Works for guests too. */
export async function getPublicRequests(limit = 50): Promise<StoryRequest[]> {
  // Fresh on every request (a new request should show at once), read as a guest.
  await connection();
  const { data, error } = await createPublicClient().rpc("story_requests_list", { p_limit: limit });
  if (error) throw new Error(`story requests: ${error.message}`);
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    note: row.note,
    status: asStatus(row.status),
    createdAt: row.created_at,
    nickname: row.nickname,
  }));
}

/** Every request, hidden ones included, for staff (RLS gives others only their own). */
export async function getAllRequests(): Promise<Omit<StoryRequest, "nickname">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("story_requests")
    .select("id, title, note, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`story requests: ${error.message}`);
  return data.map((row) => ({ id: row.id, title: row.title, note: row.note, status: asStatus(row.status), createdAt: row.created_at }));
}
