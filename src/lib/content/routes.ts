import { LOCALES, type Locale } from './locale';

/** Minimal shape the route planner needs from a content entry. */
export interface RouteEntry {
  slug: string;
  language: Locale;
  translationKey: string;
  publishedAt: Date;
  updatedAt?: Date | undefined;
}

export interface LocalizedRoute<T extends RouteEntry> {
  /** The entry rendered on this page. */
  entry: T;
  /** The page's URL locale. */
  locale: Locale;
  /** Page path with trailing slash, e.g. '/pt-br/blog/x/'. */
  path: string;
  /** True when the rendered entry is not written in the page's locale. */
  isFallback: boolean;
  /** Real translations only, each pointing at its own locale's page. */
  translations: Partial<Record<Locale, string>>;
}

/** Builds the URL path of a content page, with trailing slash. */
export function contentPath(base: string, locale: Locale, slug: string): string {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return `${prefix}/${base}/${slug}/`;
}

/**
 * Plans exactly one page per translation group (translationKey) for a locale.
 * The page renders the entry written in `locale`; when there is none it falls
 * back to the English entry, then to the first entry of the group.
 */
export function planLocalizedRoutes<T extends RouteEntry>(
  entries: T[],
  base: string,
  locale: Locale,
): LocalizedRoute<T>[] {
  const groups = new Map<string, T[]>();
  for (const entry of entries) {
    const group = groups.get(entry.translationKey);
    if (group) group.push(entry);
    else groups.set(entry.translationKey, [entry]);
  }

  const routes: LocalizedRoute<T>[] = [];
  for (const group of groups.values()) {
    const entry =
      group.find((e) => e.language === locale) ??
      group.find((e) => e.language === 'en') ??
      group[0];
    if (!entry) continue;

    const translations: Partial<Record<Locale, string>> = {};
    for (const l of LOCALES) {
      const real = group.find((e) => e.language === l);
      if (real) translations[l] = contentPath(base, l, real.slug);
    }

    routes.push({
      entry,
      locale,
      path: contentPath(base, locale, entry.slug),
      isFallback: entry.language !== locale,
      translations,
    });
  }
  return routes;
}
