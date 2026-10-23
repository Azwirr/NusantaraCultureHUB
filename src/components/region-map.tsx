import Link from "next/link";

import type { RegionSummary } from "@/lib/content";
import { fill } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { MAP_VIEWBOX, PROVINCE_SHAPES } from "@/lib/map/indonesia-provinces";
import { ISLANDS, onIsland } from "@/lib/map/islands";

import { MapCaption } from "./map-caption";

/**
 * FR-16 navigation map (no game mechanics). The provinces are grouped into
 * seven islands; each island is one link to its island page, reachable with
 * Tab in west-to-east order, and named on the map. Islands with approved
 * regions are coloured. The list below the map remains the full alternative.
 */
export function RegionMap({ regions, locale, copy }: { regions: RegionSummary[]; locale: Locale; copy: Dictionary["map"] }) {
  return (
    <figure className="flex flex-col gap-4">
      <MapCaption idle={copy.idle}>
        <div className="overflow-hidden rounded border border-ink bg-surface-container-low p-2 md:p-4">
          <svg viewBox={MAP_VIEWBOX} role="group" aria-label={copy.label} className="h-auto w-full">
            {ISLANDS.map((island) => {
              const name = island.name[locale];
              const published = regions.filter((region) => onIsland(island, region.provinceCodes)).length;
              const label = fill(copy.opens, { island: name });
              const caption = `${name} · ${published ? fill(copy.regionCount, { n: published }) : copy.nothingYet}`;
              return (
                <Link
                  key={island.slug}
                  href={`/regions/island/${island.slug}`}
                  aria-label={label}
                  data-label={caption}
                  data-island={island.slug}
                  className="group/island outline-none"
                >
                  {PROVINCE_SHAPES.filter((shape) => island.provinces.includes(shape.code)).map((shape) => (
                    <path
                      key={shape.code}
                      d={shape.d}
                      className={[
                        "transition-colors group-hover/island:fill-primary group-focus-visible/island:fill-primary group-focus-visible/island:stroke-focus-ring",
                        published ? "fill-primary-container stroke-primary" : "fill-surface-container-highest stroke-outline",
                      ].join(" ")}
                      strokeWidth={published ? 1.2 : 0.8}
                    />
                  ))}
                </Link>
              );
            })}
            {/* Island names: visual only, the links carry their own names. */}
            <g aria-hidden="true" className="pointer-events-none">
              {ISLANDS.map((island) => (
                <text
                  key={island.slug}
                  x={island.label.x}
                  y={island.label.y}
                  textAnchor="middle"
                  className="fill-on-surface stroke-surface-container-low font-sans text-[13px] font-semibold"
                  strokeWidth={4}
                  paintOrder="stroke"
                >
                  {island.name[locale]}
                </text>
              ))}
            </g>
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
            <span className="size-3.5 rounded-sm border border-outline bg-surface-container-highest" />
            {copy.legendSoon}
          </span>
        </span>
        <span>{copy.note}</span>
      </figcaption>
    </figure>
  );
}
