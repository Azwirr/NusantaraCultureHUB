import { describe, expect, it, vi } from "vitest";
import sharp from "sharp";
vi.mock("server-only", () => ({}));
vi.mock("ai", () => ({ generateText: vi.fn() }));
import { generateText } from "ai";
import { generatePortrait } from "../../src/lib/try-on/portrait-provider";
import { PORTRAIT_MODEL } from "../../src/lib/try-on/portrait";

describe("portrait provider boundary", () => {
  it("sends one identity image and all three garment references with privacy filters and no paid retries", async () => {
    const image = await sharp({ create: { width: 768, height: 1024, channels: 3, background: "#f1eadc" } }).png().toBuffer();
    vi.mocked(generateText).mockResolvedValue({ files: [{ mediaType: "image/png", uint8Array: image }] } as unknown as Awaited<ReturnType<typeof generateText>>);
    const face = new Uint8Array([1, 2, 3]);
    const result = await generatePortrait(face, "baju-bodo", "Baju Bodo", new AbortController().signal);
    const call = vi.mocked(generateText).mock.calls.at(-1)![0];
    expect(call.model).toBe(PORTRAIT_MODEL); expect(call.maxRetries).toBe(0);
    expect(call.providerOptions?.gateway).toEqual({ zeroDataRetention: true, disallowPromptTraining: true });
    const content = call.messages![0].content;
    expect(Array.isArray(content)).toBe(true);
    expect(content).toHaveLength(5); // fixed prompt + identity + head/upper/lower
    expect(content[1]).toEqual({ type: "image", image: face, mediaType: "image/jpeg" });
    expect((await sharp(result).metadata()).format).toBe("webp");
  }, 30_000);
  it("uses an unmistakable deterministic test image without invoking the real model", async () => {
    vi.mocked(generateText).mockClear();
    const signal = new AbortController().signal;
    const a = await generatePortrait(new Uint8Array([1]), "baju-bodo", "Baju Bodo", signal, true);
    const b = await generatePortrait(new Uint8Array([2]), "baju-bodo", "Baju Bodo", signal, true);
    expect(a.equals(b)).toBe(true); expect(generateText).not.toHaveBeenCalled();
  }, 30_000);
});
