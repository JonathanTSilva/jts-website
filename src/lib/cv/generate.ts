import { chmod, lstat, mkdir, mkdtemp, readFile, realpath, rename, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { career } from '../../content/portfolio/career';
import { getCvQualityWarnings } from '../career/quality';
import { getCvOutput } from './output-policy';
import { normalizePdfMetadata, renderPdfBytes } from './pdf';
import { cvProfiles } from './profiles';
import { renderCvHtml } from './render';
import { resolveCv } from './resolve';
import type { CvProfileId, ResolvedCv } from './types';
import { verifyCvPdf, type CvPdfVerification } from './verify';

type GenerateRequest =
  | Readonly<{ profileId: 'generic'; mode: 'public' }>
  | Readonly<{ profileId: Exclude<CvProfileId, 'generic'>; mode: 'private' }>
  | Readonly<{ profileId: CvProfileId; mode: 'test'; testRoot: string }>;
export interface GenerateCvResult { readonly output: string; readonly verification: CvPdfVerification; readonly warnings: ReturnType<typeof getCvQualityWarnings> }
interface TestDependencies {
  readonly renderPdfBytes?: (html: string) => Promise<Uint8Array>;
  readonly normalizePdfMetadata?: (bytes: Uint8Array, view: ResolvedCv) => Promise<Uint8Array>;
  readonly verifyCvPdf?: (bytes: Uint8Array, view: ResolvedCv) => Promise<CvPdfVerification>;
}
interface ParentIdentity { readonly path: string; readonly dev: number; readonly ino: number }

const assertSafeDestination = async (destination: string): Promise<void> => {
  try { if ((await lstat(destination)).isSymbolicLink()) throw new Error('CV output destination must not be a symlink or redirect'); }
  catch (error) { if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error; }
};
const captureParent = async (parent: string): Promise<ParentIdentity> => {
  const path = await realpath(parent); const details = await stat(path);
  if (!details.isDirectory()) throw new Error('CV output parent must be a directory');
  return { path, dev: details.dev, ino: details.ino };
};
const assertSameParent = async (parent: string, expected: ParentIdentity): Promise<void> => {
  const actual = await captureParent(parent);
  if (actual.path !== expected.path || actual.dev !== expected.dev || actual.ino !== expected.ino) {
    throw new Error('CV output parent changed or redirected during generation');
  }
};

// Node has no portable renameat/no-follow API. The repeated realpath and dev/ino
// checks protect normal operation from accidental replacement and symlink
// redirection, but do not claim to defeat a hostile same-account racing process.
export const generateCv = async (request: GenerateRequest, testDependencies?: TestDependencies): Promise<GenerateCvResult> => {
  if (testDependencies && request.mode !== 'test') throw new Error('CV dependency injection is restricted to test mode');
  const destination = getCvOutput(request); const parent = dirname(destination);
  const outputMode = request.mode === 'public' ? 0o644 : 0o600;
  await mkdir(parent, { recursive: true });
  const parentIdentity = await captureParent(parent);
  await assertSafeDestination(destination);
  const stage = await mkdtemp(join(parent, '.cv-stage-')); const stagedPdf = join(stage, 'cv.pdf');
  const dependencies = {
    renderPdfBytes: testDependencies?.renderPdfBytes ?? renderPdfBytes,
    normalizePdfMetadata: testDependencies?.normalizePdfMetadata ?? normalizePdfMetadata,
    verifyCvPdf: testDependencies?.verifyCvPdf ?? verifyCvPdf,
  };
  try {
    const profile = cvProfiles[request.profileId]; const view = resolveCv(career, profile);
    const warnings = getCvQualityWarnings(view, profile);
    const rendered = await dependencies.renderPdfBytes(renderCvHtml(view));
    const normalized = await dependencies.normalizePdfMetadata(rendered, view);
    await writeFile(stagedPdf, normalized, { flag: 'wx', mode: 0o600 });
    await chmod(stagedPdf, 0o600);
    const verification = await dependencies.verifyCvPdf(new Uint8Array(await readFile(stagedPdf)), view);
    await assertSameParent(parent, parentIdentity);
    await assertSafeDestination(destination);
    if (getCvOutput(request) !== destination) throw new Error('CV output destination changed before atomic replacement');
    await rename(stagedPdf, destination);
    await chmod(destination, outputMode);
    await assertSameParent(parent, parentIdentity);
    const final = await lstat(destination);
    if (!final.isFile() || final.isSymbolicLink() || (final.mode & 0o777) !== outputMode) throw new Error('CV output permissions or file type are invalid after replacement');
    return { output: destination, verification, warnings };
  } finally { await rm(stage, { recursive: true, force: true }); }
};
