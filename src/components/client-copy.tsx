"use client";

import { createContext, type ReactNode, use } from "react";

import type { Dictionary } from "@/lib/i18n/dictionaries/id";

/**
 * Strings for client components that have no server parent to pass props,
 * such as error.tsx. The root layout fills it from the current dictionary,
 * so only these strings (not whole dictionaries) reach the browser.
 */
export type ClientCopy = { errorPage: Dictionary["errorPage"] };

const ClientCopyContext = createContext<ClientCopy | null>(null);

export function ClientCopyProvider({ copy, children }: { copy: ClientCopy; children: ReactNode }) {
  return <ClientCopyContext value={copy}>{children}</ClientCopyContext>;
}

export function useClientCopy(): ClientCopy {
  const copy = use(ClientCopyContext);
  if (!copy) throw new Error("useClientCopy must be used inside ClientCopyProvider");
  return copy;
}
