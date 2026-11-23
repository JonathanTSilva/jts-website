import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { rehypeTableScroll } from '../../../src/lib/rehype/table-scroll';

async function transform(html: string): Promise<string> {
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeTableScroll)
    .use(rehypeStringify)
    .process(html);
  return String(result);
}

const TABLE = '<table><thead><tr><th>A</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table>';

describe('rehypeTableScroll', () => {
  it('wraps a table in a focusable scroll container', async () => {
    const output = await transform(TABLE);
    expect(output).toBe(`<div class="table-scroll" tabindex="0">${TABLE}</div>`);
  });

  it('wraps every table, including nested ones', async () => {
    const output = await transform(`<p>a</p>${TABLE}<blockquote>${TABLE}</blockquote>`);
    expect(output.match(/class="table-scroll"/g)).toHaveLength(2);
    expect(output).toContain(`<blockquote><div class="table-scroll" tabindex="0">${TABLE}</div></blockquote>`);
  });

  it('does not wrap a table twice', async () => {
    const once = await transform(TABLE);
    const twice = await transform(once);
    expect(twice).toBe(once);
  });

  it('leaves content without tables unchanged', async () => {
    const html = '<p>No tables here.</p>';
    expect(await transform(html)).toBe(html);
  });
});
