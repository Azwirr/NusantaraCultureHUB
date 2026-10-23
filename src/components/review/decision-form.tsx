"use client";

import { useActionState, useId } from "react";

import { Button } from "@/components/button";
import { runReviewAction, type ReviewFormState } from "@/lib/review-actions";
import type { ReviewAction, ReviewEntityType } from "@/lib/review-types";

import { ReviewMessage, type ReviewMessageCopy } from "./review-message";

const idle: ReviewFormState = { status: "idle" };

export type DecisionCopy = {
  reason: string;
  reasonHint: string;
  pending: string;
  actions: Record<ReviewAction, string>;
  done: Record<"approved" | "rejected" | "unpublished", string>;
};

/**
 * Approve, reject or unpublish one item. The reason field is shared: it is
 * required for reject and unpublish (the database refuses without it).
 */
export function DecisionForm({
  type,
  id,
  actions,
  copy,
  messages,
}: {
  type: ReviewEntityType;
  id: string;
  actions: ReviewAction[];
  copy: DecisionCopy;
  messages: ReviewMessageCopy;
}) {
  const [state, formAction, pending] = useActionState(runReviewAction, idle);
  const baseId = useId();
  const reasonId = `${baseId}-reason`;
  const hintId = `${baseId}-hint`;
  const messageId = `${baseId}-message`;
  const result = state.status === "done" ? state.result : undefined;
  const success = result === "approved" || result === "rejected" || result === "unpublished" ? copy.done[result] : undefined;
  const reasonInvalid = state.status === "error" && state.code === "reason_required";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="id" value={id} />
      <ReviewMessage id={messageId} state={state} copy={messages} success={success} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor={reasonId} className="text-label-md text-on-surface">
          {copy.reason}
        </label>
        <textarea
          id={reasonId}
          name="reason"
          rows={3}
          maxLength={1000}
          aria-invalid={reasonInvalid || undefined}
          aria-describedby={[hintId, reasonInvalid ? messageId : null].filter(Boolean).join(" ")}
          className={[
            "w-full rounded border bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface",
            reasonInvalid ? "border-2 border-error" : "border-outline",
          ].join(" ")}
        />
        <p id={hintId} className="text-body-sm text-on-surface-variant">
          {copy.reasonHint}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <Button
            key={action}
            type="submit"
            name="action"
            value={action}
            disabled={pending}
            variant={action === "approve" ? "primary" : "secondary"}
          >
            {pending ? copy.pending : copy.actions[action]}
          </Button>
        ))}
      </div>
    </form>
  );
}
