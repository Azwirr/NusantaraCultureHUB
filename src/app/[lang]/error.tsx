"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/button";
import { useClientCopy } from "@/components/client-copy";

/** Error boundary for every page. Never shows the error message itself. */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const { errorPage: copy } = useClientCopy();

  useEffect(() => {
    console.error(error);
  }, [error]);

  // The digest is an opaque hash that matches the server log entry.
  const digest =
    error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : null;

  return (
    <div className="page-container py-10 md:py-16">
      <section className="flex flex-col items-center gap-4 rounded border border-dashed border-outline bg-surface-container-low px-6 py-10 text-center">
        <span
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded border border-ink bg-surface-container-lowest text-error shadow-1"
        >
          <TriangleAlert size={28} strokeWidth={1.75} />
        </span>
        <h1 className="font-serif text-headline-lg-mobile text-on-surface md:text-headline-lg">{copy.title}</h1>
        <p className="max-w-md text-body-md text-on-surface-variant">{copy.body}</p>
        {digest ? (
          <p className="text-body-sm text-on-surface-variant">
            {copy.reference}: <code className="font-mono">{digest}</code>
          </p>
        ) : null}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button onClick={() => retry()}>
            <RotateCcw aria-hidden="true" size={18} strokeWidth={1.75} />
            {copy.retry}
          </Button>
          <ButtonLink href="/" variant="secondary">
            {copy.home}
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
