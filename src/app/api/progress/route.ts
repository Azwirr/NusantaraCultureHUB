import type { NextRequest } from "next/server";

import { apiError, requireApiRole } from "@/lib/api";

/**
 * POST /api/progress. Signed-in members only. Phase 1 stub: the session check
 * is real, saving progress arrives with the story player in Phase 2.
 */
export async function POST(request: NextRequest) {
  const guard = await requireApiRole(request, "member");
  if (!guard.ok) return guard.response;
  return apiError(501, "not_implemented", "Progress saving ships in Phase 2");
}
