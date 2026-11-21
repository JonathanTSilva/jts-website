/**
 * Redirects from the old slug URLs (`/blog/2026-04-welcome.en/`) to the clean
 * ones (`/blog/welcome/`). Plain TypeScript: imported from astro.config.mjs.
 *
 * Each item yields the four old forms that existed on the live site, including
 * the cross-locale duplicates (`/pt-br/blog/<base>.en`), each sent to the page
 * of the language its suffix names.
 */
export interface LegacySlug {
  collection: 'blog' | 'notes';
  /** Old slug without the language suffix, e.g. '2026-04-welcome'. */
  oldBase: string;
  /** New shared slug, e.g. 'welcome'. */
  newSlug: string;
}

export function legacyRedirects(items: LegacySlug[]): Record<string, string> {
  const redirects: Record<string, string> = {};
  for (const { collection, oldBase, newSlug } of items) {
    const target = {
      en: `/${collection}/${newSlug}`,
      'pt-br': `/pt-br/${collection}/${newSlug}`,
    };
    for (const prefix of ['', '/pt-br']) {
      for (const lang of ['en', 'pt-br'] as const) {
        const from = `${prefix}/${collection}/${oldBase}.${lang}`;
        if (from !== target[lang]) redirects[from] = target[lang];
      }
    }
  }
  return redirects;
}
