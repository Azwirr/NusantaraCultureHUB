import { expect, test } from "@playwright/test";

import { REVIEW_ACTIONS, REVIEW_TYPES, SAMPLE_ID } from "./routes";

// Build plan check 5: an anonymous client gets 401 or 403 from every review
// route. The AI job and progress stubs are protected the same way.
test.describe("anonymous API access", () => {
  for (const type of REVIEW_TYPES) {
    for (const action of REVIEW_ACTIONS) {
      test(`POST /api/review/${type}/{id}/${action} is refused`, async ({ request }) => {
        const response = await request.post(`/api/review/${type}/${SAMPLE_ID}/${action}`, {
          data: { reason: "test" },
        });
        expect([401, 403]).toContain(response.status());
        expect(response.headers()["cache-control"]).toContain("no-store");
      });
    }
  }

  test("anonymous calls are refused even for unknown types and actions", async ({ request }) => {
    const response = await request.post(`/api/review/users/${SAMPLE_ID}/delete`);
    expect(response.status()).toBe(401);
  });

  test("POST /api/ai/jobs is refused", async ({ request }) => {
    expect((await request.post("/api/ai/jobs", { data: {} })).status()).toBe(401);
  });

  test("POST /api/progress is refused", async ({ request }) => {
    expect((await request.post("/api/progress", { data: {} })).status()).toBe(401);
  });

  test("cross-origin POSTs are refused before anything else", async ({ request }) => {
    const response = await request.post(`/api/review/story/${SAMPLE_ID}/approve`, {
      headers: { Origin: "https://evil.example" },
    });
    expect(response.status()).toBe(403);
  });

  test("GET is not allowed on the review routes", async ({ request }) => {
    expect((await request.get(`/api/review/story/${SAMPLE_ID}/approve`)).status()).toBe(405);
  });
});

// Needs a live Supabase stack with email confirmation off (the local default).
test.describe("signed-in member", () => {
  test.skip(!process.env.E2E_SUPABASE, "set E2E_SUPABASE=1 with `npx supabase start` running");

  test("a member gets 403 from review routes and 501 from the progress stub", async ({ page }) => {
    const nickname = `e2e_${Date.now().toString(36)}`;
    await page.goto("/signup");
    await page.locator('input[name="username"]').fill(nickname);
    await page.locator('input[name="email"]').fill(`${nickname}@example.test`);
    await page.locator('input[name="password"]').fill("correct-horse-battery");
    await page.locator('form button[type="submit"]').click();
    await page.waitForURL("**/me");

    const review = await page.request.post(`/api/review/story/${SAMPLE_ID}/approve`, { data: {} });
    expect(review.status()).toBe(403);

    const progress = await page.request.post("/api/progress", { data: {} });
    expect(progress.status()).toBe(501);

    await page.goto("/review");
    expect(await page.title()).toBeTruthy();
    await expect(page.locator("main")).not.toContainText(/draft|draf/i);
  });
});
