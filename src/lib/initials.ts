/**
 * Up to two uppercase initials from a nickname, or null when it has none.
 * Usernames are [a-z0-9_] by the sign-up schema; anything else is dropped.
 */
export function getInitials(username: string | null | undefined): string | null {
  if (!username) return null;
  const letters = username.replace(/[^a-z0-9]/gi, "");
  return letters ? letters.slice(0, 2).toUpperCase() : null;
}
