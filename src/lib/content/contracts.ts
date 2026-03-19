/**
 * Checks for mandatory sections in Markdown body.
 * Returns an array of missing headings.
 */
export function requireSections(body: string, headings: string[]): string[] {
  return headings.filter((heading) => !body.includes(`## ${heading}`));
}
