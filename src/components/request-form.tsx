"use client";

import { useActionState, useEffect, useId, useRef } from "react";

import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/button";
import { createStoryRequest, type RequestErrorCode, type RequestFormState } from "@/lib/request-actions";

const idle: RequestFormState = { status: "idle" };

export type RequestFormCopy = {
  formHeading: string;
  titleLabel: string;
  titleHint: string;
  noteLabel: string;
  noteHint: string;
  submit: string;
  pending: string;
  done: string;
  errors: Record<RequestErrorCode, string>;
};

const field =
  "w-full rounded border bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface";

/** A member asks for new content. Clears itself after a successful send. */
export function RequestForm({ copy }: { copy: RequestFormCopy }) {
  const [state, formAction, pending] = useActionState(createStoryRequest, idle);
  const formRef = useRef<HTMLFormElement>(null);
  const baseId = useId();
  const messageId = `${baseId}-message`;
  const invalid = state.status === "error" && state.code === "invalid_input";

  useEffect(() => {
    if (state.status === "done") formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <h2 className="font-serif text-headline-md text-on-surface">{copy.formHeading}</h2>
      {state.status === "error" ? (
        <FormMessage id={messageId} tone="error">
          {copy.errors[state.code]}
        </FormMessage>
      ) : null}
      {state.status === "done" ? <FormMessage tone="success">{copy.done}</FormMessage> : null}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${baseId}-title`} className="text-label-md text-on-surface">
          {copy.titleLabel}
        </label>
        <input
          id={`${baseId}-title`}
          name="title"
          required
          minLength={3}
          maxLength={120}
          autoComplete="off"
          aria-invalid={invalid || undefined}
          aria-describedby={[`${baseId}-title-hint`, invalid ? messageId : null].filter(Boolean).join(" ")}
          className={`${field} min-h-12 ${invalid ? "border-2 border-error" : "border-outline"}`}
        />
        <p id={`${baseId}-title-hint`} className="text-body-sm text-on-surface-variant">
          {copy.titleHint}
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${baseId}-note`} className="text-label-md text-on-surface">
          {copy.noteLabel}
        </label>
        <textarea
          id={`${baseId}-note`}
          name="note"
          rows={3}
          maxLength={500}
          aria-describedby={`${baseId}-note-hint`}
          className={`${field} border-outline`}
        />
        <p id={`${baseId}-note-hint`} className="text-body-sm text-on-surface-variant">
          {copy.noteHint}
        </p>
      </div>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? copy.pending : copy.submit}
      </Button>
    </form>
  );
}
