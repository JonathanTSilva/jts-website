import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildNoteIndex } from '../../../src/lib/content/staticPaths';

// Minimal note factory — only the fields used by buildNoteIndex / makeNoteStaticPaths
function makeNote(overrides: {
  id: string;
  language: 'en' | 'pt-br';
  translationKey: string;
  publishedAt?: Date;
  category?: string;
  tags?: string[];
  noteType?: string;
}) {
  return {
    id: overrides.id,
    data: {
      slug: overrides.id,
      language: overrides.language,
      translationKey: overrides.translationKey,
      publishedAt: overrides.publishedAt ?? new Date('2024-01-01'),
      category: overrides.category,
      tags: overrides.tags ?? [],
      noteType: overrides.noteType ?? 'note',
      title: overrides.id,
      summary: undefined,
      colorToken: undefined,
    },
  } as any;
}

// ─── makeNoteStaticPaths — prev/next guard ────────────────────────────────────

// We test the guard logic directly through buildNoteIndex (same logic pattern)
// and through the actual factory by mocking getCollection.

vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}));

import { makeNoteStaticPaths } from '../../../src/lib/content/staticPaths';
import { getCollection } from 'astro:content';

const mockedGetCollection = vi.mocked(getCollection);

describe('makeNoteStaticPaths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cross-locale note gets prev=undefined and next=undefined on the EN page', async () => {
    // EN locale page; the collection has one EN note and one PT-BR note
    const enNote = makeNote({ id: 'alpha.en', language: 'en', translationKey: 'alpha', publishedAt: new Date('2024-06-01') });
    const ptNote = makeNote({ id: 'beta.pt-br', language: 'pt-br', translationKey: 'beta', publishedAt: new Date('2024-07-01') });

    mockedGetCollection.mockResolvedValue([enNote, ptNote] as any);

    const paths = await makeNoteStaticPaths('en')();

    // Find the path generated for the PT-BR note (which exists on the EN page as a cross-locale route)
    const ptPath = paths.find((p: any) => p.params.slug === 'beta.pt-br');
    expect(ptPath).toBeDefined();
    // A cross-locale note must NOT get next = sameLangNotes[0] (the first EN note)
    expect(ptPath?.props.next).toBeUndefined();
    expect(ptPath?.props.prev).toBeUndefined();
  });

  it('EN note gets correct prev/next from EN-only ordered list', async () => {
    const n1 = makeNote({ id: 'n1.en', language: 'en', translationKey: 'k1', publishedAt: new Date('2024-01-01') });
    const n2 = makeNote({ id: 'n2.en', language: 'en', translationKey: 'k2', publishedAt: new Date('2024-02-01') });
    const n3 = makeNote({ id: 'n3.en', language: 'en', translationKey: 'k3', publishedAt: new Date('2024-03-01') });

    mockedGetCollection.mockResolvedValue([n1, n2, n3] as any);

    const paths = await makeNoteStaticPaths('en')();

    const p2 = paths.find((p: any) => p.params.slug === 'n2.en');
    expect(p2?.props.prev?.id).toBe('n1.en'); // older
    expect(p2?.props.next?.id).toBe('n3.en'); // newer

    const p1 = paths.find((p: any) => p.params.slug === 'n1.en');
    expect(p1?.props.prev).toBeUndefined(); // oldest — no prev
    expect(p1?.props.next?.id).toBe('n2.en');

    const p3 = paths.find((p: any) => p.params.slug === 'n3.en');
    expect(p3?.props.next).toBeUndefined(); // newest — no next
    expect(p3?.props.prev?.id).toBe('n2.en');
  });

  it('generates translation links correctly', async () => {
    const enNote = makeNote({ id: 'about.en', language: 'en', translationKey: 'about' });
    const ptNote = makeNote({ id: 'about.pt-br', language: 'pt-br', translationKey: 'about' });

    mockedGetCollection.mockResolvedValue([enNote, ptNote] as any);

    const paths = await makeNoteStaticPaths('en')();
    const enPath = paths.find((p: any) => p.params.slug === 'about.en');

    expect(enPath?.props.translations).toMatchObject({
      en: '/notes/about.en',
      'pt-br': '/pt-br/notes/about.pt-br',
    });
  });
});

