import Image from "next/image";
import Link from "next/link";
import { BookOpen, ShieldCheck, Sparkles } from "lucide-react";

import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Site footer adhering to the heritage design system.
 * Bilingual and responsive: gives generous bottom safe-area padding
 * on small viewports so the fixed mobile BottomNav never covers links.
 */
export function AppFooter({ dict }: { dict: Dictionary }) {
  const { footer, nav, brand } = dict;

  return (
    <footer className="relative z-10 border-t border-ink bg-surface-container-low/90 pb-[calc(5rem+env(safe-area-inset-bottom))] text-on-surface md:pb-12">
      <div className="page-container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Manifesto */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/brand/logo-96.png"
                alt=""
                width={48}
                height={48}
                className="size-11 shrink-0 rounded-full border border-ink object-cover"
              />
              <span className="flex flex-col">
                <span className="font-serif text-headline-md text-primary">Nusantara</span>
                <span className="text-label-sm text-secondary">{brand.tagline}</span>
              </span>
            </Link>
            <p className="max-w-md text-body-md text-on-surface-variant">
              {footer.description}
            </p>
            <div className="mt-2 flex items-center gap-2 rounded border border-ink/40 bg-surface-container-lowest px-3 py-1.5 text-label-sm text-secondary w-fit shadow-1">
              <Sparkles size={16} aria-hidden="true" className="text-secondary" />
              <span>{footer.festivalCredit}</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif text-headline-md text-on-surface">{footer.navHeading}</h3>
            <ul className="flex flex-col gap-2.5 text-body-md text-on-surface-variant">
              <li>
                <Link href="/" className="hover:text-primary transition-colors hover:underline">
                  {nav.home}
                </Link>
              </li>
              <li>
                <Link href="/library" className="hover:text-primary transition-colors hover:underline">
                  {nav.library}
                </Link>
              </li>
              <li>
                <Link href="/regions" className="hover:text-primary transition-colors hover:underline">
                  {nav.regions}
                </Link>
              </li>
              <li>
                <Link href="/me/saved" className="hover:text-primary transition-colors hover:underline">
                  {nav.saved}
                </Link>
              </li>
              <li>
                <Link href="/me" className="hover:text-primary transition-colors hover:underline">
                  {nav.me}
                </Link>
              </li>
            </ul>
          </div>

          {/* Three Pillars */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif text-headline-md text-on-surface">{footer.pillarsHeading}</h3>
            <ul className="flex flex-col gap-2.5 text-body-md text-on-surface-variant">
              <li>
                <Link href="/library?type=costume" className="hover:text-primary transition-colors hover:underline">
                  {dict.common.types.costume} (Try-On)
                </Link>
              </li>
              <li>
                <Link href="/library?type=recipe" className="hover:text-primary transition-colors hover:underline">
                  {dict.common.types.recipe}
                </Link>
              </li>
              <li>
                <Link href="/library?type=story" className="hover:text-primary transition-colors hover:underline">
                  {dict.common.types.story} & Audio
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Trusted Curation */}
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="flex items-center gap-1.5 font-serif text-headline-md text-on-surface">
                <ShieldCheck size={18} className="text-primary" aria-hidden="true" />
                {footer.privacyHeading}
              </h3>
              <p className="mt-1 text-body-sm text-on-surface-variant leading-relaxed">
                {footer.privacyText}
              </p>
            </div>
            <div>
              <h3 className="flex items-center gap-1.5 font-serif text-headline-md text-on-surface">
                <BookOpen size={18} className="text-secondary" aria-hidden="true" />
                {footer.curationHeading}
              </h3>
              <p className="mt-1 text-body-sm text-on-surface-variant leading-relaxed">
                {footer.curationText}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink pt-6 text-label-sm text-on-surface-variant md:flex-row">
          <p>{footer.copyright}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
              <span>Dwibahasa (ID / EN) · Aksesibel WCAG AA</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
