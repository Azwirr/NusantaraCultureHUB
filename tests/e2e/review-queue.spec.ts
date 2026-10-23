import { expect, type Page, test } from "@playwright/test";

import { account, publishableKey, restSelect, signIn, supabaseUrl } from "./helpers";

// FR-11 and FR-13 through the real UI on staging. The tests work on the
// fixture story from supabase/scripts/create-e2e-fixtures.sql, which can
// never become public (it cites no source, and a chapter is public only with
// its story). Chapter 2 is approved and unpublished again in every run.

const reviewer = account("REVIEWER");
const member = account("MEMBER");

type Chapter = { id: string; chapter_no: number; review_status: string };

async function fixtureChapters(page: Page): Promise<Chapter[]> {
  const { rows } = await restSelect(
    page,
    "story_chapters?select=id,chapter_no,review_status,stories!inner(slug)&stories.slug=eq.e2e-uji&order=chapter_no",
  );
  return rows as Chapter[];
}

async function useEnglish(page: Page, baseURL: string | undefined) {
  await page.context().addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
}

test.describe("review queue access", () => {
  test("guests are sent to sign in from every reviewer page", async ({ request }) => {
    for (const path of ["/review", "/review/audit", "/review/roles", "/review/story/00000000-0000-4000-8000-000000000001"]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status(), path).toBe(307);
      expect(response.headers().location, path).toBe(`/login?next=${encodeURIComponent(path)}`);
    }
  });

  test("a member gets no reviewer pages", async ({ page }) => {
    test.skip(!member || !supabaseUrl, "needs E2E_MEMBER_* in .env.local");
    await signIn(page, member!);
    for (const path of ["/review/audit", "/review/roles"]) {
      await page.goto(path);
      await expect(page.locator("main")).toContainText(/Page not found|Halaman tidak ditemukan/);
      await expect(page.locator("main table")).toHaveCount(0);
    }
  });
});

test.describe("reviewer", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(!reviewer || !supabaseUrl, "needs E2E_REVIEWER_* in .env.local");

  test.beforeEach(async ({ page, baseURL }) => {
    await useEnglish(page, baseURL);
    await signIn(page, reviewer!);
  });

  test("the queue lists content by type and status, and filters it", async ({ page }) => {
    await page.goto("/review?type=chapter&status=draft");
    const main = page.locator("main");
    await expect(main.getByRole("table", { name: "Content by type and status" })).toBeVisible();
    await expect(main.getByRole("link", { name: "Story chapters", exact: true })).toHaveAttribute("aria-current", "true");
    await expect(main.getByRole("link", { name: /^Review: \[E2E\] Cerita uji, jangan disetujui Chapter 1$/ })).toBeVisible();
    // A reviewer is not an owner: no roles section.
    await expect(page.getByRole("navigation", { name: "Reviewer sections" }).getByRole("link")).toHaveText([
      "Queue",
      "Requests",
      "Audit log",
    ]);
    await page.goto("/review/roles");
    await expect(main).toContainText("Page not found");
  });

  test("the reviewer who edited an item is refused, with a clear message", async ({ page }) => {
    const [first] = await fixtureChapters(page);
    expect(first.review_status).toBe("draft");
    await page.goto(`/review/chapter/${first.id}`);
    const main = page.locator("main");

    // Edit the English text: this makes the reviewer the last editor.
    const field = main.getByLabel("Chapter text (EN)", { exact: true });
    const current = await field.inputValue();
    await field.fill(current === "Test text." ? "Test text, edited." : "Test text.");
    await main.getByRole("button", { name: "Save changes" }).click();
    await expect(main.getByRole("status").filter({ hasText: "Changes saved." })).toBeVisible();

    await page.reload();
    await expect(main).toContainText("You edited this last, so another reviewer must approve it.");
    await main.getByRole("button", { name: "Approve" }).click();
    await expect(main.getByRole("alert")).toHaveText(
      "You created or last edited this. Ask another reviewer to approve it.",
    );
    expect((await fixtureChapters(page))[0].review_status).toBe("draft");

    // Reject needs a reason, and the database says so.
    await main.getByRole("button", { name: "Reject" }).click();
    await expect(main.getByRole("alert")).toHaveText("Please give a reason.");
  });

  test("a reviewer approves someone else's work, which stays hidden while its story is a draft", async ({
    page,
    request,
  }) => {
    let second = (await fixtureChapters(page))[1];
    if (second.review_status === "approved") {
      // A previous run stopped half way: put it back first.
      await page.request.post(`/api/review/chapter/${second.id}/unpublish`, { data: { reason: "e2e reset" } });
    }
    await page.goto(`/review/chapter/${second.id}`);
    const main = page.locator("main");
    await main.getByRole("button", { name: "Approve" }).click();
    await expect(main.getByRole("status").filter({ hasText: "Approved." })).toBeVisible();
    second = (await fixtureChapters(page))[1];
    expect(second.review_status).toBe("approved");

    // Guests still see nothing: the story is a draft.
    const guest = await request.get(`${supabaseUrl}/rest/v1/story_chapters?select=id&id=eq.${second.id}`, {
      headers: { apikey: publishableKey },
    });
    expect(await guest.json()).toEqual([]);

    // Unpublish again, with a reason, and find both actions in the audit log.
    // A reason unique to this run, so the audit check finds this run's entry.
    const reason = `e2e: put the fixture back (${Date.now()})`;
    await page.reload();
    await main.getByLabel("Reason", { exact: true }).fill(reason);
    await main.getByRole("button", { name: "Unpublish" }).click();
    await expect(main.getByRole("status").filter({ hasText: "Taken off the public site." })).toBeVisible();
    expect((await fixtureChapters(page))[1].review_status).toBe("unpublished");

    await page.goto("/review/audit");
    const table = main.getByRole("table", { name: "The 100 most recent entries" });
    await expect(table).toBeVisible();
    await expect(table.getByRole("row").filter({ hasText: reason })).toContainText("e2e_reviewer");
    await expect(table.getByRole("row").filter({ hasText: reason })).toContainText("Unpublished");
  });
});
