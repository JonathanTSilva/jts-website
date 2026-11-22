import { SITE_NAME } from './metadata';
import type { Person } from '../../content/portfolio/schema';
import { SITE_URL } from '../site';
import type { Locale } from '../content/locale';

const BASE_URL = SITE_URL;

export interface ArticleSchemaInput {
  title: string;
  description: string;
  /** Canonical absolute URL of the page, trailing slash included. */
  url: string;
  publishedAt: Date;
  updatedAt?: Date;
  /** Absolute URL of the share image. */
  image?: string;
  locale: Locale;
}

const AUTHOR_NAME = 'Jonathan Tobias';
const IN_LANGUAGE: Record<Locale, string> = { en: 'en', 'pt-br': 'pt-BR' };

type PersonLink = Person['links'][number];
type PersonLinkKind = PersonLink['kind'];
type ReadonlyPerson = Omit<Readonly<Person>, 'links'> & {
  readonly links: readonly PersonLink[];
};

export function getPersonLink<K extends PersonLinkKind>(
  person: ReadonlyPerson,
  kind: K,
): Readonly<Extract<PersonLink, { kind: K }>> {
  const links = person.links.filter((candidate) => candidate.kind === kind);
  if (links.length === 0) throw new Error(`Missing required ${kind} link for ${person.id}`);
  if (links.length > 1) throw new Error(`Duplicate required ${kind} link for ${person.id}`);
  return Object.freeze({ ...links[0] }) as Readonly<Extract<PersonLink, { kind: K }>>;
}

export function generatePersonSchema(person: ReadonlyPerson) {
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

export function generateArticleSchema(input: ArticleSchemaInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    url: input.url,
    mainEntityOfPage: input.url,
    inLanguage: IN_LANGUAGE[input.locale],
    author: { '@type': 'Person', name: AUTHOR_NAME, url: SITE_URL },
    datePublished: input.publishedAt.toISOString(),
    dateModified: (input.updatedAt ?? input.publishedAt).toISOString(),
  };
  if (input.image !== undefined) {
    schema.image = input.image;
  }
  return schema;
}

/** JSON for an inline ld+json script: `<` is escaped so content can never close the tag. */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
