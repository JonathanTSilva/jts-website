import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { career } from '../src/content/portfolio/career';
import { cvProfiles } from '../src/lib/cv/profiles';
import { standardSectionHeading } from '../src/lib/cv/render';
import { resolveCv } from '../src/lib/cv/resolve';
import type { ResolvedCv } from '../src/lib/cv/types';

const execFile = promisify(execFileCallback);

export interface PopplerExpectations { readonly headings: readonly string[]; readonly anchors: readonly string[] }

// Derived from the career data so content edits never require touching this check.
export const popplerExpectations = (view: ResolvedCv): PopplerExpectations => {
  const sections = view.sections.map(({ kind }) => kind).filter(kind => kind === 'skills' ? view.skills.length > 0 : view[kind].length > 0);
  return {
    headings: sections.map(kind => standardSectionHeading[kind]),
    anchors: [view.fullName, ...sections.flatMap(kind => {
      if (kind === 'experience') return [view.experience[0]!.employer];
      if (kind === 'education') return [view.education[0]!.institution];
      return [];
    })],
  };
};

export const validatePopplerOutput = (
  info: string,
  text: string,
  { headings: standardHeadings, anchors: orderedAnchors }: PopplerExpectations = popplerExpectations(resolveCv(career, cvProfiles.generic)),
): void => {
  const pages = Number(info.match(/^Pages:\s+(\d+)$/m)?.[1]);
  if (!Number.isInteger(pages) || pages < 1 || pages > 2) {
    throw new Error(`CV must contain one or two pages; Poppler reported ${Number.isFinite(pages) ? pages : 'an unknown count'}`);
  }
  const sizes = [...info.matchAll(/^Page\s+\d+ size:\s+([\d.]+) x ([\d.]+) pts(?: \(A4\))?$/gm)];
  if (sizes.length !== pages) {
    throw new Error(`Poppler must report an A4 size record for every page; expected ${pages} size records but found ${sizes.length}`);
  }
  if (sizes.some(match => Math.abs(Number(match[1]) - 595.28) > 1 || Math.abs(Number(match[2]) - 841.89) > 1)) {
    throw new Error('CV pages must use A4 portrait dimensions');
  }
  if (text.includes('\\csuse')) throw new Error('CV extraction contains a LaTeX template artifact: \\csuse');
  if (text.includes('\uFFFD')) throw new Error('CV extraction contains a replacement glyph');

  const lines = text.split(/\r?\n/).map(line => line.trim());
  let previousHeading = -1;
  for (const heading of standardHeadings) {
    const index = lines.indexOf(heading);
    if (index < 0) throw new Error(`CV extraction is missing required standalone heading: ${heading}`);
    if (index <= previousHeading) throw new Error(`CV extraction heading order is invalid at: ${heading}`);
    previousHeading = index;
  }

  let previous = -1;
  for (const anchor of orderedAnchors) {
    const index = text.indexOf(anchor);
    if (index < 0) throw new Error(`CV extraction is missing required heading or anchor: ${anchor}`);
    if (index <= previous) throw new Error(`CV extraction order is invalid at anchor: ${anchor}`);
    previous = index;
  }
};

export const checkCvWithPoppler = async (pdfPath: string): Promise<void> => {
  try {
    const { stdout: summary } = await execFile('pdfinfo', [pdfPath], { encoding: 'utf8' });
    const pages = Number(summary.match(/^Pages:\s+(\d+)$/m)?.[1]);
    if (!Number.isInteger(pages) || pages < 1 || pages > 2) {
      throw new Error(`CV must contain one or two pages; Poppler reported ${Number.isFinite(pages) ? pages : 'an unknown count'}`);
    }
    const [{ stdout: pageInfo }, { stdout: text }] = await Promise.all([
      execFile('pdfinfo', ['-f', '1', '-l', String(pages), pdfPath], { encoding: 'utf8' }),
      execFile('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8' }),
    ]);
    validatePopplerOutput(`${summary}\n${pageInfo}`, text);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error('Poppler is required for this check. Install poppler-utils and try again.', { cause: error });
    }
    throw error;
  }
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  const pdfPath = process.argv[2];
  if (!pdfPath) throw new Error('Usage: check-cv-poppler.ts <pdf-path>');
  await checkCvWithPoppler(resolve(pdfPath));
  console.log(`Poppler CV check passed: ${pdfPath}`);
}
