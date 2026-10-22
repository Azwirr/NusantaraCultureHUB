import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireApiRole } from "@/lib/api";
import { isReviewAction, isReviewEntityType } from "@/lib/review";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.strictObject({ reason: z.string().max(1000).optional() });

/**
 * POST /api/review/{region|story|chapter|recipe|costume}/{id}/{approve|reject|unpublish}
 * Body: { "reason": "..." } (required for reject and unpublish).
 *
 * The role check here gives clear 401/403 answers; the database decides for
 * real: review_content runs as the caller, so RLS and guard_approval enforce
 * roles, four-eyes review, required reasons and approval preconditions.
 */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/review/[type]/[id]/[action]">) {
  const guard = await requireApiRole(request, "staff");
  if (!guard.ok) return guard.response;

  const { type, id, action } = await ctx.params;
  if (!isReviewEntityType(type) || !isReviewAction(action) || !z.guid().safeParse(id).success) {
    return apiError(404, "not_found");
  }

  let raw: unknown;
  try {
    const text = await request.text();
    raw = text.trim() ? JSON.parse(text) : {};
  } catch {
    return apiError(400, "invalid_request", "Body must be JSON");
  }
  const body = bodySchema.safeParse(raw);
  if (!body.success) return apiError(400, "invalid_request");

  const reason = body.data.reason?.trim() || null;
  if ((action === "reject" || action === "unpublish") && !reason) {
    return apiError(400, "reason_required");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("review_content", {
    p_entity: type,
    p_id: id,
    p_action: action,
    p_reason: reason,
  });

  if (error) {
    switch (error.code) {
      case "P0002":
        return apiError(404, "not_found");
      case "42501":
        return apiError(403, "forbidden", error.message);
      case "23514":
        return apiError(409, "conflict", error.message);
      case "22023":
        return apiError(400, "invalid_request", error.message);
      default:
        console.error("review_content failed", { code: error.code, type, id, action });
        return apiError(500, "server_error");
    }
  }

  return NextResponse.json({ id, review_status: data }, { headers: { "Cache-Control": "no-store" } });
}
