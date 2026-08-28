import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import type { ResolvedCv } from './types';

const fontFace = async (): Promise<string> => {
  const directory = resolve('node_modules/geist/dist/fonts/geist-sans');
  const [regular, semibold] = await Promise.all([readFile(resolve(directory, 'Geist-Regular.woff2')), readFile(resolve(directory, 'Geist-SemiBold.woff2'))]);
  return `@font-face{font-family:'Geist CV';font-style:normal;font-weight:400;src:url(data:font/woff2;base64,${regular.toString('base64')}) format('woff2')}@font-face{font-family:'Geist CV';font-style:normal;font-weight:600;src:url(data:font/woff2;base64,${semibold.toString('base64')}) format('woff2')}`;
};

export const renderPdfBytes = async (html: string): Promise<Uint8Array> => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const fonts = await fontFace();
    const sourceHtml = html.replace('<style>', `<style>${fonts}`);
    await page.setContent(sourceHtml, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const fontsLoaded = await page.evaluate(() => document.fonts.check('400 10pt "Geist CV"') && document.fonts.check('600 10pt "Geist CV"'));
    assert(fontsLoaded, 'Required Geist CV fonts did not load');
    return new Uint8Array(await page.pdf({ format: 'A4', preferCSSPageSize: true, printBackground: true, tagged: true, outline: true, scale: 1 }));
  } finally { await browser.close(); }
};

export const normalizePdfMetadata = async (bytes: Uint8Array, view: ResolvedCv): Promise<Uint8Array> => {
  const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
  pdf.setTitle(`${view.fullName} — CV`); pdf.setAuthor(view.fullName); pdf.setSubject(`${view.profileId} professional CV`);
  pdf.setKeywords(['CV', view.profileId, view.headline]); pdf.setCreator('jts-website'); pdf.setProducer('jts-website');
  const deterministicDate = new Date('2000-01-01T00:00:00.000Z');
  pdf.setCreationDate(deterministicDate); pdf.setModificationDate(deterministicDate);
  pdf.catalog.set(PDFName.of('Lang'), PDFString.of('en-US'));
  return pdf.save({ useObjectStreams: false, addDefaultPage: false });
};
