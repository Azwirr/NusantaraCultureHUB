// Shared by /auth/callback and the sign-in page, so it stays free of
// server-only imports.

/** Errors /auth/callback can report to /login?error=. Each has a dict.auth.errors message. */
export const CALLBACK_ERRORS = ["link_invalid", "oauth_failed", "oauth_cancelled"] as const;
export type CallbackErrorCode = (typeof CALLBACK_ERRORS)[number];

/** Reads ?error= on /login. Unknown values show nothing. */
export function callbackErrorFromParam(value: string | null): CallbackErrorCode | null {
  if (value === "link") return "link_invalid"; // older links
  return (CALLBACK_ERRORS as readonly string[]).includes(value ?? "") ? (value as CallbackErrorCode) : null;
}

/**
 * Why a sign-in that came back to /auth/callback failed. `via` is set by the
 * Google button; email confirmation links carry no `via`. Supabase reports a
 * declined Google consent as error=access_denied.
 */
export function callbackFailure(via: string | null, providerError: string | null): CallbackErrorCode {
  if (via === "google") return providerError === "access_denied" ? "oauth_cancelled" : "oauth_failed";
  return "link_invalid";
}
