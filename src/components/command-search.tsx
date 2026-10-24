"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, type MouseEvent, useCallback, useEffect, useId, useRef, useState } from "react";

import type { Locale } from "@/lib/i18n/config";

type Hit = { type: "story" | "recipe" | "costume" | "ceremony" | "region"; id: string; title: string; regionName: string | null; href: string };

export type CommandSearchCopy = {
  label: string;
  placeholder: string;
  shortcut: string;
  open: string;
  dialogLabel: string;
  close: string;
  hint: string;
  loading: string;
  seeAll: string;
  noResults: string;
  error: string;
  groups: Record<Hit["type"], string>;
};

/**
 * Header search. Without JavaScript it is a link to /search. With it, the
 * link, Ctrl+K (Cmd+K) or "/" opens a palette: a combobox whose options are
 * live results. Enter opens the highlighted result, or the full results
 * page. Search terms are only ever rendered as text.
 */
export function CommandSearch({ copy, locale }: { copy: CommandSearchCopy; locale: Locale }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [active, setActive] = useState(-1);
  const baseId = useId();
  const listId = `${baseId}-list`;

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = !!target?.closest("input, textarea, select, [contenteditable=true]");
      if ((event.key === "k" || event.key === "K") && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        open();
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        open();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const q = query.replace(/\s+/g, " ").trim();
    // Short queries show the hint; results are only fetched from 2 letters.
    if (q.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setStatus("loading");
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&lang=${locale}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`search responded ${response.status}`);
        const body = (await response.json()) as { hits?: Hit[] };
        setHits(body.hits ?? []);
        setActive(-1);
        setStatus("done");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        // A failed search is not "no results": drop older hits and say so.
        setHits([]);
        setActive(-1);
        setStatus("error");
      }
    }, 200);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, locale]);

  function go(href: string) {
    dialogRef.current?.close();
    router.push(href);
  }

  const trimmed = query.trim();
  // Results of an older, longer query are not shown once the query is short.
  const shown = trimmed.length >= 2 ? hits : [];

  function onInputKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && shown.length) {
      event.preventDefault();
      setActive((index) => (index + 1) % shown.length);
    } else if (event.key === "ArrowUp" && shown.length) {
      event.preventDefault();
      setActive((index) => (index <= 0 ? shown.length - 1 : index - 1));
    } else if (event.key === "Escape") {
      // Close on Escape even before the dialog sees it.
      event.preventDefault();
      dialogRef.current?.close();
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (active >= 0 && shown[active]) go(shown[active].href);
      else if (trimmed) go(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  function onTrigger(event: MouseEvent<HTMLAnchorElement>) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    open();
  }

  const message =
    trimmed.length < 2 ? copy.hint
    : status === "loading" ? copy.loading
    : status === "error" ? copy.error
    : status === "done" && !shown.length ? copy.noResults.replace("{q}", trimmed)
    : "";

  return (
    <>
      <Link
        href="/search"
        onClick={onTrigger}
        aria-keyshortcuts="Control+K Meta+K"
        className="press inline-flex size-12 shrink-0 items-center justify-center rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface lg:w-64 lg:justify-start lg:gap-2 lg:border lg:border-outline lg:bg-surface-container-lowest lg:px-3"
      >
        <Search aria-hidden="true" size={20} strokeWidth={1.75} className="shrink-0" />
        {/* The name is "Open search", plus the visible placeholder text from lg up (WCAG 2.5.3). */}
        <span className="sr-only">{copy.open}</span>
        <span className="hidden flex-1 truncate text-left text-body-md lg:inline">{copy.placeholder}</span>
        <kbd aria-hidden="true" className="hidden rounded-sm border border-ink px-1.5 text-label-sm lg:inline">
          {copy.shortcut}
        </kbd>
      </Link>

      <dialog
        ref={dialogRef}
        aria-label={copy.dialogLabel}
        className="m-auto mt-[10vh] w-[min(40rem,calc(100vw-2rem))] rounded border border-ink bg-surface-container-lowest p-0 text-on-surface shadow-2 backdrop:bg-scrim"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div role="search" className="flex items-center gap-2 border-b border-ink p-3">
          <Search aria-hidden="true" size={20} strokeWidth={1.75} className="ml-1 shrink-0 text-on-surface-variant" />
          <label htmlFor={`${baseId}-input`} className="sr-only">
            {copy.label}
          </label>
          <input
            ref={inputRef}
            id={`${baseId}-input`}
            type="text"
            role="combobox"
            aria-expanded={shown.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            maxLength={100}
            value={query}
            placeholder={copy.placeholder}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKey}
            className="min-h-12 min-w-0 flex-1 bg-transparent px-1 text-body-lg text-on-surface outline-none placeholder:text-on-surface-variant"
          />
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label={copy.close}
            className="press inline-flex size-12 shrink-0 items-center justify-center rounded text-on-surface-variant hover:bg-surface-container"
          >
            <X aria-hidden="true" size={20} strokeWidth={1.75} />
          </button>
        </div>
        <ul id={listId} role="listbox" aria-label={copy.dialogLabel} className="max-h-[50vh] overflow-y-auto p-2 empty:hidden">
          {shown.map((hit, index) => (
            <li
              key={`${hit.type}-${hit.id}`}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseEnter={() => setActive(index)}
              onClick={() => go(hit.href)}
              className={[
                "flex min-h-12 cursor-pointer flex-col justify-center rounded px-3 py-2",
                index === active ? "bg-primary-container text-on-primary-container" : "hover:bg-surface-container",
              ].join(" ")}
            >
              <span className="text-label-sm uppercase text-secondary">
                {copy.groups[hit.type]}
                {hit.regionName ? ` · ${hit.regionName}` : ""}
              </span>
              <span className="font-serif text-body-lg">{hit.title}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink px-4 py-2">
          <p role="status" className="text-body-sm text-on-surface-variant">
            {message}
          </p>
          {trimmed.length >= 2 ? (
            <Link
              href={`/search?q=${encodeURIComponent(trimmed)}`}
              onClick={() => dialogRef.current?.close()}
              className="inline-flex min-h-12 items-center text-label-md text-primary hover:underline"
            >
              {copy.seeAll}
            </Link>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
