import { expect, test } from "@playwright/test";

// Regression tests for the Phase 1 security and accessibility review.

test.describe("session cookies", () => {
  test("an unusable session cookie is deleted for good, with HttpOnly", async ({ request }) => {
    const response = await request.get("/library", {
      headers: { Cookie: "sb-127-auth-token=base64-eyJ4IjoxfQ" },
      maxRedirects: 0,
    });
    const setCookies = response
      .headersArray()
      .filter((header) => header.name.toLowerCase() === "set-cookie" && header.value.startsWith("sb-"));

    expect(setCookies.length, "the bad cookie is cleared").toBeGreaterThan(0);
    for (const { value } of setCookies) {
      // Every header must expire the cookie; none may recreate it.
      expect(value).toMatch(/Expires=Thu, 01 Jan 1970/i);
      expect(value).toMatch(/HttpOnly/i);
    }
  });

  test("empty or PKCE-only cookies do not count as signed in", async ({ request }) => {
    for (const cookie of ["sb-127-auth-token=", "sb-127-auth-token-code-verifier=abc"]) {
      const response = await request.get("/me", { headers: { Cookie: cookie }, maxRedirects: 0 });
      expect(response.status(), cookie).toBe(307);
      expect(response.headers()["location"]).toMatch(/\/login\?next=%2Fme$/);
    }
  });
});

test.describe("not found", () => {
  test("a missing page under a locale has its own title", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(/Page not found/);
  });

  test("URLs outside any locale get the bilingual 404", async ({ request }) => {
    const response = await request.get("/does-not-exist.txt");
    expect(response.status()).toBe(404);
    const html = await response.text();
    expect(html).toContain("Halaman tidak ditemukan");
    expect(html).toContain("Page not found");
  });

  test("unknown API paths answer with JSON", async ({ request }) => {
    const response = await request.get("/api/nope");
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ error: { code: "not_found", message: "not_found" } });
  });
});

test("an expired confirmation link explains itself on the sign-in page", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
  await page.goto("/login?error=link");
  await expect(page.getByText("That confirmation link is invalid or has expired")).toBeVisible();
});

test.describe("accessibility", () => {
  test("the current header link has a non-colour marker", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/library");
    const current = page.locator("header nav a[aria-current='page']");
    await expect(current).toHaveCount(1);
    const bar = await current.evaluate((el) => getComputedStyle(el, "::after").height);
    expect(bar).toBe("2px");
  });

  test("keyboard focus returns to the language switcher after switching", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/library");
    const english = page.getByRole("button", { name: /^EN/ });
    await english.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("button", { name: /^EN/ })).toBeFocused();
  });

  test("the browser theme colour follows the theme toggle", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    // The theme toggle: the language buttons also use aria-pressed but carry lang.
    await page.locator("header button[aria-pressed]:not([lang])").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const colours = await page.locator('meta[name="theme-color"]').evaluateAll((metas) =>
      metas.map((meta) => (meta as HTMLMetaElement).content),
    );
    expect(colours.length).toBeGreaterThan(0);
    for (const colour of colours) expect(colour.toLowerCase()).toBe("#18191c");
  });
});
