import { describe, it, expect } from 'vitest';
import { getCategoryColor, categoryColors } from '../../src/lib/categoryColors';

describe('getCategoryColor', () => {
  it('returns colorToken when provided (overrides category)', () => {
    expect(getCategoryColor('Software Engineering', '#ff0000')).toBe('#ff0000');
  });

  it('returns colorToken even when category is undefined', () => {
    expect(getCategoryColor(undefined, '#abc123')).toBe('#abc123');
  });

  it('returns mapped color for known category', () => {
    expect(getCategoryColor('Software Engineering')).toBe(categoryColors['Software Engineering']);
  });

  it('returns mapped color for Real-Time Systems', () => {
    expect(getCategoryColor('Real-Time Systems')).toBe('#78350f');
  });

  it('returns mapped color for Engineering', () => {
    expect(getCategoryColor('Engineering')).toBe('#064e3b');
  });

  it('returns default color for unknown category', () => {
    expect(getCategoryColor('Nonexistent Category')).toBe(categoryColors.default);
  });

  it('returns default color when category is undefined and no colorToken', () => {
    expect(getCategoryColor(undefined)).toBe(categoryColors.default);
  });

  it('returns default color when category is undefined and colorToken is undefined', () => {
    expect(getCategoryColor(undefined, undefined)).toBe(categoryColors.default);
  });

  it('prefers colorToken over any category match', () => {
    expect(getCategoryColor('Real-Time Systems', '#custom')).toBe('#custom');
  });
});

describe('categoryColors map', () => {
  it('has a default key', () => {
    expect(categoryColors).toHaveProperty('default');
  });

  it('every value is a valid hex color', () => {
    for (const [, color] of Object.entries(categoryColors)) {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
