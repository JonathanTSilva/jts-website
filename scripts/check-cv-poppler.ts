import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const execFile = promisify(execFileCallback);

const orderedAnchors = Object.freeze([
  'Jonathan Tobias da Silva',
  'Skills',
  'Experience',
  'Nova Smar',
  'Education',
  'University of São Paulo',
  'Projects',
  'Publications',
]);

export const validatePopplerOutput = (info: string, text: string): void => {
  const pages = Number(info.match(/^Pages:\s+(\d+)$/m)?.[1]);
  if (!Number.isInteger(pages) || pages < 1 || pages > 2) {
    throw new Error(`CV must contain one or two pages; Poppler reported ${Number.isFinite(pages) ? pages : 'an unknown count'}`);
  }
  const sizes = [...info.matchAll(/^Page(?:\s+\d+)? size:\s+([\d.]+) x ([\d.]+) pts(?: \(A4\))?$/gm)];
  if (!sizes.length || sizes.some(match => Math.abs(Number(match[1]) - 595.28) > 1 || Math.abs(Number(match[2]) - 841.89) > 1)) {
    throw new Error('CV pages must use A4 portrait dimensions');
  }
  if (text.includes('\\csuse')) throw new Error('CV extraction contains a LaTeX template artifact: \\csuse');
  if (text.includes('\uFFFD')) throw new Error('CV extraction contains a replacement glyph');

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
    const [{ stdout: info }, { stdout: text }] = await Promise.all([
      execFile('pdfinfo', [pdfPath], { encoding: 'utf8' }),
      execFile('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8' }),
    ]);
    validatePopplerOutput(info, text);
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
