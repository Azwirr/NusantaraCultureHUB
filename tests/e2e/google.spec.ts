import { expect, test } from "@playwright/test";

// Google sign-in. Google itself is never contacted: the test stops the
// browser at Supabase's /auth/v1/authorize step and checks what it was asked.

test.describe("Continue with Google", () => {
  for (const [path, locale, label] of [
    ["/login", "en", "Continue with Google"],
    ["/signup", "id", "Lanjutkan dengan Google"],
  ] as const) {
    test(`${path} offers it (${locale})`, async ({ page, context, baseURL }) => {
      await context.addCookies([{ name: "nch_locale", value: locale, url: baseURL! }]);
      await page.goto(path);
      await expect(page.getByRole("button", { name: label })).toBeVisible();
    });
  }

  test("starts a PKCE flow at Supabase that returns to /auth/callback with ?next=", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
    let authorizeUrl: URL | null = null;
    await page.route("**/auth/v1/authorize**", async (route) => {
      authorizeUrl = new URL(route.request().url());
      await route.fulfill({ status: 200, contentType: "text/html", body: "<title>stopped</title>" });
    });

    await page.goto("/login?next=%2Freview");
    await page.getByRole("button", { name: "Continue with Google" }).click();
    await expect(page).toHaveTitle("stopped");

    const url = authorizeUrl as URL | null;
    expect(url).not.toBeNull();
    expect(url!.searchParams.get("provider")).toBe("google");
    expect(url!.searchParams.get("code_challenge")).toBeTruthy();
    expect(url!.searchParams.get("code_challenge_method")?.toLowerCase()).toBe("s256");
    expect(url!.searchParams.get("prompt")).toBe("select_account");

    const redirectTo = new URL(url!.searchParams.get("redirect_to")!);
    expect(redirectTo.pathname).toBe("/auth/callback");
    expect(redirectTo.searchParams.get("via")).toBe("google");
    expect(redirectTo.searchParams.get("next")).toBe("/review");

    // The PKCE verifier stays in an HttpOnly cookie for the callback.
    const verifier = (await context.cookies()).find((cookie) => cookie.name.endsWith("-auth-token-code-verifier"));
    expect(verifier?.httpOnly).toBe(true);
  });
});

test.describe("/auth/callback failures", () => {
  for (const [query, code] of [
    ["via=google&error=access_denied&error_description=denied", "oauth_cancelled"],
    ["via=google&error=server_error", "oauth_failed"],
    ["via=google&code=not-a-real-code", "oauth_failed"],
    ["error=access_denied&error_code=otp_expired", "link_invalid"],
    ["next=%2Fme", "link_invalid"],
  ]) {
    test(`${query} goes to /login?error=${code}`, async ({ request }) => {
      const response = await request.get(`/auth/callback?${query}`, { maxRedirects: 0 });
      expect(response.status()).toBe(307);
      expect(new URL(response.headers()["location"]).pathname + new URL(response.headers()["location"]).search).toBe(
        `/login?error=${code}`,
      );
    });
  }

  test("the sign-in page explains a cancelled Google sign-in", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
    await page.goto("/login?error=oauth_cancelled");
    await expect(page.locator("main").getByRole("alert")).toHaveText("Google sign-in was cancelled.");
  });

  test("unknown error codes show nothing", async ({ page }) => {
    await page.goto("/login?error=%3Cb%3Ehi%3C%2Fb%3E");
    await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  });
});
