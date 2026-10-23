import { expect, test } from "@playwright/test";

test.use({ permissions: ["camera"], launchOptions: { args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] } });
test.beforeEach(async ({ context, baseURL }) => { await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]); });

test("camera, per-part controls, couple mode and PNG export work without uploading frames", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/try-on?dress=baju-bodo");
  const main = page.getByRole("main"), video = main.locator("video");
  await expect(main.getByRole("combobox", { name: "Choose a dress", exact: true })).toHaveValue("baju-bodo", { timeout: 20_000 });
  const sent: string[] = [];
  page.on("request", (r) => { if (!["GET", "HEAD"].includes(r.method())) sent.push(r.url()); });
  await main.getByRole("button", { name: "Start camera", exact: true }).click();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.videoWidth)).toBeGreaterThan(0);
  await expect(main.getByRole("button", { name: "Stop camera" })).toBeVisible();
  const top = main.locator('img[data-person="0"][data-part="top"]');
  await expect.poll(() => top.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(main.locator("img[data-part]")).toHaveCount(3);
  // Exercise the actual local worker/model, not a mocked inference provider.
  await expect(main.getByRole("status")).toContainText(/No body detected yet|Body detected/, { timeout: 60_000 });
  await main.getByLabel("Follow body automatically", { exact: true }).uncheck();
  const before = await top.evaluate((img) => img.style.width);
  await main.getByLabel("Dress size", { exact: true }).fill("150");
  await expect.poll(() => top.evaluate((img) => img.style.width)).not.toBe(before);
  await main.getByLabel("Rotate garment part", { exact: true }).fill("20");
  await expect(top).toHaveCSS("transform", /matrix/);
  await main.getByRole("button", { name: "Reset position" }).click();
  await expect.poll(() => top.evaluate((img) => img.style.width)).toBe(before);
  await main.getByRole("checkbox", { name: "Headwear", exact: true }).uncheck();
  await expect(main.locator('img[data-part="head"]')).toHaveCount(0);
  await main.getByRole("combobox", { name: "Try-on mode", exact: true }).selectOption("couple");
  await main.getByRole("combobox", { name: "Edit person", exact: true }).selectOption("1");
  await main.getByRole("combobox", { name: "Choose a dress", exact: true }).selectOption("payas-agung");
  await expect(main.locator('img[data-person="1"]')).toHaveCount(3);
  await expect(main.locator('img[data-person="1"][data-part="top"]')).toHaveAttribute("src", /payas-agung-top.webp$/);
  const downloadPromise = page.waitForEvent("download");
  await main.getByRole("button", { name: "Download photo", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("nusantara-try-on.png");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = []; for await (const chunk of stream!) chunks.push(chunk);
  const png = Buffer.concat(chunks);
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  expect(png.readUInt32BE(16)).toBe(750); expect(png.readUInt32BE(20)).toBe(1000);
  await main.getByRole("button", { name: "Stop camera" }).click();
  expect(await video.evaluate((v: HTMLVideoElement) => v.srcObject)).toBeNull();
  expect(sent).toEqual([]);
});

test("a device photo works without a camera and invalid photos explain the error", async ({ page }) => {
  await page.goto("/try-on");
  const main = page.getByRole("main");
  await main.getByLabel("Follow body automatically", { exact: true }).uncheck();
  await main.getByLabel("Choose a photo", { exact: true }).setInputFiles({ name: "bad.png", mimeType: "image/png", buffer: Buffer.from("invalid") });
  await expect(main.getByRole("alert")).toContainText("Choose a valid");
  await main.getByLabel("Choose a photo", { exact: true }).setInputFiles("public/covers/costume-ulos.webp");
  await expect(main.getByAltText("Your photo, on this device only", { exact: true })).toBeVisible();
  await expect(main.getByRole("button", { name: "Download photo", exact: true })).toBeEnabled();
  expect(await main.locator("video").evaluate((v: HTMLVideoElement) => v.srcObject)).toBeNull();
});

test("denied camera permission leaves photo upload available", async ({ page }) => {
  await page.addInitScript(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException("denied", "NotAllowedError"); }; });
  await page.goto("/try-on");
  const main = page.getByRole("main");
  await main.getByRole("button", { name: "Start camera", exact: true }).click();
  await expect(main.getByRole("alert")).toContainText("camera is blocked");
  await expect(main.getByLabel("Choose a photo", { exact: true })).toBeAttached();
});
