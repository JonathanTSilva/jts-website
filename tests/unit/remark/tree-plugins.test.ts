import { describe, expect, it } from 'vitest';
import type { Root } from 'mdast';
import type { VFile } from 'vfile';
import { remarkTaskItems } from '../../../src/lib/remark/task-items';
import { remarkMindmap } from '../../../src/lib/remark/mindmap';
import { remarkHighlights } from '../../../src/lib/remark/highlights';
import { remarkNoteBlocks } from '../../../src/lib/remark/note-blocks';
import { remarkObsidianImages } from '../../../src/lib/remark/obsidian-images';

const text = (value: string) => ({ type: 'text' as const, value });
const para = (...children: unknown[]) => ({ type: 'paragraph' as const, children });
const root = (...children: unknown[]) => ({ type: 'root', children }) as unknown as Root;

describe('remarkTaskItems on GFM trees', () => {
  const run = (...items: unknown[]) => {
    const tree = root({ type: 'list', children: items });
    remarkTaskItems()(tree);
    return (tree.children[0] as unknown as { children: Array<{ data?: { hProperties?: Record<string, unknown> } }> }).children;
  };

  it('labels checked and unchecked items and keeps existing properties', () => {
    const [checked, unchecked, merged] = run(
      { type: 'listItem', checked: true, children: [] },
      { type: 'listItem', checked: false, children: [] },
      { type: 'listItem', checked: true, data: { hProperties: { id: 'x' } }, children: [] },
    );
    expect(checked!.data!.hProperties).toEqual({ 'data-task': 'checked' });
    expect(unchecked!.data!.hProperties).toEqual({ 'data-task': 'unchecked' });
    expect(merged!.data!.hProperties).toEqual({ id: 'x', 'data-task': 'checked' });
  });

  it('ignores items that cannot carry an Obsidian marker', () => {
    const items = run(
      { type: 'listItem', checked: null, children: [] },
      { type: 'listItem', checked: null, children: [{ type: 'code', value: 'x' }] },
      { type: 'listItem', checked: null, children: [para()] },
      { type: 'listItem', checked: null, children: [para({ type: 'emphasis', children: [] })] },
      { type: 'listItem', checked: null, children: [para(text('no marker'))] },
      { type: 'listItem', checked: null, children: [para(text('[?]no space'))] },
    );
    expect(items.every((item) => item.data === undefined)).toBe(true);
  });

  it('strips a custom marker and merges existing properties', () => {
    const [item] = run({
      type: 'listItem',
      checked: null,
      data: { hProperties: { id: 'y' } },
      children: [para(text('[!] urgent'))],
    });
    expect(item!.data!.hProperties).toEqual({ id: 'y', 'data-task': 'important' });
  });
});

describe('remarkMindmap on hand-built trees', () => {
  const run = (tree: Root, noteType: unknown = 'mindmap') => {
    const file = { data: { astro: { frontmatter: { noteType } } } } as unknown as VFile;
    remarkMindmap()(tree, file);
    return tree;
  };
  const heading = (depth: number, value: string) => ({ type: 'heading', depth, children: [text(value)] });
  const item = (...children: unknown[]) => ({ type: 'listItem', children });

  it('does nothing for other note types, a missing file, an empty tree or a tree without an H1', () => {
    const other = root(heading(1, 'Root'));
    run(other, 'note');
    expect(other.children[0]!.type).toBe('heading');

    const noData = root(heading(1, 'Root'));
    remarkMindmap()(noData, {} as VFile);
    expect(noData.children[0]!.type).toBe('heading');

    const empty = root();
    run(empty);
    expect(empty.children).toEqual([]);

    const noH1 = root(heading(2, 'Branch'));
    run(noH1);
    expect(noH1.children[0]!.type).toBe('heading');
  });

  it('renders a bare root when the document has no branches', () => {
    const tree = run(root(heading(1, 'Only <root>')));
    const html = (tree.children[0] as unknown as { value: string }).value;
    expect(html).toContain('Only &lt;root&gt;');
    expect(html).not.toContain('mindmap-children');
  });

  it('nests list items under their heading and flattens inline formatting', () => {
    const tree = run(
      root(
        heading(1, 'Root'),
        { type: 'list', children: [item(para(text('orphan list is ignored')))] },
        heading(2, 'Branch'),
        {
          type: 'list',
          children: [
            item(para(text('Leaf '), { type: 'strong', children: [text('bold')] }, { type: 'inlineCode', value: 'code' }), {
              type: 'list',
              children: [item(para(text('Nested')))],
            }),
            item({ type: 'code', value: 'not a paragraph' }),
          ],
        },
        { type: 'thematicBreak' },
      ),
    );
    const html = (tree.children[0] as unknown as { value: string }).value;
    expect(html).toContain('Branch');
    expect(html).toContain('Leaf bold');
    expect(html).toContain('Nested');
    expect(html).not.toContain('orphan');
    expect(html).toContain('data-depth="2"');
  });
});

describe('remarkHighlights', () => {
  it('ignores text nodes without a parent and text without a complete highlight', () => {
    expect(() => remarkHighlights()({ type: 'text', value: '==x==' } as unknown as Root)).not.toThrow();
    const tree = root(para(text('a == b')));
    remarkHighlights()(tree);
    expect((tree.children[0] as unknown as { children: unknown[] }).children).toEqual([text('a == b')]);
  });

  it('marks highlights and keeps the text around them', () => {
    const tree = root(para(text('x ==hot== y ==cold==')));
    remarkHighlights()(tree);
    const children = (tree.children[0] as unknown as { children: Array<{ type: string; value: string }> }).children;
    expect(children.map((c) => c.value)).toEqual(['x ', '<mark>hot</mark>', ' y ', '<mark>cold</mark>']);
  });
});

describe('remarkNoteBlocks', () => {
  const run = (lang: string | null | undefined) => {
    const tree = root({ type: 'code', lang, value: 'content' });
    remarkNoteBlocks()(tree);
    return (tree.children[0] as unknown as { type: string; value?: string }).type;
  };

  it('leaves code blocks without a language, with unknown colors or unknown languages alone', () => {
    expect(run(undefined)).toBe('code');
    expect(run(null)).toBe('code');
    expect(run('note-chartreuse')).toBe('code');
    expect(run('python')).toBe('code');
  });

  it('ignores a code root without a parent', () => {
    expect(() => remarkNoteBlocks()({ type: 'code', lang: 'note-red', value: 'x' } as unknown as Root)).not.toThrow();
  });
});

describe('remarkObsidianImages', () => {
  const run = (alt: string | null | undefined) => {
    const tree = root(para({ type: 'image', url: '/a.png', alt }));
    remarkObsidianImages()(tree);
    return (tree.children[0] as unknown as { children: Array<{ alt?: string; data?: { hProperties?: Record<string, unknown> } }> })
      .children[0]!;
  };

  it('handles images without alt text, without a size and with a non-numeric size', () => {
    expect(run(undefined).data).toBeUndefined();
    expect(run('plain alt').data).toBeUndefined();
    expect(run('alt|').alt).toBe('alt');
    const bad = run('alt|abc');
    expect(bad.alt).toBe('alt');
    expect(bad.data).toBeUndefined();
  });

  it('reads width and optional height', () => {
    expect(run('alt|200').data!.hProperties).toMatchObject({ width: 200 });
    expect(run('alt|200x100').data!.hProperties).toMatchObject({ width: 200, height: 100 });
    expect(run('alt|200xabc').data!.hProperties).toEqual({ width: 200, style: 'max-width: 200px; width: 100%;' });
  });
});
