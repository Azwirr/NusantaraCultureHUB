import type { ReactNode } from "react";

/** Calm placeholder for lists with nothing approved yet, and for 404s. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  headingLevel = 2,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  headingLevel?: 1 | 2;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <section className="flex flex-col items-center gap-4 rounded border border-dashed border-outline bg-surface-container-low px-6 py-10 text-center">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded border border-ink bg-surface-container-lowest text-secondary shadow-1"
      >
        {icon}
      </span>
      <Heading
        className={
          headingLevel === 1
            ? "font-serif text-headline-lg-mobile text-on-surface md:text-headline-lg"
            : "font-serif text-headline-md text-on-surface"
        }
      >
        {title}
      </Heading>
      <p className="max-w-md text-body-md text-on-surface-variant">{description}</p>
      {action ? <div className="flex flex-wrap justify-center gap-3 pt-2">{action}</div> : null}
    </section>
  );
}
