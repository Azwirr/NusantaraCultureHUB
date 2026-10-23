"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { getSessionUser, isStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type RequestErrorCode = "signed_out" | "invalid_input" | "limit" | "forbidden" | "unknown";

export type RequestFormState =
  | { status: "idle" }
  | { status: "done" }
  | { status: "error"; code: RequestErrorCode };

const requestSchema = z.object({
  title: z.string().trim().min(3).max(120),
  note: z.string().trim().max(500).optional(),
});

/** A member asks for a new story, recipe or dress. The database limits it to 5 a day. */
export async function createStoryRequest(_prev: RequestFormState, formData: FormData): Promise<RequestFormState> {
  if (!(await getSessionUser())) return { status: "error", code: "signed_out" };
  const parsed = requestSchema.safeParse({
    title: formData.get("title") ?? "",
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { status: "error", code: "invalid_input" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("story_requests")
    .insert({ title: parsed.data.title, note: parsed.data.note || null });
  if (error) {
    if (error.code === "54000") return { status: "error", code: "limit" };
    if (error.code === "23514") return { status: "error", code: "invalid_input" };
    return { status: "error", code: "unknown" };
  }
  refresh();
  return { status: "done" };
}

const statusSchema = z.object({ id: z.guid(), status: z.enum(["open", "planned", "done", "hidden"]) });

/** Staff plan, close or hide a request. RLS lets only staff change the status. */
export async function setRequestStatus(_prev: RequestFormState, formData: FormData): Promise<RequestFormState> {
  if (!isStaff(await getSessionUser())) return { status: "error", code: "forbidden" };
  const parsed = statusSchema.safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return { status: "error", code: "invalid_input" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("story_requests")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .select("id");
  if (error || !data?.length) return { status: "error", code: "unknown" };
  refresh();
  return { status: "done" };
}
