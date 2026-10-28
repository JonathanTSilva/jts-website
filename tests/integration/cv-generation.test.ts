import { mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { career } from '../../src/content/portfolio/career';
import { generateCv } from '../../src/lib/cv/generate';
import { cvProfiles } from '../../src/lib/cv/profiles';
import { resolveCv } from '../../src/lib/cv/resolve';

describe('CV generation', () => {
  it('generates and atomically replaces a complete tagged generic CV', async () => {
    const testRoot = await mkdtemp(join(tmpdir(), 'jts-cv-test-'));
    try {
      const output = join(testRoot, 'jonathan-cv.pdf');
      await writeFile(output, 'existing destination');
      const result = await generateCv({ profileId: 'generic', mode: 'test', testRoot });
      expect(result.output).toBe(output);
      expect(result.verification).toMatchObject({ pageCount: expect.any(Number), hasStructTree: true, metadata: {
        title: 'Jonathan Tobias da Silva — CV', author: 'Jonathan Tobias da Silva', subject: 'generic professional CV',
        keywords: 'CV generic Senior Embedded/R&D Engineer | Technical Leadership | DevOps',
        creator: 'jts-website', producer: 'jts-website', language: 'en-US',
        creationDate: 'D:20000101000000Z', modificationDate: 'D:20000101000000Z',
      } });
      expect(result.verification.pageCount).toBeGreaterThanOrEqual(1);
      expect(result.verification.pageCount).toBeLessThanOrEqual(2);
      for (const page of result.verification.pages) {
        expect(page.width).toBeCloseTo(595.28, 0); expect(page.height).toBeCloseTo(841.89, 0);
      }
      const resolved = resolveCv(career, cvProfiles.generic);
      const expectedUrls = [
        ...resolved.links.map(link => link.url), ...resolved.projects.flatMap(project => project.links.map(link => link.url)),
        ...resolved.publications.flatMap(item => item.url ? [item.url] : []),
      ].map(url => new URL(url).href);
      expect(result.verification.links.map(url => new URL(url).href)).toEqual(expect.arrayContaining(expectedUrls));
      const representative = ['Jonathan Tobias da Silva', 'Skills', 'Experience', 'Education'];
      let cursor = -1;
      for (const anchor of representative) { const index = result.verification.text.indexOf(anchor, cursor + 1); expect(index).toBeGreaterThan(cursor); cursor = index; }
      expect(new TextDecoder().decode(await readFile(output))).not.toContain('existing destination');
      expect((await stat(output)).mode & 0o777).toBe(0o600);
      const repeated = await generateCv({ profileId: 'generic', mode: 'test', testRoot });
      expect(repeated.verification.metadata).toEqual(result.verification.metadata);
      expect((await readdir(testRoot)).filter(name => name.startsWith('.cv-stage-'))).toEqual([]);
    } finally { await rm(testRoot, { recursive: true, force: true }); }
  }, 60_000);

  it('cleans staging and preserves an existing destination when verification fails', async () => {
    const testRoot = await mkdtemp(join(tmpdir(), 'jts-cv-test-'));
    const output = join(testRoot, 'jonathan-cv.pdf');
    try {
      await writeFile(output, 'known-good-existing');
      await expect(generateCv({ profileId: 'generic', mode: 'test', testRoot }, {
        renderPdfBytes: async () => new Uint8Array([1, 2, 3]), normalizePdfMetadata: async bytes => bytes,
        verifyCvPdf: async () => { throw new Error('injected verification failure'); },
      })).rejects.toThrow(/injected verification failure/i);
      expect(await readFile(output, 'utf8')).toBe('known-good-existing');
      expect((await readdir(testRoot)).filter(name => name.startsWith('.cv-stage-'))).toEqual([]);
    } finally { await rm(testRoot, { recursive: true, force: true }); }
  });

  it('creates and replaces private production output with owner-only permissions', async () => {
    const workingRoot = await mkdtemp(join(tmpdir(), 'jts-cv-private-')); const original = process.cwd();
    try {
      process.chdir(workingRoot);
      const first = await generateCv({ profileId: 'leadership', mode: 'private' });
      expect(first.output).toBe(join(workingRoot, '.cv-output/jonathan-tobias-cv-leadership.pdf'));
      expect((await stat(first.output)).mode & 0o777).toBe(0o600);
      await writeFile(first.output, 'replacement target', { mode: 0o644 });
      const replaced = await generateCv({ profileId: 'leadership', mode: 'private' });
      expect((await stat(replaced.output)).mode & 0o777).toBe(0o600);
      expect(new TextDecoder().decode(await readFile(replaced.output))).not.toContain('replacement target');
    } finally { process.chdir(original); await rm(workingRoot, { recursive: true, force: true }); }
  }, 60_000);
});
