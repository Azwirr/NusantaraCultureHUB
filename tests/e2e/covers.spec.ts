import { expect, test } from "@playwright/test";
import covers from "../../src/lib/media/covers.json";

test("every bundled library cover is served as a WebP", async ({ request }) => {
  for (const cover of covers) {
    const response = await request.get(cover.url);
    expect(response.status(), cover.url).toBe(200);
    expect(response.headers()["content-type"], cover.url).toContain("image/webp");
  }
});

test("published dress cards render their local covers and attribution", async ({ page }) => {
  await page.goto("/library?type=costume");
  const cards = page.locator("main article");
  const count = await cards.count();
  test.skip(count === 0, "No published dress items in this environment");
  await expect(cards.first()).toBeVisible();
  for (let index = 0; index < count; index++) {
    const card = cards.nth(index);
    await card.scrollIntoViewIfNeeded();
    const picture = card.locator("figure img");
    await expect(picture).toBeVisible();
    await expect.poll(() => picture.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(card.locator("figcaption")).not.toBeEmpty();
  }
});
