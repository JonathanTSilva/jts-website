import { afterAll, beforeAll, describe, it } from 'vitest';
import fc from 'fast-check';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Paragraph, Root, RootContent } from 'mdast';
import { remarkObsidianWikilinks } from '../../src/lib/remark/obsidian-wikilinks';

// Property tests for the Obsidian wikilinks remark plugin: whatever text a note holds,
// the plugin must not throw and must not invent links.

let dir: string;

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wikilinks-prop-'));
  fs.mkdirSync(path.join(dir, 'blog'), { recursive: true });
  for (const slug of ['alpha', 'beta']) {
    fs.writeFileSync(path.join(dir, 'blog', `${slug}.en.md`), `---\nslug: "${slug}"\n---\n\nBody\n`);
  }
});

afterAll(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

// Mostly the characters that matter to the syntax, so brackets, pipes and bangs collide often.
const wikilinkish = fc
  .array(
    fc.oneof(
      fc.constantFrom('[[', ']]', '[', ']', '!', '|', '#', 'alpha', 'beta', '.png', '.md', ' '),
      fc.string({ maxLength: 6 }),
    ),
    { maxLength: 40 },
  )
  .map(parts => parts.join(''));
const anyText = fc.oneof(fc.string({ unit: 'grapheme', maxLength: 200 }), wikilinkish);

// Overlapping count: `[[[` holds two openers, which is the safe upper bound.
const countOpeners = (text: string) => {
  let count = 0;
  for (let i = text.indexOf('[['); i !== -1; i = text.indexOf('[[', i + 1)) count++;
  return count;
};

function run(text: string): Paragraph['children'] {
  const tree: Root = { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', value: text }] }] };
  remarkObsidianWikilinks({ contentDir: dir, onUnresolved: () => {} })(tree, { path: '/notes/page.en.md' });
  return (tree.children[0] as Paragraph).children;
}

describe('remarkObsidianWikilinks properties', () => {
  it('never throws on arbitrary text', () => {
    fc.assert(
      fc.property(anyText, text => {
        run(text);
      }),
    );
  });

  it('produces no more links or images than there are [[ openers', () => {
    fc.assert(
      fc.property(anyText, text => {
        const produced = run(text).filter(n => n.type === 'link' || n.type === 'image').length;
        return produced <= countOpeners(text);
      }),
    );
  });

  it('keeps the text unchanged when there is no [[', () => {
    fc.assert(
      fc.property(
        anyText.filter(text => !text.includes('[[')),
        text => {
          const nodes: RootContent[] = run(text);
          return nodes.length === 1 && nodes[0]?.type === 'text' && (nodes[0] as { value: string }).value === text;
        },
      ),
    );
  });
});
