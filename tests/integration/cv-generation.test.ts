import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateCv } from '../../src/lib/cv/generate';

describe('CV generation', () => {
  it('generates a tagged, parseable generic CV no longer than two A4 pages', async () => {
    const testRoot = await mkdtemp(join(tmpdir(), 'jts-cv-test-'));
    try {
      const result = await generateCv({ profileId: 'generic', mode: 'test', testRoot });
      expect(result.verification.pageCount).toBeGreaterThanOrEqual(1);
      expect(result.verification.pageCount).toBeLessThanOrEqual(2);
      expect(result.verification.hasStructTree).toBe(true);
      expect(result.verification.text).toContain('Jonathan Tobias da Silva');
    } finally { await rm(testRoot, { recursive: true, force: true }); }
  }, 30_000);
});
