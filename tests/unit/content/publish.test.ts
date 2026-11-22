import { describe, it, expect } from 'vitest';
import { isPublished } from '../../../src/lib/content/publish';

const now = new Date('2026-06-15T04:17:00Z');

describe('isPublished', () => {
  it('is false when publishedAt is one day after now', () => {
    expect(isPublished({ publishedAt: new Date('2026-06-16T04:17:00Z') }, now)).toBe(false);
  });

  it('is true when publishedAt equals now', () => {
    expect(isPublished({ publishedAt: new Date(now) }, now)).toBe(true);
  });

  it('is true when publishedAt is in the past', () => {
    expect(isPublished({ publishedAt: new Date('2026-06-14T00:00:00Z') }, now)).toBe(true);
  });

  it('compares in UTC: a date-only value is midnight UTC of that day', () => {
    expect(isPublished({ publishedAt: new Date('2026-06-15') }, now)).toBe(true);
    expect(isPublished({ publishedAt: new Date('2026-06-16') }, now)).toBe(false);
  });

  it('defaults now to the current time', () => {
    expect(isPublished({ publishedAt: new Date('2000-01-01') })).toBe(true);
    expect(isPublished({ publishedAt: new Date('2999-01-01') })).toBe(false);
  });
});
