import { expect, test } from "@playwright/test";

// FR-16 navigation map: seven labelled islands, each a link to its island
// page, reachable by keyboard, with the region list as the full alternative.

const ISLANDS = ["Sumatra", "Java", "Bali & Nusa Tenggara", "Kalimantan", "Sulawesi", "Maluku", "Papua"];

test("the map names seven islands and every island opens its page by keyboard", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
  await page.goto("/regions");
  const map = page.getByRole("group", { name: "Map of Indonesia's islands" });
  await expect(map).toBeVisible();
  await expect(page.locator("main figcaption")).toContainText("Natural Earth");

  // One link per island, west to east, even before anything is approved.
  const links = map.getByRole("link");
  await expect(links).toHaveCount(ISLANDS.length);
  for (const [index, name] of ISLANDS.entries()) {
    await expect(links.nth(index)).toHaveAccessibleName(`${name}: open the island page`);
    await expect(map.locator("text", { hasText: name })).toHaveCount(1);
  }

  // Tab from the page heading into the map reaches Sumatra first.
  await page.locator("main h1").focus();
  for (let step = 0; step < 20; step += 1) {
    await page.keyboard.press("Tab");
    if (await links.first().evaluate((node) => node === document.activeElement)) break;
  }
  await expect(links.first()).toBeFocused();
  await page.keyboard.press("Enter");
  await page.waitForURL("**/regions/island/sumatera");
  await expect(page.locator("main").getByRole("heading", { level: 1, name: "Sumatra" })).toBeVisible();
});

test("hovering an island highlights it and names it in the caption", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
  await page.goto("/regions");
  const shape = page.locator("a[data-island='kalimantan'] path").first();
  const before = await shape.evaluate((node) => getComputedStyle(node).fill);
  await shape.hover();
  await expect(page.locator("main figure p[aria-hidden='true']")).toContainText("Kalimantan");
  await expect.poll(() => shape.evaluate((node) => getComputedStyle(node).fill)).not.toBe(before);
});

test("an island page lists its provinces and links to the other islands", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
  await page.goto("/regions/island/papua");
  const main = page.locator("main");
  await expect(main.getByRole("heading", { level: 1, name: "Papua" })).toBeVisible();
  await expect(main).toContainText("Provinces:");
  const others = main.getByRole("navigation", { name: "Other islands" });
  await expect(others.getByRole("link")).toHaveCount(ISLANDS.length - 1);
  await others.getByRole("link", { name: "Maluku" }).click();
  await page.waitForURL("**/regions/island/maluku");
});

test("an unknown island is not found", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
  await page.goto("/regions/island/atlantis");
  await expect(page.locator("main")).toContainText("Page not found");
});

test("the map fits a 360px screen without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/regions");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
