import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
import { PDFDocument, PDFName } from 'pdf-lib';
import { describe, expect, it, vi } from 'vitest';
import type { ResolvedCv } from '../../../src/lib/cv/types';
import { getGeistFontCss, normalizePdfMetadata, prepareCvPdfHtml, renderPdfBytes } from '../../../src/lib/cv/pdf';

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

const cvHtml = '<html><head><style>body{}</style></head><body>CV</body></html>';

function fakeBrowser(options: { fontsLoaded?: boolean; pdf?: Uint8Array } = {}) {
  const calls: string[] = [];
  const page = {
    setContent: vi.fn(async (html: string) => void calls.push(`content:${html.includes('Geist CV')}`)),
    // Run the page callbacks against a stubbed `document`, as the browser would.
    evaluate: vi.fn(async (fn: () => unknown) => {
      calls.push('evaluate');
      vi.stubGlobal('document', {
        fonts: { ready: Promise.resolve(), check: () => options.fontsLoaded ?? true },
      });
      try {
        return await fn();
      } finally {
        vi.unstubAllGlobals();
      }
    }),
    pdf: vi.fn(async () => options.pdf ?? Buffer.from([37, 80, 68, 70])),
  };
  const browser = { newPage: vi.fn(async () => page), close: vi.fn(async () => undefined) };
  return { browser, page, calls };
}

describe('renderPdfBytes', () => {
  it('prints the prepared HTML with an injected browser and always closes it', async () => {
    const { browser, page } = fakeBrowser();
    const bytes = await renderPdfBytes(cvHtml, async () => browser as never);
    expect([...bytes]).toEqual([37, 80, 68, 70]);
    expect(page.setContent).toHaveBeenCalledWith(expect.stringContaining("font-family:'Geist CV'"), { waitUntil: 'load' });
    expect(page.pdf).toHaveBeenCalledWith(expect.objectContaining({ format: 'A4', tagged: true, printBackground: true }));
    expect(browser.close).toHaveBeenCalledOnce();
  });

  it('launches headless Chromium by default', async () => {
    const { browser } = fakeBrowser();
    const launch = vi.spyOn(chromium, 'launch').mockResolvedValue(browser as never);
    try {
      await renderPdfBytes(cvHtml);
      expect(launch).toHaveBeenCalledWith({ headless: true });
      expect(browser.close).toHaveBeenCalledOnce();
    } finally {
      launch.mockRestore();
    }
  });

  it('fails and still closes the browser when the CV fonts did not load', async () => {
    const { browser } = fakeBrowser({ fontsLoaded: false });
    await expect(renderPdfBytes(cvHtml, async () => browser as never)).rejects.toThrow(/fonts did not load/);
    expect(browser.close).toHaveBeenCalledOnce();
  });

  it('closes the browser when the HTML has no style element', async () => {
    const { browser } = fakeBrowser();
    await expect(renderPdfBytes('<html></html>', async () => browser as never)).rejects.toThrow(/style element/);
    expect(browser.close).toHaveBeenCalledOnce();
  });
});

describe('normalizePdfMetadata', () => {
  it('stamps deterministic metadata and the document language', async () => {
    const source = await PDFDocument.create();
    source.addPage();
    const view = { profileId: 'generic', fullName: 'Ada Lovelace', headline: 'Engineer' } as ResolvedCv;
    const normalized = await normalizePdfMetadata(await source.save(), view);
    const reloaded = await PDFDocument.load(normalized, { updateMetadata: false });
    expect(reloaded.getTitle()).toBe('Ada Lovelace — CV');
    expect(reloaded.getAuthor()).toBe('Ada Lovelace');
    expect(reloaded.getSubject()).toBe('generic professional CV');
    expect(reloaded.getCreator()).toBe('jts-website');
    expect(reloaded.getCreationDate()?.toISOString()).toBe('2000-01-01T00:00:00.000Z');
    expect(reloaded.getModificationDate()?.toISOString()).toBe('2000-01-01T00:00:00.000Z');
    expect(reloaded.catalog.get(PDFName.of('Lang'))?.toString()).toBe('(en-US)');
  });
});
