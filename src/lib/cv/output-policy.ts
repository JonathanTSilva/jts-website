import { existsSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import type { CvProfileId } from './types';

type ProductionOutputRequest =
  | Readonly<{ profileId: 'generic'; mode: 'public' }>
  | Readonly<{ profileId: Exclude<CvProfileId, 'generic'>; mode: 'private' }>;
type TestOutputRequest = Readonly<{ profileId: CvProfileId; mode: 'test'; testRoot: string }>;

const filenames: Readonly<Record<CvProfileId, string>> = Object.freeze({
  generic: 'jonathan-cv.pdf',
  leadership: 'jonathan-tobias-cv-leadership.pdf',
  'embedded-rd': 'jonathan-tobias-cv-embedded-rd.pdf',
  devops: 'jonathan-tobias-cv-devops.pdf',
});

const canonicalize = (input: string): string => {
  const absolute = resolve(input);
  let existing = absolute;
  const missing: string[] = [];
  while (!existsSync(existing)) {
    const parent = dirname(existing);
    if (parent === existing) break;
    missing.unshift(relative(parent, existing));
    existing = parent;
  }
  return resolve(realpathSync(existing), ...missing);
};

const isContained = (parent: string, child: string): boolean => {
  const pathFromParent = relative(parent, child);
  return pathFromParent === '' || (!pathFromParent.startsWith('..') && !isAbsolute(pathFromParent));
};

const containedOutput = (root: string, filename: string, label: string): string => {
  const absoluteRoot = resolve(root);
  const canonicalRoot = canonicalize(root);
  if (canonicalRoot !== absoluteRoot) throw new Error(`CV output root must not redirect outside ${label}`);
  const output = canonicalize(join(canonicalRoot, filename));
  if (!isContained(canonicalRoot, output)) throw new Error(`CV output must remain inside ${label}`);
  return output;
};

export function getCvOutput(request: ProductionOutputRequest | TestOutputRequest): string;
export function getCvOutput(request: Readonly<{ profileId: CvProfileId; mode: 'public' | 'private' | 'test'; testRoot?: string }>): string {
  const allowedKeys = request.mode === 'test' ? new Set(['profileId', 'mode', 'testRoot']) : new Set(['profileId', 'mode']);
  const unsupported = Object.keys(request).find(key => !allowedKeys.has(key));
  if (unsupported) throw new Error(`Unsupported CV output option: ${unsupported}`);
  if (request.mode === 'public') {
    if (request.profileId !== 'generic') throw new Error(`Private profile ${request.profileId} cannot use public output`);
    return containedOutput(resolve('public/assets/cv'), filenames.generic, 'the public CV directory');
  }
  if (request.mode === 'private') {
    if (request.profileId === 'generic') throw new Error('The generic profile cannot use private output');
    return containedOutput(resolve('.cv-output'), filenames[request.profileId], 'the private CV directory');
  }
  if (!request.testRoot) throw new Error('Test mode requires an explicit system temp root');
  const systemTemp = realpathSync(tmpdir());
  const testRoot = canonicalize(request.testRoot);
  if (!isContained(systemTemp, testRoot) || testRoot === systemTemp) {
    throw new Error('Test root must be a dedicated directory inside system temp');
  }
  return containedOutput(testRoot, filenames[request.profileId], 'the test root');
}
