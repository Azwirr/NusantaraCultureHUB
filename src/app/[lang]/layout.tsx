import "../globals.css";

import type { Metadata, Viewport } from "next";
import { Merriweather, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AppHeader } from "@/components/app-header";
import { BottomNav, BottomNavLinks } from "@/components/bottom-nav";
import { ClientCopyProvider } from "@/components/client-copy";
import { LiveBackground } from "@/components/live-background";
import { ThemeScript } from "@/components/theme-script";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionaryFor } from "@/lib/i18n/dictionaries";
import { THEME_COLORS } from "@/lib/preferences";

// Self-hosted at build time by next/font: no request to Google from the browser.
const merriweather = Merriweather({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-merriweather",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-jakarta",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionaryFor(lang);
  return {
    title: { template: "%s · Nusantara", default: dict.meta.defaultTitle },
    description: dict.meta.description,
    applicationName: "Nusantara",
  };
}

// Zoom stays enabled: no maximum-scale and no user-scalable=no (WCAG 1.4.4).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionaryFor(lang);

  return (
    // ThemeScript sets data-theme before hydration, hence suppressHydrationWarning.
    <html lang={lang} className={`${merriweather.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="relative flex min-h-dvh flex-col bg-background font-sans text-body-md text-on-background">
        <LiveBackground />
        <a href="#main" className="skip-link">
          {dict.a11y.skipToContent}
        </a>
        <AppHeader dict={dict} locale={lang} />
        <main
          id="main"
          tabIndex={-1}
          className="relative z-10 flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom))] outline-none md:pb-16"
        >
          <ClientCopyProvider copy={{ errorPage: dict.errorPage }}>{children}</ClientCopyProvider>
        </main>
        <Suspense fallback={<BottomNavLinks labels={dict.nav} label={dict.a11y.mainNav} pathname={null} />}>
          <BottomNav labels={dict.nav} label={dict.a11y.mainNav} />
        </Suspense>
      </body>
    </html>
  );
}
