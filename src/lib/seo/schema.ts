import { SITE_NAME } from './metadata';
import { career } from '../../content/portfolio/career';
import type { Person } from '../../content/portfolio/schema';

const BASE_URL = 'https://www.jontobias.com';

interface ArticleSchemaInput {
  title: string;
  description: string;
  url: string;
  publishedAt: Date;
  image?: string;
}

type PersonLinkKind = Person['links'][number]['kind'];

export function getPersonLink(person: Person, kind: PersonLinkKind) {
  const link = person.links.find((candidate) => candidate.kind === kind);
  if (!link) throw new Error(`Missing required ${kind} link for ${person.id}`);
  return link;
}

export function generatePersonSchema(person: Person = career.person) {
  const website = getPersonLink(person, 'website');
  const linkedIn = getPersonLink(person, 'linkedin');
  const github = getPersonLink(person, 'github');

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.fullName,
    url: website.url,
    jobTitle: person.headline.en,
    sameAs: [linkedIn.url, github.url],
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
