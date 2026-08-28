import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getGeistFontCss } from '../../../src/lib/cv/pdf';

describe('CV PDF fonts', () => {
  it('resolves installed Geist fonts independently of the working directory', async () => {
    const original = process.cwd(); const directory = await mkdtemp(join(tmpdir(), 'cv-font-cwd-'));
    try {
      process.chdir(directory);
      const css = await getGeistFontCss();
      expect(css).toContain("font-weight:400"); expect(css).toContain("font-weight:600"); expect(css).toContain('data:font/woff2;base64,');
    } finally { process.chdir(original); await rm(directory, { recursive: true, force: true }); }
  });
});
