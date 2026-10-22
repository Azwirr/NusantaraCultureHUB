import "./globals.css";

import { BilingualNotFoundDocument, bilingualNotFoundMetadata } from "@/components/bilingual-not-found";

// notFound() thrown by the [lang] root layout itself, for a first segment that
// is not a locale (/foo.txt). Nested [lang]/not-found.tsx handles the rest.
export const metadata = bilingualNotFoundMetadata;

export default function RootNotFound() {
  return <BilingualNotFoundDocument />;
}
