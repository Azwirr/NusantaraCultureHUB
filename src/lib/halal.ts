/**
 * The single UI rule for halal labels (CLAUDE.md, PRD FR-07 and acceptance
 * check 11): a recipe may show a halal label only when its halal_status is
 * exactly "verified_by_source". Every other value, including unknown, null,
 * a different casing or anything unexpected from the database, shows nothing.
 */
export function canShowHalalBadge(status: unknown): boolean {
  return status === "verified_by_source";
}
