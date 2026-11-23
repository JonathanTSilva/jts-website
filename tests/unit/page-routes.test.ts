import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('astro:content', () => ({ getCollection: vi.fn() }));
vi.mock('../../src/lib/ogImage', () => ({
  generateOGImage: vi.fn(async () => Buffer.from([0x89, 0x50, 0x4e, 0x47])),
}));
vi.mock('../../src/lib/engineering/dashboard', () => ({ getDashboard: vi.fn() }));

import { getCollection } from 'astro:content';
import { generateOGImage } from '../../src/lib/ogImage';
import { getDashboard } from '../../src/lib/engineering/dashboard';
import { GET as defaultOg } from '../../src/pages/og-image.png';
import { GET as dataJson } from '../../src/pages/engineering/data.json';
import { GET as entryOg, getStaticPaths } from '../../src/pages/og/[...path].png';

const mockedGetCollection = vi.mocked(getCollection);
const mockedOg = vi.mocked(generateOGImage);
const emptyContext = {} as never;

function entry(language: 'en' | 'pt-br', slug: string, extra: Record<string, unknown> = {}) {
  return {
    id: `${slug}.${language}`,
    data: { slug, language, title: `T ${slug}`, publishedAt: new Date('2020-01-01'), category: 'Engineering', ...extra },
  };
}

describe('og-image.png route', () => {
  it('returns the site default share image as a PNG', async () => {
    const response = (await defaultOg(emptyContext)) as Response;
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(mockedOg).toHaveBeenCalledWith(expect.objectContaining({ label: 'JONTOBIAS.COM' }));
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([0x89, 0x50, 0x4e, 0x47]));
  });
});

describe('engineering data.json route', () => {
  it('publishes only the data stamp as JSON', async () => {
    vi.mocked(getDashboard).mockResolvedValue({
      data: { generated_at: '2026-01-01T00:00:00Z', secret: 'x' },
      source: 'snapshot',
    } as never);
    const response = (await dataJson(emptyContext)) as Response;
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(JSON.parse(await response.text())).toEqual({ generated_at: '2026-01-01T00:00:00Z', source: 'snapshot' });
  });
});

describe('per-entry og image route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetCollection.mockImplementation((async (name: string, filter?: (e: unknown) => boolean) => {
      const all =
        name === 'blog'
          ? [entry('en', 'post'), entry('pt-br', 'post')]
          : [entry('en', 'note', { noteType: 'book', colorToken: '#abcdef' }), entry('pt-br', 'plain')];
      return filter ? all.filter(filter) : all;
    }) as never);
  });

  it('plans one image per entry and language, mirroring the page URLs', async () => {
    const paths = await getStaticPaths({} as never);
    expect(paths.map((p) => p.params.path)).toEqual([
      'blog/post',
      'pt-br/blog/post',
      'notes/note',
      'pt-br/notes/plain',
    ]);
    expect(paths.map((p) => (p.props as { kind: string }).kind)).toEqual(['blog', 'blog', 'notes', 'notes']);
  });

  it('renders a blog image without a custom accent', async () => {
    const paths = await getStaticPaths({} as never);
    const response = (await entryOg({ props: paths[0]!.props } as never)) as Response;
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(mockedOg).toHaveBeenCalledWith({ title: 'T post', label: 'BLOG · ENGINEERING' });
  });

  it('renders a note image with its note type and accent', async () => {
    const paths = await getStaticPaths({} as never);
    await entryOg({ props: paths[2]!.props } as never);
    expect(mockedOg).toHaveBeenLastCalledWith({ title: 'T note', label: 'BOOK · ENGINEERING', accent: '#abcdef' });
    await entryOg({ props: paths[3]!.props } as never);
    expect(mockedOg).toHaveBeenLastCalledWith({
      title: 'T plain',
      label: 'NOTA · ENGINEERING',
      accent: '#6272EA',
    });
  });
});
