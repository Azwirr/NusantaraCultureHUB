import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { generateText } from "ai";
import { PARTS, costumeParts } from "./assets";
import { PORTRAIT_MODEL, portraitPrompt } from "./portrait";

export async function generatePortrait(face: Uint8Array, slug: string, title: string, signal: AbortSignal, fake = false): Promise<Buffer> {
  const paths = costumeParts(slug); if (!paths) throw new Error("unknown_costume");
  const references = await Promise.all(PARTS.map((part) => readFile(path.join(process.cwd(), "public", paths[part]))));
  let output: Uint8Array;
  if (fake) {
    // Deliberately obvious deterministic test output: never impersonates a successful AI portrait.
    output = await sharp({ create: { width: 768, height: 1024, channels: 3, background: "#ece0ca" } }).composite([{ input: Buffer.from('<svg width="768" height="1024"><text x="70" y="500" font-size="40">TEST PROVIDER — NOT AI</text></svg>') }]).png().toBuffer();
  } else {
    const result = await generateText({
      model: PORTRAIT_MODEL, maxRetries: 0, abortSignal: signal,
      messages: [{ role: "user", content: [
        { type: "text", text: portraitPrompt(title) },
        { type: "image", image: face, mediaType: "image/jpeg" },
        ...references.map((image) => ({ type: "image" as const, image, mediaType: "image/webp" })),
      ] }],
      providerOptions: {
        google: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio: "3:4", imageSize: "1K" } },
        gateway: { zeroDataRetention: true, disallowPromptTraining: true },
      },
    });
    const image = result.files.find((file) => file.mediaType.startsWith("image/"));
    if (!image) throw new Error("no_image");
    output = image.uint8Array;
  }
  const resized = await sharp(output, { limitInputPixels: 20_000_000 }).rotate().resize({ width: 1024, height: 1365, fit: "inside", withoutEnlargement: true }).toBuffer();
  const meta = await sharp(resized).metadata();
  const width = meta.width!, height = meta.height!;
  const watermark = Buffer.from(`<svg width="${width}" height="${height}"><rect x="0" y="${height - 44}" width="${width}" height="44" fill="#142a46" fill-opacity="0.9"/><text x="16" y="${height - 16}" fill="#fff9ee" font-family="sans-serif" font-size="16">Nusantara Culture Hub · ${fake ? "TEST PREVIEW" : "AI Portrait"}</text></svg>`);
  return sharp(resized).composite([{ input: watermark }]).webp({ quality: 86 }).toBuffer();
}
