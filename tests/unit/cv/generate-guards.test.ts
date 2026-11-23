import { mkdtemp, rm } from 'node:fs/promises';
import * as fsp from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  return {
    ...actual,
    realpath: vi.fn(actual.realpath),
    stat: vi.fn(actual.stat),
    lstat: vi.fn(actual.lstat),
  };
});
vi.mock('../../../src/lib/cv/output-policy', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/lib/cv/output-policy')>();
  return { ...actual, getCvOutput: vi.fn(actual.getCvOutput) };
});

import { generateCv } from '../../../src/lib/cv/generate';
import { getCvOutput } from '../../../src/lib/cv/output-policy';

const deps = {
  renderPdfBytes: async () => new Uint8Array([1]),
  normalizePdfMetadata: async (bytes: Uint8Array) => bytes,
  verifyCvPdf: async () => ({ pageCount: 1 }) as never,
};

describe('generateCv race and permission guards', () => {
  let root: string;
  let other: string;
  const request = () => ({ profileId: 'generic', mode: 'test', testRoot: root }) as const;

  beforeEach(async () => {
    root = await mkdtemp(join(realpathSync(tmpdir()), 'jts-cv-guard-'));
    other = await mkdtemp(join(realpathSync(tmpdir()), 'jts-cv-guard-other-'));
  });

  afterEach(async () => {
    vi.mocked(fsp.realpath).mockReset();
    vi.mocked(fsp.stat).mockReset();
    vi.mocked(fsp.lstat).mockReset();
    vi.mocked(getCvOutput).mockReset();
    await rm(root, { recursive: true, force: true });
    await rm(other, { recursive: true, force: true });
  });

  it('rejects an output parent that is not a directory', async () => {
    vi.mocked(fsp.stat).mockResolvedValueOnce({ isDirectory: () => false } as never);
    await expect(generateCv(request(), deps)).rejects.toThrow(/must be a directory/);
  });

  it('rejects a parent whose real path changed during generation', async () => {
    let calls = 0;
    const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
    vi.mocked(fsp.realpath).mockImplementation((async (path: string) =>
      ++calls === 2 ? other : actual.realpath(path)) as never);
    await expect(generateCv(request(), deps)).rejects.toThrow(/changed or redirected/);
  });

  it.each([
    ['device', { dev: 999999 }],
    ['inode', { ino: 999999 }],
  ])('rejects a parent whose %s identity changed during generation', async (_label, override) => {
    let calls = 0;
    const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
    vi.mocked(fsp.stat).mockImplementation((async (path: string) => {
      const details = await actual.stat(path);
      return ++calls === 2 ? Object.assign(Object.create(Object.getPrototypeOf(details)), details, override) : details;
    }) as never);
    await expect(generateCv(request(), deps)).rejects.toThrow(/changed or redirected/);
  });

  it('rejects an output destination that changes before the atomic replacement', async () => {
    let calls = 0;
    const actual = await vi.importActual<typeof import('../../../src/lib/cv/output-policy')>(
      '../../../src/lib/cv/output-policy',
    );
    vi.mocked(getCvOutput).mockImplementation(((input: never) =>
      ++calls === 2 ? join(root, 'moved.pdf') : actual.getCvOutput(input)) as never);
    await expect(generateCv(request(), deps)).rejects.toThrow(/destination changed/);
  });

  it('rejects a destination that became a symlink after the output policy check', async () => {
    vi.mocked(fsp.lstat).mockResolvedValueOnce({ isSymbolicLink: () => true } as never);
    await expect(generateCv(request(), deps)).rejects.toThrow(/must not be a symlink or redirect/);
  });

  it('rethrows filesystem errors other than a missing destination', async () => {
    vi.mocked(fsp.lstat).mockRejectedValueOnce(Object.assign(new Error('denied'), { code: 'EACCES' }));
    await expect(generateCv(request(), deps)).rejects.toThrow('denied');
  });

  it('rethrows non-Error rejections while checking the destination', async () => {
    vi.mocked(fsp.lstat).mockRejectedValueOnce('boom');
    await expect(generateCv(request(), deps)).rejects.toBe('boom');
  });

  it.each([
    ['not a regular file', { isFile: () => false, isSymbolicLink: () => false, mode: 0o100600 }],
    ['a symlink', { isFile: () => true, isSymbolicLink: () => true, mode: 0o100600 }],
    ['wrong permissions', { isFile: () => true, isSymbolicLink: () => false, mode: 0o100644 }],
  ])('rejects a final output that is %s', async (_label, details) => {
    const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
    let calls = 0;
    vi.mocked(fsp.lstat).mockImplementation((async (path: string) =>
      ++calls === 3 ? details : actual.lstat(path)) as never);
    await expect(generateCv(request(), deps)).rejects.toThrow(/permissions or file type are invalid/);
  });
});
