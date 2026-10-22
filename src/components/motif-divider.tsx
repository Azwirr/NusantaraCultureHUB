import { KawungNode } from "./line-art";

/** Section break: two 1px rules meeting at a single kawung node. Decorative. */
export function MotifDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 24"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
      className={["line-art mx-auto block h-6 w-full max-w-60 text-secondary", className]
        .filter(Boolean)
        .join(" ")}
    >
      <g fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round">
        <line x1="4" y1="12" x2="100" y2="12" />
        <line x1="140" y1="12" x2="236" y2="12" />
        <KawungNode cx={120} cy={12} size={9} />
      </g>
    </svg>
  );
}
