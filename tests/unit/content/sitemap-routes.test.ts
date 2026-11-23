import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isTestFixtureUrl, readRouteEntries, sitemapMeta } from '../../../src/lib/content/sitemapRoutes';

const SITE = 'https://www.jontobias.com';
let root: string;

function post(
  collection: 'blog' | 'notes',
  file: string,
  fm: { slug: string; language: string; key: string; published: string; updated?: string },
) {
  const lines = [
    '---',
    `slug: "${fm.slug}"`,
    `title: "T"`,
    `language: "${fm.language}"`,
    `translationKey: "${fm.key}"`,
    `publishedAt: ${fm.published}`,
    ...(fm.updated ? [`updatedAt: ${fm.updated}`] : []),
    '---',
    '',
    'Body',
  ];
  writeFileSync(join(root, collection, file), lines.join('\n'));
}

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'sitemap-routes-'));
  mkdirSync(join(root, 'blog'));
  mkdirSync(join(root, 'notes'));

  // EN-only blog post.
  post('blog', 'b.en.md', { slug: 'b.en', language: 'en', key: 'b', published: '2026-03-01' });
  // Full blog pair, EN has updatedAt.
  post('blog', 'a.en.md', {
    slug: 'a.en', language: 'en', key: 'a', published: '2026-03-02', updated: '2026-11-20',
  });
  post('blog', 'a.pt-br.mdx', { slug: 'a.pt-br', language: 'pt-br', key: 'a', published: '2026-03-02' });
  // PT-only note.
  post('notes', 'n.pt-br.md', { slug: 'n.pt-br', language: 'pt-br', key: 'n', published: '2026-04-05' });
  // Non-markdown file is ignored.
  writeFileSync(join(root, 'blog', 'README.txt'), 'ignore me');
});

afterAll(() => rmSync(root, { recursive: true, force: true }));

describe('isTestFixtureUrl', () => {
  it('matches E2E fixture pages in both locales', () => {
    expect(isTestFixtureUrl(`${SITE}/test-fixtures/blog/fixture-markdown/`)).toBe(true);
    expect(isTestFixtureUrl(`${SITE}/pt-br/test-fixtures/notes/fixture-note/`)).toBe(true);
  });

  it('does not match real pages', () => {
    expect(isTestFixtureUrl(`${SITE}/blog/welcome/`)).toBe(false);
    expect(isTestFixtureUrl(`${SITE}/pt-br/notes/note-a/`)).toBe(false);
    expect(isTestFixtureUrl(`${SITE}/`)).toBe(false);
  });
});

describe('scheduled posts', () => {
  it('skips entries whose publishedAt is in the future', () => {
    const later = mkdtempSync(join(tmpdir(), 'sitemap-scheduled-'));
    try {
      mkdirSync(join(later, 'blog'));
      const write = (file: string, language: string, published: string, slug = 'later') =>
        writeFileSync(
          join(later, 'blog', file),
          `---\nslug: "${slug}"\ntitle: "T"\nlanguage: "${language}"\ntranslationKey: "${slug}"\npublishedAt: ${published}\n---\n\nBody\n`,
        );
      write('later.en.md', 'en', '2999-01-01');
      write('later.pt-br.md', 'pt-br', '2999-01-01');
      write('live.en.md', 'en', '2020-01-01', 'live');
      expect(readRouteEntries(later, 'blog').map((e) => e.publishedAt.getUTCFullYear())).toEqual([2020]);
      const { lastmod } = sitemapMeta(later, SITE);
      expect(lastmod.has(`${SITE}/blog/later/`)).toBe(false);
      expect(lastmod.has(`${SITE}/blog/live/`)).toBe(true);
    } finally {
      rmSync(later, { recursive: true, force: true });
    }
  });
});

describe('readRouteEntries', () => {
  it('reads frontmatter of md and mdx files only', () => {
    const entries = readRouteEntries(root, 'blog');
    expect(entries.map((e) => e.slug).sort()).toEqual(['a.en', 'a.pt-br', 'b.en']);
    const a = entries.find((e) => e.slug === 'a.en')!;
    expect(a.language).toBe('en');
    expect(a.translationKey).toBe('a');
    expect(a.updatedAt).toEqual(new Date('2026-11-20'));
  });

  it('returns an empty list for a missing collection folder', () => {
    expect(readRouteEntries(join(root, 'nope'), 'blog')).toEqual([]);
  });
});

describe('sitemapMeta', () => {
  it('excludes fallback pages and keeps real ones', () => {
    const { exclude } = sitemapMeta(root, SITE);
    expect(exclude.has(`${SITE}/pt-br/blog/b.en/`)).toBe(true);
    expect(exclude.has(`${SITE}/blog/b.en/`)).toBe(false);
    expect(exclude.has(`${SITE}/blog/a.en/`)).toBe(false);
    expect(exclude.has(`${SITE}/pt-br/blog/a.pt-br/`)).toBe(false);
  });

  it('excludes the English fallback of a Portuguese-only note', () => {
    const { exclude } = sitemapMeta(root, SITE);
    expect(exclude.has(`${SITE}/notes/n.pt-br/`)).toBe(true);
    expect(exclude.has(`${SITE}/pt-br/notes/n.pt-br/`)).toBe(false);
  });

  it('uses updatedAt for lastmod when present', () => {
    const { lastmod } = sitemapMeta(root, SITE);
    expect(lastmod.get(`${SITE}/blog/a.en/`)).toBe('2026-11-20T00:00:00.000Z');
  });

  it('falls back to publishedAt for lastmod', () => {
    const { lastmod } = sitemapMeta(root, SITE);
    expect(lastmod.get(`${SITE}/pt-br/blog/a.pt-br/`)).toBe('2026-03-02T00:00:00.000Z');
    expect(lastmod.get(`${SITE}/pt-br/notes/n.pt-br/`)).toBe('2026-04-05T00:00:00.000Z');
  });

  it('ignores any number of trailing slashes on the site URL', () => {
    expect(sitemapMeta(root, `${SITE}/`).lastmod.has(`${SITE}/blog/a.en/`)).toBe(true);
    expect(sitemapMeta(root, `${SITE}///`).lastmod.has(`${SITE}/blog/a.en/`)).toBe(true);
  });

  it('trims a long run of slashes quickly', () => {
    const start = performance.now();
    sitemapMeta(root, `${SITE}${'/'.repeat(10_000)}x${'/'.repeat(10_000)}`);
    expect(performance.now() - start).toBeLessThan(100);
  });
});
