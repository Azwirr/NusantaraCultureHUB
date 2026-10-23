import { ArrowLeft, LogOut } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { NicknameForm } from "@/components/auth/nickname-form";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PageHeader } from "@/components/page-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import type { Locale } from "@/lib/i18n/config";
import { type Dictionary, getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getDictionary();
  return { title: settings.title, robots: { index: false, follow: false } };
}

export default async function SettingsPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <div className="page-container py-8 md:py-12">
      <Link href="/me" className="mb-4 inline-flex min-h-12 items-center gap-2 rounded text-label-md text-primary hover:underline">
        <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.75} />
        {dict.settings.back}
      </Link>
      <PageHeader kicker={dict.settings.kicker} title={dict.settings.title} lead={dict.settings.lead} />
      <Suspense
        fallback={
          <p role="status" className="text-body-md text-on-surface-variant">
            {dict.me.loading}
          </p>
        }
      >
        <SettingsPanel dict={dict} locale={locale} />
      </Suspense>
    </div>
  );
}

/** Members only (the proxy and requireUser send guests to /login). */
async function SettingsPanel({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const user = await requireUser("/me/settings");
  const { settings, me, auth, language, theme } = dict;
  return (
    <div className="flex max-w-xl flex-col gap-6">
      {/* NicknameForm is its own labelled section. */}
      <NicknameForm
        copy={{ ...me.nickname, label: auth.fields.username, hint: auth.fields.usernameHint, errors: auth.errors }}
        current={user.username ?? ""}
        required={user.needsNickname}
      />

      <Card as="section" aria-labelledby="display-heading" className="flex flex-col gap-4 p-5">
        <h2 id="display-heading" className="font-serif text-headline-md text-on-surface">
          {settings.displayHeading}
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-label-md text-on-surface">{settings.languageLabel}</span>
          <LanguageSwitcher
            current={locale}
            label={language.label}
            names={{ id: language.id, en: language.en }}
            codes={{ id: language.idCode, en: language.enCode }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-label-md text-on-surface">{settings.themeLabel}</span>
          <ThemeToggle label={theme.toggle} />
        </div>
      </Card>

      <Card as="section" aria-labelledby="account-heading" className="flex flex-col gap-4 p-5">
        <h2 id="account-heading" className="font-serif text-headline-md text-on-surface">
          {settings.accountHeading}
        </h2>
        <form action={signOut}>
          <Button type="submit" variant="secondary">
            <LogOut aria-hidden="true" size={18} strokeWidth={1.75} />
            {settings.signOut}
          </Button>
        </form>
      </Card>
    </div>
  );
}
