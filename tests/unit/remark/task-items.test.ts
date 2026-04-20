import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';
import { remarkTaskItems } from '../../../src/lib/remark/task-items';

async function transform(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkTaskItems)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);
  return String(result);
}

describe('remarkTaskItems', () => {
  it('adds data-task="scheduled" for [>] marker', async () => {
    const output = await transform('- [>] Deferred task');
    expect(output).toContain('data-task="scheduled"');
    expect(output).toContain('Deferred task');
    expect(output).not.toContain('[>]');
  });

  it('adds data-task="cancelled" for [-] marker', async () => {
    const output = await transform('- [-] Cancelled task');
    expect(output).toContain('data-task="cancelled"');
    expect(output).toContain('Cancelled task');
    expect(output).not.toContain('[-]');
  });

  it('adds data-task="question" for [?] marker', async () => {
    const output = await transform('- [?] Uncertain task');
    expect(output).toContain('data-task="question"');
    expect(output).toContain('Uncertain task');
  });

  it('adds data-task="important" for [!] marker', async () => {
    const output = await transform('- [!] Important task');
    expect(output).toContain('data-task="important"');
    expect(output).toContain('Important task');
  });

  it('strips marker text from the rendered output', async () => {
    const output = await transform('- [>] Some task');
    expect(output).not.toContain('[>] ');
  });

  it('does not transform regular list items', async () => {
    const output = await transform('- Normal item');
    expect(output).not.toContain('data-task');
    expect(output).toContain('Normal item');
  });

  it('handles multiple task items in one list', async () => {
    const md = '- [>] Scheduled\n- [-] Cancelled\n- [?] Question\n- [!] Important';
    const output = await transform(md);
    expect(output).toContain('data-task="scheduled"');
    expect(output).toContain('data-task="cancelled"');
    expect(output).toContain('data-task="question"');
    expect(output).toContain('data-task="important"');
  });

  it('does not transform unknown markers like [~]', async () => {
    const output = await transform('- [~] Unknown marker');
    expect(output).not.toContain('data-task');
  });
});
