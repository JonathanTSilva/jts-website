import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildContentMap, resolveWikilinkUrl } from '../../../src/lib/remark/obsidian-wikilinks';

let dir: string;

function write(collection: string, name: string, slug: string, language: string) {
  const target = path.join(dir, collection);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(
    path.join(target, name),
    `---\nslug: "${slug}"\ntitle: "T"\nlanguage: "${language}"\ntranslationKey: "k"\n---\n\nBody\n`,
  );
}

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wikilinks-'));
  write('blog', '2026-11-low-cost-homelab-setup.en.md', 'low-cost-homelab-setup', 'en');
  write('blog', '2026-11-low-cost-homelab-setup.pt-br.md', 'low-cost-homelab-setup', 'pt-br');
  write('notes', 'book-cheatsheet.en.md', 'book-cheatsheet', 'en');
  write('notes', 'book-cheatsheet.pt-br.md', 'book-cheatsheet', 'pt-br');
});

afterAll(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('scheduled targets', () => {
  it('leaves a link to a future-dated post unresolved', () => {
    const later = fs.mkdtempSync(path.join(os.tmpdir(), 'wikilinks-scheduled-'));
    try {
      const target = path.join(later, 'blog');
      fs.mkdirSync(target, { recursive: true });
      const write = (name: string, published: string) =>
        fs.writeFileSync(
          path.join(target, name),
          `---\nslug: "x"\ntitle: "T"\nlanguage: "en"\ntranslationKey: "k"\npublishedAt: ${published}\n---\n\nBody\n`,
        );
      write('2999-01-ahead.en.md', '2999-01-01');
      write('2020-01-past.en.md', '2020-01-01');
      const map = buildContentMap(later);
      expect(resolveWikilinkUrl(map, '2999-01-ahead.en', 'en')).toBeNull();
      expect(resolveWikilinkUrl(map, '2020-01-past.en', 'en')).toBe('/blog/x/');
    } finally {
      fs.rmSync(later, { recursive: true, force: true });
    }
  });
});

describe('wikilink resolution with shared clean slugs', () => {
  it('resolves a filename-stem link to the clean URL of that language', () => {
    const map = buildContentMap(dir);
    expect(resolveWikilinkUrl(map, '2026-11-low-cost-homelab-setup.en', 'en')).toBe(
      '/blog/low-cost-homelab-setup/',
    );
    expect(resolveWikilinkUrl(map, '2026-11-low-cost-homelab-setup.pt-br', 'en')).toBe(
      '/pt-br/blog/low-cost-homelab-setup/',
    );
  });

  it('resolves a slug link to the entry in the linking page language', () => {
    const map = buildContentMap(dir);
    expect(resolveWikilinkUrl(map, 'low-cost-homelab-setup', 'en')).toBe('/blog/low-cost-homelab-setup/');
    expect(resolveWikilinkUrl(map, 'low-cost-homelab-setup', 'pt-br')).toBe(
      '/pt-br/blog/low-cost-homelab-setup/',
    );
  });

  it('accepts the filename with its extension', () => {
    const map = buildContentMap(dir);
    expect(resolveWikilinkUrl(map, '2026-11-low-cost-homelab-setup.pt-br.md', 'en')).toBe(
      '/pt-br/blog/low-cost-homelab-setup/',
    );
  });

  it('resolves notes the same way', () => {
    const map = buildContentMap(dir);
    expect(resolveWikilinkUrl(map, 'book-cheatsheet.pt-br', 'en')).toBe('/pt-br/notes/book-cheatsheet/');
    expect(resolveWikilinkUrl(map, 'book-cheatsheet', 'pt-br')).toBe('/pt-br/notes/book-cheatsheet/');
  });

  it('returns null for an unknown target', () => {
    expect(resolveWikilinkUrl(buildContentMap(dir), 'nope', 'en')).toBeNull();
  });
});
