import { expect, test } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { career } from '../../src/content/portfolio/career';
import { cvProfiles } from '../../src/lib/cv/profiles';
import { renderCvHtml } from '../../src/lib/cv/render';
import { resolveCv } from '../../src/lib/cv/resolve';

test('generic printable CV visual regression', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'CV snapshot is desktop-print only');
  await page.setViewportSize({ width: 794, height: 1123 });
  await page.setContent(renderCvHtml(resolveCv(career, cvProfiles.generic)), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.cv')).toHaveScreenshot('cv-generic.png', { animations: 'disabled' });
});

test('built public site exposes no private CV route or selector', async ({ request }) => {
  for (const route of ['/cv/leadership', '/cv/embedded-rd', '/cv/devops']) {
    expect((await request.get(route)).status(), route).toBe(404);
  }

  const htmlFiles = (await readdir(resolve('dist'), { recursive: true }))
    .filter(file => file.endsWith('.html'));
  const html = (await Promise.all(htmlFiles.map(file => readFile(resolve('dist', file), 'utf8')))).join('\n');
  expect(html).not.toMatch(/cv[-_ ]?profile|choose\s+(?:a\s+)?cv\s+profile|profile\s*selector/i);
});
