import { PDFDocument, PDFName, PDFString, StandardFonts } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import type { ResolvedCv } from '../../../src/lib/cv/types';
import { assertValidExtractedCvText, matchOrderedTextFields, verifyCvPdf } from '../../../src/lib/cv/verify';

const view = {
  profileId: 'generic', fullName: 'Jonathan Tobias da Silva', headline: 'Engineer', summary: 'Reliable systems.',
  location: 'Brazil', links: [{ kind: 'email', label: 'Email', url: 'mailto:test@example.com' }],
  experience: [{ id: 'role', employer: 'Acme', title: 'Engineer', dates: { start: { value: '2020', precision: 'year' } }, verification: 'verified', highlights: [] }],
  projects: [], publications: [], education: [], skills: [{ id: 'tools', name: 'Tools', skills: [{ id: 'ts', name: 'TypeScript' }] }],
  sections: [{ kind: 'skills' }, { kind: 'experience' }],
} satisfies ResolvedCv;
const linkedView = {
  ...view,
  projects: [{ id: 'project', title: 'Project Alpha', role: 'Lead', description: 'Project summary.', links: [{ kind: 'github', label: 'Project source', url: 'https://example.com/project' }], highlights: [] }],
  publications: [{ id: 'paper', title: 'Paper Alpha', authors: ['Ada Author'], venue: 'Journal', date: { value: '2024', precision: 'year' }, type: 'paper', url: 'https://example.com/paper' }],
  sections: [{ kind: 'skills' }, { kind: 'experience' }, { kind: 'projects' }, { kind: 'publications' }],
} satisfies ResolvedCv;
const twoLinkView = { ...view, links: [
  { kind: 'website', label: 'Link One', url: 'https://example.com/one' },
  { kind: 'github', label: 'Link Two', url: 'https://example.com/two' },
] } satisfies ResolvedCv;

async function fixture(options: { pages?: number; size?: [number, number]; text?: string; metadata?: boolean; structure?: boolean; link?: boolean; splitWord?: boolean; urls?: string[]; labelsForRects?: string[]; zeroArea?: boolean } = {}) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let index = 0; index < (options.pages ?? 1); index += 1) {
    const page = pdf.addPage(options.size ?? [595.28, 841.89]);
    const text = options.text ?? 'Jonathan Tobias da Silva Engineer Brazil Email Reliable systems. Skills Tools TypeScript Experience Engineer Acme 2020 – Present';
    if (options.splitWord) {
      const before = text.slice(0, text.indexOf('TypeScript')) + 'Type';
      page.drawText(before, { x: 30, y: 800, font, size: 3 });
      page.drawText('Script Experience Engineer Acme 2020 – Present', { x: 30 + font.widthOfTextAtSize(before, 3), y: 800, font, size: 3 });
    } else page.drawText(text, { x: 30, y: 800, font, size: 3 });
    if (options.link !== false) {
      const annotations = (options.urls ?? ['mailto:test@example.com']).map((url, urlIndex) => {
        const label = (options.labelsForRects ?? ['Email'])[urlIndex] ?? 'Email'; const labelIndex = text.indexOf(label);
        const x = 30 + font.widthOfTextAtSize(text.slice(0, Math.max(labelIndex, 0)), 3); const width = font.widthOfTextAtSize(label, 3);
        const rect = options.zeroArea ? [x, 800, x, 800] : [x, 798, x + width, 805];
        return pdf.context.register(pdf.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: rect, Border: [0, 0, 0], A: { Type: 'Action', S: 'URI', URI: PDFString.of(url) } }));
      });
      page.node.set(PDFName.of('Annots'), pdf.context.obj(annotations));
    }
  }
  if (options.metadata !== false) {
    pdf.setTitle('Jonathan Tobias da Silva — CV'); pdf.setAuthor('Jonathan Tobias da Silva');
    pdf.setSubject('generic professional CV'); pdf.setKeywords(['CV', 'generic', 'Engineer']); pdf.setCreator('jts-website'); pdf.setProducer('jts-website');
    const date = new Date('2000-01-01T00:00:00.000Z'); pdf.setCreationDate(date); pdf.setModificationDate(date);
    pdf.catalog.set(PDFName.of('Lang'), PDFString.of('en-US'));
  }
  if (options.structure !== false) {
    const root = pdf.context.obj({ Type: 'StructTreeRoot', K: [] });
    pdf.catalog.set(PDFName.of('StructTreeRoot'), pdf.context.register(root));
    pdf.catalog.set(PDFName.of('MarkInfo'), pdf.context.obj({ Marked: true }));
  }
  return pdf.save({ useObjectStreams: false });
}

