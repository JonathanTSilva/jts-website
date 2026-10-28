import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getGeistFontCss, prepareCvPdfHtml } from '../../../src/lib/cv/pdf';

describe('CV PDF fonts', () => {
  it('resolves installed Geist fonts independently of the working directory', async () => {
    const original = process.cwd(); const directory = await mkdtemp(join(tmpdir(), 'cv-font-cwd-'));
    try {
      process.chdir(directory);
      const css = await getGeistFontCss();
      expect(css).toContain("font-weight:400"); expect(css).toContain("font-weight:600"); expect(css).toContain('data:font/woff2;base64,');
    } finally { process.chdir(original); await rm(directory, { recursive: true, force: true }); }
  });

  it('prepares renderer HTML with the same embedded regular and semibold fonts used for PDF output', async () => {
    const html = await prepareCvPdfHtml('<html><head><style>body{color:#111}</style></head><body>CV</body></html>');
    expect(html).toContain("font-family:'Geist CV'");
    expect(html).toContain('font-weight:400');
    expect(html).toContain('font-weight:600');
    expect(html).toContain('data:font/woff2;base64,');
    expect(html).toContain('body{color:#111}');
  });
});
