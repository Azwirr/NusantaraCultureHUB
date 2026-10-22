import type { Metadata } from "next";
import { Merriweather, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";

import { ThemeScript } from "@/components/theme-script";
import { en } from "@/lib/i18n/dictionaries/en";
import { id } from "@/lib/i18n/dictionaries/id";

// URLs that match no locale (/foo.txt, /fr/x, unknown routes) never get a
// usable [lang] layout, so the language is unknown: say it in both languages
// instead of falling back to Next's English-only page. Used by
// src/app/global-not-found.tsx and src/app/not-found.tsx.

const merriweather = Merriweather({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-merriweather",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-jakarta",
});

export const bilingualNotFoundMetadata: Metadata = {
  title: `${id.notFound.title} · ${en.notFound.title} · Nusantara`,
};

/** A complete document: it renders outside the [lang] root layout. */
export function BilingualNotFoundDocument() {
  return (
    <html lang="id" className={`${merriweather.variable} ${jakarta.variable}`} suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-head-element -- App Router document; next/head is Pages Router only. */}
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col bg-background font-sans text-body-md text-on-background">
        <main className="page-container flex flex-1 flex-col justify-center gap-8 py-16">
          <section>
            <h1 className="font-serif text-headline-lg text-on-surface">{id.notFound.title}</h1>
            <p className="mt-2 text-body-lg text-on-surface-variant">{id.notFound.body}</p>
          </section>
          <section lang="en">
            <h2 className="font-serif text-headline-md text-on-surface">{en.notFound.title}</h2>
            <p className="mt-2 text-body-lg text-on-surface-variant">{en.notFound.body}</p>
          </section>
          <p>
            <Link
              href="/"
              className="inline-flex min-h-12 items-center rounded bg-primary px-5 text-label-md text-on-primary"
            >
              {id.common.backHome} · <span lang="en">&nbsp;{en.common.backHome}</span>
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
