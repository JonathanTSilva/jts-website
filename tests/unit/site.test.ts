import { describe, expect, it } from 'vitest';
import { SITE_DISPLAY_NAME, SITE_HOST, SITE_URL, absoluteUrl } from '../../src/lib/site';
import { getNoteAccentColor } from '../../src/lib/notes';

describe('site helpers', () => {
  it('derives the host from the site URL', () => {
    expect(SITE_HOST).toBe(new URL(SITE_URL).host);
    expect(SITE_DISPLAY_NAME).toBe('jontobias.com');
  });

  it('builds absolute URLs for site paths', () => {
    expect(absoluteUrl('/blog/x/')).toBe(`${SITE_URL}/blog/x/`);
  });
});

describe('getNoteAccentColor', () => {
  it('prefers the color token, then the category, then the default', () => {
    expect(getNoteAccentColor('#123456', 'Engineering')).toBe('#123456');
    expect(getNoteAccentColor(undefined, 'Engineering')).toBe('#064e3b');
    expect(getNoteAccentColor(undefined, undefined)).toBe('#1e3a8a');
  });
});
