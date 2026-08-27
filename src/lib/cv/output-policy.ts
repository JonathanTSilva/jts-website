import { existsSync, lstatSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { profileIds, type CvProfileId } from './types';

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

const hasSymlinkComponent = (input: string): boolean => {
  let current = resolve(input);
  while (true) {
    try {
      if (lstatSync(current).isSymbolicLink()) return true;
    } catch (error) {
      if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error;
    }
    const parent = dirname(current);
    if (parent === current) return false;
    current = parent;
  }
};

const containedOutput = (root: string, filename: string, label: string): string => {
  const absoluteRoot = resolve(root);
  if (hasSymlinkComponent(absoluteRoot)) throw new Error(`CV output root must not contain a symlink in ${label}`);
  const canonicalRoot = canonicalize(root);
  if (canonicalRoot !== absoluteRoot) throw new Error(`CV output root must not redirect outside ${label}`);
  const lexicalOutput = join(absoluteRoot, filename);
  if (hasSymlinkComponent(lexicalOutput)) throw new Error('CV output filename must not be a symlink or redirect');
  const canonicalOutput = canonicalize(lexicalOutput);
  if (canonicalOutput !== lexicalOutput) throw new Error(`CV output filename must not redirect outside the exact output path`);
  if (!isContained(canonicalRoot, canonicalOutput)) throw new Error(`CV output must remain inside ${label}`);
  // This validates the current filesystem state. The eventual writer must still use an
  // atomic, no-follow strategy to defend against hostile concurrent symlink replacement.
  return lexicalOutput;
};

type ValidatedOutputRequest = { profileId: CvProfileId; mode: 'public' | 'private' | 'test'; testRoot?: string };

const allowedModes = new Set(['public', 'private', 'test']);
const knownProfiles = new Set<string>(profileIds);
const traversalSegment = (value: string): boolean => value.split(/[\\/]/).includes('..');

const validateRequest = (input: unknown): ValidatedOutputRequest => {
  if (typeof input !== 'object' || input === null || Object.getPrototypeOf(input) !== Object.prototype) {
    throw new Error('CV output request must be a plain object with no inherited properties');
  }
  for (const key of Reflect.ownKeys(input)) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key)!;
    if (typeof key !== 'string') throw new Error('Unsupported CV output option: symbol key');
    if (!descriptor.enumerable) throw new Error(`Non-enumerable CV output option is forbidden: ${key}`);
    if (!('value' in descriptor)) throw new Error(`CV output option must be a data property: ${key}`);
  }
  const record = input as Record<string, unknown>;
  if (typeof record.mode !== 'string' || !allowedModes.has(record.mode)) {
    throw new Error(`Unknown mode for CV output: ${String(record.mode)}`);
  }
  if (typeof record.profileId !== 'string' || !knownProfiles.has(record.profileId)) {
    throw new Error(`Unknown profile for CV output: ${String(record.profileId)}`);
  }
  const allowed = record.mode === 'test' ? ['profileId', 'mode', 'testRoot'] : ['profileId', 'mode'];
  for (const key of Object.keys(record)) {
    if (!allowed.includes(key)) throw new Error(`Unsupported CV output option: ${key}`);
  }
  for (const key of allowed) {
    if (!Object.hasOwn(record, key)) throw new Error(`Missing required CV output option: ${key}`);
  }
  if (record.mode === 'test' && typeof record.testRoot !== 'string') {
    throw new Error('Test mode requires an explicit system temp root string');
  }
  return record as ValidatedOutputRequest;
};

export function getCvOutput(request: ProductionOutputRequest | TestOutputRequest): string;
export function getCvOutput(input: unknown): string {
  const request = validateRequest(input);
  if (request.mode === 'public') {
    if (request.profileId !== 'generic') throw new Error(`Private profile ${request.profileId} cannot use public output`);
    return containedOutput(resolve('public/assets/cv'), filenames.generic, 'the public CV directory');
  }
  if (request.mode === 'private') {
    if (request.profileId === 'generic') throw new Error('The generic profile cannot use private output');
    return containedOutput(resolve('.cv-output'), filenames[request.profileId], 'the private CV directory');
  }
  if (!request.testRoot) throw new Error('Test mode requires an explicit system temp root');
  if (traversalSegment(request.testRoot)) throw new Error('Test root must not contain traversal segments');
  const systemTemp = realpathSync(tmpdir());
  const lexicalTestRoot = resolve(request.testRoot);
  if (hasSymlinkComponent(lexicalTestRoot)) throw new Error('Test root must not contain a symlink or redirect within or outside system temp');
  const testRoot = canonicalize(request.testRoot);
  if (testRoot !== lexicalTestRoot) throw new Error('Test root must not redirect through a symlink or leave system temp');
  if (!isContained(systemTemp, testRoot) || testRoot === systemTemp) {
    throw new Error('Test root must be a dedicated directory inside system temp');
  }
  return containedOutput(testRoot, filenames[request.profileId], 'the test root');
}
