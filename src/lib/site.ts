/** The one place the site's address is written. Plain TS: also imported by astro.config.mjs. */
export const SITE_URL = 'https://www.jontobias.com';
/** Host with www, as served (analytics domain). */
export const SITE_HOST = new URL(SITE_URL).host;
/** Short name shown on share cards. */
export const SITE_DISPLAY_NAME = 'jontobias.com';
/** Absolute URL for a site path, e.g. absoluteUrl('/blog/x/'). */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
