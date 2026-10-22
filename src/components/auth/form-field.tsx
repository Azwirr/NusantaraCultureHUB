import type { ComponentProps } from "react";

/**
 * Labelled 48px input with an optional hint. `invalid` sets aria-invalid and
 * links the form's error message through aria-describedby.
 */
export function FormField({
  id,
  label,
  hint,
  invalid,
  errorId,
  ...input
}: Omit<ComponentProps<"input">, "id" | "aria-invalid" | "aria-describedby"> & {
  id: string;
  label: string;
  hint?: string;
  invalid: boolean;
  errorId: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, invalid ? errorId : undefined].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label-md text-on-surface">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={[
          "min-h-12 w-full rounded border bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface",
          invalid ? "border-2 border-error" : "border-outline",
        ].join(" ")}
        {...input}
      />
      {hint ? (
        <p id={hintId} className="text-body-sm text-on-surface-variant">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
