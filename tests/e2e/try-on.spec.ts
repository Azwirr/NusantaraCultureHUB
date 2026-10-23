import { expect, test } from "@playwright/test";

// FR-08 try-on studio, with Chromium's fake camera: the camera starts, the
// dress picture lies over it and can be changed and moved, stopping releases
// the camera, and nothing is sent anywhere while it runs.

test.use({
  permissions: ["camera"],
  launchOptions: { args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] },
});

test("the camera starts, the dress lies over it, and stopping releases it", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
  await page.goto("/try-on");
  const main = page.locator("main");
  await expect(main.getByRole("heading", { level: 1, name: "Try-On Studio" })).toBeVisible();
  test.skip(await main.getByText("No dress with a picture is published yet.").isVisible(), "no dress with a picture on this project");

  // Watch for anything leaving the page while the camera runs.
  const sent: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET" && request.method() !== "HEAD") sent.push(`${request.method()} ${request.url()}`);
  });

  await main.getByRole("button", { name: "Start camera" }).click();
  const video = main.locator("video");
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.videoWidth)).toBeGreaterThan(0);
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => !node.paused)).toBe(true);

  // The chosen dress is laid over the camera.
  const select = main.getByLabel("Choose a dress");
  const first = await select.inputValue();
  const overlay = main.locator("img[alt]").filter({ hasNot: page.locator("header") }).last();
  await expect(overlay).toBeVisible();
  // The picture really loads: a local cover, or a scaled Commons copy (never the multi-MB original).
  await expect.poll(() => overlay.evaluate((node: HTMLImageElement) => node.naturalWidth), { timeout: 20_000 }).toBeGreaterThan(0);
  expect(await overlay.getAttribute("src")).toMatch(/^\/|\?width=\d+$/);
  const firstSrc = await overlay.getAttribute("src");

  // Another dress swaps the picture.
  const options = await select.locator("option").evaluateAll((nodes) => nodes.map((node) => (node as HTMLOptionElement).value));
  const other = options.find((value) => value !== first);
  if (other) {
    await select.selectOption(other);
    await expect.poll(() => overlay.getAttribute("src")).not.toBe(firstSrc);
  }

  // Size and position move the dress; reset puts it back.
  const before = await overlay.evaluate((node) => node.style.transform);
  await main.getByLabel("Dress size").fill("150");
  await main.getByLabel("Move up or down").fill("-20");
  await expect.poll(() => overlay.evaluate((node) => node.style.transform)).not.toBe(before);
  expect(await overlay.evaluate((node) => node.style.transform)).toContain("scale(1.5)");
  await main.getByRole("button", { name: "Reset position" }).click();
  await expect.poll(() => overlay.evaluate((node) => node.style.transform)).toBe(before);

  // Mirroring flips the camera view only.
  await main.getByRole("button", { name: "Mirror the picture" }).click();
  await expect(main.getByRole("button", { name: "Mirror the picture" })).toHaveAttribute("aria-pressed", "false");

  // Stopping releases the camera.
  await main.getByRole("button", { name: "Stop camera" }).click();
  await expect(main.getByRole("button", { name: "Start camera" })).toBeVisible();
  expect(await video.evaluate((node: HTMLVideoElement) => node.srcObject)).toBeNull();

  // Nothing was uploaded or posted while the camera ran.
  expect(sent).toEqual([]);
});
