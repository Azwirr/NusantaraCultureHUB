// Visitor preferences stored in plain, non-secret cookies. Client-safe.
// The locale cookie name lives in src/lib/i18n/config.ts (LOCALE_COOKIE).

/** Remembers light or dark. ThemeScript reads it before first paint. */
export const THEME_COOKIE = "nch_theme";

export type Theme = "light" | "dark";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** Page background per theme, for the browser UI colour (meta theme-color). */
export const THEME_COLORS: Record<Theme, string> = { light: "#f7f1e3", dark: "#18191c" };

/** Points every theme-color meta at the chosen theme, whatever the OS prefers. */
export function syncThemeColor(theme: Theme): void {
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = THEME_COLORS[theme];
  }
}

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Writes a preference cookie: path=/, one year, SameSite=Lax (Secure on https). */
export function writePreferenceCookie(name: string, value: string): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
}

export function readCookie(name: string): string | null {
  for (const part of document.cookie.split("; ")) {
    const separator = part.indexOf("=");
    if (separator > 0 && part.slice(0, separator) === name) {
      try {
        return decodeURIComponent(part.slice(separator + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}
