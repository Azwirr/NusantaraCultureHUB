import { expect, test } from "@playwright/test";

test.describe("language", () => {
  test("defaults to Indonesian when the browser prefers neither language", async ({ browser }) => {
    const context = await browser.newContext({ locale: "fr-FR" });
    const page = await context.newPage();
    await page.goto("/library");
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
    await context.close();
  });

  test("follows Accept-Language when no choice is saved", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-GB" });
    const page = await context.newPage();
    await page.goto("/library");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await context.close();
  });

  test("the saved cookie wins and the URL stays unprefixed", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
    await page.goto("/library");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(new URL(page.url()).pathname).toBe("/library");
  });
});

test.describe("protected pages", () => {
  for (const path of ["/me", "/review", "/en/review"]) {
    test(`${path} answers guests with an HTTP redirect to sign in`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(307);
      const target = path.endsWith("/me") ? "%2Fme" : "%2Freview";
      expect(response.headers()["location"]).toMatch(new RegExp(`/login\\?next=${target}$`));
    });
  }

  test("/me lands guests on the sign-in page", async ({ page }) => {
    await page.goto("/me");
    await expect(page).toHaveURL(/\/login\?next=%2Fme$/);
  });
});

// NFR: user-entered text is rendered as plain text, never as HTML.
test.describe("HTML payloads", () => {
  const payload = `"><img src=x onerror="window.__xss=1"><script>window.__xss=1</script>`;

  for (const route of [
    `/login?next=${encodeURIComponent(payload)}`,
    `/stories/${encodeURIComponent(payload)}`,
    `/library?q=${encodeURIComponent(payload)}`,
  ]) {
    test(`${route.split("?")[0]} does not execute injected markup`, async ({ page }) => {
      let dialog = false;
      page.on("dialog", async (d) => {
        dialog = true;
        await d.dismiss();
      });
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(dialog).toBe(false);
      expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
      expect(await page.locator("img[src='x']").count()).toBe(0);
    });
  }
});
