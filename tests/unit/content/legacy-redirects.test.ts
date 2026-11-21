import { describe, it, expect } from 'vitest';
import { legacyRedirects } from '../../../src/lib/content/legacyRedirects';
import { LEGACY_SLUGS } from '../../../src/data/legacy-slugs';

describe('legacyRedirects', () => {
  it('maps all four old forms of a blog post to the clean URL of the right language', () => {
    expect(
      legacyRedirects([{ collection: 'blog', oldBase: '2026-04-welcome', newSlug: 'welcome' }]),
    ).toEqual({
      '/blog/2026-04-welcome.en': '/blog/welcome',
      '/blog/2026-04-welcome.pt-br': '/pt-br/blog/welcome',
      '/pt-br/blog/2026-04-welcome.en': '/blog/welcome',
      '/pt-br/blog/2026-04-welcome.pt-br': '/pt-br/blog/welcome',
    });
  });

  it('does the same for notes', () => {
    expect(
      legacyRedirects([{ collection: 'notes', oldBase: 'book-cheatsheet', newSlug: 'book-cheatsheet-2' }]),
    ).toEqual({
      '/notes/book-cheatsheet.en': '/notes/book-cheatsheet-2',
      '/notes/book-cheatsheet.pt-br': '/pt-br/notes/book-cheatsheet-2',
      '/pt-br/notes/book-cheatsheet.en': '/notes/book-cheatsheet-2',
      '/pt-br/notes/book-cheatsheet.pt-br': '/pt-br/notes/book-cheatsheet-2',
    });
  });

  it('returns nothing for no items', () => {
    expect(legacyRedirects([])).toEqual({});
  });

  it('ships an array of legacy slugs', () => {
    expect(Array.isArray(LEGACY_SLUGS)).toBe(true);
  });
});
