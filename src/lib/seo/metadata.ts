import { type Locale, DEFAULT_LOCALE, LOCALES } from '../content/locale';

export const SITE_NAME = 'Tobias';
export const OG_SITE_NAME = 'Jonathan Tobias';
// Bump when the share card design changes, so LinkedIn/WhatsApp fetch the new image.
export const OG_IMAGE_VERSION = '2';
const SITE_DESCRIPTION = 'Senior Embedded Software Engineer & M.Sc. specializing in mission-critical systems and technical leadership.';

export type PageType = 'home' | 'blog-index' | 'notes-index' | 'portfolio' | 'now' | 'article' | 'legal' | 'generic';

interface PageTypeDefaults {
  title: string;
  description: string;
}

const PAGE_TYPE_DEFAULTS: Record<PageType, Record<Locale, PageTypeDefaults>> = {
  home: {
    en: {
      title: `${SITE_NAME} | Senior Embedded Software Engineer`,
      description: SITE_DESCRIPTION,
    },
    'pt-br': {
      title: `${SITE_NAME} | Engenheiro Sênior de Software Embarcado`,
      description: 'Engenheiro Sênior de Software Embarcado & M.Sc. especializado em sistemas críticos e liderança técnica.',
    },
  },
  'blog-index': {
    en: {
      title: `Blog | ${SITE_NAME}`,
      description: 'Articles and thoughts on embedded systems, software engineering, and technical leadership.',
    },
    'pt-br': {
      title: `Blog | ${SITE_NAME}`,
      description: 'Artigos e reflexões sobre sistemas embarcados, engenharia de software e liderança técnica.',
    },
  },
  'notes-index': {
    en: {
      title: `Notes | ${SITE_NAME}`,
      description: 'Short-form notes, TILs, and technical observations.',
    },
    'pt-br': {
      title: `Notas | ${SITE_NAME}`,
      description: 'Notas curtas, TILs e observações técnicas.',
    },
  },
  portfolio: {
    en: {
      title: `Portfolio | ${SITE_NAME}`,
      description: 'Selected projects and open-source work in embedded systems and software engineering.',
    },
    'pt-br': {
      title: `Portfólio | ${SITE_NAME}`,
      description: 'Projetos selecionados e trabalhos de código aberto em sistemas embarcados e engenharia de software.',
    },
  },
  now: {
    en: {
      title: `Now | ${SITE_NAME}`,
      description: 'What I am focused on right now.',
    },
    'pt-br': {
      title: `Agora | ${SITE_NAME}`,
      description: 'No que estou focado agora.',
    },
  },
  article: {
    en: {
      title: `${SITE_NAME} | Senior Embedded Software Engineer`,
      description: SITE_DESCRIPTION,
    },
    'pt-br': {
      title: `${SITE_NAME} | Engenheiro Sênior de Software Embarcado`,
      description: 'Engenheiro Sênior de Software Embarcado & M.Sc. especializado em sistemas críticos e liderança técnica.',
    },
  },
  legal: {
    en: {
      title: `Legal | ${SITE_NAME}`,
      description: 'Legal information, privacy policy, and terms of use.',
    },
    'pt-br': {
      title: `Legal | ${SITE_NAME}`,
      description: 'Informações legais, política de privacidade e termos de uso.',
    },
  },
  generic: {
    en: {
      title: `${SITE_NAME} | Senior Embedded Software Engineer`,
      description: SITE_DESCRIPTION,
    },
    'pt-br': {
      title: `${SITE_NAME} | Engenheiro Sênior de Software Embarcado`,
      description: 'Engenheiro Sênior de Software Embarcado & M.Sc. especializado em sistemas críticos e liderança técnica.',
    },
  },
};

export interface SeoProps {
  title?: string | undefined;
  description?: string | undefined;
  canonical?: string;
  ogType?: 'website' | 'article' | undefined;
  image?: string | undefined;
  locale: Locale;
  currentPath?: string;
  pageType?: PageType | undefined;
  /** Real translations of this page (path per locale). Drives hreflang when set. */
  translations?: Partial<Record<Locale, string>> | undefined;
  /** Keeps the page out of search results (translation fallback pages). */
  noindex?: boolean | undefined;
}

