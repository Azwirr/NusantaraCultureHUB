import { type BrowserContext, expect, type Page, test } from "@playwright/test";

import { SAMPLE_ID } from "./routes";

// Signed-in flows against a real Supabase project (staging). The accounts are
// confirmed test users whose credentials live only in .env.local:
//   E2E_MEMBER_EMAIL / E2E_MEMBER_PASSWORD      (no role)
//   E2E_REVIEWER_EMAIL / E2E_REVIEWER_PASSWORD  (user_roles: reviewer)
// None of these tests changes data: review calls are made where the database
// must refuse them.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

function account(role: "MEMBER" | "REVIEWER") {
  const email = process.env[`E2E_${role}_EMAIL`];
  const password = process.env[`E2E_${role}_PASSWORD`];
  return email && password ? { email, password } : null;
}

async function signIn(page: Page, credentials: { email: string; password: string }) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(credentials.email);
  await page.locator('input[name="password"]').fill(credentials.password);
  // The email form's button; the Google button is a separate form.
  await page.getByRole("button", { name: /^(Sign in|Masuk)$/ }).click();
  await page.waitForURL("**/me");
}

/** The session cookie, reassembled from its chunks. */
async function sessionCookies(context: BrowserContext) {
  return (await context.cookies())
    .filter((cookie) => /^sb-.+-auth-token(\.\d+)?$/.test(cookie.name))
    .sort((a, b) => Number(a.name.split(".").at(-1)) - Number(b.name.split(".").at(-1)));
}

async function accessToken(context: BrowserContext): Promise<string> {
  const raw = (await sessionCookies(context)).map((cookie) => cookie.value).join("");
  const json = raw.startsWith("base64-")
    ? Buffer.from(raw.slice("base64-".length), "base64url").toString("utf8")
    : decodeURIComponent(raw);
  return (JSON.parse(json) as { access_token: string }).access_token;
}

/** Queries the Supabase REST API directly with this user's own token. */
async function restSelect(page: Page, path: string): Promise<{ status: number; rows: unknown[] }> {
  const response = await page.request.get(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: publishableKey, Authorization: `Bearer ${await accessToken(page.context())}` },
  });
  return { status: response.status(), rows: response.ok() ? await response.json() : [] };
}

test.describe("signed-in member", () => {
  const member = account("MEMBER");
  test.skip(!member || !supabaseUrl, "needs E2E_MEMBER_* in .env.local and a Supabase project");

  test.beforeEach(async ({ page }) => {
    await signIn(page, member!);
  });

  test("the session cookie is HttpOnly and the profile shows the nickname", async ({ page, context }) => {
    const cookies = await sessionCookies(context);
    expect(cookies.length).toBeGreaterThan(0);
    for (const cookie of cookies) expect(cookie.httpOnly, cookie.name).toBe(true);
    await expect(page.locator("main")).toContainText("e2e_member");
  });

  test("a member gets 403 from review routes and 501 from the progress stub", async ({ page }) => {
    expect((await page.request.post(`/api/review/story/${SAMPLE_ID}/approve`, { data: {} })).status()).toBe(403);
    expect((await page.request.post("/api/ai/jobs", { data: {} })).status()).toBe(403);
    expect((await page.request.post("/api/progress", { data: {} })).status()).toBe(501);
  });

  test("a member sees no drafts through the API, and no review page", async ({ page }) => {
    const stories = await restSelect(page, "stories?select=slug,review_status");
    expect(stories.status).toBe(200);
    expect(stories.rows).toEqual([]);
    const roles = await restSelect(page, "user_roles?select=role");
    expect(roles.rows).toEqual([]);

    await page.goto("/review");
    await expect(page.locator("main")).toContainText(/Page not found|Halaman tidak ditemukan/);
    await expect(page.locator("main table")).toHaveCount(0);
  });

  test("a member cannot grant themselves a role through the API", async ({ page }) => {
    const token = await accessToken(page.context());
    const userId = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")).sub as string;
    const response = await page.request.post(`${supabaseUrl}/rest/v1/user_roles`, {
      headers: { apikey: publishableKey, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      data: { user_id: userId, role: "reviewer" },
    });
    expect(response.status()).toBe(403);
    expect((await restSelect(page, "user_roles?select=role")).rows).toEqual([]);
  });

  test("the nickname can be changed, and taken or invalid ones are refused", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
    await page.goto("/me");
    const field = page.getByLabel("Nickname", { exact: true });
    const save = page.getByRole("button", { name: "Save nickname" });
    await expect(field).toHaveValue("e2e_member");

    await field.fill("e2e_reviewer");
    await save.click();
    await expect(page.locator("main").getByRole("alert")).toHaveText("That nickname is already taken. Please try another.");

    await field.fill("Not Valid!");
    await save.click();
    await expect(page.locator("main").getByRole("alert")).toHaveText("Please check the highlighted fields.");

    // Saving the current nickname leaves the account unchanged.
    await field.fill("e2e_member");
    await save.click();
    await expect(page.locator("main").getByRole("status").filter({ hasText: "Nickname saved." })).toBeVisible();
  });

  test("signing out clears the session", async ({ page, context }) => {
    await page.getByRole("button", { name: /^(Sign out|Keluar)$/ }).click();
    await page.waitForURL((url) => url.pathname === "/");
    expect(await sessionCookies(context)).toEqual([]);
    const response = await page.request.get("/me", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
  });
});

test.describe("signed-in reviewer", () => {
  const reviewer = account("REVIEWER");
  test.skip(!reviewer || !supabaseUrl, "needs E2E_REVIEWER_* in .env.local and a Supabase project");

  test.beforeEach(async ({ page }) => {
    await signIn(page, reviewer!);
  });

  test("the review page lists draft counts", async ({ page }) => {
    await page.goto("/review");
    const table = page.locator("main table");
    await expect(table).toBeVisible();
    // The seed holds 3 draft regions; staff see them, guests and members do not.
    await expect(table).toContainText("3");
  });

  test("a reviewer sees drafts through the API", async ({ page }) => {
    const stories = await restSelect(page, "stories?select=slug,review_status&slug=eq.timun-mas");
    expect(stories.rows).toEqual([{ slug: "timun-mas", review_status: "draft" }]);
  });

  test("the database refuses to approve an incomplete story, through the real API", async ({ page }) => {
    const [story] = (await restSelect(page, "stories?select=id&slug=eq.timun-mas")).rows as { id: string }[];
    const response = await page.request.post(`/api/review/story/${story.id}/approve`, { data: {} });
    expect(response.status()).toBe(409);
    // The seed has no Indonesian summary yet, so guard_approval blocks it.
    expect((await response.json()).error.message).toContain("summary_id");
    const after = await restSelect(page, `stories?select=review_status&id=eq.${story.id}`);
    expect(after.rows).toEqual([{ review_status: "draft" }]);
  });

  test("reject and unpublish need a reason; unknown ids are 404", async ({ page }) => {
    expect((await page.request.post(`/api/review/story/${SAMPLE_ID}/reject`, { data: {} })).status()).toBe(400);
    expect((await page.request.post(`/api/review/story/${SAMPLE_ID}/unpublish`, { data: {} })).status()).toBe(400);
    expect((await page.request.post(`/api/review/story/${SAMPLE_ID}/approve`, { data: {} })).status()).toBe(404);
    expect((await page.request.post("/api/ai/jobs", { data: {} })).status()).toBe(501);
  });
});
