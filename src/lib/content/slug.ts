/**
 * The slug rule. Plain TypeScript, no astro:* imports: it runs under tsx from
 * scripts/validate-content.ts. jts-skills' check_pair.py implements the same rule.
 *
 * slug = the filename without .md/.mdx, without .en/.pt-br and, for a blog
 * post, without the leading YYYY-MM-. Notes keep a date if their name has one.
 */

export type SlugCollection = 'blog' | 'notes';

export function expectedSlug(filename: string, collection: SlugCollection): string {
  let base = filename.replace(/^.*[\\/]/, '').replace(/\.(md|mdx)$/, '');
  base = base.replace(/\.(en|pt-br)$/, '');
  if (collection === 'blog') base = base.replace(/^\d{4}-\d{2}-/, '');
  return base;
}

/**
 * Content collection entry id: the filename stem. Astro's glob loader would
 * otherwise use the frontmatter `slug` as id, and both languages of a post now
 * share one slug, so one language would overwrite the other.
 */
export function entryIdFromPath(entry: string): string {
  return entry.replace(/\.(md|mdx)$/, '');
}
