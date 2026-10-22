import "server-only";

import { notFound } from "next/navigation";
import { lang } from "next/root-params";

import { isLocale, type Locale } from "./config";
import { en } from "./dictionaries/en";
import { id, type Dictionary } from "./dictionaries/id";

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { id, en };

/** The current locale from the [lang] root segment. Unknown values 404. */
export async function getLocale(): Promise<Locale> {
  const value: unknown = await lang();
  if (!isLocale(value)) notFound();
  return value;
}

/** Dictionary for the current request's language (Server Components only). */
export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()];
}

/** Dictionary for an explicit locale, e.g. from `params` in generateMetadata. */
export function getDictionaryFor(locale: Locale): Dictionary {
  return dictionaries[locale];
}
