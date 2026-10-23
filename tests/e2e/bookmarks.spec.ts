import { expect, type Page, test } from "@playwright/test";

import { accessToken, account, publishableKey, restSelect, signIn, supabaseUrl } from "./helpers";

// Bookmarks ("Simpan"): members save public content only.

const member = account("MEMBER");
const reviewer = account("REVIEWER");

async function insertBookmark(page: Page, type: string, id: string) {
  return page.request.post(`${supabaseUrl}/rest/v1/bookmarks`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${await accessToken(page.context())}`,
      "Content-Type": "application/json",
    },
    data: { content_type: type, content_id: id },
  });
}

test("guests are asked to sign in before seeing their collection", async ({ request }) => {
  const response = await request.get("/me", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe("/login?next=%2Fme");
});

test("the old saves page redirects to My collection and keeps the filter", async ({ request }) => {
  const response = await request.get("/me/saved?type=recipe", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/me?type=recipe");
});

test.describe("member", () => {
  test.skip(!member || !reviewer || !supabaseUrl, "needs E2E_MEMBER_* and E2E_REVIEWER_* in .env.local");

  test("a member cannot bookmark a draft id", async ({ browser }) => {
    // Find a draft id the way only staff can.
    const staff = await browser.newPage();
    await signIn(staff, reviewer!);
    const [draft] = (await restSelect(staff, "stories?select=id&slug=eq.e2e-uji")).rows as { id: string }[];
    await staff.close();

    const page = await browser.newPage();
    await signIn(page, member!);
    const response = await insertBookmark(page, "story", draft.id);
    expect(response.status()).toBe(403);
    expect((await restSelect(page, `bookmarks?select=id&content_id=eq.${draft.id}`)).rows).toEqual([]);
    await page.close();
  });

  test("My collection shows the saves and their counts, with no separate Saved tab", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
    await signIn(page, member!);
    const main = page.locator("main");
    await expect(main.getByRole("heading", { level: 1, name: "My collection" })).toBeVisible();
    await expect(main.getByRole("region", { name: "Your collection at a glance" })).toContainText("All items");
    const nav = page.getByRole("navigation", { name: "Main navigation" }).first();
    await expect(nav.getByRole("link", { name: "My collection", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Saved", exact: true })).toHaveCount(0);
    // The phone tab bar has four tabs and marks Collection.
    await page.setViewportSize({ width: 360, height: 780 });
    const tabs = page.getByRole("navigation", { name: "Main navigation" }).last();
    await expect(tabs.getByRole("link")).toHaveCount(4);
    await expect(tabs.getByRole("link", { name: "Collection", exact: true })).toHaveAttribute("aria-current", "page");
  });

  test("save, list and unsave a public item", async ({ page, request, context, baseURL }) => {
    // Needs at least one approved item; staging has none until reviewers approve content.
    const pick = async (table: string, type: string) => {
      const response = await request.get(`${supabaseUrl}/rest/v1/${table}?select=id,slug&limit=1`, {
        headers: { apikey: publishableKey },
      });
      const [row] = (await response.json()) as { id: string; slug: string }[];
      return row ? { ...row, type } : null;
    };
    const item = (await pick("recipes", "recipe")) ?? (await pick("stories", "story")) ?? (await pick("costumes", "costume"));
    test.skip(!item, "no approved content on this project yet");

    await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
    await signIn(page, member!);
    const path = { recipe: "/recipes/", story: "/stories/", costume: "/costumes/" }[item!.type] + item!.slug;
    await page.goto(path);
    const main = page.locator("main");
    const save = main.getByRole("button", { name: /^(Save|Saved):/ }).first();
    if ((await save.getAttribute("aria-pressed")) === "true") {
      await save.click();
      await expect(save).toHaveAttribute("aria-pressed", "false");
    }
    await save.click();
    await expect(save).toHaveAttribute("aria-pressed", "true");

    await page.goto("/me");
    await expect(main.getByRole("listitem").filter({ has: page.getByRole("link", { name: /.+/ }) }).first()).toBeVisible();
    // Its name turns from "Saved: …" into "Save: …" when pressed, so match both.
    const unsave = main.getByRole("button", { name: /^(Save|Saved):/ }).first();
    await unsave.click();
    await expect(unsave).toHaveAttribute("aria-pressed", "false");
    // The button updates at once; the delete reaches the database a moment later.
    await expect
      .poll(async () => (await restSelect(page, `bookmarks?select=id&content_id=eq.${item!.id}`)).rows)
      .toEqual([]);
  });
});
