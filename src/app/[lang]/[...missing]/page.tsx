import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.notFound.title };
}

// Any unmatched path under a locale renders [lang]/not-found.tsx inside the
// site shell, in the visitor's language.
export default function MissingPage(): never {
  notFound();
}
