import Link from "next/link";

import type { RegionSummary } from "@/lib/content";
import { fill } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { MAP_VIEWBOX, PROVINCE_SHAPES } from "@/lib/map/indonesia-provinces";
import { PROVINCE_NAMES } from "@/lib/map/province-names";

import { MapCaption } from "./map-caption";

/**
 * FR-16 navigation map (no game mechanics). Provinces covered by an approved
 * region are links to its page, reachable with Tab in map order; the others
 * are decoration. The list below the map remains the full alternative.
 */
export function RegionMap({ regions, locale, copy }: { regions: RegionSummary[]; locale: Locale; copy: Dictionary["map"] }) {
  const byProvince = new Map<string, RegionSummary>();
  for (const region of regions) {
    for (const code of region.provinceCodes) if (!byProvince.has(code)) byProvince.set(code, region);
  }
  const name = (code: string, fallback: string) => PROVINCE_NAMES[code]?.[locale] ?? fallback;

  return (
    <figure className="flex flex-col gap-4">
      <MapCaption idle={copy.idle}>
        <div className="overflow-hidden rounded border border-ink bg-surface-container-low p-2 md:p-4">
          <svg viewBox={MAP_VIEWBOX} role="group" aria-label={copy.label} className="h-auto w-full">
            {PROVINCE_SHAPES.map((shape) => {
              const region = byProvince.get(shape.code);
              const province = name(shape.code, shape.name);
              if (!region) {
                return (
                  <path
                    key={shape.code}
                    d={shape.d}
                    aria-hidden="true"
                    data-label={fill(copy.soon, { province })}
                    className="fill-surface-container-highest stroke-outline-variant"
                    strokeWidth={0.8}
                  />
                );
              }
              const label = fill(copy.opens, { province, region: region.name });
              return (
                <Link key={shape.code} href={`/regions/${region.slug}`} aria-label={label} data-label={label} className="group/province outline-none">
                  <path
                    d={shape.d}
                    className="fill-primary-container stroke-primary transition-colors group-hover/province:fill-primary group-focus-visible/province:fill-primary group-focus-visible/province:stroke-focus-ring"
                    strokeWidth={1.2}
                  />
                </Link>
              );
            })}
          </svg>
        </div>
      </MapCaption>
      <figcaption className="flex flex-col gap-2 text-body-sm text-on-surface-variant">
        <span>{copy.hint}</span>
        <span className="flex flex-wrap gap-x-5 gap-y-1" aria-hidden="true">
          <span className="inline-flex items-center gap-2">
            <span className="size-3.5 rounded-sm border border-primary bg-primary-container" />
            {copy.legendActive}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-3.5 rounded-sm border border-outline-variant bg-surface-container-highest" />
            {copy.legendSoon}
          </span>
        </span>
        <span>{copy.note}</span>
      </figcaption>
    </figure>
  );
}
