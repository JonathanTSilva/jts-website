/**
 * Checks for mandatory sections in Markdown body.
 * Each entry in headings may contain pipe-separated alternatives (e.g. "Conclusion|Conclusão").
 * A section is satisfied when any alternative appears as a heading at any level (H1–H6).
 * Returns an array of missing headings (first alternative of each unsatisfied entry).
 */
export function requireSections(body: string, headings: string[]): string[] {
  return headings.filter((heading) => {
    const alternatives = heading.split("|");
    return !alternatives.some((alt) =>
      new RegExp(`^#{1,6} ${alt}\\s*$`, "m").test(body)
    );
  });
}
