import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { account, restSelect, signIn } from "./helpers";

// WCAG 2.1 AA gate (PRD NFR Accessibility, acceptance check 8). axe finds the
// machine-checkable problems; the keyboard and screen-reader passes stay manual.

const PUBLIC = ["/", "/library", "/regions", "/search?q=rendang", "/try-on", "/login", "/signup"];
const THEMES = [
  { locale: "id", theme: "light" },
  { locale: "en", theme: "dark" },
] as const;

async function expectNoViolations(page: Page, label: string) {
  // The rise animation starts at opacity 0; let it finish before checking contrast.
  await page.waitForTimeout(900);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  expect(summary, label).toEqual([]);
}

for (const { locale, theme } of THEMES) {
  test.describe(`axe, ${locale}, ${theme}`, () => {
    test.beforeEach(async ({ context, baseURL }) => {
      await context.addCookies([
        { name: "nch_locale", value: locale, url: baseURL! },
        { name: "nch_theme", value: theme, url: baseURL! },
      ]);
    });

    for (const path of PUBLIC) {
      test(`${path} has no WCAG 2.1 AA violations`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        await expectNoViolations(page, path);
      });
    }
  });
}

test.describe("axe, signed-in templates", () => {
  const reviewer = account("REVIEWER");
  test.skip(!reviewer, "needs E2E_REVIEWER_* in .env.local");

  test("story, recipe and costume templates, the queue and the member page", async ({ page }) => {
    test.setTimeout(120_000);
    await signIn(page, reviewer!);
    const ids: string[] = [];
    for (const [table, slug, type] of [
      ["stories", "timun-mas", "story"],
      ["recipes", "rendang-daging", "recipe"],
      ["costumes", "baju-bodo", "costume"],
    ]) {
      const [row] = (await restSelect(page, `${table}?select=id&slug=eq.${slug}`)).rows as { id: string }[];
      ids.push(`/review/preview/${type}/${row.id}`);
    }
    for (const path of [...ids, "/review", "/me", "/me/saved", "/review/audit"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expectNoViolations(page, path);
    }
  });
});
