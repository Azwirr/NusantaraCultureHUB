"use client";

import { Bookmark, BookOpen, House, LayoutList, type LucideIcon, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { stripLocalePrefix } from "@/lib/i18n/paths";

export type NavLabels = {
  home: string;
  library: string;
  regions: string;
  saved: string;
  me: string;
  /** The tab bar has five tabs at 360px, so it uses a shorter library label. */
  libraryShort: string;
};

type NavKey = "home" | "library" | "regions" | "saved" | "me";

type NavItem = {
  key: NavKey;
  href: string;
  icon: LucideIcon;
  /** Unprefixed path roots that belong to this tab. */
  sections: string[];
  /** Only the exact path counts (Saya must not light up on /me/saved). */
  exact?: boolean;
};

// Wilayah keeps a neutral list icon: the region map is for navigation, and
// the list stays the main way in (FR-16).
const NAV_ITEMS: NavItem[] = [
  { key: "home", href: "/", icon: House, sections: [] },
  { key: "library", href: "/library", icon: BookOpen, sections: ["/stories", "/recipes", "/costumes", "/try-on", "/search"] },
  { key: "regions", href: "/regions", icon: LayoutList, sections: [] },
  { key: "saved", href: "/me/saved", icon: Bookmark, sections: [] },
  { key: "me", href: "/me", icon: UserRound, sections: [], exact: true },
];

function currentState(item: NavItem, pathname: string | null): "page" | "true" | undefined {
  if (pathname === null) return undefined;
  const path = stripLocalePrefix(pathname);
  if (path === item.href) return "page";
  if (item.href === "/" || item.exact) return undefined;
  const inSection = [item.href, ...item.sections].some(
    (root) => path === root || path.startsWith(`${root}/`),
  );
  return inSection ? "true" : undefined;
}

type NavProps = { labels: NavLabels; label: string };

/**
 * Static markup for the bottom tab bar (phones, under md). Also the Suspense
 * fallback: usePathname suspends while dynamic routes prerender.
 */
export function BottomNavLinks({ labels, label, pathname }: NavProps & { pathname: string | null }) {
  return (
    <nav
      aria-label={label}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const current = currentState(item, pathname);
          const Icon = item.icon;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={current}
                className={[
                  // Inset focus ring: the bar touches the screen edges.
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-1.5 text-center text-label-sm focus-visible:[outline-offset:-4px]",
                  current
                    ? "text-primary before:absolute before:inset-x-5 before:top-0 before:h-0.5 before:rounded-full before:bg-primary"
                    : "text-on-surface-variant hover:text-on-surface",
                ].join(" ")}
              >
                <Icon aria-hidden="true" size={24} strokeWidth={1.75} />
                <span>{item.key === "library" ? labels.libraryShort : labels[item.key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Bottom tab bar with the active tab marked by aria-current. Wrap in Suspense. */
export function BottomNav(props: NavProps) {
  const pathname = usePathname();
  return <BottomNavLinks {...props} pathname={pathname} />;
}

/** The same four links rendered inside the header from md up. */
export function HeaderNavLinks({ labels, label, pathname }: NavProps & { pathname: string | null }) {
  return (
    <nav aria-label={label} className="hidden md:block">
      <ul className="flex flex-wrap items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const current = currentState(item, pathname);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={current}
                className={[
                  "relative inline-flex min-h-12 min-w-12 items-center justify-center rounded px-3 text-label-md",
                  // The bar under the current link is the cue that does not rely on colour.
                  current
                    ? "bg-primary-container text-on-primary-container after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                ].join(" ")}
              >
                {labels[item.key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Header navigation for md and up. Wrap in Suspense. */
export function HeaderNav(props: NavProps) {
  const pathname = usePathname();
  return <HeaderNavLinks {...props} pathname={pathname} />;
}
