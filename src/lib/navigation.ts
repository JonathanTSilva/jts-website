import { contentLocalePath, type Locale } from './content/locale';

interface NavLink {
  href: string;
  label: string;
}

export const getNavigation = (locale: Locale): NavLink[] => {
  const t = {
    en: {
      home: 'Home',
      portfolio: 'Portfolio',
      blog: 'Blog',
      notes: 'Notes',
      now: 'Now',
    },
    'pt-br': {
      home: 'Início',
      portfolio: 'Portfólio',
      blog: 'Blog',
      notes: 'Notas',
      now: 'Agora',
    },
  }[locale];

  return [
    { href: contentLocalePath(locale, '/'), label: t.home },
    { href: contentLocalePath(locale, '/portfolio'), label: t.portfolio },
    { href: contentLocalePath(locale, '/blog'), label: t.blog },
    { href: contentLocalePath(locale, '/notes'), label: t.notes },
    { href: contentLocalePath(locale, '/now'), label: t.now },
  ];
};
