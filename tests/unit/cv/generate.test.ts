import { mkdtemp, readFile, readdir, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/lib/cv/pdf', () => ({
  renderPdfBytes: vi.fn(async () => new Uint8Array([1, 2, 3])),
  normalizePdfMetadata: vi.fn(async (bytes: Uint8Array) => bytes),
}));
vi.mock('../../../src/lib/cv/verify', () => ({
  verifyCvPdf: vi.fn(async () => ({ pageCount: 1, verified: true })),
}));

import { generateCv } from '../../../src/lib/cv/generate';
import { normalizePdfMetadata, renderPdfBytes } from '../../../src/lib/cv/pdf';
import { verifyCvPdf } from '../../../src/lib/cv/verify';

const stages = async (dir: string) => (await readdir(dir)).filter((name) => name.startsWith('.cv-stage-'));

describe('generateCv', () => {
  let root: string;
  let original: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    original = process.cwd();
    root = await mkdtemp(join(realpathSync(tmpdir()), 'jts-cv-unit-'));
  });

  afterEach(async () => {
    process.chdir(original);
    await rm(root, { recursive: true, force: true });
  });

  it('writes the public CV with world-readable permissions using the production renderer', async () => {
    process.chdir(root);
    const result = await generateCv({ profileId: 'generic', mode: 'public' });
    expect(result.output).toBe(join(root, 'public/assets/cv/jonathan-cv.pdf'));
    expect((await stat(result.output)).mode & 0o777).toBe(0o644);
    expect([...(await readFile(result.output))]).toEqual([1, 2, 3]);
    expect(renderPdfBytes).toHaveBeenCalledOnce();
    expect(normalizePdfMetadata).toHaveBeenCalledOnce();
    expect(verifyCvPdf).toHaveBeenCalledOnce();
    expect(result.verification).toEqual({ pageCount: 1, verified: true });
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(await stages(join(root, 'public/assets/cv'))).toEqual([]);
  });

  it('writes private CVs with owner-only permissions', async () => {
    process.chdir(root);
    const result = await generateCv({ profileId: 'leadership', mode: 'private' });
    expect(result.output).toBe(join(root, '.cv-output/jonathan-tobias-cv-leadership.pdf'));
    expect((await stat(result.output)).mode & 0o777).toBe(0o600);
  });

  it('replaces an existing destination in test mode and uses injected dependencies', async () => {
    const output = join(root, 'jonathan-cv.pdf');
    await writeFile(output, 'old');
    const verification = { pageCount: 2 } as never;
    const result = await generateCv(
      { profileId: 'generic', mode: 'test', testRoot: root },
      {
        renderPdfBytes: async () => new Uint8Array([9]),
        normalizePdfMetadata: async (bytes) => bytes,
        verifyCvPdf: async () => verification,
      },
    );
    expect(result.verification).toBe(verification);
    expect([...(await readFile(output))]).toEqual([9]);
    expect(renderPdfBytes).not.toHaveBeenCalled();
    expect(await stages(root)).toEqual([]);
  });

  it('falls back to the production dependencies in test mode when none are injected', async () => {
    await generateCv({ profileId: 'devops', mode: 'test', testRoot: root });
    expect(renderPdfBytes).toHaveBeenCalledOnce();
  });

  it('rejects dependency injection outside test mode', async () => {
    await expect(
      generateCv({ profileId: 'generic', mode: 'public' } as never, {} as never),
    ).rejects.toThrow(/restricted to test mode/);
  });

  it('refuses a destination that is a symlink', async () => {
    await symlink(join(root, 'elsewhere'), join(root, 'jonathan-cv.pdf'));
    await expect(generateCv({ profileId: 'generic', mode: 'test', testRoot: root })).rejects.toThrow(
      /symlink/i,
    );
    expect(await stages(root)).toEqual([]);
  });

  it('removes the staging directory and keeps the old file when a step fails', async () => {
    const output = join(root, 'jonathan-cv.pdf');
    await writeFile(output, 'keep me');
    await expect(
      generateCv(
        { profileId: 'generic', mode: 'test', testRoot: root },
        { renderPdfBytes: async () => { throw new Error('render failed'); } },
      ),
    ).rejects.toThrow('render failed');
    expect(await readFile(output, 'utf8')).toBe('keep me');
    expect(await stages(root)).toEqual([]);
  });
});
