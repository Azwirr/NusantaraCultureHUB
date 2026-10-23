"use client";

import { useActionState, useId } from "react";

import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/button";
import { type RequestErrorCode, type RequestFormState, setRequestStatus } from "@/lib/request-actions";

const idle: RequestFormState = { status: "idle" };
const STATUSES = ["open", "planned", "done", "hidden"] as const;

/** Staff change one request's status. */
export function RequestStatusForm({
  id,
  current,
  copy,
}: {
  id: string;
  current: (typeof STATUSES)[number];
  copy: {
    label: string;
    saved: string;
    statuses: Record<(typeof STATUSES)[number], string>;
    errors: Record<RequestErrorCode, string>;
  };
}) {
  const [state, formAction, pending] = useActionState(setRequestStatus, idle);
  const selectId = useId();
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-label-md text-on-surface">
          {copy.label}
        </label>
        <select
          id={selectId}
          name="status"
          defaultValue={current}
          className="min-h-12 rounded border border-outline bg-surface-container-lowest px-3 text-body-md text-on-surface"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {copy.statuses[status]}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" variant="secondary" disabled={pending}>
        {copy.label}
      </Button>
      {state.status === "done" ? <FormMessage tone="success">{copy.saved}</FormMessage> : null}
      {state.status === "error" ? <FormMessage tone="error">{copy.errors[state.code]}</FormMessage> : null}
    </form>
  );
}
