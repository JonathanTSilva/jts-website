import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser } from '@playwright/test';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import type { ResolvedCv } from './types';

export const getGeistFontCss = async (): Promise<string> => {
  const directory = new URL('../../assets/fonts/geist/', import.meta.url);
  const [regular, semibold] = await Promise.all([readFile(fileURLToPath(new URL('Geist-Regular.woff2', directory))), readFile(fileURLToPath(new URL('Geist-SemiBold.woff2', directory)))]);
  return `@font-face{font-family:'Geist CV';font-style:normal;font-weight:400;src:url(data:font/woff2;base64,${regular.toString('base64')}) format('woff2')}@font-face{font-family:'Geist CV';font-style:normal;font-weight:600;src:url(data:font/woff2;base64,${semibold.toString('base64')}) format('woff2')}`;
};

export const prepareCvPdfHtml = async (html: string): Promise<string> => {
  const fonts = await getGeistFontCss();
  if (!html.includes('<style>')) throw new Error('CV HTML must contain a style element for embedded fonts');
  return html.replace('<style>', `<style>${fonts}`);
};

type LaunchBrowser = () => Promise<Pick<Browser, 'newPage' | 'close'>>;
const launchChromium: LaunchBrowser = () => chromium.launch({ headless: true });

export const renderPdfBytes = async (html: string, launchBrowser: LaunchBrowser = launchChromium): Promise<Uint8Array> => {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    const sourceHtml = await prepareCvPdfHtml(html);
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
