import { lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { career } from '../../content/portfolio/career';
import { getCvQualityWarnings } from '../career/quality';
import { getCvOutput } from './output-policy';
import { normalizePdfMetadata, renderPdfBytes } from './pdf';
import { cvProfiles } from './profiles';
import { renderCvHtml } from './render';
import { resolveCv } from './resolve';
import type { CvProfileId } from './types';
import { verifyCvPdf, type CvPdfVerification } from './verify';

type GenerateRequest =
  | Readonly<{ profileId: 'generic'; mode: 'public' }>
  | Readonly<{ profileId: Exclude<CvProfileId, 'generic'>; mode: 'private' }>
  | Readonly<{ profileId: CvProfileId; mode: 'test'; testRoot: string }>;
export interface GenerateCvResult { readonly output: string; readonly verification: CvPdfVerification; readonly warnings: ReturnType<typeof getCvQualityWarnings> }

const assertSafeDestination = async (destination: string): Promise<void> => {
  try { if ((await lstat(destination)).isSymbolicLink()) throw new Error('CV output destination must not be a symlink or redirect'); }
  catch (error) { if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error; }
};

export const generateCv = async (request: GenerateRequest): Promise<GenerateCvResult> => {
  const destination = getCvOutput(request);
  const parent = dirname(destination);
  await mkdir(parent, { recursive: true });
  await assertSafeDestination(destination);
  const stage = await mkdtemp(join(parent, '.cv-stage-'));
  const stagedPdf = join(stage, 'cv.pdf');
  try {
    const profile = cvProfiles[request.profileId];
    const view = resolveCv(career, profile);
    const warnings = getCvQualityWarnings(view, profile);
    const rendered = await renderPdfBytes(renderCvHtml(view));
    const normalized = await normalizePdfMetadata(rendered, view);
    await writeFile(stagedPdf, normalized, { flag: 'wx' });
    const verification = await verifyCvPdf(new Uint8Array(await readFile(stagedPdf)), view);
    await assertSafeDestination(destination);
    if (getCvOutput(request) !== destination) throw new Error('CV output destination changed before atomic replacement');
    await rename(stagedPdf, destination);
    return { output: destination, verification, warnings };
  } finally { await rm(stage, { recursive: true, force: true }); }
};
