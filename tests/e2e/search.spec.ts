import { expect, test } from "@playwright/test";

import { publishableKey, supabaseUrl } from "./helpers";

// FR-14 search. Drafts are never returned; the term is always plain text.

type Hit = { type: string; id: string; slug: string; title: string };

async function apiSearch(request: import("@playwright/test").APIRequestContext, q: string): Promise<Hit[]> {
  const response = await request.get(`/api/search?q=${encodeURIComponent(q)}&lang=id`);
  expect(response.status()).toBe(200);
  return ((await response.json()) as { hits: Hit[] }).hits;
}

test.describe("search", () => {
  test("never returns drafts: every hit is visible to a guest, and the draft fixture is never found", async ({
    request,
  }) => {
    // Words that exist in draft content on staging.
    for (const q of ["Timun Mas", "rendang", "gudeg", "Baju Bodo", "E2E Cerita uji", "jangan disetujui"]) {
      const hits = await apiSearch(request, q);
      expect(hits.some((hit) => hit.slug === "e2e-uji"), q).toBe(false);
      for (const hit of hits) {
        const table = { story: "stories", recipe: "recipes", costume: "costumes", region: "regions" }[hit.type];
        const guest = await request.get(`${supabaseUrl}/rest/v1/${table}?select=review_status&id=eq.${hit.id}`, {
          headers: { apikey: publishableKey },
        });
        expect(await guest.json(), `${q}: ${hit.slug}`).toEqual([{ review_status: "approved" }]);
      }
    }
  });

  test("the search term is rendered as plain text", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
    const payload = `<img src=x onerror="window.__xss=1">rendang`;
    await page.goto(`/search?q=${encodeURIComponent(payload)}`);
    const main = page.locator("main");
    await expect(main.getByRole("status")).toContainText(payload);
    await expect(main.locator("img[src='x']")).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
    await expect(main.getByRole("searchbox")).toHaveValue(payload);
  });

  test("no results offer a way to the library", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
    await page.goto("/search?q=zzqqxx");
    const main = page.locator("main");
    await expect(main.getByRole("status")).toHaveText(/No results for “zzqqxx”/);
    await main.getByRole("link", { name: "Open the library" }).click();
    await page.waitForURL("**/library");
  });

  test("a failed palette search says so and drops older results", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "nch_locale", value: "id", url: baseURL! }]);
    await page.goto("/library");
    await page.waitForLoadState("networkidle");

    // First a search that returns one (fake) hit, then the API fails.
    let fail = false;
    await page.route("**/api/search?**", (route) =>
      fail
        ? route.fulfill({ status: 500, contentType: "application/json", body: '{"error":{"code":"server_error"}}' })
        : route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              q: "rendang",
              hits: [{ type: "recipe", id: "r1", title: "Rendang Daging", regionName: "Minangkabau", href: "/recipes/rendang-daging" }],
            }),
          }),
    );

    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Pencarian" });
    const box = dialog.getByRole("combobox");
    await box.fill("rendang");
    await expect(dialog.getByRole("option")).toHaveCount(1);

    fail = true;
    await box.fill("gudeg");
    await expect(dialog.getByRole("status")).toHaveText("Pencarian gagal dimuat. Periksa koneksi Anda, lalu coba lagi.");
    await expect(dialog.getByRole("option")).toHaveCount(0);
    await expect(box).toHaveAttribute("aria-expanded", "false");

    // A network failure reads the same, never as "no results".
    await page.route("**/api/search?**", (route) => route.abort("internetdisconnected"));
    await box.fill("soto");
    await expect(dialog.getByRole("status")).toHaveText("Pencarian gagal dimuat. Periksa koneksi Anda, lalu coba lagi.");
  });

  test("short queries show a hint", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
    await page.goto("/search?q=a");
    await expect(page.locator("main")).toContainText("Type at least 2 letters.");
  });

  // Without JavaScript the search form still submits to a shareable
  // /search?q= URL. (Streamed results need JavaScript to be revealed: that is
  // how Next.js streams Suspense content.)
  test("the header search and the search form work without JavaScript", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
    const page = await context.newPage();
    await page.goto("/");
    await page.getByRole("link", { name: "Open search" }).click();
    await page.waitForURL("**/search");
    await page.locator("main").getByRole("searchbox").fill("gudeg");
    await page.locator("main").getByRole("button", { name: "Search" }).click();
    await page.waitForURL(/\/search\?q=gudeg/);
    await context.close();
  });

  test("Ctrl+K opens the search palette, and Escape closes it", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
    await page.goto("/library");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Search" });
    await expect(dialog).toBeVisible();
    const box = dialog.getByRole("combobox", { name: "Search" });
    await expect(box).toBeFocused();
    await expect(dialog.getByRole("status")).toHaveText("Type at least 2 letters.");
    await box.fill("zzqqxx");
    await expect(dialog.getByRole("status")).toHaveText(/No results for “zzqqxx”/);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    // Enter with no highlighted result opens the full results page.
    await page.keyboard.press("Control+k");
    await box.fill("rendang");
    await page.keyboard.press("Enter");
    await page.waitForURL(/\/search\?q=rendang/);
  });
});
