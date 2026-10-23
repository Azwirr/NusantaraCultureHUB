"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type SaveResult = { ok: true; saved: boolean } | { ok: false; error: "signed_out" | "not_available" | "unknown" };

const input = z.object({
  type: z.enum(["story", "recipe", "costume"]),
  id: z.guid(),
  save: z.boolean(),
});

/**
 * Saves or unsaves one item for the signed-in member. RLS takes the member
 * from the session and only accepts public content, so a draft id is refused
 * the same way as an id that does not exist.
 */
export async function setSaved(type: string, id: string, save: boolean): Promise<SaveResult> {
  const parsed = input.safeParse({ type, id, save });
  if (!parsed.success) return { ok: false, error: "not_available" };
  if (!(await getSessionUser())) return { ok: false, error: "signed_out" };

  const supabase = await createClient();
  const target = { content_type: parsed.data.type, content_id: parsed.data.id };
  if (parsed.data.save) {
    const { error } = await supabase.from("bookmarks").insert(target);
    // Already saved (a second tab, a double click) counts as saved.
    if (error && error.code !== "23505") {
      return { ok: false, error: error.code === "42501" ? "not_available" : "unknown" };
    }
  } else {
    const { error } = await supabase.from("bookmarks").delete().match(target);
    if (error) return { ok: false, error: "unknown" };
  }
  refresh();
  return { ok: true, saved: parsed.data.save };
}