interface Alternate {
  locale: string;
  href: string;
}

/** hreflang alternates from real translations; none unless at least two exist. */
function buildTranslationAlternates(
  translations: Partial<Record<Locale, string>>,
  baseUrl: string,
): Alternate[] {
  const present = LOCALES.flatMap((locale) => {
    const path = translations[locale];
    return path ? [{ locale, href: new URL(path, baseUrl).toString() }] : [];
  });
  if (present.length < 2) return [];
  const xDefault = translations[DEFAULT_LOCALE] ?? translations['pt-br'];
  return [
    ...present,
    ...(xDefault ? [{ locale: 'x-default', href: new URL(xDefault, baseUrl).toString() }] : []),
  ];
}

/** hreflang alternates for static pages, derived by mapping the locale prefix. */
function buildPathAlternates(pathWithoutLocale: string, baseUrl: string): Alternate[] {
  const enHref = new URL(pathWithoutLocale === '/' ? '/' : pathWithoutLocale, baseUrl).toString();
  return [
    ...LOCALES.map((loc) => {
      const localePrefix = loc === DEFAULT_LOCALE ? '' : `/${loc}`;
      const path = pathWithoutLocale === '/' ? '' : pathWithoutLocale;
      const href = new URL(`${localePrefix}${path}${path === '' ? '/' : ''}`, baseUrl).toString();
      return { locale: loc, href };
    }),
    { locale: 'x-default', href: enHref },
  ];
}

export function generateSeo(props: SeoProps) {
  const { title, description, canonical, ogType = 'website', image, locale, currentPath = '/', pageType, translations, noindex } = props;
  const baseUrl = 'https://www.jontobias.com';

  // Resolve page-type defaults when no explicit title/description given
  const pageDefaults = pageType ? PAGE_TYPE_DEFAULTS[pageType][locale] : undefined;
  const profession = locale === 'pt-br' ? 'Engenheiro Sênior de Software Embarcado' : 'Senior Embedded Software Engineer';

  let fullTitle: string;
  if (title) {
    fullTitle = `${title} | ${SITE_NAME}`;
  } else if (pageDefaults) {
    fullTitle = pageDefaults.title;
  } else {
    fullTitle = `${SITE_NAME} | ${profession}`;
  }

  const shareTitle = ogType === 'article' && title ? title : fullTitle;

  const fullDescription = description ?? (pageDefaults ? pageDefaults.description : SITE_DESCRIPTION);

  // Strip locale prefix from current path if it exists to find the base path
  const pathWithoutLocale = currentPath.startsWith('/pt-br')
    ? currentPath.slice(6) || '/'
    : currentPath;

  const fullCanonical = canonical
    ? new URL(canonical, baseUrl).toString()
    : new URL(currentPath, baseUrl).toString();

  const fullImage = image ? new URL(image, baseUrl).toString() : new URL('/og-image.png', baseUrl).toString();
  const imageUrl = new URL(fullImage);
  imageUrl.searchParams.set('v', OG_IMAGE_VERSION);
  const shareImage = imageUrl.toString();

  const alternateLocales = noindex
    ? []
    : translations
      ? buildTranslationAlternates(translations, baseUrl)
      : buildPathAlternates(pathWithoutLocale, baseUrl);

  return {
    title: fullTitle,
    description: fullDescription,
    canonical: fullCanonical,
    og: {
      title: shareTitle,
      description: fullDescription,
      type: ogType,
      url: fullCanonical,
      image: shareImage,
      site_name: OG_SITE_NAME,
      locale: locale === 'pt-br' ? 'pt_BR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description: fullDescription,
      image: shareImage,
    },
    alternateLocales,
    robots: noindex ? ('noindex, follow' as const) : undefined,
  };
}
