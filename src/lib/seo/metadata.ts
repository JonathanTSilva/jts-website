import { type Locale, DEFAULT_LOCALE, LOCALES } from '../content/locale';

export const SITE_NAME = 'Tobias';
export const SITE_DESCRIPTION = 'Senior Embedded Software Engineer & M.Sc. specializing in mission-critical systems and technical leadership.';

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
}

export function generateSeo(props: SeoProps) {
  const { title, description, canonical, ogType = 'website', image, locale, currentPath = '/', pageType } = props;
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

  const fullDescription = description ?? (pageDefaults ? pageDefaults.description : SITE_DESCRIPTION);

  // Strip locale prefix from current path if it exists to find the base path
  const pathWithoutLocale = currentPath.startsWith('/pt-br')
    ? currentPath.slice(6) || '/'
    : currentPath;

  const fullCanonical = canonical
    ? new URL(canonical, baseUrl).toString()
    : new URL(currentPath, baseUrl).toString();

  const fullImage = image ? new URL(image, baseUrl).toString() : new URL('/og-image.png', baseUrl).toString();

  // EN (x-default) URL derived from pathWithoutLocale
  const enHref = new URL(pathWithoutLocale === '/' ? '/' : pathWithoutLocale, baseUrl).toString();

  const alternateLocales = [
    ...LOCALES.map((loc) => {
      const localePrefix = loc === DEFAULT_LOCALE ? '' : `/${loc}`;
      const path = pathWithoutLocale === '/' ? '' : pathWithoutLocale;
      const href = new URL(`${localePrefix}${path}${path === '' ? '/' : ''}`, baseUrl).toString();
      return { locale: loc, href };
    }),
    { locale: 'x-default', href: enHref },
  ];

  return {
    title: fullTitle,
    description: fullDescription,
    canonical: fullCanonical,
    og: {
      title: fullTitle,
      description: fullDescription,
      type: ogType,
      url: fullCanonical,
      image: fullImage,
      site_name: SITE_NAME,
      locale: locale === 'pt-br' ? 'pt_BR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      image: fullImage,
    },
    alternateLocales,
  };
}
