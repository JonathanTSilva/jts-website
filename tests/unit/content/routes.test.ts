import { describe, it, expect } from 'vitest';
import { contentPath, planLocalizedRoutes, type RouteEntry } from '../../../src/lib/content/routes';

function entry(slug: string, language: 'en' | 'pt-br', translationKey: string): RouteEntry {
  return { slug, language, translationKey, publishedAt: new Date('2024-01-01') };
}

describe('contentPath', () => {
  it('builds English paths without a prefix', () => {
    expect(contentPath('blog', 'en', 'x')).toBe('/blog/x/');
  });

  it('builds Portuguese paths under /pt-br', () => {
    expect(contentPath('notes', 'pt-br', 'x')).toBe('/pt-br/notes/x/');
  });
});

describe('planLocalizedRoutes', () => {
  it('a translation pair yields one non-fallback route per locale', () => {
    const e = [entry('a.en', 'en', 'a'), entry('a.pt-br', 'pt-br', 'a')];
    const routes = planLocalizedRoutes(e, 'blog', 'en');
    expect(routes).toHaveLength(1);
    expect(routes[0]!.entry.slug).toBe('a.en');
    expect(routes[0]!.isFallback).toBe(false);
    expect(routes[0]!.translations).toEqual({
      en: '/blog/a.en/',
      'pt-br': '/pt-br/blog/a.pt-br/',
    });

    const pt = planLocalizedRoutes(e, 'blog', 'pt-br');
    expect(pt).toHaveLength(1);
    expect(pt[0]!.entry.slug).toBe('a.pt-br');
    expect(pt[0]!.path).toBe('/pt-br/blog/a.pt-br/');
    expect(pt[0]!.isFallback).toBe(false);
  });

  it('a missing translation yields a fallback route', () => {
    const routes = planLocalizedRoutes([entry('b.en', 'en', 'b')], 'blog', 'pt-br');
    expect(routes).toHaveLength(1);
    expect(routes[0]!.path).toBe('/pt-br/blog/b.en/');
    expect(routes[0]!.locale).toBe('pt-br');
    expect(routes[0]!.isFallback).toBe(true);
    expect(routes[0]!.translations).toEqual({ en: '/blog/b.en/' });
  });

  it('fallback prefers English, then the first entry', () => {
    const routes = planLocalizedRoutes([entry('c.pt-br', 'pt-br', 'c')], 'blog', 'en');
    expect(routes).toHaveLength(1);
    expect(routes[0]!.entry.slug).toBe('c.pt-br');
    expect(routes[0]!.isFallback).toBe(true);
  });
});
