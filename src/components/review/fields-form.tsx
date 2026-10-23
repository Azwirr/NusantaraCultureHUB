"use client";

import { type FormEvent, useActionState, useId, useTransition } from "react";

import { Button } from "@/components/button";
import { type ReviewFormState, saveReviewFields } from "@/lib/review-actions";
import { INGREDIENT_UNITS, REVIEW_FIELDS, type SingleField } from "@/lib/review-fields";
import type { ReviewEntityType } from "@/lib/review-types";

import { ReviewMessage, type ReviewMessageCopy } from "./review-message";

const idle: ReviewFormState = { status: "idle" };

export type FieldsCopy = {
  idColumn: string;
  enColumn: string;
  idCode: string;
  enCode: string;
  fields: Record<string, string>;
  hints: { provinceCodes: string; url: string; halalStatus: string };
  halalOptions: Record<string, string>;
  dietary: Record<string, string>;
  units: Record<string, string>;
  save: string;
  saving: string;
  saved: string;
  unchanged: string;
  editWarning: string;
  ingredientsHeading: string;
  stepsHeading: string;
  amount: string;
  unit: string;
  noUnit: string;
  step: string;
};

export type EditableIngredient = {
  id: string;
  position: number;
  name_id: string;
  name_en: string | null;
  amount: number | null;
  unit: string | null;
};
export type EditableStep = { id: string; stepNo: number; text_id: string | null; text_en: string | null };

const inputClass =
  "min-h-12 w-full rounded border border-outline bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface disabled:opacity-70";

function asText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

/**
 * Edits one item's visible fields, Indonesian and English side by side.
 * Submitted without a form reset, so a refused save keeps what was typed.
 */
