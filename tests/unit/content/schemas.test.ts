import { describe, expect, it } from 'vitest';
import { notesSchema } from '../../../src/lib/content/schemas';

const note = {
  slug: 'a-note',
  title: 'A note',
  language: 'en',
  translationKey: 'a-note',
  publishedAt: '2026-04-17',
};

describe('notesSchema', () => {
  it('accepts an optional updatedAt like blog posts do', () => {
    const parsed = notesSchema.parse({ ...note, updatedAt: '2026-05-01' });
    expect(parsed.updatedAt?.toISOString()).toBe('2026-05-01T00:00:00.000Z');
  });

  it('keeps updatedAt optional', () => {
    expect(notesSchema.parse(note).updatedAt).toBeUndefined();
  });
});
