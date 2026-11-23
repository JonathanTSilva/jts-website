import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CollectionEntry } from 'astro:content';

vi.mock('astro:content', () => ({ getCollection: vi.fn() }));

import { getCollection } from 'astro:content';
import { buildNoteIndex, makeNoteStaticPaths } from '../../../src/lib/content/staticPaths';

const mockedGetCollection = vi.mocked(getCollection);

type NoteInit = {
  id: string;
  language: 'en' | 'pt-br';
  translationKey: string;
  publishedAt?: string;
  category?: string;
  tags?: string[] | undefined;
  noteType?: string | undefined;
};

function note(init: NoteInit) {
  return {
    id: init.id,
    data: {
      slug: init.id,
      language: init.language,
      translationKey: init.translationKey,
      publishedAt: new Date(init.publishedAt ?? '2024-01-01'),
      category: init.category,
      tags: init.tags,
      noteType: init.noteType,
      title: init.id,
    },
  } as unknown as CollectionEntry<'notes'>;
}

describe('buildNoteIndex edge cases', () => {
  it('shows a Portuguese-only note on the English index and translates its category when a map exists', () => {
    const notes = [
      note({ id: 'only-pt', language: 'pt-br', translationKey: 'a', category: 'Carreira', tags: [] }),
      note({ id: 'pair-en', language: 'en', translationKey: 'b', category: 'Career', tags: [] }),
      note({ id: 'pair-pt', language: 'pt-br', translationKey: 'b', category: 'Carreira', tags: [] }),
    ];
    const { notesToShow, categories } = buildNoteIndex(notes, 'en');
    const fallback = notesToShow.find((n) => n.id === 'only-pt')!;
    expect(fallback.isTranslationMissing).toBe(true);
    expect(fallback.data.category).toBe('Career');
    expect(categories).toEqual(['Career']);
  });

  it('keeps an unmapped category and tolerates a fallback note without a category', () => {
    const notes = [
      note({ id: 'unmapped', language: 'pt-br', translationKey: 'a', category: 'Solo', tags: [] }),
      note({ id: 'uncategorised', language: 'pt-br', translationKey: 'b', tags: [] }),
    ];
    const { notesToShow, categories } = buildNoteIndex(notes, 'en');
    expect(notesToShow.find((n) => n.id === 'unmapped')!.data.category).toBe('Solo');
    expect(notesToShow.find((n) => n.id === 'uncategorised')!.data.category).toBeUndefined();
    expect(categories).toEqual(['Solo']);
  });

  it('collects sorted unique tags and defaults a missing note type to note', () => {
    const notes = [
      note({ id: 'one', language: 'en', translationKey: 'a', tags: ['zeta', 'alpha'], noteType: undefined }),
      note({ id: 'two', language: 'en', translationKey: 'b', tags: ['alpha', 'beta'], noteType: 'book' }),
    ];
    const { tags, noteTypes, noteTypeCounts } = buildNoteIndex(notes, 'en');
    expect(tags).toEqual(['alpha', 'beta', 'zeta']);
    expect(noteTypes).toEqual(['book', 'note']);
    expect(noteTypeCounts).toEqual({ book: 1, note: 1 });
  });
});

describe('makeNoteStaticPaths related notes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('relates notes by category or shared tag, ignoring uncategorised and tagless notes', async () => {
    mockedGetCollection.mockResolvedValue([
      note({ id: 'main', language: 'en', translationKey: 'main', publishedAt: '2024-01-01', category: 'Eng', tags: ['x'] }),
      note({ id: 'same-category', language: 'en', translationKey: 'c', publishedAt: '2024-02-01', category: 'Eng', tags: [] }),
      note({ id: 'shared-tag', language: 'en', translationKey: 't', publishedAt: '2024-03-01', category: 'Other', tags: ['x'] }),
      note({ id: 'unrelated', language: 'en', translationKey: 'u', publishedAt: '2024-04-01', category: 'Other', tags: ['y'] }),
      note({ id: 'bare', language: 'en', translationKey: 'bare', publishedAt: '2024-05-01', tags: undefined }),
    ] as never);
    const paths = await makeNoteStaticPaths('en')();
    const main = paths.find((p) => p.params.slug === 'main')!;
    expect(main.props.relatedNotes.map((n: { id: string }) => n.id)).toEqual(['shared-tag', 'same-category']);
    const bare = paths.find((p) => p.params.slug === 'bare')!;
    expect(bare.props.relatedNotes).toEqual([]);
  });
});
