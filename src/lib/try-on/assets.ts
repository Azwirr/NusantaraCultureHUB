export const PARTS = ["head", "top", "bottom"] as const;
export const COSTUME_SLUGS = ["ulos", "payas-agung", "baju-bodo", "baju-bundo-kanduang", "pengantin-jawa", "kebaya-sunda", "bagajah-gamuling-baular-lulut", "baju-cele", "rok-rumbai", "baju-lambung", "baju-sadariah", "linto-baro", "baju-pokko", "baju-sangkarut", "tii-langga"] as const;

export function costumeParts(slug: string) {
  if (!(COSTUME_SLUGS as readonly string[]).includes(slug)) return null;
  return Object.fromEntries(PARTS.map((part) => [part, `/try-on/costumes/${slug}-${part}.webp`])) as Record<typeof PARTS[number], string>;
}
