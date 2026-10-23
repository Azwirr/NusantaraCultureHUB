"use client";

import { type FocusEvent, type MouseEvent, type ReactNode, useState } from "react";

/**
 * Shows the name of the province under the pointer or keyboard focus. The
 * map's links carry their own accessible names, so this caption is visual
 * only (aria-hidden) and the map works without it.
 */
export function MapCaption({ idle, children }: { idle: string; children: ReactNode }) {
  const [label, setLabel] = useState<string | null>(null);

  function pick(event: MouseEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>) {
    const shape = (event.target as Element).closest("[data-label]");
    setLabel(shape?.getAttribute("data-label") ?? null);
  }

  return (
    <div onMouseOver={pick} onFocus={pick} onMouseLeave={() => setLabel(null)} onBlur={() => setLabel(null)} className="flex flex-col gap-3">
      <p aria-hidden="true" className="min-h-6 text-body-md text-on-surface">
        {label ?? <span className="text-on-surface-variant">{idle}</span>}
      </p>
      {children}
    </div>
  );
}
