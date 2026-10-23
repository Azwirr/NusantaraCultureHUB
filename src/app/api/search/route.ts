import { connection, type NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api";
import { isLocale } from "@/lib/i18n/config";
import { normalizeQuery, searchContent } from "@/lib/search";

/**
 * GET /api/search?q=rendang&lang=id — the search palette's results as JSON.
 * Public: approved content only (search_content never returns drafts).
 */
export async function GET(request: NextRequest) {
  await connection();
  const params = request.nextUrl.searchParams;
  const q = normalizeQuery(params.get("q"));
  const lang = params.get("lang");
  const locale = isLocale(lang) ? lang : "id";
  try {
    const hits = await searchContent(q, locale, 8);
    return NextResponse.json({ q, hits }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=60" } });
  } catch (error) {
    console.error("search failed", error);
    return apiError(500, "server_error");
  }
}
