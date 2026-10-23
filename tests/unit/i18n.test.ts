import { describe, expect, it } from "vitest";

import { defaultLocale, isLocale, locales } from "../../src/lib/i18n/config";
import { en } from "../../src/lib/i18n/dictionaries/en";
import { id } from "../../src/lib/i18n/dictionaries/id";
import { stripLocalePrefix } from "../../src/lib/i18n/paths";

type Tree = { [key: string]: string | Tree };

/** Every leaf as [dotted.path, value]. Fails on anything that is not a string or object. */
function leaves(tree: Tree, prefix = ""): Array<[string, string]> {
  return Object.entries(tree).flatMap(([key, value]): Array<[string, string]> => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") return [[path, value]];
    if (value && typeof value === "object" && !Array.isArray(value)) return leaves(value, path);
    throw new Error(`Unexpected dictionary value at ${path}: ${String(value)}`);
  });
}

const dictionaries = { id: id as Tree, en: en as Tree };

describe("dictionaries", () => {
  it("cover every supported locale", () => {
    expect(Object.keys(dictionaries).sort()).toEqual([...locales].sort());
    expect(isLocale(defaultLocale)).toBe(true);
  });

  it("have exactly the same keys in Indonesian and English", () => {
    const idKeys = leaves(dictionaries.id).map(([path]) => path).sort();
    const enKeys = leaves(dictionaries.en).map(([path]) => path).sort();
    expect(enKeys).toEqual(idKeys);
    expect(idKeys.length).toBeGreaterThan(50);
  });

  it.each(Object.entries(dictionaries))("has no empty strings in %s", (_locale, dictionary) => {
    const empty = leaves(dictionary)
      .filter(([, value]) => value.trim() === "")
      .map(([path]) => path);
    expect(empty).toEqual([]);
  });

  it("has a message for every auth error code in both languages", () => {
    const codes = [
      "invalid_input",
      "invalid_credentials",
      "email_not_confirmed",
      "weak_password",
      "email_taken",
      "link_invalid",
      "oauth_failed",
      "oauth_cancelled",
      "nickname_taken",
      "rate_limited",
      "unknown",
    ];
    expect(Object.keys(id.auth.errors).sort()).toEqual([...codes].sort());
    expect(Object.keys(en.auth.errors).sort()).toEqual([...codes].sort());
  });
});

describe("stripLocalePrefix", () => {
  it.each([
    ["/id", "/"],
    ["/en", "/"],
    ["/id/", "/"],
    ["/id/library", "/library"],
    ["/en/regions/jawa", "/regions/jawa"],
    ["/library", "/library"],
    ["/", "/"],
    ["", "/"],
    ["/idx/library", "/idx/library"],
    ["/fr/library", "/fr/library"],
  ])("maps %j to %j", (input, expected) => {
    expect(stripLocalePrefix(input)).toBe(expected);
  });
});
