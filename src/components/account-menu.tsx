"use client";

import { Bookmark, ClipboardList, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { signOut } from "@/lib/auth-actions";

export type AccountMenuCopy = {
  myAccount: string;
  menu: string;
  collection: string;
  settings: string;
  review: string;
  signOut: string;
};

const itemClass =
  "flex min-h-12 w-full items-center gap-3 rounded px-3 text-left text-label-md text-on-surface hover:bg-surface-container focus-visible:bg-surface-container";

/**
 * The avatar opens a disclosure menu: My collection, Settings, the review
 * queue (staff only) and Sign out. Escape and a click outside close it, and
 * Escape returns focus to the avatar. Plain links and a form, so it is a
 * disclosure, not an ARIA menu.
 */
export function AccountMenu({
  initials,
  username,
  staff,
  copy,
}: {
  initials: string | null;
  username: string | null;
  staff: boolean;
  copy: AccountMenuCopy;
}) {
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  // Navigating away closes the menu (derived, not set in an effect).
  const shown = open && openedAt === pathname;

  useEffect(() => {
    if (!shown) return;
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [shown]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={shown}
        aria-controls={panelId}
        onClick={() => {
          setOpen(!shown);
          setOpenedAt(pathname);
        }}
        className="press inline-flex size-12 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
      >
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-full border border-ink bg-primary-container text-label-md text-on-primary-container"
        >
          {initials ?? <UserRound size={20} strokeWidth={1.75} />}
        </span>
        <span className="sr-only">{copy.menu}</span>
      </button>

      <div
        id={panelId}
        hidden={!shown}
        className="absolute right-0 top-full z-50 mt-2 w-64 rounded border border-ink bg-surface-container-lowest p-2 shadow-2"
      >
        <p className="border-b border-outline-variant px-3 pb-2 pt-1 text-body-sm text-on-surface-variant">
          {copy.myAccount}
          {/* User-entered nickname: a plain text node only. */}
          {username ? <span className="block break-words text-body-lg font-semibold text-on-surface">{username}</span> : null}
        </p>
        <ul className="flex flex-col pt-1">
          <li>
            <Link href="/me" className={itemClass}>
              <Bookmark aria-hidden="true" size={18} strokeWidth={1.75} />
              {copy.collection}
            </Link>
          </li>
          <li>
            <Link href="/me/settings" className={itemClass}>
              <Settings aria-hidden="true" size={18} strokeWidth={1.75} />
              {copy.settings}
            </Link>
          </li>
          {staff ? (
            <li>
              <Link href="/review" className={itemClass}>
                <ClipboardList aria-hidden="true" size={18} strokeWidth={1.75} />
                {copy.review}
              </Link>
            </li>
          ) : null}
          <li className="mt-1 border-t border-outline-variant pt-1">
            <form action={signOut}>
              <button type="submit" className={itemClass}>
                <LogOut aria-hidden="true" size={18} strokeWidth={1.75} />
                {copy.signOut}
              </button>
            </form>
          </li>
        </ul>
      </div>
    </div>
  );
}
