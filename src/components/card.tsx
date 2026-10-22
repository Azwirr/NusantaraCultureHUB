import type { ReactNode } from "react";

export type CardSurface = "lowest" | "low" | "primary";

const surfaces: Record<CardSurface, string> = {
  lowest: "bg-surface-container-lowest text-on-surface",
  low: "bg-surface-container-low text-on-surface",
  primary: "bg-primary-container text-on-primary-container",
};

type CardProps = {
  as?: "div" | "article" | "section" | "aside";
  surface?: CardSurface;
  className?: string;
  children: ReactNode;
} & Record<`aria-${string}`, string | undefined>;

/** Paper card: 1px ink contour, 8px radius and a hard offset shadow (Level 1). */
export function Card({ as: Tag = "div", surface = "lowest", className, children, ...aria }: CardProps) {
  return (
    <Tag
      className={["rounded border border-ink shadow-1", surfaces[surface], className].filter(Boolean).join(" ")}
      {...aria}
    >
      {children}
    </Tag>
  );
}
