import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Paragraph, Root } from 'mdast';
import {
  buildContentMap,
  resolveWikilinkUrl,
  remarkObsidianWikilinks,
} from '../../../src/lib/remark/obsidian-wikilinks';

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

// ---------------------------------------------------------------------------
// Plugin behavior against the committed fixture tree
// ---------------------------------------------------------------------------

const FIXTURES = path.join(__dirname, 'fixtures', 'wikilinks');

/** Loose view of the mdast phrasing nodes the plugin emits, so assertions can read any field. */
interface LooseNode {
  type: string;
  value?: string;
  url?: string;
  alt?: string;
  title?: string | null;
  data?: { hProperties?: Record<string, unknown> };
  children?: LooseNode[];
}

/** Runs the plugin over one text node and returns the resulting paragraph children. */
function run(
  text: string,
  filePath: string,
  options: { contentDir?: string; onUnresolved?: (target: string, file?: string) => void } = {},
): LooseNode[] {
  const tree: Root = {
    type: 'root',
    children: [{ type: 'paragraph', children: [{ type: 'text', value: text }] }],
  };
  const transform = remarkObsidianWikilinks({ contentDir: FIXTURES, ...options });
  transform(tree, { path: filePath, history: [filePath] });
  return (tree.children[0] as Paragraph).children as LooseNode[];
}

const EN_PAGE = '/vault/blog/2026-12-chinese-cameras.en.md';
const PT_PAGE = '/vault/blog/2026-12-chinese-cameras.pt-br.md';