// ─── buildNoteIndex ───────────────────────────────────────────────────────────

describe('buildNoteIndex', () => {
  it('returns one item per translationKey (deduplication)', () => {
    const notes = [
      makeNote({ id: 'a.en', language: 'en', translationKey: 'a', publishedAt: new Date('2024-01-01') }),
      makeNote({ id: 'a.pt-br', language: 'pt-br', translationKey: 'a', publishedAt: new Date('2024-01-01') }),
      makeNote({ id: 'b.en', language: 'en', translationKey: 'b', publishedAt: new Date('2024-02-01') }),
    ];

    const { notesToShow } = buildNoteIndex(notes as any, 'en');
    expect(notesToShow).toHaveLength(2);
  });

  it('prefers the matching-locale note over the fallback', () => {
    const enNote = makeNote({ id: 'a.en', language: 'en', translationKey: 'a', category: 'Systems' });
    const ptNote = makeNote({ id: 'a.pt-br', language: 'pt-br', translationKey: 'a', category: 'Sistemas' });

    const { notesToShow } = buildNoteIndex([enNote, ptNote] as any, 'en');
    expect(notesToShow[0]!.data.category).toBe('Systems');
    expect(notesToShow[0]!.isTranslationMissing).toBe(false);
  });

  it('falls back to EN note when PT-BR locale has no match, marks isTranslationMissing', () => {
    const enNote = makeNote({ id: 'only.en', language: 'en', translationKey: 'only', category: 'Systems' });

    const { notesToShow } = buildNoteIndex([enNote] as any, 'pt-br');
    expect(notesToShow).toHaveLength(1);
    expect(notesToShow[0]!.isTranslationMissing).toBe(true);
  });

  it('returns notes sorted descending by publishedAt', () => {
    const n1 = makeNote({ id: 'n1.en', language: 'en', translationKey: 'k1', publishedAt: new Date('2024-01-01') });
    const n2 = makeNote({ id: 'n2.en', language: 'en', translationKey: 'k2', publishedAt: new Date('2024-03-01') });
    const n3 = makeNote({ id: 'n3.en', language: 'en', translationKey: 'k3', publishedAt: new Date('2024-02-01') });

    const { notesToShow } = buildNoteIndex([n1, n2, n3] as any, 'en');
    expect(notesToShow.map((n: any) => n.id)).toEqual(['n2.en', 'n3.en', 'n1.en']);
  });

  it('computes categoryCounts matching actual note counts', () => {
    const notes = [
      makeNote({ id: 'a.en', language: 'en', translationKey: 'a', category: 'Firmware' }),
      makeNote({ id: 'b.en', language: 'en', translationKey: 'b', category: 'Firmware' }),
      makeNote({ id: 'c.en', language: 'en', translationKey: 'c', category: 'Linux' }),
    ];

    const { categoryCounts, notesToShow } = buildNoteIndex(notes as any, 'en');
    expect(categoryCounts['Firmware']).toBe(2);
    expect(categoryCounts['Linux']).toBe(1);

    // Verify counts actually match the visible notes
    for (const [cat, count] of Object.entries(categoryCounts)) {
      const actual = notesToShow.filter((n: any) => n.data.category === cat).length;
      expect(actual).toBe(count);
    }
  });

  it('computes noteTypeCounts correctly', () => {
    const notes = [
      makeNote({ id: 'a.en', language: 'en', translationKey: 'a', noteType: 'note' }),
      makeNote({ id: 'b.en', language: 'en', translationKey: 'b', noteType: 'book' }),
      makeNote({ id: 'c.en', language: 'en', translationKey: 'c', noteType: 'book' }),
    ];

    const { noteTypeCounts } = buildNoteIndex(notes as any, 'en');
    expect(noteTypeCounts['note']).toBe(1);
    expect(noteTypeCounts['book']).toBe(2);
  });
});
