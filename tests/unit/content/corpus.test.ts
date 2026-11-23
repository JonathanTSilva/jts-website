import { describe, it, expect } from 'vitest';
import { validateCorpus, type CorpusFile } from '../../../src/lib/content/corpus';

function file(
  name: string,
  collection: CorpusFile['collection'],
  data: Record<string, unknown>,
): CorpusFile {
  return { path: `/some/dir/${name}`, collection, data };
}

const post = (name: string, language: string, slug: string, translationKey: string) =>
  file(name, 'blog', { slug, language, translationKey });

describe('validateCorpus', () => {
  it('accepts a clean EN and PT pair', () => {
    const result = validateCorpus([
      post('2026-03-x.en.md', 'en', 'x', 'k'),
      post('2026-03-x.pt-br.md', 'pt-br', 'x', 'k'),
    ]);
    expect(result).toEqual({ errors: [], warnings: [] });
  });

  it('flags a duplicate slug within a collection and language', () => {
    const { errors } = validateCorpus([
      post('a.en.md', 'en', 'x', 'k1'),
      post('b.en.md', 'en', 'x', 'k2'),
      post('a.pt-br.md', 'pt-br', 'a', 'k1'),
      post('b.pt-br.md', 'pt-br', 'b', 'k2'),
    ]);
    expect(errors).toEqual(['Duplicate slug "x" in blog (en): a.en.md, b.en.md']);
  });

  it('flags one slug shared by two translationKeys in different languages', () => {
    // An EN-only post and an unrelated PT-only post would both build /blog/x/ and
    // /pt-br/blog/x/ (one real page, one fallback), so one URL would hold two posts.
    const { errors } = validateCorpus([
      post('2026-01-x.en.md', 'en', 'x', 'k1'),
      post('2026-02-x.pt-br.md', 'pt-br', 'x', 'k2'),
    ]);
    expect(errors).toEqual([
      'Slug "x" in blog belongs to more than one translationKey: 2026-01-x.en.md (k1), 2026-02-x.pt-br.md (k2)',
    ]);
  });

  it('allows the same slug in different collections', () => {
    const { errors } = validateCorpus([
      post('a.en.md', 'en', 'x', 'k1'),
      file('a.en.md', 'notes', { slug: 'x', language: 'en', translationKey: 'k2' }),
    ]);
    expect(errors).toEqual([]);
  });

  it('flags more than one file of a language for one translationKey', () => {
    const { errors } = validateCorpus([
      file('a.pt-br.md', 'notes', { slug: 'a', language: 'pt-br', translationKey: 'k' }),
      file('b.pt-br.md', 'notes', { slug: 'b', language: 'pt-br', translationKey: 'k' }),
      file('a.en.md', 'notes', { slug: 'a', language: 'en', translationKey: 'k' }),
    ]);
    expect(errors).toContain(
      'More than one pt-br file for translationKey "k" in notes: a.pt-br.md, b.pt-br.md',
    );
  });

  it('flags a language that does not match the filename suffix', () => {
    const { errors } = validateCorpus([
      post('x.pt-br.md', 'en', 'x', 'k'),
      post('x.en.md', 'en', 'x', 'k'),
    ]);
    expect(errors).toContain('language "en" does not match the filename suffix of x.pt-br.md');
  });

  it('ignores filenames without a language suffix', () => {
    const { errors } = validateCorpus([post('x.md', 'en', 'x', 'k')]);
    expect(errors).toEqual([]);
  });

  it('warns when a translationKey has no pt-br translation', () => {
    const { errors, warnings } = validateCorpus([post('x.en.md', 'en', 'x', 'k')]);
    expect(errors).toEqual([]);
    expect(warnings).toEqual(['translationKey "k" in blog has no pt-br translation']);
  });

  it('warns when a translationKey has no en counterpart', () => {
    const { warnings } = validateCorpus([post('x.pt-br.md', 'pt-br', 'x', 'k')]);
    expect(warnings).toEqual(['translationKey "k" in blog has no en translation']);
  });

  it('warns when a translationKey uses different slugs per language', () => {
    const { errors, warnings } = validateCorpus([
      post('x.en.md', 'en', 'x', 'k'),
      post('y.pt-br.md', 'pt-br', 'y', 'k'),
    ]);
    expect(errors).toEqual([]);
    expect(warnings).toEqual(['translationKey "k" in blog uses different slugs per language']);
  });

  it('skips files without a usable language or translationKey', () => {
    const result = validateCorpus([
      file('a.en.md', 'blog', { slug: 'a' }),
      file('b.en.md', 'blog', { slug: 'a', language: 3, translationKey: 'k' }),
    ]);
    expect(result).toEqual({ errors: [], warnings: [] });
  });

  it('pairs files without a slug (now, portfolio) by translationKey', () => {
    const { errors, warnings } = validateCorpus([
      file('index.en.md', 'now', { language: 'en', translationKey: 'now' }),
      file('index.pt-br.md', 'now', { language: 'pt-br', translationKey: 'now' }),
    ]);
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
  });
});
