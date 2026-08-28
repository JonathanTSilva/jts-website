import { PDFDocument, PDFName, PDFString, StandardFonts } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import type { ResolvedCv } from '../../../src/lib/cv/types';
import { verifyCvPdf } from '../../../src/lib/cv/verify';

const view = {
  profileId: 'generic', fullName: 'Jonathan Tobias da Silva', headline: 'Engineer', summary: 'Reliable systems.',
  location: 'Brazil', links: [{ kind: 'email', label: 'Email', url: 'mailto:test@example.com' }],
  experience: [{ id: 'role', employer: 'Acme', title: 'Engineer', dates: { start: { value: '2020', precision: 'year' } }, verification: 'verified', highlights: [] }],
  projects: [], publications: [], education: [], skills: [{ id: 'tools', name: 'Tools', skills: [{ id: 'ts', name: 'TypeScript' }] }],
  sections: [{ kind: 'skills' }, { kind: 'experience' }],
} satisfies ResolvedCv;

async function fixture(options: { pages?: number; size?: [number, number]; text?: string; metadata?: boolean; structure?: boolean; link?: boolean; splitWord?: boolean } = {}) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let index = 0; index < (options.pages ?? 1); index += 1) {
    const page = pdf.addPage(options.size ?? [595.28, 841.89]);
    const text = options.text ?? 'Jonathan Tobias da Silva Engineer Brazil Email Reliable systems. Skills Tools TypeScript Experience Engineer Acme';
    if (options.splitWord) {
      const before = text.slice(0, text.indexOf('TypeScript')) + 'Type';
      page.drawText(before, { x: 30, y: 800, font, size: 8 });
      page.drawText('Script Experience Engineer Acme', { x: 30 + font.widthOfTextAtSize(before, 8), y: 800, font, size: 8 });
    } else page.drawText(text, { x: 30, y: 800, font, size: 8 });
    if (options.link !== false) {
      const annotation = pdf.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [30, 780, 90, 800], Border: [0, 0, 0], A: { Type: 'Action', S: 'URI', URI: PDFString.of('mailto:test@example.com') } });
      page.node.set(PDFName.of('Annots'), pdf.context.obj([pdf.context.register(annotation)]));
    }
  }
  if (options.metadata !== false) {
    pdf.setTitle('Jonathan Tobias da Silva — CV'); pdf.setAuthor('Jonathan Tobias da Silva');
    pdf.setSubject('generic professional CV'); pdf.setKeywords(['CV', 'generic']); pdf.setCreator('jts-website'); pdf.setProducer('jts-website');
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
  it('rejects empty input', async () => { await expect(verifyCvPdf(new Uint8Array(), view)).rejects.toThrow(/empty/i); });
  it('rejects more than two pages', async () => { await expect(verifyCvPdf(await fixture({ pages: 3 }), view)).rejects.toThrow(/one or two pages/i); });
  it('rejects non-A4 pages', async () => { await expect(verifyCvPdf(await fixture({ size: [612, 792] }), view)).rejects.toThrow(/A4/i); });
  it('rejects a missing structure tree', async () => { await expect(verifyCvPdf(await fixture({ structure: false }), view)).rejects.toThrow(/structure tree/i); });
  it('rejects missing metadata', async () => { await expect(verifyCvPdf(await fixture({ metadata: false }), view)).rejects.toThrow(/metadata|title|language/i); });
  it('rejects anchors in the wrong order', async () => { await expect(verifyCvPdf(await fixture({ text: 'Experience Acme Engineer Skills TypeScript Jonathan Tobias da Silva Engineer Brazil Email Reliable systems.' }), view)).rejects.toThrow(/order/i); });
  it('rejects leaked template syntax', async () => { await expect(verifyCvPdf(await fixture({ text: 'Jonathan Tobias da Silva Engineer Brazil Email Reliable systems. Skills TypeScript Experience Acme \\csuse' }), view)).rejects.toThrow(/template syntax/i); });
  it('rejects missing link annotations', async () => { await expect(verifyCvPdf(await fixture({ link: false }), view)).rejects.toThrow(/link annotation/i); });
  it('matches a full ordered anchor split across adjacent PDF.js text items', async () => {
    await expect(verifyCvPdf(await fixture({ splitWord: true }), view)).resolves.toMatchObject({ pageCount: 1 });
  });
});
