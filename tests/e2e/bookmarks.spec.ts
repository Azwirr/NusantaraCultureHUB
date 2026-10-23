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

test("guests are asked to sign in before seeing saves", async ({ request }) => {
  const response = await request.get("/me/saved", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe("/login?next=%2Fme%2Fsaved");
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
    expect((await restSelect(page, "bookmarks?select=id")).rows).toEqual([]);
    await page.close();
  });

  test("the member page shows the collection and its counts", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
    await signIn(page, member!);
    const main = page.locator("main");
    await expect(main.getByRole("heading", { name: "My collection" })).toBeVisible();
    await expect(main.getByRole("region", { name: "Your saves at a glance" })).toContainText("Saved items");
    await page.goto("/me/saved");
    await expect(main.getByRole("heading", { level: 1, name: "My Saves" })).toBeVisible();
    // The tab bar marks Saved, not Me, on /me/saved.
    await page.setViewportSize({ width: 360, height: 780 });
    const tabs = page.getByRole("navigation", { name: "Main navigation" }).last();
    await expect(tabs.getByRole("link", { name: "Saved", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(tabs.getByRole("link", { name: "Me", exact: true })).not.toHaveAttribute("aria-current", /.+/);
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

    await page.goto("/me/saved");
    await expect(main.getByRole("listitem").filter({ has: page.getByRole("link", { name: /.+/ }) }).first()).toBeVisible();
    const unsave = main.getByRole("button", { name: /^Saved:/ }).first();
    await unsave.click();
    await expect(unsave).toHaveAttribute("aria-pressed", "false");
    expect((await restSelect(page, `bookmarks?select=id&content_id=eq.${item!.id}`)).rows).toEqual([]);
  });
});
