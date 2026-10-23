import { Clock, Users } from "lucide-react";
import type { ReactNode } from "react";

import type { RecipeDetail } from "@/lib/content";
import { fill } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { Chip } from "../chip";
import { canShowHalalBadge } from "@/lib/halal";

import { HalalBadge } from "../halal-badge";
import { SourceList } from "../source-list";
import { DetailHeader } from "./detail-header";
import { ServingsScaler } from "./servings-scaler";

/** Recipe page body (FR-07). The halal label only ever comes from HalalBadge. */
export function RecipeView({
  recipe,
  dict,
  locale,
  actions,
}: {
  recipe: RecipeDetail;
  dict: Dictionary;
  locale: Locale;
  actions?: ReactNode;
}) {
  const copy = dict.recipeDetail;
  const dietary = dict.vocab.dietary as Record<string, string>;
  return (
    <article>
      <DetailHeader
        kicker={dict.common.types.recipe}
        region={recipe.region}
        title={recipe.title}
        subtitle={recipe.altTitle !== recipe.title ? recipe.altTitle : undefined}
        actions={actions}
      >
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-body-md text-on-surface">
          {recipe.minutes ? (
            <div className="flex items-center gap-2">
              <dt>
                <Clock aria-hidden="true" size={18} strokeWidth={1.75} className="text-secondary" />
                <span className="sr-only">{copy.time}</span>
              </dt>
              <dd>{fill(dict.common.minutes, { n: recipe.minutes })}</dd>
            </div>
          ) : null}
          {recipe.servings ? (
            <div className="flex items-center gap-2">
              <dt>
                <Users aria-hidden="true" size={18} strokeWidth={1.75} className="text-secondary" />
                <span className="sr-only">{copy.servings}</span>
              </dt>
              <dd>{fill(copy.servingsValue, { n: recipe.servings })}</dd>
            </div>
          ) : null}
        </dl>
        {recipe.dietaryTags.length || canShowHalalBadge(recipe.halalStatus) ? (
          <div className="flex flex-col gap-2">
            <h2 className="sr-only">{copy.dietary}</h2>
            <ul className="flex flex-wrap gap-2">
              {recipe.dietaryTags.map((tag) => (
                <li key={tag}>
                  <Chip tone="neutral">{dietary[tag] ?? tag}</Chip>
                </li>
              ))}
              {canShowHalalBadge(recipe.halalStatus) ? (
                <li>
                  <HalalBadge status={recipe.halalStatus} label={dict.halal.verified} />
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </DetailHeader>

      {recipe.picture ? (
        <figure className="flex flex-col gap-2">
          {/* Reviewed, licensed picture; plain img keeps remote hosts out of next/image config. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={recipe.picture.url} alt={recipe.picture.alt} className="mx-auto h-auto w-full max-w-2xl rounded border border-ink" />
          <figcaption className="text-body-sm text-on-surface-variant">
            {fill(dict.common.pictureCredit, { credit: recipe.picture.credit, licence: recipe.picture.licence })}
          </figcaption>
        </figure>
      ) : null}
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section aria-labelledby="ingredients-heading" className="rule-lead flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          <h2 id="ingredients-heading" className="font-serif text-headline-lg-mobile text-on-surface">
            {copy.ingredients}
          </h2>
          <ServingsScaler
            baseServings={recipe.servings}
            ingredients={recipe.ingredients}
            units={dict.vocab.units}
            locale={locale}
            copy={copy}
          />
        </section>

        <div className="flex min-w-0 flex-col gap-12">
          <section aria-labelledby="steps-heading" className="rule-lead flex flex-col gap-6">
            <h2 id="steps-heading" className="font-serif text-headline-lg-mobile text-on-surface">
              {copy.steps}
            </h2>
            <ol className="flex flex-col gap-6">
              {recipe.steps.map((step) => (
                <li key={step.id} className="measure grid grid-cols-[3rem_minmax(0,1fr)] gap-4">
                  <span aria-hidden="true" className="font-serif text-numeral leading-none text-secondary">
                    {step.number}
                  </span>
                  <div className="flex flex-col gap-1 pt-1">
                    <p className="text-body-lg text-on-surface">{step.text}</p>
                    {step.timerSeconds ? (
                      <p className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
                        <Clock aria-hidden="true" size={16} strokeWidth={1.75} />
                        {fill(copy.stepTimer, { n: Math.round(step.timerSeconds / 60) })}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <p className="measure text-body-sm text-on-surface-variant">{copy.halalNote}</p>
          <SourceList sources={recipe.sources} copy={dict.common} />
        </div>
      </div>
    </article>
  );
}
