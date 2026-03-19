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
}

export function generateSeo(props: SeoProps) {
  const { title, description, canonical, ogType = 'website', image, locale } = props;
  const baseUrl = 'https://jts.dev'; // Placeholder base URL
  
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const fullDescription = description || SITE_DESCRIPTION;
  const fullCanonical = canonical ? new URL(canonical, baseUrl).toString() : baseUrl;
  const fullImage = image ? new URL(image, baseUrl).toString() : new URL('/og-image.png', baseUrl).toString();

  const alternateLocales = LOCALES.map((loc) => ({
    locale: loc,
    href: new URL(loc === DEFAULT_LOCALE ? '/' : `/${loc}`, baseUrl).toString(),
  }));

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
