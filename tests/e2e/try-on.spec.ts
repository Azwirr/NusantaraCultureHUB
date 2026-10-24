import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { account, signIn } from "./helpers";

test.use({ permissions: ["camera"], launchOptions: { args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] } });
test.beforeEach(async ({ context, baseURL }) => { await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]); });

test("prepared outfit references are available without floating camera overlays", async ({ page }) => {
  await page.goto("/try-on?dress=baju-bodo");
  const main = page.getByRole("main");
  await expect(main.getByRole("combobox", { name: "Choose a dress for the portrait", exact: true })).toHaveValue("baju-bodo", { timeout: 20_000 });
  await expect(main.getByRole("heading", { name: "1. Choose a complete outfit" })).toBeVisible();
  for (const part of ["head", "top", "bottom"]) await expect(main.locator(`img[src$="baju-bodo-${part}.webp"]`)).toBeVisible();
  await expect(main.getByRole("slider")).toHaveCount(0);
  await expect(main.getByRole("link", { name: "Sign in to create a portrait" })).toBeVisible();
});

test("camera captures a face, stops tracks and never uploads before consent", async ({ page }) => {
  await page.goto("/try-on"); const main = page.getByRole("main");
  const uploads: string[] = [];
  page.on("request", (r) => { if (!["GET", "HEAD"].includes(r.method())) uploads.push(r.url()); });
  await main.getByRole("button", { name: "Open camera", exact: true }).click();
  const video = main.locator("video");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.videoWidth)).toBeGreaterThan(0);
  await main.getByRole("button", { name: "Take face photo", exact: true }).click();
  await expect(main.getByAltText("Face photo for AI portrait", { exact: true })).toBeVisible();
  expect(await video.evaluate((v: HTMLVideoElement) => v.srcObject)).toBeNull();
  await expect(main.getByRole("checkbox")).not.toBeChecked(); expect(uploads).toEqual([]);
  await main.getByRole("button", { name: "Remove face photo" }).click();
  await expect(main.getByAltText("Face photo for AI portrait", { exact: true })).toHaveCount(0);
});

test("invalid photos and denied camera permission leave a usable upload flow", async ({ page }) => {
  await page.addInitScript(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException("denied", "NotAllowedError"); }; });
  await page.goto("/try-on"); const main = page.getByRole("main");
  await main.getByRole("button", { name: "Open camera", exact: true }).click();
  await expect(main.getByRole("alert")).toContainText("permission was denied");
  await main.getByLabel("Upload face photo", { exact: true }).setInputFiles({ name: "bad.png", mimeType: "image/png", buffer: Buffer.from("bad") });
  await expect(main.getByRole("alert")).toContainText("Choose a clear");
  await main.getByLabel("Upload face photo", { exact: true }).setInputFiles("public/covers/costume-ulos.webp");
  await expect(main.getByAltText("Face photo for AI portrait", { exact: true })).toBeVisible();
});

test("the portrait API refuses anonymous and cross-origin requests", async ({ request, baseURL }) => {
  expect((await request.post("/api/try-on/generate")).status()).toBe(401);
  expect((await request.post("/api/try-on/generate", { headers: { origin: "https://untrusted.example", host: new URL(baseURL!).host } })).status()).toBe(403);
});

test.describe("member portrait flow with deterministic response", () => {
  const member = account("MEMBER"); test.skip(!member, "needs E2E_MEMBER_* account");
  test("explicit consent gates generation, result downloads, and quota errors are explained", async ({ page }) => {
    test.setTimeout(60_000); await signIn(page, member!); await page.goto("/try-on?dress=payas-agung");
    const main = page.getByRole("main");
    const calls: Buffer[] = [];
    const image = await readFile("public/covers/costume-payas-agung.webp");
    await page.route("**/api/try-on/generate", async (route) => {
      calls.push(route.request().postDataBuffer()!);
      await route.fulfill({ status: 200, contentType: "image/webp", headers: { "X-AI-Remaining": "19" }, body: image });
    });
    const generate = main.getByRole("button", { name: "Generate portrait", exact: true });
    await expect(generate).toBeDisabled();
    await main.getByLabel("Upload face photo", { exact: true }).setInputFiles("public/covers/costume-ulos.webp");
    await expect(main.getByAltText("Face photo for AI portrait", { exact: true })).toBeVisible();
    await expect(generate).toBeDisabled(); expect(calls).toHaveLength(0);
    await main.getByRole("checkbox").check(); await generate.click();
    await expect(main.getByAltText("AI portrait of you wearing Payas agung", { exact: true })).toBeVisible();
    expect(calls).toHaveLength(1); expect(calls[0].includes(Buffer.from("portrait-ai-v1"))).toBe(true);
    const download = page.waitForEvent("download"); await main.getByRole("link", { name: "Download portrait" }).click();
    expect((await download).suggestedFilename()).toBe("nusantara-payas-agung-ai.webp");
    await page.unroute("**/api/try-on/generate");
    await page.route("**/api/try-on/generate", (route) => route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ error: { code: "quota_exceeded" } }) }));
    await generate.click(); await expect(main.getByRole("alert")).toContainText("quota is used up");
    await expect(main.getByRole("heading", { name: "Your traditional dress portrait" })).toHaveCount(0);
  });
});
