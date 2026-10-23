"use client";

import { Minus, Plus } from "lucide-react";
import { useId, useState } from "react";

import { fill } from "@/lib/format";

type Ingredient = { id: string; name: string; amount: number | null; unit: string | null };

/**
 * Ingredient list with a servings stepper. Amounts scale in the browser;
 * the change is announced politely for screen-reader users.
 */
export function ServingsScaler({
  baseServings,
  ingredients,
  units,
  locale,
  copy,
}: {
  baseServings: number;
  ingredients: Ingredient[];
  units: Record<string, string>;
  locale: string;
  copy: { servings: string; servingsValue: string; fewer: string; more: string; servingsChanged: string };
}) {
  const [servings, setServings] = useState(baseServings);
  const [announce, setAnnounce] = useState("");
  const labelId = useId();
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });

  function change(next: number) {
    const value = Math.min(100, Math.max(1, next));
    setServings(value);
    setAnnounce(fill(copy.servingsChanged, { n: value }));
  }

  const stepper =
    "press inline-flex size-12 items-center justify-center rounded border border-ink bg-surface-container-lowest text-on-surface hover:bg-surface-container disabled:opacity-50";

  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-labelledby={labelId} className="flex items-center gap-3">
        <span id={labelId} className="text-label-md text-on-surface">
          {copy.servings}
        </span>
        <button type="button" className={stepper} onClick={() => change(servings - 1)} disabled={servings <= 1} aria-label={copy.fewer}>
          <Minus aria-hidden="true" size={18} strokeWidth={1.75} />
        </button>
        <output aria-live="off" className="min-w-24 text-center font-serif text-headline-md tabular-nums text-on-surface">
          {fill(copy.servingsValue, { n: servings })}
        </output>
        <button type="button" className={stepper} onClick={() => change(servings + 1)} disabled={servings >= 100} aria-label={copy.more}>
          <Plus aria-hidden="true" size={18} strokeWidth={1.75} />
        </button>
      </div>
      <p role="status" className="sr-only">
        {announce}
      </p>
      <ul className="flex flex-col divide-y divide-ink border-y border-ink">
        {ingredients.map((ingredient) => {
          const amount = ingredient.amount === null ? null : (ingredient.amount * servings) / baseServings;
          const unit = ingredient.unit ? units[ingredient.unit] ?? ingredient.unit : "";
          const quantity =
            ingredient.unit === "to_taste" ? unit : amount === null ? "" : `${number.format(amount)} ${unit}`.trim();
          return (
            <li key={ingredient.id} className="flex items-baseline justify-between gap-4 py-3">
              {/* Content text is data: plain text nodes only. */}
              <span className="text-body-md text-on-surface">{ingredient.name}</span>
              {quantity ? <span className="shrink-0 text-right text-body-md tabular-nums text-on-surface-variant">{quantity}</span> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
