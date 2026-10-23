import { FormMessage } from "@/components/auth/form-message";
import type { ReviewErrorCode } from "@/lib/review-errors";
import { REVIEW_FIELDS } from "@/lib/review-fields";

export type ReviewMessageCopy = {
  errors: Record<ReviewErrorCode, string>;
  fields: Record<string, string>;
  idCode: string;
  enCode: string;
};

/** "summary_en" -> "Ringkasan (EN)", using the editor's own field labels. */
export function columnLabel(column: string, copy: ReviewMessageCopy): string {
  for (const { pairs, singles } of Object.values(REVIEW_FIELDS)) {
    for (const pair of pairs) {
      if (pair.id === column) return `${copy.fields[pair.key] ?? pair.key} (${copy.idCode})`;
      if (pair.en === column) return `${copy.fields[pair.key] ?? pair.key} (${copy.enCode})`;
    }
    for (const single of singles) if (single.column === column) return copy.fields[single.key] ?? column;
  }
  return column;
}

/** The result of a review form: an error (with the fields to fix) or a success note. */
export function ReviewMessage({
  id,
  state,
  copy,
  success,
}: {
  id?: string;
  state: { status: "idle" } | { status: "done" } | { status: "error"; code: ReviewErrorCode; fields?: string[] };
  copy: ReviewMessageCopy;
  success?: string;
}) {
  if (state.status === "done") return success ? <FormMessage tone="success">{success}</FormMessage> : null;
  if (state.status !== "error") return null;
  const fields = state.code === "missing_fields" ? (state.fields ?? []) : [];
  const message = fields.length
    ? `${copy.errors[state.code]} ${fields.map((field) => columnLabel(field, copy)).join(", ")}.`
    : copy.errors[state.code];
  return (
    <FormMessage id={id} tone="error">
      {message}
    </FormMessage>
  );
}
