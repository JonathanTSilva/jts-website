import type { Locale } from './content/locale';

const INTL_LOCALES: Record<Locale, string> = {
  en: 'en-US',
  'pt-br': 'pt-BR',
};

/**
 * Formats a date-only content value (frontmatter `2026-11-19`, parsed as UTC
 * midnight). Always formats in UTC so a build in any timezone shows the same
 * day. Defaults to the long style ("November 19, 2026"); pass `options` for
 * another shape (the timezone is always UTC).
 */
export function formatDate(
  date: Date,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions,
): string {
  // `undefined` means the long style; an explicit `{}` is kept as the numeric default.
  const resolved = options ?? { dateStyle: 'long' };
  return new Intl.DateTimeFormat(INTL_LOCALES[locale], { ...resolved, timeZone: 'UTC' }).format(date);
}
