import Link from "next/link";

import type { Dictionary } from "@/lib/i18n/dictionaries";

type Section = "queue" | "audit" | "roles";

const HREFS: Record<Section, string> = { queue: "/review", audit: "/review/audit", roles: "/review/roles" };

/** Queue, audit log and (owners only) roles. The current section is marked for assistive tech too. */
export function ReviewNav({
  copy,
  current,
  isOwner,
}: {
  copy: Dictionary["review"]["nav"];
  current: Section | null;
  isOwner: boolean;
}) {
  const sections: Section[] = isOwner ? ["queue", "audit", "roles"] : ["queue", "audit"];
  return (
    <nav aria-label={copy.label} className="mb-8">
      <ul className="flex flex-wrap gap-2">
        {sections.map((section) => {
          const active = section === current;
          return (
            <li key={section}>
              <Link
                href={HREFS[section]}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative inline-flex min-h-12 items-center rounded border border-ink px-4 text-label-md",
                  active
                    ? "bg-primary-container text-on-primary-container after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-primary"
                    : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                ].join(" ")}
              >
                {copy[section]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
