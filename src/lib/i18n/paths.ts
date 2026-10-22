import { isLocale } from "./config";

/**
 * Removes a leading /id or /en segment so internal paths can be compared and
 * linked unprefixed (the proxy adds the locale back). Client-safe.
 *   "/id/library" -> "/library", "/en" -> "/", "/library" -> "/library"
 */
export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/");
  if (!isLocale(segments[1])) return pathname || "/";
  const rest = `/${segments.slice(2).join("/")}`;
  return rest === "/" || rest === "" ? "/" : rest;
}
