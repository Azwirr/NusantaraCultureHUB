/**
 * Returns a same-origin path that is safe to redirect to after sign-in, or
 * the fallback. Blocks absolute URLs, protocol-relative URLs ("//evil.com")
 * and backslash tricks ("/\\evil.com") that browsers treat as hosts.
 */
export function safeNextPath(value: unknown, fallback = "/me"): string {
  if (typeof value !== "string") return fallback;
  const path = value.trim();
  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//") || path.startsWith("/\\")) return fallback;
  if ([...path].some((ch) => ch.charCodeAt(0) < 0x20 || ch === "\\")) return fallback;
  if (path.length > 512) return fallback;
  return path;
}
