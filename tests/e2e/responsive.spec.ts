import { expect, test } from "@playwright/test";

import { PAGE_ROUTES } from "./routes";

// Build plan check 7 / PRD check 10: every route renders at 360 px width with
// no horizontal scroll, in both languages and both colour themes.
const VARIANTS = [
  { locale: "id", theme: "light" },
  { locale: "en", theme: "dark" },
] as const;

for (const { locale, theme } of VARIANTS) {
  test.describe(`360px, ${locale}, ${theme}`, () => {
    test.use({ viewport: { width: 360, height: 780 } });

    test.beforeEach(async ({ context, baseURL }) => {
      await context.addCookies([
        { name: "nch_locale", value: locale, url: baseURL! },
        { name: "nch_theme", value: theme, url: baseURL! },
      ]);
    });

    for (const route of PAGE_ROUTES) {
      test(`${route} has no horizontal scroll`, async ({ page }) => {
        const response = await page.goto(route);
        expect(response?.status(), "page responds").toBeLessThan(500);

        await page.waitForLoadState("networkidle");
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.locator("main")).toBeVisible();

        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(overflow.scrollWidth, `scrollWidth ${overflow.scrollWidth} > ${overflow.clientWidth}`).toBeLessThanOrEqual(
          overflow.clientWidth,
        );
      });
    }
  });
}
