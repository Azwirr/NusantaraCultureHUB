"use client";

import { type ReactNode, useActionState, useId } from "react";

import { Button, type ButtonVariant } from "@/components/button";
import type { ReviewFormState } from "@/lib/review-actions";

import { ReviewMessage, type ReviewMessageCopy } from "./review-message";

const idle: ReviewFormState = { status: "idle" };

/**
 * A small review form: hidden ids, optional inputs, one submit button and the
 * result message. Used for citing, removing and suggesting sources, and for
 * granting and revoking roles.
 */
export function ActionForm({
  action,
  hidden,
  submitLabel,
  pendingLabel,
  success,
  copy,
  variant = "secondary",
  className,
  children,
}: {
  action: (state: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
  hidden: Record<string, string>;
  submitLabel: string;
  pendingLabel: string;
  success?: string;
  copy: ReviewMessageCopy;
  variant?: ButtonVariant;
  className?: string;
  children?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, idle);
  const messageId = useId();
  return (
    <form action={formAction} className={["flex flex-col gap-3", className].filter(Boolean).join(" ")}>
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {children}
      <ReviewMessage id={messageId} state={state} copy={copy} success={success} />
      <Button
        type="submit"
        variant={variant}
        disabled={pending}
        aria-describedby={state.status === "error" ? messageId : undefined}
        className="self-start"
      >
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
