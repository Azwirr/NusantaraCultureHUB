import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { getSessionUser, isStaff, type SessionUser } from "@/lib/auth";

export type ApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "cross_origin"
  | "not_found"
  | "invalid_request"
  | "reason_required"
  | "conflict"
  | "not_implemented"
  | "server_error";

export function apiError(status: number, code: ApiErrorCode, message?: string) {
  return NextResponse.json({ error: { code, message: message ?? code } }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * Browsers always send Origin on cross-site POSTs. Refuse a mismatch so a
 * third-party page cannot drive a reviewer's session. Non-browser clients
 * that omit Origin still have to present a valid session cookie.
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

type Guarded = { ok: true; user: SessionUser } | { ok: false; response: NextResponse };

/**
 * Role check for route handlers, run before anything else so every protected
 * route answers 401 to guests and 403 to the wrong role. RLS checks again.
 */
export async function requireApiRole(
  request: NextRequest,
  role: "member" | "staff",
): Promise<Guarded> {
  if (!isSameOrigin(request)) return { ok: false, response: apiError(403, "cross_origin") };
  const user = await getSessionUser();
  if (!user) return { ok: false, response: apiError(401, "unauthorized") };
  if (role === "staff" && !isStaff(user)) return { ok: false, response: apiError(403, "forbidden") };
  return { ok: true, user };
}
