"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect, useSyncExternalStore } from "react";

import {
  isTheme,
  readCookie,
  syncThemeColor,
  THEME_COOKIE,
  type Theme,
  writePreferenceCookie,
} from "@/lib/preferences";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function currentTheme(): Theme {
  const attribute = document.documentElement.getAttribute("data-theme");
  if (isTheme(attribute)) return attribute;
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

// The server cannot know the theme; the icon is picked by CSS until hydration.
const serverTheme = (): Theme | null => null;

/** Light/dark toggle. Saves the choice in the nch_theme cookie read by ThemeScript. */
export function ThemeToggle({ label }: { label: string }) {
  const theme = useSyncExternalStore(subscribe, currentTheme, serverTheme);

  // React's development remount resets <html> attributes; restore the saved
  // choice before paint. A no-op in production.
  useLayoutEffect(() => {
    const saved = readCookie(THEME_COOKIE);
    if (!isTheme(saved)) return;
    if (document.documentElement.getAttribute("data-theme") !== saved) {
      document.documentElement.setAttribute("data-theme", saved);
    }
    // The theme-color metas only know the OS preference; follow the saved choice.
    syncThemeColor(saved);
  }, []);

  function toggle() {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    syncThemeColor(next);
    writePreferenceCookie(THEME_COOKIE, next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === "dark"}
      aria-label={label}
      className="press inline-flex size-12 shrink-0 items-center justify-center rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
    >
      <Moon aria-hidden="true" size={22} strokeWidth={1.75} className="theme-icon-moon" />
      <Sun aria-hidden="true" size={22} strokeWidth={1.75} className="theme-icon-sun" />
    </button>
  );
}
