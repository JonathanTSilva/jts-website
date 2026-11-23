import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { formatDate } from '../../src/lib/format';

describe('formatDate', () => {
  const originalTz = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = 'America/Sao_Paulo';
  });

  afterAll(() => {
    if (originalTz === undefined) delete process.env.TZ;
    else process.env.TZ = originalTz;
  });

  it('the test timezone really is UTC-3 (a naive local-time format loses a day)', () => {
    const naive = new Date('2026-11-19').toLocaleDateString('en-US', { dateStyle: 'long' });
    expect(naive).toBe('November 18, 2026');
  });

  it('date-only values keep their day in UTC-3', () => {
    expect(formatDate(new Date('2026-11-19'), 'en')).toBe('November 19, 2026');
    expect(formatDate(new Date('2026-11-19'), 'pt-br')).toBe('19 de novembro de 2026');
  });

  it('defaults to the long style when options are omitted or undefined', () => {
    expect(formatDate(new Date('2026-11-19'), 'en', undefined)).toBe('November 19, 2026');
  });

  it('accepts custom options and still formats in UTC', () => {
    expect(formatDate(new Date('2026-11-19'), 'en', { dateStyle: 'medium' })).toBe('Nov 19, 2026');
    expect(formatDate(new Date('2026-11-19'), 'en', { month: 'short', day: '2-digit' })).toBe('Nov 19');
    expect(formatDate(new Date('2026-11-19'), 'en', {})).toBe('11/19/2026');
    expect(formatDate(new Date('2026-11-19'), 'pt-br', {})).toBe('19/11/2026');
  });
});
