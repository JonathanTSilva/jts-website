// Plain TS/Node only: imported from astro.config.mjs, so no `astro:*` imports.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { LOCALES, type Locale } from './locale';
import { isPublished } from './publish';
import { planLocalizedRoutes, type RouteEntry } from './routes';

type Collection = 'blog' | 'notes';

/**
 * E2E fixture pages (/test-fixtures/, /pt-br/test-fixtures/) never belong in the
 * sitemap. `sitemapMeta` only reads the real content folder, so this is what the
 * sitemap integration's `filter` uses to drop the fixture routes.
 */
export function isTestFixtureUrl(url: string): boolean {
  return url.includes('/test-fixtures/');
}

function toDate(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * Reads the route-relevant frontmatter of every `*.md` / `*.mdx` file in
 * `<contentRoot>/<collection>`. Files with incomplete frontmatter are skipped;
 * `pnpm lint:content` is what reports those.
 */
export function readRouteEntries(contentRoot: string, collection: Collection): RouteEntry[] {
  const dir = join(contentRoot, collection);
  if (!existsSync(dir)) return [];

  const entries: RouteEntry[] = [];
  for (const file of readdirSync(dir).sort()) {
    if (!/\.mdx?$/.test(file)) continue;
    const { data } = matter(readFileSync(join(dir, file), 'utf8'));
    const publishedAt = toDate(data.publishedAt);
    const language = data.language as Locale;
    if (
      typeof data.slug !== 'string' ||
      typeof data.translationKey !== 'string' ||
      !LOCALES.includes(language) ||
      !publishedAt
    ) {
      continue;
    }
    // A scheduled post has no page yet, so it has no sitemap entry either.
    if (!isPublished({ publishedAt })) continue;
    entries.push({
      slug: data.slug,
      language,
      translationKey: data.translationKey,
      publishedAt,
      updatedAt: toDate(data.updatedAt),
    });
  }
  return entries;
}

/**
 * Sitemap data derived from the same route plan the pages are built from:
 * `exclude` holds the absolute URLs of fallback pages, `lastmod` maps every
 * article URL to an ISO date (updatedAt, else publishedAt).
 */
export function sitemapMeta(
  contentRoot: string,
  siteUrl: string,
): { exclude: Set<string>; lastmod: Map<string, string> } {
  let origin = siteUrl;
  // Trim trailing slashes without a backtracking regex.
  while (origin.endsWith('/')) origin = origin.slice(0, -1);
  const exclude = new Set<string>();
  const lastmod = new Map<string, string>();

  for (const collection of ['blog', 'notes'] as const) {
    const entries = readRouteEntries(contentRoot, collection);
    for (const locale of LOCALES) {
      for (const route of planLocalizedRoutes(entries, collection, locale)) {
        const url = `${origin}${route.path}`;
        if (route.isFallback) exclude.add(url);
        lastmod.set(url, (route.entry.updatedAt ?? route.entry.publishedAt).toISOString());
      }
    }
  }
  return { exclude, lastmod };
}
