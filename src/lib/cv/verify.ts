import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { standardSectionHeading } from './render';
import type { ResolvedCv } from './types';

export interface CvPdfVerification { readonly pageCount: number; readonly hasStructTree: boolean; readonly text: string; readonly links: readonly string[] }

const A4 = { width: 595.28, height: 841.89, tolerance: 2 };
const require = createRequire(import.meta.url);
const standardFontDataUrl = `${resolve(dirname(require.resolve('pdfjs-dist/package.json')), 'standard_fonts')}/`;
const safeUrl = (value: string): boolean => {
  try { const protocol = new URL(value).protocol; return protocol === 'https:' || protocol === 'mailto:'; } catch { return false; }
};
// PDF.js may expose adjacent text-showing operators as separate items even when
// they form one visual word. Search a Unicode-normalized, whitespace-insensitive
// representation while retaining every character and the complete anchor.
const searchable = (value: string): string => value.normalize('NFKC').replace(/[\u00ad\u200b\u2060\ufeff]/g, '').replace(/\s+/g, '');
const orderedAnchors = (view: ResolvedCv): string[] => [
  view.fullName, view.headline, view.location, ...view.links.map(link => link.label), view.summary,
  ...view.sections.flatMap(({ kind }) => {
    const heading = standardSectionHeading[kind];
    switch (kind) {
      case 'skills': return [heading, ...view.skills.flatMap(group => [group.name, ...group.skills.map(skill => skill.name)])];
      case 'experience': return [heading, ...view.experience.flatMap(item => [item.title, item.employer, ...item.highlights.map(highlight => highlight.text)])];
      case 'projects': return [heading, ...view.projects.flatMap(item => [item.title, item.description, ...item.highlights.map(highlight => highlight.text)])];
      case 'education': return [heading, ...view.education.flatMap(item => [item.credential, item.institution, ...item.highlights.map(highlight => highlight.text)])];
      case 'publications': return [heading, ...view.publications.flatMap(item => [item.title, item.venue])];
    }
  }),
];

export const verifyCvPdf = async (bytes: Uint8Array, view: ResolvedCv): Promise<CvPdfVerification> => {
  assert(bytes.byteLength > 0, 'PDF data must not be empty');
  const loadingTask = getDocument({ data: new Uint8Array(bytes), standardFontDataUrl });
  try {
    const pdf = await loadingTask.promise;
      assert(pdf.numPages >= 1 && pdf.numPages <= 2, 'PDF must contain one or two pages');
      const metadata = await pdf.getMetadata();
      const hasStructTree = (metadata as typeof metadata & { hasStructTree?: boolean }).hasStructTree === true;
      assert(hasStructTree, 'PDF must contain a structure tree');
      const info = metadata.info as Record<string, unknown>;
      assert(info.Title === `${view.fullName} — CV`, 'PDF title metadata is missing or invalid');
      assert(info.Author === view.fullName, 'PDF author metadata is missing or invalid');
      assert(info.Subject === `${view.profileId} professional CV`, 'PDF subject metadata is missing or invalid');
      assert(typeof info.Keywords === 'string' && info.Keywords.includes(view.profileId), 'PDF keywords metadata is missing or invalid');
      assert(info.Creator === 'jts-website' && info.Producer === 'jts-website', 'PDF creator or producer metadata is missing or invalid');
      assert(info.Language === 'en-US', 'PDF language metadata must be en-US');

      const pageText: string[] = [];
      const links: string[] = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        assert(Math.abs(viewport.width - A4.width) <= A4.tolerance && Math.abs(viewport.height - A4.height) <= A4.tolerance, 'PDF pages must be A4 portrait');
        const content = await page.getTextContent();
        pageText.push(content.items.flatMap(item => 'str' in item ? [item.str] : []).join(' '));
        const annotations = await page.getAnnotations();
        for (const annotation of annotations) {
          if (annotation.subtype !== 'Link') continue;
          const url = annotation.url ?? annotation.unsafeUrl;
          assert(typeof url === 'string' && safeUrl(url), 'PDF contains an invalid link annotation');
          links.push(url);
        }
      }
      const text = pageText.join(' ').replace(/\s+/g, ' ').trim();
      assert(text.length > 0, 'PDF must contain selectable text');
      assert(!/\\csuse|\{\{[^}]+\}\}|<%[=-]?|�/.test(text), 'PDF contains leaked template syntax or replacement glyphs');
      const searchableText = searchable(text);
      let cursor = -1;
      for (const anchor of orderedAnchors(view)) {
        const index = searchableText.indexOf(searchable(anchor), cursor + 1);
        assert(index >= 0, `PDF is missing required content or ordered anchor: ${anchor}`);
        assert(index > cursor, `PDF anchors are not in expected order: ${anchor}`);
        cursor = index;
      }
      for (const expected of view.links) {
        assert(searchableText.includes(searchable(expected.label)), `PDF is missing visible contact label: ${expected.label}`);
        assert(safeUrl(expected.url), `CV model contains an invalid contact URL: ${expected.url}`);
        const expectedUrl = new URL(expected.url).href;
        assert(links.some(link => new URL(link).href === expectedUrl), `PDF is missing link annotation for ${expected.label}`);
      }
      return { pageCount: pdf.numPages, hasStructTree, text, links };
  } finally { await loadingTask.destroy(); }
};
