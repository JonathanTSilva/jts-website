/**
 * Cross-file content checks: rules about the set of files, not one file.
 *
 * Plain TypeScript, no astro:* imports: it runs under tsx from
 * scripts/validate-content.ts.
 */
import type { CollectionType } from './validation';

export interface CorpusFile {
  path: string;
  collection: CollectionType;
  data: Record<string, unknown>;
}

interface Entry {
  name: string;
  collection: CollectionType;
  language: string;
  translationKey: string;
  slug: string | null;
}

const baseName = (p: string): string => p.replace(/^.*[\\/]/, '');

function suffixLanguage(name: string): string | null {
  const m = /\.(en|pt-br)\.(md|mdx)$/.exec(name);
  return m ? m[1]! : null;
}

function groupBy<T>(items: T[], key: (item: T) => string): T[][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const group = groups.get(k);
    if (group) group.push(item);
    else groups.set(k, [item]);
  }
  return [...groups.values()];
}

const names = (entries: Entry[]): string => entries.map((e) => e.name).join(', ');

export function validateCorpus(files: CorpusFile[]): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const entries: Entry[] = [];
  for (const file of files) {
    const { language, translationKey, slug } = file.data;
    if (typeof language !== 'string' || typeof translationKey !== 'string') continue;
    entries.push({
      name: baseName(file.path),
      collection: file.collection,
      language,
      translationKey,
      slug: typeof slug === 'string' && slug.length > 0 ? slug : null,
    });
  }

  // The language field must agree with the filename suffix.
  for (const e of entries) {
    const suffix = suffixLanguage(e.name);
    if (suffix && suffix !== e.language) {
      errors.push(`language "${e.language}" does not match the filename suffix of ${e.name}`);
    }
  }

  // One slug, one URL: two files of a collection and language must not share it.
  const withSlug = entries.filter((e) => e.slug !== null);
  for (const group of groupBy(withSlug, (e) => `${e.collection}\0${e.language}\0${e.slug}`)) {
    if (group.length < 2) continue;
    const first = group[0]!;
    errors.push(`Duplicate slug "${first.slug}" in ${first.collection} (${first.language}): ${names(group)}`);
  }

  // A translationKey names one file per language.
  for (const group of groupBy(entries, (e) => `${e.collection}\0${e.translationKey}\0${e.language}`)) {
    if (group.length < 2) continue;
    const first = group[0]!;
    errors.push(
      `More than one ${first.language} file for translationKey "${first.translationKey}" in ${first.collection}: ${names(group)}`,
    );
  }

  // Translation pairing.
  for (const group of groupBy(entries, (e) => `${e.collection}\0${e.translationKey}`)) {
    const first = group[0]!;
    const languages = new Set(group.map((e) => e.language));
    for (const language of ['en', 'pt-br']) {
      if (!languages.has(language)) {
        warnings.push(`translationKey "${first.translationKey}" in ${first.collection} has no ${language} translation`);
      }
    }
    if (languages.has('en') && languages.has('pt-br')) {
      const slugs = new Set(group.map((e) => e.slug).filter((s): s is string => s !== null));
      if (slugs.size > 1) {
        warnings.push(`translationKey "${first.translationKey}" in ${first.collection} uses different slugs per language`);
      }
    }
  }

  return { errors, warnings };
}
