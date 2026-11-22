import { contentLocalePath, type Locale } from './content/locale';
import { useTranslations } from '../i18n/ui';

interface NavLink {
  href: string;
  label: string;
}

export const getNavigation = (locale: Locale): NavLink[] => {
  const { nav } = useTranslations(locale);

  return [
    { href: contentLocalePath(locale, '/'), label: nav.home },
    { href: contentLocalePath(locale, '/portfolio'), label: nav.portfolio },
    { href: contentLocalePath(locale, '/blog'), label: nav.blog },
    { href: contentLocalePath(locale, '/notes'), label: nav.notes },
    { href: contentLocalePath(locale, '/now'), label: nav.now },
  ];
};
