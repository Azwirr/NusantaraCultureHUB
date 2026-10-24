import { describe, expect, it } from "vitest";

import { contentHref, sizedImage } from "../../src/lib/format";

describe("sizedImage", () => {
  it("asks Wikimedia Commons for a scaled copy", () => {
    expect(sizedImage("https://commons.wikimedia.org/wiki/Special:FilePath/Ulos.jpg", 640)).toBe(
      "https://commons.wikimedia.org/wiki/Special:FilePath/Ulos.jpg?width=640",
    );
  });

  it("leaves our own files and URLs that already have a query alone", () => {
    expect(sizedImage("/placeholders/costume-ulos.svg", 640)).toBe("/placeholders/costume-ulos.svg");
    expect(sizedImage("https://commons.wikimedia.org/wiki/Special:FilePath/A.jpg?width=300", 640)).toBe(
      "https://commons.wikimedia.org/wiki/Special:FilePath/A.jpg?width=300",
    );
    expect(sizedImage("https://example.org/a.jpg", 640)).toBe("https://example.org/a.jpg");
  });
});

describe("contentHref", () => {
  it("builds the public path for each content type", () => {
    expect(contentHref("story", "si-pitung")).toBe("/stories/si-pitung");
    expect(contentHref("recipe", "rendang")).toBe("/recipes/rendang");
    expect(contentHref("costume", "baju-bodo")).toBe("/costumes/baju-bodo");
    expect(contentHref("ceremony", "pasola")).toBe("/ceremonies/pasola");
  });

  it("encodes the slug so it stays one path segment", () => {
    expect(contentHref("ceremony", "ma'nene")).toBe("/ceremonies/ma'nene");
    expect(contentHref("ceremony", "a/b")).toBe("/ceremonies/a%2Fb");
  });
});
