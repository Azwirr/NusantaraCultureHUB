"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { safeNextPath } from "@/lib/safe-redirect";

function NextPathInput() {
  const searchParams = useSearchParams();
  return <input type="hidden" name="next" value={safeNextPath(searchParams.get("next"))} />;
}

/**
 * Carries ?next= through a sign-in form. The server action re-checks it with
 * safeNextPath. Suspense because search params are only known at request time.
 */
export function NextPathField() {
  return (
    <Suspense fallback={<input type="hidden" name="next" value="/me" />}>
      <NextPathInput />
    </Suspense>
  );
}
