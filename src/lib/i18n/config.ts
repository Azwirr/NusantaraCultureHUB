// Shared by the proxy, server code and client components, so it must stay
// free of server-only imports.

export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "id";

/** Cookie that remembers the visitor's language choice. Not a secret. */
export const LOCALE_COOKIE = "nch_locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/**
 * Picks the first supported language from an Accept-Language header,
 * honouring q-values. Falls back to Indonesian.
 */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return defaultLocale;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .filter((entry) => entry.tag && entry.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    const primary = tag.split("-")[0];
    if (isLocale(primary)) return primary;
  }
  return defaultLocale;
}
