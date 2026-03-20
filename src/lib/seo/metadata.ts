import { type Locale, DEFAULT_LOCALE, LOCALES } from '../content/locale';

export const SITE_NAME = 'Jonathan';
export const SITE_DESCRIPTION = 'Senior Embedded Software Engineer Portfolio & Writing';

export interface SeoProps {
  title?: string | undefined;
  description?: string | undefined;
  canonical?: string;
  ogType?: 'website' | 'article';
  image?: string;
  locale: Locale;
  currentPath?: string;
}

export function generateSeo(props: SeoProps) {
  const { title, description, canonical, ogType = 'website', image, locale, currentPath = '/' } = props;
  const baseUrl = 'https://www.jontobias.com';
  
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const fullDescription = description || SITE_DESCRIPTION;
  
  // Strip locale prefix from current path if it exists to find the base path
  const pathWithoutLocale = currentPath.startsWith('/pt-br') 
    ? currentPath.slice(6) || '/' 
    : currentPath;

  const fullCanonical = canonical 
    ? new URL(canonical, baseUrl).toString() 
    : new URL(currentPath, baseUrl).toString();

  const fullImage = image ? new URL(image, baseUrl).toString() : new URL('/og-image.png', baseUrl).toString();

  const alternateLocales = LOCALES.map((loc) => {
    const localePrefix = loc === DEFAULT_LOCALE ? '' : `/${loc}`;
    const href = new URL(`${localePrefix}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`, baseUrl).toString();
    return {
      locale: loc,
      href,
    };
  });

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
