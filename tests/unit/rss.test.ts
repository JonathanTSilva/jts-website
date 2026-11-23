import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('astro:content', () => ({ getCollection: vi.fn() }));

import { getCollection } from 'astro:content';
import { makeRssHandler } from '../../src/lib/rss';
import { getPublished } from '../../src/lib/content/published';
import { GET as blogEn } from '../../src/pages/rss.xml';
import { GET as notesEn } from '../../src/pages/notes/rss.xml';
import { GET as blogPt } from '../../src/pages/pt-br/rss.xml';
import { GET as notesPt } from '../../src/pages/pt-br/notes/rss.xml';

const mockedGetCollection = vi.mocked(getCollection);

function entry(slug: string, language: 'en' | 'pt-br', publishedAt: string, extra: Record<string, unknown> = {}) {
  return {
    id: `${slug}.${language}`,
    data: { slug, language, title: `Title ${slug}`, publishedAt: new Date(publishedAt), ...extra },
    rendered: { html: `<p>${slug}</p>` },
  };
}

const context = (site?: URL) => ({ site }) as Parameters<ReturnType<typeof makeRssHandler>>[0];

describe('makeRssHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetCollection.mockImplementation((async (_name: string, filter?: (e: unknown) => boolean) => {
      const all = [
        entry('old', 'en', '2024-01-01', { summary: 'Old one' }),
        entry('new', 'en', '2025-01-01'),
        entry('pt', 'pt-br', '2025-02-01'),
      ];
      return filter ? all.filter(filter) : all;
    }) as never);
  });

  it('lists only entries in the locale, newest first, with English feed metadata', async () => {
    const response = await makeRssHandler('blog', 'en')(context(new URL('https://example.com')));
    const xml = await response.text();
    expect(xml).toContain('<title>Jonathan&apos;s Blog</title>');
    expect(xml).toContain('<language>en-us</language>');
    expect(xml.indexOf('Title new')).toBeLessThan(xml.indexOf('Title old'));
    expect(xml).not.toContain('Title pt');
    expect(xml).toContain('https://example.com/blog/old');
    expect(xml).toContain('Old one');
  });

  it('uses the notes feed titles and the Portuguese language tag', async () => {
    const xml = await (await makeRssHandler('notes', 'pt-br')(context())).text();
    expect(xml).toContain('<title>Notas do Jonathan</title>');
    expect(xml).toContain('<language>pt-br</language>');
    expect(xml).toContain('Title pt');
    expect(xml).toContain('https://www.jontobias.com/pt-br/notes/pt');
  });

  it('tolerates entries without rendered html', async () => {
    mockedGetCollection.mockResolvedValue([
      { ...entry('bare', 'en', '2024-01-01'), rendered: undefined },
    ] as never);
    const xml = await (await makeRssHandler('blog', 'en')(context())).text();
    expect(xml).toContain('Title bare');
  });

  it('wires the four feed endpoints to their collection and locale', async () => {
    const titles = await Promise.all(
      [blogEn, notesEn, blogPt, notesPt].map(async (get) => (await get(context() as never) as Response).text()),
    );
    expect(titles[0]).toContain('Jonathan&apos;s Blog');
    expect(titles[1]).toContain('Jonathan&apos;s Notes');
    expect(titles[2]).toContain('Blog do Jonathan');
    expect(titles[3]).toContain('Notas do Jonathan');
  });
});

describe('getPublished', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('keeps only entries whose publishedAt has passed in production', async () => {
    vi.stubEnv('DEV', false);
    mockedGetCollection.mockResolvedValue([]);
    await getPublished('blog');
    const filter = mockedGetCollection.mock.calls[0]![1] as (e: { data: { publishedAt: Date } }) => boolean;
    expect(filter({ data: { publishedAt: new Date('2000-01-01') } })).toBe(true);
    expect(filter({ data: { publishedAt: new Date('2999-01-01') } })).toBe(false);
  });

  it('shows scheduled entries on the dev server', async () => {
    vi.stubEnv('DEV', true);
    mockedGetCollection.mockResolvedValue([]);
    await getPublished('notes');
    const filter = mockedGetCollection.mock.calls[0]![1] as (e: { data: { publishedAt: Date } }) => boolean;
    expect(filter({ data: { publishedAt: new Date('2999-01-01') } })).toBe(true);
  });
});
