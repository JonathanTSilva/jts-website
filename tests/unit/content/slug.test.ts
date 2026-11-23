import { describe, it, expect } from 'vitest';
import { entryIdFromPath, expectedSlug, globEntryId } from '../../../src/lib/content/slug';

describe('expectedSlug', () => {
  it('strips the date and the language from a blog filename', () => {
    expect(expectedSlug('2026-11-low-cost-homelab-setup.en.md', 'blog')).toBe('low-cost-homelab-setup');
    expect(expectedSlug('2026-11-low-cost-homelab-setup.pt-br.md', 'blog')).toBe('low-cost-homelab-setup');
  });

  it('strips only the language from a note filename', () => {
    expect(expectedSlug('book-cheatsheet.pt-br.md', 'notes')).toBe('book-cheatsheet');
  });

  it('keeps the date for notes that have one', () => {
    expect(expectedSlug('2026-11-x.en.md', 'notes')).toBe('2026-11-x');
  });

  it('handles .mdx', () => {
    expect(expectedSlug('2026-04-welcome.en.mdx', 'blog')).toBe('welcome');
    expect(expectedSlug('x.pt-br.mdx', 'notes')).toBe('x');
  });

  it('keeps the base of a blog filename without a date', () => {
    expect(expectedSlug('welcome.en.md', 'blog')).toBe('welcome');
    expect(expectedSlug('welcome.md', 'blog')).toBe('welcome');
  });

  it('only strips a leading YYYY-MM-, not other digits', () => {
    expect(expectedSlug('2026-x.en.md', 'blog')).toBe('2026-x');
    expect(expectedSlug('top-10-2026-11-tips.en.md', 'blog')).toBe('top-10-2026-11-tips');
  });
});

describe('entryIdFromPath', () => {
  it('uses the filename stem, so both languages of a post keep distinct ids', () => {
    expect(entryIdFromPath('2026-11-low-cost-homelab-setup.en.md')).toBe('2026-11-low-cost-homelab-setup.en');
    expect(entryIdFromPath('2026-11-low-cost-homelab-setup.pt-br.mdx')).toBe('2026-11-low-cost-homelab-setup.pt-br');
  });
});

describe('globEntryId', () => {
  it('adapts entryIdFromPath to the glob loader options object', () => {
    expect(globEntryId({ entry: '2026-11-low-cost-homelab-setup.pt-br.md' })).toBe('2026-11-low-cost-homelab-setup.pt-br');
  });
});