export function FieldsForm({
  type,
  id,
  values,
  ingredients,
  steps,
  locked,
  copy,
  messages,
}: {
  type: ReviewEntityType;
  id: string;
  values: Record<string, unknown>;
  ingredients: EditableIngredient[];
  steps: EditableStep[];
  locked: boolean;
  copy: FieldsCopy;
  messages: ReviewMessageCopy;
}) {
  const [state, formAction, pending] = useActionState(saveReviewFields, idle);
  const [, startTransition] = useTransition();
  const baseId = useId();
  const { pairs, singles } = REVIEW_FIELDS[type];
  const invalid = new Set(state.status === "error" ? (state.fields ?? []) : []);
  const success = state.status === "done" ? (state.result === "unchanged" ? copy.unchanged : copy.saved) : undefined;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  const fieldId = (column: string) => `${baseId}-${column.replace(/\./g, "-")}`;
  const invalidProps = (column: string) =>
    invalid.has(column) ? { "aria-invalid": true as const, className: `${inputClass} border-2 border-error` } : { className: inputClass };

  return (
    <form action={formAction} onSubmit={onSubmit} className="flex flex-col gap-6">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="id" value={id} />
      <fieldset disabled={locked || pending} className="flex min-w-0 flex-col gap-6">
        {pairs.map((pair) => (
          <div key={pair.key} className="grid gap-4 md:grid-cols-2">
            {([
              [pair.id, copy.idCode, "id"],
              [pair.en, copy.enCode, "en"],
            ] as const).map(([column, code, lang]) => (
              <div key={column} className="flex min-w-0 flex-col gap-1.5">
                <label htmlFor={fieldId(column)} className="text-label-md text-on-surface">
                  {copy.fields[pair.key]} <span className="text-on-surface-variant">({code})</span>
                </label>
                {pair.multiline ? (
                  <textarea
                    id={fieldId(column)}
                    name={column}
                    lang={lang}
                    rows={pair.max > 2000 ? 8 : 4}
                    maxLength={pair.max}
                    defaultValue={asText(values[column])}
                    {...invalidProps(column)}
                  />
                ) : (
                  <input
                    id={fieldId(column)}
                    name={column}
                    lang={lang}
                    maxLength={pair.max}
                    defaultValue={asText(values[column])}
                    {...invalidProps(column)}
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        {singles.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {singles.map((field) => (
              <SingleInput
                key={field.column}
                field={field}
                inputId={fieldId(field.column)}
                value={values[field.column]}
                copy={copy}
                invalid={invalid.has(field.column)}
              />
            ))}
          </div>
        ) : null}

        {ingredients.length ? (
          <fieldset className="flex min-w-0 flex-col gap-4">
            <legend className="mb-2 font-serif text-headline-md text-on-surface">{copy.ingredientsHeading}</legend>
            <ol className="flex flex-col gap-4">
              {ingredients.map((ingredient) => {
                const prefix = `ingredient.${ingredient.id}.`;
                return (
                  <li key={ingredient.id} className="grid gap-3 rounded border border-ink p-3 md:grid-cols-[2rem_1fr_1fr_6rem_10rem]">
                    <span aria-hidden="true" className="text-label-md text-on-surface-variant md:pt-9">
                      {ingredient.position}.
                    </span>
                    {([
                      ["name_id", copy.idCode, ingredient.name_id, "id"],
                      ["name_en", copy.enCode, ingredient.name_en, "en"],
                    ] as const).map(([column, code, value, lang]) => (
                      <div key={column} className="flex min-w-0 flex-col gap-1.5">
                        <label htmlFor={fieldId(prefix + column)} className="text-label-md text-on-surface">
                          {copy.fields.name} {ingredient.position} ({code})
                        </label>
                        <input
                          id={fieldId(prefix + column)}
                          name={prefix + column}
                          lang={lang}
                          maxLength={200}
                          defaultValue={value ?? ""}
                          {...invalidProps(prefix + column)}
                        />
                      </div>
                    ))}
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <label htmlFor={fieldId(`${prefix}amount`)} className="text-label-md text-on-surface">
                        {copy.amount} {ingredient.position}
                      </label>
                      <input
                        id={fieldId(`${prefix}amount`)}
                        name={`${prefix}amount`}
                        inputMode="decimal"
                        defaultValue={ingredient.amount ?? ""}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <label htmlFor={fieldId(`${prefix}unit`)} className="text-label-md text-on-surface">
                        {copy.unit} {ingredient.position}
                      </label>
                      <select
                        id={fieldId(`${prefix}unit`)}
                        name={`${prefix}unit`}
                        defaultValue={ingredient.unit ?? ""}
                        className={`${inputClass} min-h-12`}
                      >
                        <option value="">{copy.noUnit}</option>
                        {INGREDIENT_UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {copy.units[unit]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </li>
                );
              })}
            </ol>
          </fieldset>
        ) : null}

        {steps.length ? (
          <fieldset className="flex min-w-0 flex-col gap-4">
            <legend className="mb-2 font-serif text-headline-md text-on-surface">{copy.stepsHeading}</legend>
            <ol className="flex flex-col gap-4">
              {steps.map((step) => {
                const prefix = `step.${step.id}.`;
                return (
                  <li key={step.id} className="grid gap-3 rounded border border-ink p-3 md:grid-cols-2">
                    {([
                      ["text_id", copy.idCode, step.text_id, "id"],
                      ["text_en", copy.enCode, step.text_en, "en"],
                    ] as const).map(([column, code, value, lang]) => (
                      <div key={column} className="flex min-w-0 flex-col gap-1.5">
                        <label htmlFor={fieldId(prefix + column)} className="text-label-md text-on-surface">
                          {copy.step} {step.stepNo} ({code})
                        </label>
                        <textarea
                          id={fieldId(prefix + column)}
                          name={prefix + column}
                          lang={lang}
                          rows={3}
                          maxLength={4000}
                          defaultValue={value ?? ""}
                          {...invalidProps(prefix + column)}
                        />
                      </div>
                    ))}
                  </li>
                );
              })}
            </ol>
          </fieldset>
        ) : null}
      </fieldset>

      {!locked ? (
        <div className="flex flex-col gap-3">
          <ReviewMessage state={state} copy={messages} success={success} />
          <p className="text-body-sm text-on-surface-variant">{copy.editWarning}</p>
          <Button type="submit" disabled={pending} className="self-start">
            {pending ? copy.saving : copy.save}
          </Button>
        </div>
      ) : null}
    </form>
  );
}

function SingleInput({
  field,
  inputId,
  value,
  copy,
  invalid,
}: {
  field: SingleField;
  inputId: string;
  value: unknown;
  copy: FieldsCopy;
  invalid: boolean;
}) {
  const label = copy.fields[field.key];
  const hint =
    field.kind === "codes" ? copy.hints.provinceCodes
    : field.kind === "url" ? copy.hints.url
    : field.column === "halal_status" ? copy.hints.halalStatus
    : null;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const className = invalid ? `${inputClass} border-2 border-error` : inputClass;

  if (field.kind === "tags") {
    const selected = new Set(Array.isArray(value) ? value.map(String) : []);
    return (
      <fieldset className="flex min-w-0 flex-col gap-2 md:col-span-2">
        <legend className="text-label-md text-on-surface">{label}</legend>
        <div className="flex flex-wrap gap-2">
          {field.options.map((option) => (
            <label
              key={option}
              className="inline-flex min-h-12 items-center gap-2 rounded border border-outline bg-surface-container-lowest px-3 text-body-md text-on-surface"
            >
              <input type="checkbox" name={field.column} value={option} defaultChecked={selected.has(option)} className="size-5" />
              {copy.dietary[option]}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={inputId} className="text-label-md text-on-surface">
        {label}
      </label>
      {field.kind === "select" ? (
        <select
          id={inputId}
          name={field.column}
          defaultValue={asText(value)}
          aria-describedby={hintId}
          aria-invalid={invalid || undefined}
          className={`${className} min-h-12`}
        >
          {field.options.map((option) => (
            <option key={option} value={option}>
              {copy.halalOptions[option] ?? option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          name={field.column}
          inputMode={field.kind === "number" ? "numeric" : undefined}
          type={field.kind === "url" ? "text" : undefined}
          spellCheck={false}
          defaultValue={asText(value)}
          aria-describedby={hintId}
          aria-invalid={invalid || undefined}
          className={className}
        />
      )}
      {hint ? (
        <p id={hintId} className="text-body-sm text-on-surface-variant">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
