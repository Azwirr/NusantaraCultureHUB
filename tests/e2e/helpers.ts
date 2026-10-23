import { type BrowserContext, type Page } from "@playwright/test";

// Shared helpers for signed-in flows against a real Supabase project (staging).
// The accounts are confirmed test users whose credentials live only in .env.local:
//   E2E_MEMBER_EMAIL / E2E_MEMBER_PASSWORD      (no role)
//   E2E_REVIEWER_EMAIL / E2E_REVIEWER_PASSWORD  (user_roles: reviewer)

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export function account(role: "MEMBER" | "REVIEWER") {
  const email = process.env[`E2E_${role}_EMAIL`];
  const password = process.env[`E2E_${role}_PASSWORD`];
  return email && password ? { email, password } : null;
}

export async function signIn(page: Page, credentials: { email: string; password: string }) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(credentials.email);
  await page.locator('input[name="password"]').fill(credentials.password);
  // The email form's button; the Google button is a separate form.
  await page.getByRole("button", { name: /^(Sign in|Masuk)$/ }).click();
  await page.waitForURL("**/me");
}

/** The session cookie, reassembled from its chunks. */
export async function sessionCookies(context: BrowserContext) {
  return (await context.cookies())
    .filter((cookie) => /^sb-.+-auth-token(\.\d+)?$/.test(cookie.name))
    .sort((a, b) => Number(a.name.split(".").at(-1)) - Number(b.name.split(".").at(-1)));
}

export async function accessToken(context: BrowserContext): Promise<string> {
  const raw = (await sessionCookies(context)).map((cookie) => cookie.value).join("");
  const json = raw.startsWith("base64-")
    ? Buffer.from(raw.slice("base64-".length), "base64url").toString("utf8")
    : decodeURIComponent(raw);
  return (JSON.parse(json) as { access_token: string }).access_token;
}

/** Queries the Supabase REST API directly with this user's own token. */
export async function restSelect(page: Page, path: string): Promise<{ status: number; rows: unknown[] }> {
  const response = await page.request.get(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: publishableKey, Authorization: `Bearer ${await accessToken(page.context())}` },
  });
  return { status: response.status(), rows: response.ok() ? await response.json() : [] };
}
