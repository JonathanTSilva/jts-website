import fs from 'node:fs';
import path from 'node:path';
import type { Locale } from '../../../src/lib/content/locale';

/** One entry of dist/api/<locale>/search-index.json (see scripts/build-search-index.ts). */
export interface SearchItem {
  title: string;
  summary: string;
  tags: string[];
  category?: string;
  /** Site path without trailing slash, e.g. '/blog/some-post' or '/pt-br/notes/some-note'. */
  url: string;
  type: 'blog' | 'notes' | 'now' | 'portfolio';
}

/**
 * The built search index, the list of real (vault-synced) content that is live.
 * Specs that check real listings read it instead of hardcoding titles or slugs,
 * so they pass with any content. Fixtures are never in it.
 */
export function readSearchIndex(locale: Locale): SearchItem[] {
  const file = path.join(process.cwd(), 'dist', 'api', locale, 'search-index.json');
  return JSON.parse(fs.readFileSync(file, 'utf8')) as SearchItem[];
}
