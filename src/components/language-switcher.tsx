"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";

import { LOCALE_COOKIE, locales, type Locale } from "@/lib/i18n/config";
import { stripLocalePrefix } from "@/lib/i18n/paths";
import { writePreferenceCookie } from "@/lib/preferences";
import { safeNextPath } from "@/lib/safe-redirect";

// Switching language mounts a new page tree, which drops keyboard focus. The
// chosen language is remembered here so the new switcher can take focus back.
const FOCUS_KEY = "nch_focus_lang";

/**
 * ID | EN segmented control. Saves the choice in the nch_locale cookie, which
 * the proxy uses to pick /id or /en for unprefixed URLs, then re-renders.
 */
export function LanguageSwitcher({
  current,
  label,
  names,
  codes,
}: {
  current: Locale;
  label: string;
  /** Full language names, read by screen readers. */
  names: Record<Locale, string>;
  /** Short visible codes ("ID", "EN"). */
  codes: Record<Locale, string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const buttons = useRef<Partial<Record<Locale, HTMLButtonElement | null>>>({});

  useEffect(() => {
    try {
      if (sessionStorage.getItem(FOCUS_KEY) !== current) return;
      sessionStorage.removeItem(FOCUS_KEY);
    } catch {
      return;
    }
    buttons.current[current]?.focus();
  }, [current]);

  function choose(next: Locale) {
    if (next === current || pending) return;
    writePreferenceCookie(LOCALE_COOKIE, next);
    try {
      sessionStorage.setItem(FOCUS_KEY, next);
    } catch {
      // Storage blocked: the switch still works, focus just is not restored.
    }
    const { pathname, search, hash } = window.location;
    const unprefixed = safeNextPath(stripLocalePrefix(pathname), "/");
    startTransition(() => {
      // A visible /id or /en prefix would pin the old language: drop it.
      if (unprefixed !== pathname) router.replace(`${unprefixed}${search}${hash}`);
      else router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex shrink-0 rounded border border-ink bg-surface-container-low shadow-1"
    >
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            ref={(element) => {
              buttons.current[locale] = element;
            }}
            type="button"
            lang={locale}
            aria-pressed={active}
            onClick={() => choose(locale)}
            className={[
              "inline-flex min-h-12 min-w-12 items-center justify-center px-2 text-label-md first:rounded-l-[7px] last:rounded-r-[7px]",
              active
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
            ].join(" ")}
          >
            {/* Visible code stays in the accessible name (WCAG 2.5.3). */}
            {codes[locale]}
            <span className="sr-only">, {names[locale]}</span>
          </button>
        );
      })}
    </div>
  );
}
