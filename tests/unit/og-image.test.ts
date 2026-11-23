import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_OG_AUTHOR,
  DEFAULT_OG_AUTHOR_ROLE,
  DEFAULT_OG_DOMAIN,
  generateOGImage,
} from '../../src/lib/ogImage';

describe('ogImage defaults', () => {
  it('uses refreshed public identity defaults', () => {
    expect(DEFAULT_OG_AUTHOR).toBe('Jonathan Tobias');
    expect(DEFAULT_OG_AUTHOR_ROLE).toBe('Senior Embedded Software Engineer');
    expect(DEFAULT_OG_DOMAIN).toBe('jontobias.com');
  });
});

describe('generateOGImage', () => {
  it('renders a 1200x630 png for a short title', { timeout: 20000 }, async () => {
    const buf = await generateOGImage({ title: 'Welcome', label: 'BLOG · PERSONAL' });
    const meta = await sharp(buf).metadata();
    expect(meta.width).toBe(1200);
    expect(meta.height).toBe(630);
    expect(meta.format).toBe('png');
  });

  it('renders a 1200x630 png for a 130-character title with a custom accent', { timeout: 20000 }, async () => {
    const title = 'How I structure firmware for mission-critical industrial controllers with Zephyr RTOS and keep it running for a decade'.padEnd(130, '.');
    expect(title).toHaveLength(130);
    const buf = await generateOGImage({ title, label: 'BLOG · ENGINEERING', accent: '#0ea5e9' });
    const meta = await sharp(buf).metadata();
    expect(meta.width).toBe(1200);
    expect(meta.height).toBe(630);
    expect(meta.format).toBe('png');
  });

  it.each([50, 80, 110])('renders a 1200x630 png for a %i-character title', { timeout: 20000 }, async (length) => {
    const buf = await generateOGImage({ title: 'x'.repeat(length), label: 'BLOG' });
    const meta = await sharp(buf).metadata();
    expect([meta.width, meta.height]).toEqual([1200, 630]);
  });
});