describe('buildContentMap with gray-matter', () => {
  it('indexes the fixture tree by slug, base name, stem and filename', () => {
    const map = buildContentMap(FIXTURES);
    expect(map.get('low-cost-homelab-setup')).toHaveLength(2);
    expect(map.get('2026-11-low-cost-homelab-setup')).toHaveLength(2);
    expect(map.get('2026-11-low-cost-homelab-setup.en')).toEqual([
      { collection: 'blog', slug: 'low-cost-homelab-setup', locale: 'en' },
    ]);
    expect(map.get('2026-11-low-cost-homelab-setup.pt-br.md')).toHaveLength(1);
  });

  it('skips a future-dated post whether publishedAt is a quoted string or a bare YAML date', () => {
    const map = buildContentMap(FIXTURES);
    expect(map.has('scheduled-post')).toBe(false);
    expect(map.has('2999-01-scheduled-post.en')).toBe(false);
  });

  it('handles frontmatter the old regex could not (colon in title, CRLF, single quotes)', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wikilinks-yaml-'));
    try {
      fs.mkdirSync(path.join(tmp, 'blog'), { recursive: true });
      fs.writeFileSync(
        path.join(tmp, 'blog', '2026-01-odd.en.md'),
        "---\r\ntitle: 'A: title'\r\nslug: 'odd-one'\r\nlanguage: en\r\n---\r\n\r\nBody\r\n",
      );
      const map = buildContentMap(tmp);
      expect(resolveWikilinkUrl(map, '2026-01-odd.en', 'en')).toBe('/blog/odd-one/');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('skips a file without a slug', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wikilinks-noslug-'));
    try {
      fs.mkdirSync(path.join(tmp, 'blog'), { recursive: true });
      fs.writeFileSync(path.join(tmp, 'blog', 'x.en.md'), '---\ntitle: "T"\n---\n\nBody\n');
      expect(buildContentMap(tmp).size).toBe(0);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe('remarkObsidianWikilinks resolution', () => {
  const link = (nodes: LooseNode[]) => nodes.find((n) => n.type === 'link');

  it.each([
    ['base name', '[[2026-11-low-cost-homelab-setup]]', '/blog/low-cost-homelab-setup/'],
    ['stem with language', '[[2026-11-low-cost-homelab-setup.en]]', '/blog/low-cost-homelab-setup/'],
    ['filename with extension', '[[2026-11-low-cost-homelab-setup.en.md]]', '/blog/low-cost-homelab-setup/'],
    ['clean slug', '[[low-cost-homelab-setup]]', '/blog/low-cost-homelab-setup/'],
  ])('resolves %s from an EN page', (_name, text, url) => {
    expect(link(run(text, EN_PAGE))?.url).toBe(url);
  });

  it('prefers the locale of the linking page for shared keys (slug and base name)', () => {
    expect(link(run('[[low-cost-homelab-setup]]', PT_PAGE))?.url).toBe('/pt-br/blog/low-cost-homelab-setup/');
    expect(link(run('[[2026-11-low-cost-homelab-setup]]', PT_PAGE))?.url).toBe(
      '/pt-br/blog/low-cost-homelab-setup/',
    );
  });

  it('falls back to English when the linking page language has no translation of the target', () => {
    expect(link(run('[[english-only]]', PT_PAGE))?.url).toBe('/notes/english-only/');
  });

  it('a PT page linking an EN stem explicitly goes to the EN page (the stem pins the language)', () => {
    expect(link(run('[[2026-11-low-cost-homelab-setup.en]]', PT_PAGE))?.url).toBe(
      '/blog/low-cost-homelab-setup/',
    );
  });

  it('resolves the exact vault form with an alias to the EN page', () => {
    const nodes = run('[[2026-11-low-cost-homelab-setup.en|post about my homelab]]', EN_PAGE);
    expect(nodes).toEqual([
      {
        type: 'link',
        url: '/blog/low-cost-homelab-setup/',
        title: null,
        children: [{ type: 'text', value: 'post about my homelab' }],
      },
    ]);
  });

  it('resolves the .pt-br stem to the PT page', () => {
    const nodes = run('[[2026-11-low-cost-homelab-setup.pt-br|post sobre meu homelab]]', PT_PAGE);
    expect(link(nodes)?.url).toBe('/pt-br/blog/low-cost-homelab-setup/');
    expect(link(nodes)?.children?.[0]?.value).toBe('post sobre meu homelab');
  });

  it('keeps a heading anchor, lowercased with dashes for spaces', () => {
    expect(link(run('[[low-cost-homelab-setup#My Section]]', EN_PAGE))?.url).toBe(
      '/blog/low-cost-homelab-setup/#my-section',
    );
  });

  it('combines anchor and label', () => {
    const l = link(run('[[low-cost-homelab-setup#Part Two|see part two]]', EN_PAGE));
    expect(l?.url).toBe('/blog/low-cost-homelab-setup/#part-two');
    expect(l?.children?.[0]?.value).toBe('see part two');
  });

  it('uses the target as the label when none is given', () => {
    expect(link(run('[[low-cost-homelab-setup]]', EN_PAGE))?.children?.[0]?.value).toBe('low-cost-homelab-setup');
  });

  it('resolves notes', () => {
    expect(link(run('[[book-cheatsheet]]', PT_PAGE))?.url).toBe('/pt-br/notes/book-cheatsheet/');
  });

  it('keeps surrounding text', () => {
    const nodes = run('see [[low-cost-homelab-setup]] now', EN_PAGE);
    expect(nodes.map((n) => n.type)).toEqual(['text', 'link', 'text']);
    expect(nodes[0]?.value).toBe('see ');
    expect(nodes[2]?.value).toBe(' now');
  });

  it('leaves an unresolved wikilink as plain text', () => {
    const nodes = run('[[missing-note]]', EN_PAGE, { onUnresolved: () => {} });
    expect(nodes).toEqual([{ type: 'text', value: '[[missing-note]]' }]);
  });

  it('leaves a link to a scheduled post as plain text', () => {
    const nodes = run('[[scheduled-post]]', EN_PAGE, { onUnresolved: () => {} });
    expect(nodes).toEqual([{ type: 'text', value: '[[scheduled-post]]' }]);
  });
});

describe('unresolved wikilink reporting', () => {
  it('calls onUnresolved with the target and the file path', () => {
    const calls: Array<[string, string | undefined]> = [];
    run('[[missing-note]]', EN_PAGE, { onUnresolved: (t, f) => calls.push([t, f]) });
    expect(calls).toEqual([['missing-note', EN_PAGE]]);
  });

  it('reports the target without anchor or alias, once per unresolved link', () => {
    const targets: string[] = [];
    run('[[a-gone#Sec|label]] and [[b-gone]] and [[low-cost-homelab-setup]]', EN_PAGE, {
      onUnresolved: (t) => targets.push(t),
    });
    expect(targets).toEqual(['a-gone', 'b-gone']);
  });

  it('falls back to file.history[0] when file.path is missing', () => {
    const tree: Root = {
      type: 'root',
      children: [{ type: 'paragraph', children: [{ type: 'text', value: '[[nope]]' }] }],
    };
    const calls: Array<[string, string | undefined]> = [];
    remarkObsidianWikilinks({ contentDir: FIXTURES, onUnresolved: (t, f) => calls.push([t, f]) })(tree, {
      history: [EN_PAGE],
    });
    expect(calls).toEqual([['nope', EN_PAGE]]);
  });

  it('does not report resolved links, image embeds or non-image embeds', () => {
    const onUnresolved = vi.fn();
    run('[[low-cost-homelab-setup]] ![[pic.png]] ![[some-note]]', EN_PAGE, { onUnresolved });
    expect(onUnresolved).not.toHaveBeenCalled();
  });

  it('warns through console.warn by default with a clear message', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      run('[[missing-note]]', EN_PAGE);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(String(warn.mock.calls[0]?.[0])).toBe(`unresolved wikilink [[missing-note]] in ${EN_PAGE}`);
    } finally {
      warn.mockRestore();
    }
  });
});

describe('content map cache', () => {
  function copyFixtures(): string {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wikilinks-cache-'));
    fs.cpSync(FIXTURES, tmp, { recursive: true });
    return tmp;
  }

  it('sees a file added after the first call without a restart', () => {
    const tmp = copyFixtures();
    try {
      const first = run('[[2027-01-new-post.en]]', EN_PAGE, { contentDir: tmp, onUnresolved: () => {} });
      expect(first[0]?.type).toBe('text');

      const file = path.join(tmp, 'blog', '2027-01-new-post.en.md');
      fs.writeFileSync(
        file,
        '---\nslug: "new-post"\ntitle: "N"\nlanguage: "en"\ntranslationKey: "n"\npublishedAt: "2026-11-15"\n---\n\nBody\n',
      );
      // Same-second mtimes would hide the change; push it clearly into the future.
      const later = new Date(Date.now() + 5000);
      fs.utimesSync(file, later, later);

      const second = run('[[2027-01-new-post.en]]', EN_PAGE, { contentDir: tmp, onUnresolved: () => {} });
      expect(second[0]?.type).toBe('link');
      expect(second[0]?.url).toBe('/blog/new-post/');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('sees an edited slug on an existing file', () => {
    const tmp = copyFixtures();
    try {
      run('[[english-only]]', EN_PAGE, { contentDir: tmp });
      const file = path.join(tmp, 'notes', 'english-only.en.md');
      fs.writeFileSync(file, fs.readFileSync(file, 'utf-8').replace('english-only', 'renamed-note'));
      const later = new Date(Date.now() + 5000);
      fs.utimesSync(file, later, later);
      const nodes = run('[[renamed-note]]', EN_PAGE, { contentDir: tmp });
      expect(nodes[0]?.url).toBe('/notes/renamed-note/');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('keeps separate caches per content directory', () => {
    const tmp = copyFixtures();
    try {
      fs.rmSync(path.join(tmp, 'notes'), { recursive: true });
      expect(run('[[book-cheatsheet]]', EN_PAGE, { contentDir: tmp, onUnresolved: () => {} })[0]?.type).toBe('text');
      expect(run('[[book-cheatsheet]]', EN_PAGE)[0]?.type).toBe('link');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('reuses the map while no mtime changes (the cache is keyed on stat only)', () => {
    const tmp = copyFixtures();
    try {
      const file = path.join(tmp, 'notes', 'english-only.en.md');
      // A whole-millisecond mtime survives a Date round trip exactly.
      const fixed = new Date('2026-06-01T00:00:00.000Z');
      fs.utimesSync(file, fixed, fixed);
      expect(run('[[english-only]]', EN_PAGE, { contentDir: tmp })[0]?.url).toBe('/notes/english-only/');

      // Change the content but restore the mtime: a cache hit must not notice.
      fs.writeFileSync(file, fs.readFileSync(file, 'utf-8').replace('english-only', 'sneaky'));
      fs.utimesSync(file, fixed, fixed);

      const nodes = run('[[english-only]]', EN_PAGE, { contentDir: tmp, onUnresolved: () => {} });
      expect(nodes[0]?.url).toBe('/notes/english-only/');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