describe('CV PDF verifier', () => {
  it('matches split adjacent items as one token without accepting substrings inside larger tokens', () => {
    const items = [
      { page: 1, text: 'Type', rect: [0, 0, 20, 10] as const }, { page: 1, text: 'Script', rect: [20, 0, 45, 10] as const },
      { page: 1, text: 'testament', rect: [50, 0, 90, 10] as const },
    ];
    expect(matchOrderedTextFields(items, ['TypeScript'])).toHaveLength(1);
    expect(() => matchOrderedTextFields(items, ['test'])).toThrow(/test/);
  });
  it('consumes duplicate anchors deterministically instead of reusing one occurrence', () => {
    const items = [{ page: 1, text: 'Engineer Engineer', rect: [0, 0, 100, 10] as const }];
    const matches = matchOrderedTextFields(items, ['Engineer', 'Engineer']);
    expect(matches[1]!.tokenStart).toBeGreaterThan(matches[0]!.tokenEnd);
    expect(() => matchOrderedTextFields([{ page: 1, text: 'Engineer', rect: [0, 0, 50, 10] as const }], ['Engineer', 'Engineer'])).toThrow(/Engineer/);
  });
  it('rejects empty input', async () => { await expect(verifyCvPdf(new Uint8Array(), view)).rejects.toThrow(/empty/i); });
  it('rejects more than two pages', async () => { await expect(verifyCvPdf(await fixture({ pages: 3 }), view)).rejects.toThrow(/one or two pages/i); });
  it('rejects non-A4 pages', async () => { await expect(verifyCvPdf(await fixture({ size: [612, 792] }), view)).rejects.toThrow(/A4/i); });
  it('rejects a missing structure tree', async () => { await expect(verifyCvPdf(await fixture({ structure: false }), view)).rejects.toThrow(/structure tree/i); });
  it('rejects missing metadata', async () => { await expect(verifyCvPdf(await fixture({ metadata: false }), view)).rejects.toThrow(/metadata|title|language/i); });
  it('rejects anchors in the wrong order', async () => { await expect(verifyCvPdf(await fixture({ text: 'Experience Acme 2020 – Present Engineer Skills TypeScript Jonathan Tobias da Silva Engineer Brazil Email Reliable systems.' }), view)).rejects.toThrow(/ordered anchor/i); });
  it('rejects leaked template syntax', async () => { await expect(verifyCvPdf(await fixture({ text: 'Jonathan Tobias da Silva Engineer Brazil Email Reliable systems. Skills Tools TypeScript Experience Engineer Acme 2020 – Present \\csuse' }), view)).rejects.toThrow(/template syntax/i); });
  it('rejects replacement glyphs', () => { expect(() => assertValidExtractedCvText('Jonathan � Silva')).toThrow(/replacement glyph/i); });
  it('rejects an invalid link annotation', async () => { await expect(verifyCvPdf(await fixture({ urls: ['javascript:alert(1)'] }), view)).rejects.toThrow(/invalid link annotation/i); });
  it('rejects missing identity content', async () => { await expect(verifyCvPdf(await fixture({ text: 'Engineer Brazil Email Reliable systems. Skills Tools TypeScript Experience Engineer Acme 2020 – Present' }), view)).rejects.toThrow(/Jonathan Tobias/i); });
  it('rejects a missing section heading', async () => { await expect(verifyCvPdf(await fixture({ text: 'Jonathan Tobias da Silva Engineer Brazil Email Reliable systems. Tools TypeScript Experience Engineer Acme 2020 – Present' }), view)).rejects.toThrow(/Skills/i); });
  it('rejects missing profile-required content', async () => { await expect(verifyCvPdf(await fixture({ text: 'Jonathan Tobias da Silva Engineer Brazil Email Reliable systems. Skills Tools Experience Engineer Acme 2020 – Present' }), view)).rejects.toThrow(/TypeScript/i); });
  it('rejects missing link annotations', async () => { await expect(verifyCvPdf(await fixture({ link: false }), view)).rejects.toThrow(/link annotation/i); });
  it('matches a full ordered anchor split across adjacent PDF.js text items', async () => {
    await expect(verifyCvPdf(await fixture({ splitWord: true }), view)).resolves.toMatchObject({ pageCount: 1 });
  });
  it('requires project link annotations', async () => {
    const text = 'Jonathan Tobias da Silva Engineer Brazil Email Reliable systems. Skills Tools TypeScript Experience Engineer Acme 2020 – Present Projects Project Alpha Lead Project summary. Project source Publications Ada Author. Paper Alpha. Journal, 2024. paper.';
    await expect(verifyCvPdf(await fixture({ text, urls: ['mailto:test@example.com'] }), linkedView)).rejects.toThrow(/Project source/i);
  });
  it('requires publication link annotations', async () => {
    const text = 'Jonathan Tobias da Silva Engineer Brazil Email Reliable systems. Skills Tools TypeScript Experience Engineer Acme 2020 – Present Projects Project Alpha Lead Project summary. Project source Publications Ada Author. Paper Alpha. Journal, 2024. paper.';
    await expect(verifyCvPdf(await fixture({ text, urls: ['mailto:test@example.com', 'https://example.com/project'], labelsForRects: ['Email', 'Project source'] }), linkedView)).rejects.toThrow(/Ada Author/i);
  });
  it('rejects swapped URL annotations even when both URLs exist', async () => {
    const text = 'Jonathan Tobias da Silva Engineer Brazil Link One Link Two Reliable systems. Skills Tools TypeScript Experience Engineer Acme 2020 – Present';
    await expect(verifyCvPdf(await fixture({ text, urls: ['https://example.com/two', 'https://example.com/one'], labelsForRects: ['Link One', 'Link Two'] }), twoLinkView)).rejects.toThrow(/Link (?:One|Two)/i);
  });
  it('rejects a correctly targeted URL annotation placed over unrelated text', async () => {
    await expect(verifyCvPdf(await fixture({ labelsForRects: ['Jonathan Tobias'] }), view)).rejects.toThrow(/Email/i);
  });
  it('rejects zero-area link annotations', async () => {
    await expect(verifyCvPdf(await fixture({ zeroArea: true }), view)).rejects.toThrow(/nonzero area/i);
  });
});
