import { describe, expect, it } from "vitest";
import { format, ui, useTranslations } from "../../../src/i18n/ui";

type Tree = { [key: string]: string | Tree };

function leafPaths(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? [path] : leafPaths(value, path);
  });
}

function valueAt(tree: Tree, path: string): unknown {
  let node: unknown = tree;
  for (const segment of path.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  return node;
}

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1] as string).sort();
}

describe("ui dictionary", () => {
  const enPaths = leafPaths(ui.en as Tree);
  const ptPaths = leafPaths(ui["pt-br"] as Tree);

  it("has at least one key", () => {
    expect(enPaths.length).toBeGreaterThan(0);
  });

  it("every English key has a non-empty Portuguese value", () => {
    for (const path of enPaths) {
      const value = valueAt(ui["pt-br"] as Tree, path);
      expect(typeof value, `pt-br is missing ${path}`).toBe("string");
      expect((value as string).trim().length, `pt-br is empty at ${path}`).toBeGreaterThan(0);
    }
  });

  it("every Portuguese key exists in English (no extra pt-br keys)", () => {
    for (const path of ptPaths) {
      expect(typeof valueAt(ui.en as Tree, path), `en is missing ${path}`).toBe("string");
    }
    expect(ptPaths.slice().sort()).toEqual(enPaths.slice().sort());
  });

  it("every English value is non-empty", () => {
    for (const path of enPaths) {
      expect((valueAt(ui.en as Tree, path) as string).trim().length, `en is empty at ${path}`).toBeGreaterThan(0);
    }
  });

  it("uses the same {placeholders} in both languages", () => {
    for (const path of enPaths) {
      const en = valueAt(ui.en as Tree, path) as string;
      const pt = valueAt(ui["pt-br"] as Tree, path) as string;
      expect(placeholders(pt), `placeholders differ at ${path}`).toEqual(placeholders(en));
    }
  });

  it("defines plurals as one/other pairs", () => {
    for (const locale of ["en", "pt-br"] as const) {
      const paths = leafPaths(ui[locale] as Tree);
      for (const path of paths) {
        if (path.endsWith(".one")) expect(paths, `${locale} ${path} has no .other`).toContain(path.replace(/\.one$/, ".other"));
        if (path.endsWith(".other")) expect(paths, `${locale} ${path} has no .one`).toContain(path.replace(/\.other$/, ".one"));
      }
    }
  });
});

describe("useTranslations", () => {
  it("returns the dictionary of the given locale", () => {
    expect(useTranslations("pt-br")).toBe(ui["pt-br"]);
    expect(useTranslations("en")).toBe(ui.en);
  });
});

describe("format", () => {
  it("replaces placeholders with values", () => {
    expect(format("Hello {name}", { name: "Ada" })).toBe("Hello Ada");
  });

  it("replaces every occurrence and several placeholders", () => {
    expect(format("{a}-{b}-{a}", { a: 1, b: "x" })).toBe("1-x-1");
  });

  it("stringifies numbers, including zero", () => {
    expect(format("{count} min read", { count: 0 })).toBe("0 min read");
  });

  it("leaves unknown placeholders untouched", () => {
    expect(format("Hi {missing}", {})).toBe("Hi {missing}");
  });

  it("returns the template unchanged when there are no placeholders", () => {
    expect(format("plain", { a: 1 })).toBe("plain");
  });

  it("does not interpret replacement patterns in values", () => {
    expect(format("{a}", { a: "$&$1" })).toBe("$&$1");
  });
});
