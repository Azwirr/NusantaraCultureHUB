"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useRef, useState, useTransition } from "react";

import { setSaved } from "@/lib/bookmark-actions";

export type SaveCopy = { save: string; saved: string; error: string; unavailable: string };

const base =
  "press inline-flex min-h-12 shrink-0 items-center gap-2 rounded border-[1.5px] px-4 text-label-md aria-disabled:cursor-wait";

/** Toggles a save for the signed-in member. Optimistic; the server has the last word. */
export function SaveButton({
  type,
  id,
  title,
  initialSaved,
  copy,
}: {
  type: "story" | "recipe" | "costume";
  id: string;
  title: string;
  initialSaved: boolean;
  copy: SaveCopy;
}) {
  const [saved, setSavedState] = useState(initialSaved);
  const [optimistic, setOptimistic] = useOptimistic(saved);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();
  // One request at a time: a double click must not save and then unsave.
  const inFlight = useRef(false);

  function toggle() {
    if (inFlight.current) return;
    inFlight.current = true;
    const next = !optimistic;
    setMessage("");
    startTransition(async () => {
      try {
        setOptimistic(next);
        const result = await setSaved(type, id, next);
        if (result.ok) setSavedState(result.saved);
        else if (result.error === "signed_out") {
          // Back to this exact page after signing in, filters included.
          router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        } else setMessage(result.error === "not_available" ? copy.unavailable : copy.error);
      } catch {
        // Offline or a server failure: say so here instead of failing the page.
        setMessage(copy.error);
      } finally {
        inFlight.current = false;
      }
    });
  }

  const label = optimistic ? copy.saved : copy.save;
  const Icon = optimistic ? BookmarkCheck : Bookmark;
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={optimistic}
        aria-busy={pending || undefined}
        // Not `disabled`: that would drop keyboard focus mid-save.
        aria-disabled={pending || undefined}
        // Starts with the visible label (WCAG 2.5.3), then names the item.
        aria-label={`${label}: ${title}`}
        className={[
          base,
          optimistic
            ? "border-primary bg-primary text-on-primary hover:bg-primary-strong"
            : "border-secondary bg-surface-container-lowest text-on-surface hover:bg-secondary-container hover:text-on-secondary-container",
        ].join(" ")}
      >
        <Icon aria-hidden="true" size={18} strokeWidth={1.75} />
        {label}
      </button>
      <span role="status" className="text-body-sm text-error empty:hidden">
        {message}
      </span>
    </span>
  );
}
