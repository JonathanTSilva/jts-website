import { SITE_NAME } from './metadata';

const BASE_URL = 'https://www.jontobias.com';

export interface ArticleSchemaInput {
  title: string;
  description: string;
  url: string;
  publishedAt: Date;
  image?: string;
}

export function generatePersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Jonathan Tobias',
    url: BASE_URL,
    jobTitle: 'Senior Embedded Software Engineer',
    sameAs: [
      'https://www.linkedin.com/in/jonathan-tobias-silva',
      'https://github.com/JonathanTSilva',
    ],
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
  };
}

export function generateArticleSchema(input: ArticleSchemaInput) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    url: input.url,
    datePublished: input.publishedAt.toISOString(),
  };
  if (input.image !== undefined) {
    schema.image = input.image;
  }
  return schema;
}
