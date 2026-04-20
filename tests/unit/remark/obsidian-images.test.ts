import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';
import { remarkObsidianImages } from '../../../src/lib/remark/obsidian-images';

async function transform(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkObsidianImages)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);
  return String(result);
}

describe('remarkObsidianImages', () => {
  it('strips size suffix from alt and adds width', async () => {
    const output = await transform('![photo|300](image.png)');
    expect(output).toContain('alt="photo"');
    expect(output).toContain('width="300"');
  });

  it('adds both width and height for WxH syntax', async () => {
    const output = await transform('![banner|800x400](hero.jpg)');
    expect(output).toContain('alt="banner"');
    expect(output).toContain('width="800"');
    expect(output).toContain('height="400"');
  });

  it('sets max-width style matching width', async () => {
    const output = await transform('![img|250](pic.png)');
    expect(output).toContain('max-width: 250px');
  });

  it('does not modify images without pipe syntax', async () => {
    const output = await transform('![plain alt](image.png)');
    expect(output).toContain('alt="plain alt"');
    expect(output).not.toContain('width=');
  });

  it('handles alt with spaces before pipe', async () => {
    const output = await transform('![my photo|200](image.png)');
    expect(output).toContain('alt="my photo"');
    expect(output).toContain('width="200"');
  });

  it('ignores non-numeric size after pipe', async () => {
    const output = await transform('![photo|large](image.png)');
    // Alt is still stripped at pipe, but no width added for non-numeric
    expect(output).toContain('alt="photo"');
    expect(output).not.toContain('width=');
  });

  it('handles empty size after pipe gracefully', async () => {
    const output = await transform('![photo|](image.png)');
    expect(output).toContain('alt="photo"');
  });
});
