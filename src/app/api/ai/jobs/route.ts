import type { NextRequest } from "next/server";

import { apiError, requireApiRole } from "@/lib/api";

/**
 * POST /api/ai/jobs (FR-12). Reviewer only. Phase 1 stub: the role check is
 * real, the job runner arrives in Phase 2 (no AI calls in Phase 1).
 */
export async function POST(request: NextRequest) {
  const guard = await requireApiRole(request, "staff");
  if (!guard.ok) return guard.response;
  return apiError(501, "not_implemented", "AI jobs ship in Phase 2");
}
