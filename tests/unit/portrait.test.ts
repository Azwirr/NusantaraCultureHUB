import { beforeEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ user: vi.fn(), db: vi.fn(), provider: vi.fn() }));
vi.mock("../../src/lib/auth", () => ({ getSessionUser: mocks.user, isStaff: () => false }));
vi.mock("../../src/lib/supabase/server", () => ({ createClient: mocks.db }));
vi.mock("../../src/lib/try-on/portrait-provider", () => ({ generatePortrait: mocks.provider }));
import { POST } from "../../src/app/api/try-on/generate/route";
import { PORTRAIT_CONSENT, portraitPrompt } from "../../src/lib/try-on/portrait";

const quota = vi.fn(), maybeSingle = vi.fn();
const select = { select: () => select, eq: vi.fn(() => select), maybeSingle };
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("TRY_ON_AI_ENABLED", "true"); vi.stubEnv("AI_GATEWAY_API_KEY", "test-only"); vi.stubEnv("TRY_ON_FAKE_PROVIDER", "0");
  mocks.user.mockResolvedValue({ id: "member", roles: [] });
  maybeSingle.mockResolvedValue({ data: { name_id: "Baju Bodo" }, error: null });
  quota.mockResolvedValue({ data: [{ allowed: true, remaining: 19, daily_limit: 20 }], error: null });
  mocks.db.mockResolvedValue({ from: () => select, rpc: quota });
  mocks.provider.mockResolvedValue(Buffer.from("test-image"));
});
async function request(options: { consent?: boolean; slug?: string; invalid?: boolean; origin?: string } = {}) {
  const form = new FormData(); form.set("dress", options.slug ?? "baju-bodo");
  if (options.consent !== false) form.set("consent", PORTRAIT_CONSENT);
  const bytes = options.invalid ? Buffer.from("invalid") : await readFile("public/covers/costume-ulos.webp");
  form.set("face", new File([bytes], "face.webp", { type: "image/webp" }));
  return new NextRequest("http://localhost:3100/api/try-on/generate", { method: "POST", body: form, headers: { host: "localhost:3100", origin: options.origin ?? "http://localhost:3100" } });
}
describe("consented AI portrait endpoint", () => {
  it("requires member authentication and refuses cross-origin use before processing a photo", async () => {
    mocks.user.mockResolvedValue(null);
    expect((await POST(await request())).status).toBe(401);
    expect((await POST(await request({ origin: "https://attacker.example" }))).status).toBe(403);
    expect(quota).not.toHaveBeenCalled(); expect(mocks.provider).not.toHaveBeenCalled();
  });
  it("requires consent, a known approved costume and real decodable image pixels", async () => {
    for (const options of [{ consent: false }, { slug: "../../secret" }, { invalid: true }]) expect((await POST(await request(options))).status).toBe(400);
    maybeSingle.mockResolvedValue({ data: null, error: null });
    expect((await POST(await request())).status).toBe(404);
    expect(quota).not.toHaveBeenCalled(); expect(mocks.provider).not.toHaveBeenCalled();
  });
  it("fails closed when disabled or daily quota is exhausted", async () => {
    vi.stubEnv("TRY_ON_AI_ENABLED", "false"); expect((await POST(await request())).status).toBe(503);
    vi.stubEnv("TRY_ON_AI_ENABLED", "true");
    quota.mockResolvedValue({ data: [{ allowed: false }], error: null });
    expect((await POST(await request())).status).toBe(429); expect(mocks.provider).not.toHaveBeenCalled();
  });
  it("re-encodes photos, consumes atomic quota and returns a private no-store image", async () => {
    const response = await POST(await request());
    expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("content-type")).toBe("image/webp"); expect(response.headers.get("X-AI-Remaining")).toBe("19");
    expect(quota).toHaveBeenCalledOnce(); expect(quota).toHaveBeenCalledWith("consume_assistant_question");
    const image = await sharp(mocks.provider.mock.calls[0][0]).metadata(); expect(image.format).toBe("jpeg"); expect(image.exif).toBeUndefined();
    expect(select.eq).toHaveBeenCalledWith("review_status", "approved");
  });
  it("does not expose provider failure payloads", async () => {
    mocks.provider.mockRejectedValue(new Error("secret image payload"));
    const response = await POST(await request()); expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("secret image payload");
  });
  it("binds face identity and complete costume references in the fixed image-only task", () => {
    const prompt = portraitPrompt("Ulos"); expect(prompt).toContain("ONLY identity reference"); expect(prompt).toContain("Images 2, 3 and 4"); expect(prompt).toContain("not float");
  });
});
