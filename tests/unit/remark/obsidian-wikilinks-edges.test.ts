import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Paragraph, Root } from 'mdast';
import {
  buildContentMap,
  remarkObsidianWikilinks,
  resolveWikilinkUrl,
} from '../../../src/lib/remark/obsidian-wikilinks';

interface LooseNode {
  type: string;
  value?: string;
  url?: string;
  alt?: string;
  data?: { hProperties?: Record<string, unknown> };
  children?: LooseNode[];
}

let dir: string;

function write(collection: string, name: string, frontmatter: string) {
  const target = path.join(dir, collection);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, name), `---\n${frontmatter}\n---\n\nBody\n`);
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wikilinks-edges-'));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('buildContentMap edge cases', () => {
  it('uses the file name as base name and English when there is no language suffix', () => {
    write('blog', 'plain.md', 'slug: "plain"');
    const map = buildContentMap(dir);
    expect(map.get('plain')).toEqual([{ collection: 'blog', slug: 'plain', locale: 'en' }]);
  });

  it('takes the locale from the filename when the frontmatter has no language', () => {
    write('notes', 'thing.pt-br.md', 'slug: "thing"');
    expect(resolveWikilinkUrl(buildContentMap(dir), 'thing', 'en')).toBe('/pt-br/notes/thing/');
  });

  it('falls back to English for a language the site does not support', () => {
    write('blog', 'odd.en.md', 'slug: "odd"\nlanguage: "fr"');
    expect(resolveWikilinkUrl(buildContentMap(dir), 'odd', 'de')).toBe('/blog/odd/');
  });

  it('keeps a post whose publishedAt cannot be parsed and skips a quoted future date', () => {
    write('blog', 'bad-date.en.md', 'slug: "bad-date"\npublishedAt: "not a date"');
    write('blog', 'future.en.md', 'slug: "future"\npublishedAt: "2999-01-01"');
    const map = buildContentMap(dir);
    expect(map.has('bad-date')).toBe(true);
    expect(map.has('future')).toBe(false);
  });

  it('returns null for an unknown target and for an empty entry list', () => {
    const map = buildContentMap(dir);
    map.set('empty', []);
    expect(resolveWikilinkUrl(map, 'empty', 'en')).toBeNull();
    expect(resolveWikilinkUrl(map, 'missing.md', 'en')).toBeNull();
  });
});

describe('remarkObsidianWikilinks edge cases', () => {
  function transform(text: string, file?: { path?: string; history?: string[] }, options = {}) {
    const tree: Root = {
      type: 'root',
      children: [{ type: 'paragraph', children: [{ type: 'text', value: text }] }],
    };
    remarkObsidianWikilinks({ contentDir: dir, ...options })(tree, file);
    return (tree.children[0] as Paragraph).children as LooseNode[];
  }

  it('renders aliases, anchors and surrounding text', () => {
    write('blog', 'target.en.md', 'slug: "target"');
    const nodes = transform('see [[target#My Heading|the post]] and [[target#Intro]] now', { path: '/v/a.en.md' });
    expect(nodes.map((n) => n.type)).toEqual(['text', 'link', 'text', 'link', 'text']);
    expect(nodes[1]).toMatchObject({ url: '/blog/target/#my-heading', children: [{ value: 'the post' }] });
    expect(nodes[3]).toMatchObject({ url: '/blog/target/#intro', children: [{ value: 'target' }] });
  });

  it('reports unresolved targets with the file path, or a generic name without one', () => {
    const onUnresolved = vi.fn();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      transform('[[ghost]]', { path: '/v/a.en.md' }, { onUnresolved });
      expect(onUnresolved).toHaveBeenCalledWith('ghost', '/v/a.en.md');

      const nodes = transform('[[ghost]]', undefined);
      expect(nodes).toEqual([{ type: 'text', value: '[[ghost]]' }]);
      expect(warn).toHaveBeenCalledWith('unresolved wikilink [[ghost]] in unknown file');

      transform('[[ghost2]]', { history: ['/v/from-history.en.md'] });
      expect(warn).toHaveBeenLastCalledWith('unresolved wikilink [[ghost2]] in /v/from-history.en.md');
    } finally {
      warn.mockRestore();
    }
  });

  it('turns image embeds into images with width, size or alt modifiers', () => {
    const nodes = transform('![[a b.png]]![[c.png|300]]![[d.png|300x200]]![[e.png|diagram of e]]', { path: '/v/a.en.md' });
    expect(nodes.map((n) => n.type)).toEqual(['image', 'image', 'image', 'image']);
    expect(nodes[0]).toMatchObject({ url: '/assets/uploads/a b.png', alt: 'a b' });
    expect(nodes[1]!.data?.hProperties).toEqual({ width: 300, style: 'max-width: 300px; width: 100%;' });
    expect(nodes[2]!.data?.hProperties).toMatchObject({ width: 300, height: 200 });
    expect(nodes[3]).toMatchObject({ alt: 'diagram of e' });
    expect(nodes[3]!.data).toBeUndefined();
  });

  it('keeps non-image embeds as text, with or without a modifier', () => {
    const nodes = transform('a ![[some note]] b ![[other|alias]]', { path: '/v/a.en.md' });
    expect(nodes.map((n) => n.value ?? n.type)).toEqual(['a ', '![[some note]]', ' b ', '![[other|alias]]']);
  });

  it('leaves a text node untouched when nothing in it changes', () => {
    const nodes = transform('![[only a note]]', { path: '/v/a.en.md' });
    expect(nodes).toEqual([{ type: 'text', value: '![[only a note]]' }]);
  });

  it('ignores text without wikilinks and a text root without a parent', () => {
    expect(transform('plain text', { path: '/v/a.en.md' })).toEqual([{ type: 'text', value: 'plain text' }]);
    const root = { type: 'text', value: '[[x]]' } as unknown as Root;
    expect(() => remarkObsidianWikilinks({ contentDir: dir })(root)).not.toThrow();
  });

  it('works with a content directory that does not exist yet and picks up new files', () => {
    const missing = path.join(dir, 'later');
    const run = () => {
      const tree: Root = { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', value: '[[late]]' }] }] };
      remarkObsidianWikilinks({ contentDir: missing, onUnresolved: () => undefined })(tree, { path: '/v/a.en.md' });
      return (tree.children[0] as Paragraph).children as LooseNode[];
    };
    expect(run()[0]!.type).toBe('text');
    fs.mkdirSync(path.join(missing, 'blog', 'nested'), { recursive: true });
    fs.writeFileSync(path.join(missing, 'blog', 'late.en.md'), '---\nslug: "late"\n---\n');
    fs.writeFileSync(path.join(missing, 'blog', 'nested', 'readme.txt'), 'ignored');
    fs.writeFileSync(path.join(missing, 'blog', 'nested', 'deep.en.md'), '---\nslug: "deep"\n---\n');
    expect(run()[0]!.type).toBe('link');
  });

  it('handles a file without a language suffix and a file with no path at all', () => {
    write('blog', 'target.en.md', 'slug: "target"');
    expect(transform('[[target]]', { path: '/v/plain.md' })[0]!.type).toBe('link');
    expect(transform('[[target]]', {})[0]!.type).toBe('link');
  });
});
