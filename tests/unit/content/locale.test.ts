import { describe, expect, it } from "vitest";
import { contentLocalePath, isDefaultLocale } from "../../../src/lib/content/locale";

describe("locale helpers", () => {
  it("uses unprefixed routes for english", () => {
    expect(contentLocalePath("en", "/blog/test")).toBe("/blog/test");
  });

  it("prefixes brazilian portuguese routes", () => {
    expect(contentLocalePath("pt-br", "/blog/test")).toBe("/pt-br/blog/test");
  });

  it("marks english as the default locale", () => {
    expect(isDefaultLocale("en")).toBe(true);
  });

  it("marks pt-br as not the default locale", () => {
    expect(isDefaultLocale("pt-br")).toBe(false);
  });
});
