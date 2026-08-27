import { describe, expect, it } from 'vitest';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import type { ResolvedCv } from '../../../src/lib/cv/types';
import { cvPrintStyles } from '../../../src/lib/cv/print-styles';
import { renderCvHtml, standardSectionHeading } from '../../../src/lib/cv/render';

const view: ResolvedCv = {
  profileId: 'generic',
  fullName: 'Ada <Lovelace>',
  headline: 'Engineer & Researcher',
  summary: 'Builds reliable "systems" <script>alert(1)</script>.',
  location: 'London & Remote',
  links: [
    { kind: 'email', label: 'Email Ada', url: 'mailto:ada@example.com' },
    { kind: 'website', label: 'Portfolio <home>', url: 'https://example.com/?a=1&b="two"' },
  ],
  experience: [{
    id: 'role', employer: 'Analytical & Co', title: 'Senior <Engineer>', location: 'London',
    dates: { start: { value: '2020-01', precision: 'month' } }, verification: 'verified',
    highlights: [{ id: 'role-result', text: 'Improved safety by 20% & reliability.' }],
  }],
  projects: [{
    id: 'project', title: 'Engine <One>', description: 'A safe & fast engine.', role: 'Lead',
    dates: { start: { value: '2019', precision: 'year' }, end: { value: '2020', precision: 'year' } },
    links: [{ kind: 'github', label: 'Source code', url: 'javascript:alert(1)' } as never],
    highlights: [{ id: 'project-result', text: 'Shipped "on time".' }],
  }],
  education: [{
    id: 'education', institution: 'University & College', credential: 'MSc <Computing>',
    dates: { start: { value: '2017', precision: 'year' }, end: { value: '2019', precision: 'year' } },
    highlights: [],
  }],
  publications: [{
    id: 'publication', title: 'Notes <on> Engines', authors: ['Ada & Charles'], venue: 'Journal "A"',
    date: { value: '2021-06', precision: 'month' }, type: 'paper', url: 'data:text/html,bad',
  }],
  skills: [{ id: 'languages', name: 'Languages & Tools', skills: [{ id: 'ts', name: 'TypeScript <ES>' }] }],
  sections: [
    { kind: 'skills' }, { kind: 'experience' }, { kind: 'projects' }, { kind: 'education' }, { kind: 'publications' },
  ],
};

interface HtmlNode {
  readonly type: string;
  readonly tagName?: string;
  readonly value?: string;
  readonly properties?: Readonly<Record<string, unknown>>;
  readonly children?: readonly HtmlNode[];
}
interface HtmlElement extends HtmlNode {
  readonly tagName: string;
  readonly properties: Readonly<Record<string, unknown>>;
}

const parse = (html: string): HtmlNode => unified().use(rehypeParse).parse(html) as HtmlNode;
const walk = (node: HtmlNode, visitor: (child: HtmlNode) => void): void => {
  visitor(node);
  node.children?.forEach(child => walk(child, visitor));
};
const elements = (tree: HtmlNode, tagName: string): HtmlElement[] => {
  const found: HtmlElement[] = [];
  walk(tree, node => {
    if (node.type === 'element' && node.tagName === tagName) found.push(node as HtmlElement);
  });
  return found;
};
const text = (node: HtmlNode): string => {
  let value = '';
  walk(node, child => { if (child.type === 'text') value += child.value ?? ''; });
  return value.trim();
};

describe('CV HTML renderer', () => {
  it('renders one complete English document with sections in resolved order', () => {
    const html = renderCvHtml(view);
    const tree = parse(html);
    const mains = elements(tree, 'main').filter(node => Array.isArray(node.properties.className) && node.properties.className.includes('cv'));

    expect(elements(tree, 'html')[0]?.properties.lang).toBe('en');
    expect(mains).toHaveLength(1);
    expect(elements(tree, 'section').map(section => text(elements(section, 'h2')[0]!)))
      .toEqual(view.sections.map(section => standardSectionHeading[section.kind]));
    expect(elements(mains[0]!, 'a').map(text)).toEqual(['Email Ada', 'Portfolio <home>']);
  });

  it('uses semantic single-column markup and leaves no empty sections', () => {
    const html = renderCvHtml({ ...view, projects: [], sections: [{ kind: 'projects' }, { kind: 'experience' }] });
    const tree = parse(html);

    expect(elements(tree, 'section').map(section => text(elements(section, 'h2')[0]!)))
      .toEqual(['Experience']);
    for (const forbidden of ['table', 'img', 'svg', 'header', 'footer']) expect(elements(tree, forbidden)).toHaveLength(0);
    expect(html).not.toMatch(/\bicon(?:-|\b)|fa[srb]?\b/i);
  });

  it('escapes all values and rejects unsafe URL schemes without losing visible labels', () => {
    const html = renderCvHtml(view);
    const tree = parse(html);
    const anchors = elements(tree, 'a');

    expect(elements(tree, 'script')).toHaveLength(0);
    expect(text(elements(tree, 'h1')[0]!)).toBe('Ada <Lovelace>');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('data:text');
    expect(anchors.map(anchor => anchor.properties.href)).toEqual([
      'mailto:ada@example.com', 'https://example.com/?a=1&b="two"',
    ]);
    expect(text(elements(tree, 'main')[0]!)).toContain('Source code');
  });

  it('does not mutate the resolved view', () => {
    const input = structuredClone(view);
    const before = structuredClone(input);
    renderCvHtml(input);
    expect(input).toEqual(before);
  });
});

describe('CV print CSS', () => {
  it('uses conservative A4 typography and forbids layout tricks', () => {
    expect(cvPrintStyles).toMatch(/@page\s*{[^}]*size:\s*A4;[^}]*margin:\s*12mm 14mm 13mm;/s);
    expect(cvPrintStyles).toMatch(/font-family:\s*['"]Geist CV['"],\s*Arial,\s*sans-serif/);
    expect(cvPrintStyles).toMatch(/body\s*{[^}]*font-size:\s*(?:9\.75|(?:1[0-9]|[2-9][0-9])(?:\.\d+)?)pt;[^}]*line-height:\s*(?:1\.3[2-9]|1\.[4-9]\d*)/s);
    expect(cvPrintStyles).toMatch(/\.cv\s*{[^}]*display:\s*block/s);
    expect(cvPrintStyles).toMatch(/section\s*{[^}]*break-inside:\s*auto/s);
    expect(cvPrintStyles).toMatch(/\.role\s*{[^}]*break-inside:\s*avoid-page/s);
    expect(cvPrintStyles).not.toMatch(/display:\s*grid|grid-template|columns?\s*:|position:\s*(?:absolute|fixed)|transform\s*:|\bzoom\s*:/i);
    expect(cvPrintStyles).not.toMatch(/font-size:\s*(?:[0-8](?:\.\d+)?|9(?:\.[0-6]\d*)?)pt/i);
  });
});
