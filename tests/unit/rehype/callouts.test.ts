import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import { rehypeCallouts } from '../../../src/lib/rehype/callouts';

// rehype plugin needs rehype pipeline, but we can test via the remark→rehype chain
// We use a simpler approach: parse HTML blockquotes directly with rehype
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';

async function transform(html: string): Promise<string> {
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeCallouts)
    .use(rehypeStringify)
    .process(html);
  return String(result);
}

describe('rehypeCallouts', () => {
  it('transforms [!note] blockquote into callout div', async () => {
    const html = '<blockquote><p>[!note] My note</p></blockquote>';
    const output = await transform(html);
    expect(output).toContain('class="callout callout-note"');
    expect(output).toContain('class="callout-title"');
    expect(output).toContain('class="callout-title-text"');
  });

  it('uses title text from the callout marker line', async () => {
    const html = '<blockquote><p>[!tip] Custom Title</p></blockquote>';
    const output = await transform(html);
    expect(output).toContain('Custom Title');
  });

  it('uses default title when none provided', async () => {
    const html = '<blockquote><p>[!warning] </p></blockquote>';
    const output = await transform(html);
    expect(output).toContain('Warning');
  });

  it('maps type aliases to canonical types', async () => {
    const aliases: [string, string][] = [
      ['seealso', 'note'],
      ['summary', 'abstract'],
      ['tldr', 'abstract'],
      ['todo', 'info'],
      ['hint', 'tip'],
      ['important', 'tip'],
      ['check', 'success'],
      ['done', 'success'],
      ['help', 'question'],
      ['faq', 'question'],
      ['caution', 'warning'],
      ['attention', 'warning'],
      ['fail', 'failure'],
      ['missing', 'failure'],
      ['error', 'danger'],
      ['cite', 'quote'],
    ];

    for (const [alias, canonical] of aliases) {
      const html = `<blockquote><p>[!${alias}] Test</p></blockquote>`;
      const output = await transform(html);
      expect(output).toContain(`callout-${canonical}`);
    }
  });

  it('renders collapsible [!type]+ as open <details>', async () => {
    const html = '<blockquote><p>[!note]+ Collapsible</p></blockquote>';
    const output = await transform(html);
    expect(output).toContain('<details');
    expect(output).toContain('open');
    expect(output).toContain('<summary');
  });

  it('renders collapsible [!type]- as closed <details>', async () => {
    const html = '<blockquote><p>[!note]- Collapsed</p></blockquote>';
    const output = await transform(html);
    expect(output).toContain('<details');
    expect(output).not.toContain('open');
    expect(output).toContain('<summary');
  });

  it('non-collapsible uses <div> not <details>', async () => {
    const html = '<blockquote><p>[!tip] Plain callout</p></blockquote>';
    const output = await transform(html);
    expect(output).not.toContain('<details');
    expect(output).not.toContain('<summary');
  });

  it('does not transform regular blockquotes without [!type]', async () => {
    const html = '<blockquote><p>Just a regular quote</p></blockquote>';
    const output = await transform(html);
    expect(output).toContain('<blockquote>');
    expect(output).not.toContain('callout');
  });

  it('includes callout-icon with aria-hidden', async () => {
    const html = '<blockquote><p>[!bug] A bug report</p></blockquote>';
    const output = await transform(html);
    expect(output).toContain('class="callout-icon"');
    expect(output).toContain('aria-hidden="true"');
  });

  it('falls back to note type for unknown callout types', async () => {
    const html = '<blockquote><p>[!unknowntype] Test</p></blockquote>';
    const output = await transform(html);
    expect(output).toContain('callout-note');
  });

  it('preserves content after the title line', async () => {
    const html = '<blockquote><p>[!tip] Title</p><p>Body content here</p></blockquote>';
    const output = await transform(html);
    expect(output).toContain('Body content here');
    expect(output).toContain('callout-content');
  });
});

describe('rehypeCallouts edge cases', () => {
  it('leaves blockquotes that are not callouts untouched', async () => {
    for (const html of [
      '<blockquote></blockquote>',
      '<blockquote><div>[!note] not a paragraph</div></blockquote>',
      '<blockquote><p></p></blockquote>',
      '<blockquote><p><em>[!note]</em></p></blockquote>',
      '<blockquote><p>just a quote</p></blockquote>',
    ]) {
      expect(await transform(html)).not.toContain('callout');
    }
  });

  it('moves text after the first line, and inline siblings, into the callout body', async () => {
    const withBody = await transform('<blockquote><p>[!tip] Title\nbody text <b>bold</b></p></blockquote>');
    expect(withBody).toContain('<p>body text <b>bold</b></p>');

    const inlineOnly = await transform('<blockquote><p>[!tip]\n<b>bold only</b></p></blockquote>');
    expect(inlineOnly).toContain('<b>bold only</b>');
    expect(inlineOnly).toContain('Tip');
  });

  it('adds no body paragraph when nothing follows the header line', async () => {
    const output = await transform('<blockquote><p>[!tip] Title\n</p></blockquote>');
    expect(output).toContain('callout-title-text');
    expect(output).not.toContain('<p></p>');
  });

  it('supports foldable callouts and unknown types', async () => {
    const closed = await transform('<blockquote><p>[!faq]- Closed</p></blockquote>');
    expect(closed).toContain('<summary');
    expect(closed).toContain('callout-question');
    const open = await transform('<blockquote><p>[!whatever]+</p></blockquote>');
    expect(open).toContain('open');
    expect(open).toContain('callout-note');
    expect(open).toContain('Whatever');
  });
});
