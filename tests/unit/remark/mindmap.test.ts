import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';
import { remarkMindmap } from '../../../src/lib/remark/mindmap';

async function transform(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkMindmap)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);
  return String(result);
}

describe('remarkMindmap', () => {
  it('wraps output in mindmap-tree root', async () => {
    const output = await transform('# Root\n\n## Branch A\n\n## Branch B\n');
    expect(output).toContain('class="mindmap-tree"');
  });

  it('sets data-depth="0" on root H1 node', async () => {
    const output = await transform('# Root\n\n## Branch\n');
    expect(output).toContain('data-depth="0"');
    expect(output).toContain('data-depth="1"');
  });

  it('renders H1 text as root content', async () => {
    const output = await transform('# My Root Topic\n\n## Branch\n');
    expect(output).toContain('My Root Topic');
  });

  it('handles list items under a heading', async () => {
    const output = await transform('# Root\n\n## Branch\n\n- leaf one\n- leaf two\n');
    expect(output).toContain('leaf one');
    expect(output).toContain('leaf two');
  });

  it('handles nested list items', async () => {
    const output = await transform('# Root\n\n## Branch\n\n- item\n    - nested\n');
    expect(output).toContain('nested');
  });

  it('produces no output for empty content', async () => {
    const output = await transform('');
    expect(output.trim()).toBe('');
  });
});
