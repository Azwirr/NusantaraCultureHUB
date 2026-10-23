import Image from "next/image";
import type { Cover } from "@/lib/media/covers";

/** Credits are visible on every use, including cards; generated art is labelled. */
export function CoverArt({ cover, compact = false, portrait = false }: { cover: Cover; compact?: boolean; portrait?: boolean }) {
  return (
    <figure className={compact ? "border-b border-ink" : "mb-8 overflow-hidden rounded border border-ink bg-surface-container-lowest"}>
      <div className={`relative w-full overflow-hidden bg-surface-container ${compact ? "aspect-[16/10]" : portrait ? "aspect-[4/5]" : "aspect-[16/9]"}`}>
        {cover.url.startsWith("/covers/") ? (
          <Image
            src={cover.url}
            alt={cover.alt}
            fill
            sizes={compact ? "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw" : "(max-width: 1200px) 100vw, 1200px"}
            className={portrait ? "object-contain" : "object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.025]"}
            style={{ objectPosition: cover.objectPosition ?? "50% 50%" }}
          />
        ) : (
          // Existing remote media is still supported while local assets roll out.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover.url} alt={cover.alt} loading="lazy" className="h-full w-full object-cover" />
        )}
      </div>
      <figcaption className={`relative z-10 flex items-center gap-x-2 bg-surface-container-lowest text-body-sm text-on-surface-variant ${compact ? "min-h-14 px-3 py-1" : "flex-wrap px-4 py-2"}`}>
        {cover.sourceUrl ? (
          <a href={cover.sourceUrl} target="_blank" rel="noopener noreferrer" title={cover.credit} className={`inline-flex min-h-12 items-center underline decoration-outline-variant underline-offset-2 hover:text-primary ${compact ? "min-w-0 flex-1" : ""}`}>
            <span className={compact ? "truncate" : ""}>{cover.credit}</span>
          </a>
        ) : <span className={compact ? "line-clamp-2" : ""}>{cover.credit} · {cover.licence}</span>}
        {cover.sourceUrl ? <span aria-hidden="true">·</span> : null}
        {cover.sourceUrl && cover.licenceUrl ? (
          <a href={cover.licenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 shrink-0 items-center underline decoration-outline-variant underline-offset-2 hover:text-primary">
            {cover.licence}
          </a>
        ) : cover.sourceUrl ? <span>{cover.licence}</span> : null}
      </figcaption>
    </figure>
  );
}
