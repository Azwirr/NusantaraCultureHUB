import { expect, test } from "@playwright/test";

import { accessToken, account, publishableKey, restSelect, signIn, supabaseUrl } from "./helpers";

// Phase 2b: story requests (FR-17), the settings page and the new logo.

const member = account("MEMBER");
const reviewer = account("REVIEWER");

test("guests see requests and are asked to sign in to send one", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
  await page.goto("/requests");
  const main = page.locator("main");
  await expect(main.getByRole("heading", { level: 1, name: "Request a Story" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login?next=%2Frequests");
  await expect(main.getByRole("textbox")).toHaveCount(0);
});

test("the header shows the Nusantara logo and the tab has an icon", async ({ page, request }) => {
  await page.goto("/");
  const logo = page.locator("header img[src*='logo-96']");
  await expect(logo).toBeVisible();
  // Decorative: the wordmark names the link.
  await expect(logo).toHaveAttribute("alt", "");
  const icon = await page.locator("link[rel='icon']").first().getAttribute("href");
  expect(icon).toBeTruthy();
  expect((await request.get(icon!)).status()).toBe(200);
});

test.describe("member", () => {
  test.skip(!member || !supabaseUrl, "needs E2E_MEMBER_* in .env.local");

  test.beforeEach(async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "nch_locale", value: "en", url: baseURL! }]);
    await signIn(page, member!);
  });

  test("the account menu opens settings, and My collection has no nickname form", async ({ page }) => {
    const main = page.locator("main");
    await expect(main.getByRole("heading", { level: 1, name: "My collection" })).toBeVisible();
    await expect(main.getByLabel("Nickname", { exact: true })).toHaveCount(0);
    // Settings and Sign out moved off the profile card into the avatar menu.
    await expect(main.getByRole("link", { name: "Settings" })).toHaveCount(0);
    await expect(main.getByRole("button", { name: "Sign out" })).toHaveCount(0);
    const header = page.locator("header");
    const menuButton = header.getByRole("button", { name: "Account menu" });
    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(header.getByRole("button", { name: "Sign out" })).toBeVisible();
    // Escape closes the menu and returns focus to the avatar.
    await page.keyboard.press("Escape");
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(menuButton).toBeFocused();
    await menuButton.click();
    await header.getByRole("link", { name: "Settings" }).click();
    await page.waitForURL("**/me/settings");
    await expect(main.getByLabel("Nickname", { exact: true })).toHaveValue("e2e_member");
    await expect(main.getByRole("group", { name: "Language" })).toBeVisible();
  });

  test("a member sends a request, shown as plain text", async ({ page, browser }) => {
    test.skip(!reviewer, "needs E2E_REVIEWER_* to hide the test request again");
    const before = (await restSelect(page, "story_requests?select=id")).rows.length;
    test.skip(before >= 5, "the test member already used today's 5 requests");

    await page.goto("/requests");
    const main = page.locator("main");
    const title = `<b>E2E</b> request ${Date.now()}`;
    await main.getByLabel("What would you like to read?", { exact: true }).fill(title);
    await main.getByRole("button", { name: "Send request" }).click();
    await expect(main.getByRole("status").filter({ hasText: "Thank you!" })).toBeVisible();
    await expect(main.getByRole("heading", { level: 3, name: title })).toBeVisible();
    await expect(main.locator("b", { hasText: "E2E" })).toHaveCount(0);

    // Staff hide the test request again, so the public list stays clean.
    const staff = await browser.newPage();
    await signIn(staff, reviewer!);
    const response = await staff.request.patch(
      `${supabaseUrl}/rest/v1/story_requests?title=eq.${encodeURIComponent(title)}`,
      {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${await accessToken(staff.context())}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        data: { status: "hidden" },
      },
    );
    expect(response.status()).toBe(200);
    expect(await response.json()).toHaveLength(1);
    await staff.close();
    await page.reload();
    await expect(main.getByRole("heading", { level: 3, name: title })).toHaveCount(0);
  });
});
