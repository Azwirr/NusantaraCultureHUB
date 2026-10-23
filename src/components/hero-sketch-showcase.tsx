"use client";

import { ChevronLeft, ChevronRight, Compass, Sparkles } from "lucide-react";
import { type ComponentType, useState } from "react";

import {
  AngklungArt,
  BatikArt,
  CandiArt,
  KawungNode,
  KerisArt,
  PinisiArt,
  RumahGadangArt,
  WayangArt,
} from "./line-art";

export type HeroSketchDictionary = {
  tag: string;
  badge: string;
  switchAction: string;
  nextAction: string;
  prevAction: string;
  items: {
    borobudur: { title: string; origin: string; category: string; note: string };
    pinisi: { title: string; origin: string; category: string; note: string };
    gadang: { title: string; origin: string; category: string; note: string };
    wayang: { title: string; origin: string; category: string; note: string };
    keris: { title: string; origin: string; category: string; note: string };
    angklung: { title: string; origin: string; category: string; note: string };
  };
};

type SketchKey = "borobudur" | "pinisi" | "gadang" | "wayang" | "keris" | "angklung";

type SketchItemDef = {
  id: SketchKey;
  icon: string;
  art: ComponentType<{ className?: string }>;
  accentColor: string;
};

const SKETCHES: Array<SketchItemDef> = [
  { id: "borobudur", icon: "🏛️", art: CandiArt, accentColor: "text-primary" },
  { id: "pinisi", icon: "⛵", art: PinisiArt, accentColor: "text-secondary" },
  { id: "gadang", icon: "🏡", art: RumahGadangArt, accentColor: "text-primary" },
  { id: "wayang", icon: "🎭", art: WayangArt, accentColor: "text-tertiary" },
  { id: "keris", icon: "🗡️", art: KerisArt, accentColor: "text-secondary" },
  { id: "angklung", icon: "🎋", art: AngklungArt, accentColor: "text-primary" },
];

export function HeroSketchShowcase({ dict }: { dict: HeroSketchDictionary }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const current = SKETCHES[selectedIndex] ?? SKETCHES[0]!;
  const currentMeta = dict.items[current.id];
  const CurrentArt = current.art;

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? SKETCHES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === SKETCHES.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative col-span-4 flex flex-col gap-3 md:col-span-8 lg:col-span-5">
      {/* Visual Header / Gallery Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-ink/20 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles size={12} aria-hidden="true" />
          </span>
          <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
            {dict.tag}
          </span>
        </div>
        <div className="flex items-center gap-1.5" aria-label={dict.switchAction}>
          <button
            type="button"
            onClick={handlePrev}
            aria-label={dict.prevAction}
            className="press inline-flex h-7 w-7 items-center justify-center rounded border border-ink/40 bg-surface text-on-surface hover:border-primary hover:bg-primary-container hover:text-on-primary-container transition-colors"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <span className="text-[11px] font-mono text-on-surface-variant tabular-nums px-1">
            {selectedIndex + 1}/{SKETCHES.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            aria-label={dict.nextAction}
            className="press inline-flex h-7 w-7 items-center justify-center rounded border border-ink/40 bg-surface text-on-surface hover:border-primary hover:bg-primary-container hover:text-on-primary-container transition-colors"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Main Specimen Stage with Archival Layering */}
      <div className="relative pt-2 pb-1">
        {/* Layer 1: Background stacked decorative plate (Batik / Parang angle) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 translate-x-3 translate-y-3 -rotate-2 rounded border border-ink/30 bg-surface-container-low shadow-1 opacity-60 transition-transform"
        >
          <div className="absolute right-2 bottom-2 w-28 opacity-25">
            <BatikArt className="h-auto w-full" />
          </div>
        </div>

        {/* Layer 2: Main Active Curatorial Sketch Card */}
        <div className="relative z-10 flex flex-col rounded border border-ink bg-surface-container-lowest p-4 shadow-3">
          {/* Top Plate Bar: Origin & Category */}
          <div className="flex items-center justify-between border-b border-ink/15 pb-2.5">
            <div className="flex items-center gap-1.5 text-label-sm text-secondary font-medium">
              <Compass size={13} aria-hidden="true" className="shrink-0 text-primary" />
              <span>{currentMeta.origin}</span>
            </div>
            <span className="rounded-full border border-ink/30 bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
              {currentMeta.category}
            </span>
          </div>

          {/* Canvas Display with Vintage Stamp Watermark */}
          <div className="relative my-2 flex min-h-[170px] sm:min-h-[210px] items-center justify-center overflow-hidden rounded bg-surface-container-low/40 p-3">
            {/* Museum Heritage Seal Watermark */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-2 right-2 flex flex-col items-center opacity-30 select-none"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-ink/60">
                <KawungNode cx={0} cy={0} size={12} />
              </div>
              <span className="mt-0.5 text-[8px] font-mono uppercase tracking-widest text-ink">
                ARCHIVE
              </span>
            </div>

            {/* The Active Line Drawing */}
            <div className={`w-full max-w-[280px] sm:max-w-[320px] ${current.accentColor} transition-all duration-300`}>
              <CurrentArt className="mx-auto max-h-48 w-full transition-transform hover:scale-105 duration-300" />
            </div>
          </div>

          {/* Curatorial Specimen Caption */}
          <div className="flex flex-col gap-1 border-t border-ink/15 pt-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-serif text-title-md text-on-surface">
                {currentMeta.title}
              </h3>
              <span className="text-body-sm" aria-hidden="true">
                {current.icon}
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant leading-snug line-clamp-2">
              {currentMeta.note}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Sketch Selector Pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {SKETCHES.map((sketch, idx) => {
          const isSelected = idx === selectedIndex;
          const itemMeta = dict.items[sketch.id];
          return (
            <button
              key={sketch.id}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-pressed={isSelected}
              className={`press inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-label-xs transition-colors ${
                isSelected
                  ? "border-primary bg-primary text-on-primary font-semibold shadow-1"
                  : "border-ink/30 bg-surface-container-lowest text-on-surface hover:border-primary hover:bg-surface-container-low"
              }`}
            >
              <span aria-hidden="true">{sketch.icon}</span>
              <span>{itemMeta.title.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
