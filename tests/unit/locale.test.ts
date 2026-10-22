import { describe, expect, it } from "vitest";

import { isLocale, localeFromAcceptLanguage } from "../../src/lib/i18n/config";

describe("isLocale", () => {
  it("accepts only the two supported languages", () => {
    expect(isLocale("id")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe("localeFromAcceptLanguage", () => {
  it("defaults to Indonesian", () => {
    expect(localeFromAcceptLanguage(null)).toBe("id");
    expect(localeFromAcceptLanguage("fr-FR,de;q=0.8")).toBe("id");
  });

  it("picks the highest-ranked supported language", () => {
    expect(localeFromAcceptLanguage("en-GB,en;q=0.9,id;q=0.8")).toBe("en");
    expect(localeFromAcceptLanguage("fr;q=1, id-ID;q=0.9, en;q=0.5")).toBe("id");
    expect(localeFromAcceptLanguage("id;q=0.2, en;q=0.7")).toBe("en");
  });

  it("ignores languages with q=0", () => {
    expect(localeFromAcceptLanguage("en;q=0, id;q=0.1")).toBe("id");
  });
});
