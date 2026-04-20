import { describe, it, expect } from 'vitest';
import { getReadingTime } from '../../src/lib/readingTime';

describe('getReadingTime', () => {
  it('returns 1 for undefined body', () => {
    expect(getReadingTime(undefined)).toBe(1);
  });

  it('returns 1 for empty string', () => {
    expect(getReadingTime('')).toBe(1);
  });

  it('returns 1 for whitespace-only body', () => {
    expect(getReadingTime('   \n\n  ')).toBe(1);
  });

  it('returns 1 for very short content (minimum clamp)', () => {
    expect(getReadingTime('Hello world')).toBe(1);
  });

  it('calculates ~1 min for 238 words (WPM boundary)', () => {
    const words = Array(238).fill('word').join(' ');
    expect(getReadingTime(words)).toBe(1);
  });

  it('rounds up to 2 min for 239 words', () => {
    const words = Array(239).fill('word').join(' ');
    expect(getReadingTime(words)).toBe(2);
  });

  it('calculates correctly for a long post (~1000 words)', () => {
    const words = Array(1000).fill('word').join(' ');
    // 1000/238 = 4.2 → ceil = 5
    expect(getReadingTime(words)).toBe(5);
  });

  it('trims leading/trailing whitespace before counting', () => {
    const body = '  \n  ' + Array(238).fill('word').join(' ') + '  \n  ';
    expect(getReadingTime(body)).toBe(1);
  });
});
