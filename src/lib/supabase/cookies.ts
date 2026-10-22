// Shared by the proxy and the server client, so it must stay free of
// server-only imports.

/**
 * Attributes for the Supabase session cookies. Only server code reads them
 * (proxy, Server Components, actions, route handlers), so page scripts never
 * need access: HttpOnly keeps the tokens away from any injected script.
 */
export const AUTH_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
} as const;

// sb-<project-ref>-auth-token, or one of its .0/.1 chunks. Excludes the
// PKCE "-code-verifier" cookie.
const SESSION_COOKIE = /^sb-.+-auth-token(\.\d+)?$/;

/** True when the request carries a non-empty Supabase session cookie. */
export function hasSessionCookie(cookies: { name: string; value: string }[]): boolean {
  return cookies.some((cookie) => cookie.value !== "" && SESSION_COOKIE.test(cookie.name));
}
