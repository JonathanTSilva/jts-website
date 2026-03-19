export const DEFAULT_LOCALE = "en";
export const LOCALES = ["en", "pt-br"] as const;

export type Locale = (typeof LOCALES)[number];

export function isDefaultLocale(locale: string): boolean {
  return locale === DEFAULT_LOCALE;
}

export function contentLocalePath(locale: Locale, path: string): string {
  if (isDefaultLocale(locale)) {
    return path;
  }
  return `/${locale}${path}`;
}
