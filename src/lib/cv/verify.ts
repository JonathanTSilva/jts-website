import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { standardSectionHeading } from './render';
import type { ResolvedCv } from './types';

export interface CvPdfVerification {
  readonly pageCount: number; readonly hasStructTree: boolean; readonly text: string; readonly links: readonly string[];
  readonly pages: readonly Readonly<{ width: number; height: number }>[];
  readonly metadata: Readonly<{ title: string; author: string; subject: string; keywords: string; creator: string; producer: string; language: string }>;
}
const A4 = { width: 595.28, height: 841.89, tolerance: 2 };
const require = createRequire(import.meta.url);
const standardFontDataUrl = `${resolve(dirname(require.resolve('pdfjs-dist/package.json')), 'standard_fonts')}/`;
const safeUrl = (value: string): boolean => {
  try { const protocol = new URL(value).protocol; return protocol === 'https:' || protocol === 'mailto:'; } catch { return false; }
};
// PDF.js may split adjacent text operators inside one visual word. Keep every
// visible character and complete anchor, ignoring only normalization artifacts.
const searchable = (value: string): string => value.normalize('NFKC').replace(/[\u00ad\u200b\u2060\ufeff]/g, '').replace(/\s+/g, '');
const months = Object.freeze(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']);
const formatDate = (date: { value: string; precision: 'year' | 'month' }): string => date.precision === 'year'
  ? date.value : `${months[Number(date.value.slice(5, 7)) - 1]} ${date.value.slice(0, 4)}`;
const formatRange = (range: { start: { value: string; precision: 'year' | 'month' }; end?: { value: string; precision: 'year' | 'month' } | undefined }): string =>
  `${formatDate(range.start)} – ${range.end ? formatDate(range.end) : 'Present'}`;
const publicationCitation = (item: ResolvedCv['publications'][number]): string =>
  `${item.authors.join(', ')}. ${item.title}. ${item.venue}, ${formatDate(item.date)}. ${item.type}.`;
const orderedAnchors = (view: ResolvedCv): string[] => [
  view.fullName, view.headline, view.location, ...view.links.map(link => link.label), view.summary,
  ...view.sections.flatMap(({ kind }) => {
    const heading = standardSectionHeading[kind];
    switch (kind) {
      case 'skills': return [heading, ...view.skills.flatMap(group => [group.name, ...group.skills.map(skill => skill.name)])];
      case 'experience': return [heading, ...view.experience.flatMap(item => [item.title, item.employer, formatRange(item.dates), ...(item.location ? [item.location] : []), ...item.highlights.map(highlight => highlight.text)])];
      case 'projects': return [heading, ...view.projects.flatMap(item => [item.title, ...(item.role ? [item.role] : []), ...(item.dates ? [formatRange(item.dates)] : []), item.description, ...item.links.map(link => link.label), ...item.highlights.map(highlight => highlight.text)])];
      case 'education': return [heading, ...view.education.flatMap(item => [item.credential, item.institution, formatRange(item.dates), ...(item.location ? [item.location] : []), ...item.highlights.map(highlight => highlight.text)])];
      case 'publications': return [heading, ...view.publications.map(publicationCitation)];
    }
  }),
];
const expectedLinks = (view: ResolvedCv): ReadonlyArray<Readonly<{ label: string; url: string }>> => [
  ...view.links, ...view.projects.flatMap(project => project.links),
  ...view.publications.flatMap(item => item.url ? [{ label: publicationCitation(item), url: item.url }] : []),
];
export const assertValidExtractedCvText = (text: string): void => {
  assert(text.trim().length > 0, 'PDF must contain selectable text');
  assert(!/\\csuse|\{\{[^}]+\}\}|<%[=-]?|�/.test(text), 'PDF contains leaked template syntax or replacement glyphs');
};

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
    const pageText: string[] = []; const links: string[] = []; const pages: Array<{ width: number; height: number }> = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber); const viewport = page.getViewport({ scale: 1 });
      pages.push({ width: viewport.width, height: viewport.height });
      assert(Math.abs(viewport.width - A4.width) <= A4.tolerance && Math.abs(viewport.height - A4.height) <= A4.tolerance, 'PDF pages must be A4 portrait');
      const content = await page.getTextContent();
      pageText.push(content.items.flatMap(item => 'str' in item ? [item.str] : []).join(' '));
      for (const annotation of await page.getAnnotations()) {
        if (annotation.subtype !== 'Link') continue;
        const url = annotation.url ?? annotation.unsafeUrl;
        assert(typeof url === 'string' && safeUrl(url), 'PDF contains an invalid link annotation'); links.push(url);
      }
    }
    const text = pageText.join(' ').replace(/\s+/g, ' ').trim();
    assertValidExtractedCvText(text);
    const searchableText = searchable(text); let cursor = 0;
    for (const anchor of orderedAnchors(view)) {
      const normalizedAnchor = searchable(anchor); const index = searchableText.indexOf(normalizedAnchor, cursor);
      assert(index >= 0, `PDF is missing required content or ordered anchor: ${anchor}`);
      cursor = index + normalizedAnchor.length;
    }
    for (const expected of expectedLinks(view)) {
      assert(searchableText.includes(searchable(expected.label)), `PDF is missing visible link label: ${expected.label}`);
      assert(safeUrl(expected.url), `CV model contains an invalid link URL: ${expected.url}`);
      const expectedUrl = new URL(expected.url).href;
      assert(links.some(link => new URL(link).href === expectedUrl), `PDF is missing link annotation for ${expected.label}`);
    }
    return { pageCount: pdf.numPages, hasStructTree, text, links, pages, metadata: {
      title: String(info.Title), author: String(info.Author), subject: String(info.Subject), keywords: String(info.Keywords),
      creator: String(info.Creator), producer: String(info.Producer), language: String(info.Language),
    } };
  } finally { await loadingTask.destroy(); }
};
