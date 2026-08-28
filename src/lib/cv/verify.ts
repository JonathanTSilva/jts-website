import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { standardSectionHeading } from './render';
import type { ResolvedCv } from './types';

export interface CvPdfVerification {
  readonly pageCount: number; readonly hasStructTree: boolean; readonly text: string; readonly links: readonly string[];
  readonly pages: readonly Readonly<{ width: number; height: number }>[];
  readonly metadata: Readonly<{ title: string; author: string; subject: string; keywords: string; creator: string; producer: string; language: string; creationDate: string; modificationDate: string }>;
}
const A4 = { width: 595.28, height: 841.89, tolerance: 2 };
const require = createRequire(import.meta.url);
const standardFontDataUrl = `${resolve(dirname(require.resolve('pdfjs-dist/package.json')), 'standard_fonts')}/`;
const safeUrl = (value: string): boolean => {
  try { const protocol = new URL(value).protocol; return protocol === 'https:' || protocol === 'mailto:'; } catch { return false; }
};
export interface PdfTextFragment { readonly page: number; readonly text: string; readonly rect: readonly [number, number, number, number] }
export interface TextFieldMatch { readonly field: string; readonly page: number; readonly rects: readonly (readonly [number, number, number, number])[]; readonly tokenStart: number; readonly tokenEnd: number }
interface Token { readonly value: string; readonly page: number; readonly rect: readonly [number, number, number, number]; readonly item: number }
const words = (value: string): string[] => value.normalize('NFKC').replace(/[\u00ad\u200b\u2060\ufeff]/g, '').match(/[\p{L}\p{N}+#]+/gu) ?? [];
const tokenizeFragments = (items: readonly PdfTextFragment[]): Token[] => items.flatMap((item, itemIndex) => {
  const matches = [...item.text.normalize('NFKC').matchAll(/[\p{L}\p{N}+#]+/gu)];
  const width = item.rect[2] - item.rect[0]; const length = Math.max(item.text.length, 1);
  return matches.map(match => ({
    value: match[0], page: item.page, item: itemIndex,
    rect: [item.rect[0] + width * (match.index / length), item.rect[1], item.rect[0] + width * ((match.index + match[0].length) / length), item.rect[3]] as const,
  }));
});
const joinable = (left: Token, right: Token): boolean => left.item !== right.item && left.page === right.page
  && Math.abs(left.rect[1] - right.rect[1]) <= 2 && Math.abs(right.rect[0] - left.rect[2]) <= 2;
export const matchOrderedTextFields = (items: readonly PdfTextFragment[], fields: readonly string[]): TextFieldMatch[] => {
  const tokens = tokenizeFragments(items); const results: TextFieldMatch[] = []; let cursor = 0;
  for (const field of fields) {
    const expected = words(field); assert(expected.length > 0, `Expected PDF field must contain tokens: ${field}`);
    let found: { start: number; end: number } | undefined;
    for (let start = cursor; start < tokens.length && !found; start += 1) {
      let position = start; let valid = true;
      for (const expectedToken of expected) {
        let combined = ''; const tokenStart = position;
        while (position < tokens.length && combined.length < expectedToken.length) {
          if (position > tokenStart && !joinable(tokens[position - 1]!, tokens[position]!)) break;
          combined += tokens[position]!.value; position += 1;
        }
        if (combined !== expectedToken) { valid = false; break; }
      }
      if (valid) found = { start, end: position - 1 };
    }
    assert(found, `PDF is missing required content or ordered anchor: ${field}`);
    const matched = tokens.slice(found.start, found.end + 1);
    results.push({ field, page: matched[0]!.page, rects: matched.map(token => token.rect), tokenStart: found.start, tokenEnd: found.end });
    cursor = found.end + 1;
  }
  return results;
};
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
    assert(info.Keywords === `CV ${view.profileId} ${view.headline}`, 'PDF keywords metadata is missing or invalid');
    assert(info.Creator === 'jts-website' && info.Producer === 'jts-website', 'PDF creator or producer metadata is missing or invalid');
    assert(info.Language === 'en-US', 'PDF language metadata must be en-US');
    assert(info.CreationDate === 'D:20000101000000Z' && info.ModDate === 'D:20000101000000Z', 'PDF dates must be deterministic');
    const pageText: string[] = []; const fragments: PdfTextFragment[] = []; const links: string[] = [];
    const annotations: Array<{ page: number; url: string; rect: readonly [number, number, number, number] }> = [];
    const pages: Array<{ width: number; height: number }> = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber); const viewport = page.getViewport({ scale: 1 });
      pages.push({ width: viewport.width, height: viewport.height });
      assert(Math.abs(viewport.width - A4.width) <= A4.tolerance && Math.abs(viewport.height - A4.height) <= A4.tolerance, 'PDF pages must be A4 portrait');
      const content = await page.getTextContent();
      pageText.push(content.items.flatMap(item => 'str' in item ? [item.str] : []).join(' '));
      for (const item of content.items) if ('str' in item && item.str.trim()) {
        const x = item.transform[4]; const baseline = item.transform[5]; const height = Math.max(item.height, Math.abs(item.transform[3]));
        fragments.push({ page: pageNumber, text: item.str, rect: [x, baseline - height * 0.25, x + item.width, baseline + height] });
      }
      for (const annotation of await page.getAnnotations()) {
        if (annotation.subtype !== 'Link') continue;
        const url = annotation.url ?? annotation.unsafeUrl;
        assert(typeof url === 'string' && safeUrl(url), 'PDF contains an invalid link annotation');
        const rect = annotation.rect as [number, number, number, number];
        assert(rect[2] > rect[0] && rect[3] > rect[1], 'PDF link annotation must have nonzero area');
        links.push(url); annotations.push({ page: pageNumber, url, rect });
      }
    }
    const text = pageText.join(' ').replace(/\s+/g, ' ').trim();
    assertValidExtractedCvText(text);
    matchOrderedTextFields(fragments, orderedAnchors(view));
    const linkExpectations = expectedLinks(view); const linkMatches = matchOrderedTextFields(fragments, linkExpectations.map(link => link.label));
    const overlaps = (left: readonly number[], right: readonly number[]): boolean => Math.min(left[2]!, right[2]!) > Math.max(left[0]!, right[0]!)
      && Math.min(left[3]!, right[3]!) > Math.max(left[1]!, right[1]!);
    linkExpectations.forEach((expected, index) => {
      assert(safeUrl(expected.url), `CV model contains an invalid link URL: ${expected.url}`);
      const expectedUrl = new URL(expected.url).href;
      const match = linkMatches[index]!;
      assert(annotations.some(annotation => annotation.page === match.page && new URL(annotation.url).href === expectedUrl
        && match.rects.some(rect => overlaps(rect, annotation.rect))), `PDF is missing geometrically associated link annotation for ${expected.label}`);
    });
    return { pageCount: pdf.numPages, hasStructTree, text, links, pages, metadata: {
      title: String(info.Title), author: String(info.Author), subject: String(info.Subject), keywords: String(info.Keywords),
      creator: String(info.Creator), producer: String(info.Producer), language: String(info.Language),
      creationDate: String(info.CreationDate), modificationDate: String(info.ModDate),
    } };
  } finally { await loadingTask.destroy(); }
};
