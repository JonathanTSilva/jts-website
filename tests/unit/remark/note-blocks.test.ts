import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';
import { remarkNoteBlocks } from '../../../src/lib/remark/note-blocks';

async function transform(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkNoteBlocks)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);
  return String(result);
}

describe('remarkNoteBlocks', () => {
  it('transforms note-blue fenced block into styled div', async () => {
    const output = await transform('```note-blue\nImportant info\n```');
    expect(output).toContain('class="note-block note-blue"');
    expect(output).toContain('Important info');
  });

  it('transforms note-red fenced block', async () => {
    const output = await transform('```note-red\nWarning!\n```');
    expect(output).toContain('class="note-block note-red"');
  });

  it('transforms note-green-background with bg class', async () => {
    const output = await transform('```note-green-background\nSuccess\n```');
    expect(output).toContain('class="note-block note-green note-bg"');
  });

  it('transforms ad-tip admonition', async () => {
    const output = await transform('```ad-tip\nA tip for you\n```');
    expect(output).toContain('class="note-block note-tip"');
    expect(output).toContain('A tip for you');
  });

  it('transforms ad-warning admonition', async () => {
    const output = await transform('```ad-warning\nBe careful\n```');
    expect(output).toContain('class="note-block note-warning"');
  });

  it('transforms ad-note admonition', async () => {
    const output = await transform('```ad-note\nTake note\n```');
    expect(output).toContain('class="note-block note-note"');
  });

  it('transforms ad-info admonition', async () => {
    const output = await transform('```ad-info\nFor your info\n```');
    expect(output).toContain('class="note-block note-info"');
  });

  it('transforms ad-danger admonition', async () => {
    const output = await transform('```ad-danger\nDanger zone\n```');
    expect(output).toContain('class="note-block note-danger"');
  });

  it('ignores unknown note-COLOR variants', async () => {
    const output = await transform('```note-magenta\nNope\n```');
    expect(output).not.toContain('note-block');
  });

  it('ignores regular code blocks', async () => {
    const output = await transform('```javascript\nconst x = 1;\n```');
    expect(output).not.toContain('note-block');
  });

  it('escapes HTML entities in content', async () => {
    const output = await transform('```note-blue\n<script>alert("xss")</script>\n```');
    expect(output).toContain('&lt;script&gt;');
    expect(output).not.toContain('<script>');
  });

  it('handles all valid NOTE_COLORS', async () => {
    const colors = ['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'];
    for (const color of colors) {
      const output = await transform(`\`\`\`note-${color}\ncontent\n\`\`\``);
      expect(output).toContain(`note-${color}`);
    }
  });

  it('preserves multiline content', async () => {
    const output = await transform('```note-blue\nLine one\nLine two\nLine three\n```');
    expect(output).toContain('Line one');
    expect(output).toContain('Line two');
    expect(output).toContain('Line three');
  });
});
