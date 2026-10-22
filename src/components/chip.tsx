import type { ReactNode } from "react";

export type ChipTone = "primary" | "secondary" | "neutral";

const tones: Record<ChipTone, string> = {
  primary: "bg-primary-container text-on-primary-container",
  secondary: "bg-secondary-container text-on-secondary-container",
  neutral: "bg-surface-container-high text-on-surface-variant",
};

/** Compact 32px tag with a 4px radius. Labels wrap instead of truncating. */
export function Chip({
  tone = "secondary",
  icon,
  className,
  children,
}: {
  tone?: ChipTone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={[
        "inline-flex min-h-8 items-center gap-1.5 rounded-sm border border-ink px-2.5 py-1 text-label-sm",
        tones[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon ? (
        <span aria-hidden="true" className="flex shrink-0">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </span>
  );
}
