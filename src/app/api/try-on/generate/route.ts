import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { requireApiRole } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { generatePortrait } from "@/lib/try-on/portrait-provider";
import { MAX_FACE_BYTES, PORTRAIT_CONSENT, validCostume } from "@/lib/try-on/portrait";

// Node.js is the default runtime (sharp needs it); cacheComponents forbids `runtime`.
export const maxDuration = 120;
const headers = { "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff" };
function failure(status: number, code: string) { return NextResponse.json({ error: { code } }, { status, headers }); }

export async function POST(request: NextRequest) {
  const guard = await requireApiRole(request, "member");
  if (!guard.ok) return guard.response;
  // Tests cannot enable a fake provider on Vercel or a public hostname.
  const fake = process.env.TRY_ON_FAKE_PROVIDER === "1" && !process.env.VERCEL && ["localhost", "127.0.0.1"].includes(request.nextUrl.hostname);
  if (!fake && (process.env.TRY_ON_AI_ENABLED !== "true" || !process.env.AI_GATEWAY_API_KEY)) return failure(503, "not_configured");
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) return failure(400, "invalid_photo");
  if (Number(request.headers.get("content-length") ?? 0) > MAX_FACE_BYTES + 50_000) return failure(413, "photo_too_large");
  let form: FormData;
  try {
    // Bound chunked bodies as well as Content-Length. No unbounded form parser.
    const reader = request.body?.getReader(); if (!reader) return failure(400, "invalid_photo");
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const item = await reader.read(); if (item.done) break;
      size += item.value.byteLength;
      if (size > MAX_FACE_BYTES + 50_000) { await reader.cancel(); return failure(413, "photo_too_large"); }
      chunks.push(item.value);
    }
    form = await new Response(new Uint8Array(Buffer.concat(chunks)), { headers: { "Content-Type": request.headers.get("content-type")! } }).formData();
  } catch { return failure(400, "invalid_photo"); }
  if (form.get("consent") !== PORTRAIT_CONSENT) return failure(400, "consent_required");
  const slug = form.get("dress"), file = form.get("face");
  if (typeof slug !== "string" || !validCostume(slug)) return failure(400, "invalid_costume");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_FACE_BYTES || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) return failure(400, "invalid_photo");
  let face: Buffer;
  try {
    const image = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 25_000_000, animated: false });
    const meta = await image.metadata();
    if (!["jpeg", "png", "webp"].includes(meta.format ?? "") || !meta.width || !meta.height || Math.min(meta.width, meta.height) < 192 || (meta.pages ?? 1) > 1) return failure(400, "invalid_photo");
    // Re-encode pixels to strip metadata and cap provider upload size.
    face = await image.rotate().resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 90 }).toBuffer();
  } catch { return failure(400, "invalid_photo"); }
  const db = await createClient();
  const { data: costume, error } = await db.from("costumes").select("name_id").eq("slug", slug).eq("review_status", "approved").maybeSingle();
  if (error) return failure(503, "unavailable");
  if (!costume) return failure(404, "invalid_costume");
  // Existing atomic daily quota, shared with the grounded assistant. No photo or prompt is stored.
  const quota = await db.rpc("consume_assistant_question");
  if (quota.error || !quota.data?.[0]) return failure(503, "unavailable");
  if (!quota.data[0].allowed) return failure(429, "quota_exceeded");
  try {
    const image = await generatePortrait(face, slug, costume.name_id, AbortSignal.any([request.signal, AbortSignal.timeout(105_000)]), fake);
    return new NextResponse(new Uint8Array(image), { headers: { ...headers, "Content-Type": "image/webp", "Content-Disposition": 'inline; filename="nusantara-ai-portrait.webp"', "X-AI-Remaining": String(quota.data[0].remaining), "X-AI-Test-Provider": String(fake) } });
  } catch {
    // Never log provider errors: they can contain source images or image payloads.
    return failure(502, "generation_failed");
  }
}
