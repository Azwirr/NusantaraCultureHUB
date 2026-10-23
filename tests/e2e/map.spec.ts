import { expect, test } from "@playwright/test";

// FR-16 navigation map: keyboard only, with the list as the full alternative.

test("the region map is a labelled group whose region links work by keyboard", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
  await page.goto("/regions");
  const map = page.getByRole("group", { name: "Map of Indonesian provinces" });
  await expect(map).toBeVisible();
  await expect(page.locator("main figcaption")).toContainText("Natural Earth");

  const links = map.getByRole("link");
  const count = await links.count();
  // Provinces without an approved region are never focusable.
  expect(await map.locator("path[aria-hidden='true']").count()).toBeGreaterThan(0);
  test.skip(count === 0, "no approved region on this project yet: nothing to open");

  // Tab from the page heading into the map reaches the first region link.
  await page.locator("main h1").focus();
  for (let step = 0; step < 20; step += 1) {
    await page.keyboard.press("Tab");
    if (await links.first().evaluate((node) => node === document.activeElement)) break;
  }
  await expect(links.first()).toBeFocused();
  const label = await links.first().getAttribute("aria-label");
  expect(label).toMatch(/: open /);
  const href = await links.first().getAttribute("href");
  await page.keyboard.press("Enter");
  await page.waitForURL(`**${href}`);
  await expect(page.locator("main h1")).toBeVisible();
});

test("the map fits a 360px screen without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/regions");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
