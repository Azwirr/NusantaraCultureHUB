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
