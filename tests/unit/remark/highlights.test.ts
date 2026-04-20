import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';
import { remarkHighlights } from '../../../src/lib/remark/highlights';

async function transform(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkHighlights)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);
  return String(result);
}

describe('remarkHighlights', () => {
  it('transforms ==text== into <mark>text</mark>', async () => {
    const output = await transform('This is ==highlighted== text');
    expect(output).toContain('<mark>highlighted</mark>');
  });

  it('preserves surrounding text', async () => {
    const output = await transform('before ==middle== after');
    expect(output).toContain('before ');
    expect(output).toContain('<mark>middle</mark>');
    expect(output).toContain(' after');
  });

  it('handles multiple highlights in one line', async () => {
    const output = await transform('==one== and ==two==');
    expect(output).toContain('<mark>one</mark>');
    expect(output).toContain('<mark>two</mark>');
  });

  it('does not transform single = signs', async () => {
    const output = await transform('a = b');
    expect(output).not.toContain('<mark>');
  });

  it('does not transform empty ==== markers', async () => {
    const output = await transform('text ==== more text');
    expect(output).not.toContain('<mark></mark>');
  });

  it('leaves regular text untouched', async () => {
    const output = await transform('No highlights here');
    expect(output).toContain('No highlights here');
    expect(output).not.toContain('<mark>');
  });

  it('handles highlight at start of line', async () => {
    const output = await transform('==start== of line');
    expect(output).toContain('<mark>start</mark>');
  });

  it('handles highlight at end of line', async () => {
    const output = await transform('end of ==line==');
    expect(output).toContain('<mark>line</mark>');
  });
});
