import "./globals.css";

import { BilingualNotFoundDocument, bilingualNotFoundMetadata } from "@/components/bilingual-not-found";

// Unmatched URLs (needs experimental.globalNotFound in next.config.ts).
export const metadata = bilingualNotFoundMetadata;

export default function GlobalNotFound() {
  return <BilingualNotFoundDocument />;
}
