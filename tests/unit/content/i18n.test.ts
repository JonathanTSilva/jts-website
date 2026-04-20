import { describe, it, expect } from 'vitest';
import { buildCategoryMap } from '../../../src/lib/content/i18n';

type Item = {
  data: { translationKey: string; language: string; category?: string | null | undefined };
};

function item(translationKey: string, language: string, category?: string): Item {
  return { data: { translationKey, language, category } };
}

describe('buildCategoryMap', () => {
  it('maps source category to target category for bilingual pairs', () => {
    const items: Item[] = [
      item('post-1', 'en', 'Software Engineering'),
      item('post-1', 'pt-br', 'Engenharia de Software'),
    ];
    const map = buildCategoryMap(items, 'en', 'pt-br');
    expect(map.get('Software Engineering')).toBe('Engenharia de Software');
  });

  it('returns empty map when no bilingual pairs exist', () => {
    const items: Item[] = [
      item('post-1', 'en', 'Software Engineering'),
    ];
    const map = buildCategoryMap(items, 'en', 'pt-br');
    expect(map.size).toBe(0);
  });

  it('skips pairs where categories are the same', () => {
    const items: Item[] = [
      item('post-1', 'en', 'Blog'),
      item('post-1', 'pt-br', 'Blog'),
    ];
    const map = buildCategoryMap(items, 'en', 'pt-br');
    expect(map.size).toBe(0);
  });

  it('skips pairs where source category is missing', () => {
    const items: Item[] = [
      item('post-1', 'en', undefined),
      item('post-1', 'pt-br', 'Carreira'),
    ];
    const map = buildCategoryMap(items, 'en', 'pt-br');
    expect(map.size).toBe(0);
  });

  it('skips pairs where target category is missing', () => {
    const items: Item[] = [
      item('post-1', 'en', 'Career'),
      item('post-1', 'pt-br', undefined),
    ];
    const map = buildCategoryMap(items, 'en', 'pt-br');
    expect(map.size).toBe(0);
  });

  it('handles multiple translation groups', () => {
    const items: Item[] = [
      item('post-1', 'en', 'Career'),
      item('post-1', 'pt-br', 'Carreira'),
      item('post-2', 'en', 'Life'),
      item('post-2', 'pt-br', 'Vida'),
    ];
    const map = buildCategoryMap(items, 'en', 'pt-br');
    expect(map.get('Career')).toBe('Carreira');
    expect(map.get('Life')).toBe('Vida');
  });

  it('works in reverse direction (pt-br → en)', () => {
    const items: Item[] = [
      item('post-1', 'en', 'Software Engineering'),
      item('post-1', 'pt-br', 'Engenharia de Software'),
    ];
    const map = buildCategoryMap(items, 'pt-br', 'en');
    expect(map.get('Engenharia de Software')).toBe('Software Engineering');
  });

  it('handles null category as missing', () => {
    const items: Item[] = [
      item('post-1', 'en', 'Career'),
      { data: { translationKey: 'post-1', language: 'pt-br', category: null } },
    ];
    const map = buildCategoryMap(items, 'en', 'pt-br');
    expect(map.size).toBe(0);
  });
});
