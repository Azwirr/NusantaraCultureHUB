import { Bookmark } from "lucide-react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";

import { getSavedKeys } from "@/lib/bookmarks";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { SaveButton } from "./save-button";

type Props = {
  type: "story" | "recipe" | "costume";
  id: string;
  title: string;
  /** Where to come back to after signing in. */
  nextPath: string;
  copy: Dictionary["save"];
};

/** Guests (and the static shell): a link that signs in first, then returns here. */
function GuestSave({ title, nextPath, copy }: Omit<Props, "type" | "id">) {
  return (
    <Link
      href={`/login?next=${encodeURIComponent(nextPath)}`}
      aria-label={`${copy.save}: ${title}. ${copy.signInFirst}`}
      className="press inline-flex min-h-12 shrink-0 items-center gap-2 rounded border-[1.5px] border-secondary bg-surface-container-lowest px-4 text-label-md text-on-surface hover:bg-secondary-container hover:text-on-secondary-container"
    >
      <Bookmark aria-hidden="true" size={18} strokeWidth={1.75} />
      {copy.save}
    </Link>
  );
}

async function MemberSave(props: Props) {
  let keys: Set<string> | null = null;
  try {
    keys = await getSavedKeys();
  } catch (error) {
    unstable_rethrow(error);
    console.error("SaveSlot: bookmark lookup failed", error);
  }
  if (!keys) return <GuestSave {...props} />;
  return (
    <SaveButton
      type={props.type}
      id={props.id}
      title={props.title}
      initialSaved={keys.has(`${props.type}:${props.id}`)}
      copy={props.copy}
    />
  );
}

/** "Simpan": reads the session, so it streams in behind the static card. */
export function SaveSlot(props: Props) {
  return (
    <Suspense fallback={<GuestSave {...props} />}>
      <MemberSave {...props} />
    </Suspense>
  );
}
