import Link from "next/link";
import { Suspense } from "react";

import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { AccountButton, AccountButtonFallback } from "./account-button";
import { CommandSearch } from "./command-search";
import { HeaderNav, HeaderNavLinks } from "./bottom-nav";
import { LanguageSwitcher } from "./language-switcher";
import { BrandMark } from "./line-art";
import { ThemeToggle } from "./theme-toggle";

/**
 * Site header. Phones: brand, search, language and theme (the bottom tab bar
 * carries navigation and the account tab). md: a second row with the links
 * and the account button. lg: one row, and search becomes a field (Ctrl+K).
 */
export function AppHeader({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const navLabels = dict.nav;
  return (
    <header className="border-b border-ink bg-surface">
      <div className="page-container flex flex-wrap items-center gap-x-2 py-2 lg:flex-nowrap lg:gap-x-6">
        <Link href="/" className="mr-auto flex min-h-12 shrink-0 items-center gap-2.5 rounded pr-1 lg:mr-0">
          <BrandMark className="size-10 shrink-0" />
          <span className="flex flex-col">
            {/* Brand wordmark: the same in both languages. */}
            <span className="font-serif text-wordmark text-primary">Nusantara</span>
            <span className="text-label-sm text-secondary">{dict.brand.tagline}</span>
            <span className="sr-only">, {dict.nav.home}</span>
          </span>
        </Link>

        <div className="order-last hidden w-full md:block lg:order-none lg:w-auto lg:flex-1">
          <Suspense fallback={<HeaderNavLinks labels={navLabels} label={dict.a11y.mainNav} pathname={null} />}>
            <HeaderNav labels={navLabels} label={dict.a11y.mainNav} />
          </Suspense>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <CommandSearch copy={dict.search} locale={locale} />
          <LanguageSwitcher
            current={locale}
            label={dict.language.label}
            names={{ id: dict.language.id, en: dict.language.en }}
            codes={{ id: dict.language.idCode, en: dict.language.enCode }}
          />
          <ThemeToggle label={dict.theme.toggle} />
          <div className="hidden md:flex">
            <Suspense fallback={<AccountButtonFallback copy={dict.account} />}>
              <AccountButton copy={dict.account} />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
}
