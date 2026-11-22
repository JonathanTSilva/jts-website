/**
 * Scheduled publishing: a post goes live once its publishedAt has passed.
 *
 * Plain TypeScript, no astro:* imports, so the sitemap, the search index and
 * the wikilink plugin can use it outside Astro's content layer.
 */
export function isPublished(data: { publishedAt: Date }, now: Date = new Date()): boolean {
  // Date.getTime() is a UTC instant, so this compares in UTC.
  return data.publishedAt.getTime() <= now.getTime();
}
