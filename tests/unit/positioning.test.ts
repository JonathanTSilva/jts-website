import { describe, expect, it } from 'vitest';
import { getHeroPositioning } from '../../src/lib/content/positioning';

describe('getHeroPositioning', () => {
  it.each(['en', 'pt-br'] as const)('returns complete hero copy for %s', (locale) => {
    const hero = getHeroPositioning(locale);
    expect(hero.name).toBe('Jonathan Tobias');
    expect(hero.typewriterPhrases.length).toBeGreaterThan(0);
    expect(hero.achievements).toHaveLength(4);
    expect(hero.achievements[0]!.value).toBe(`${new Date().getFullYear() - 2020}+`);
  });

  it('keeps the two locales distinct', () => {
    expect(getHeroPositioning('en').blogCta).toBe('Read Blog');
    expect(getHeroPositioning('pt-br').blogCta).toBe('Ler Blog');
  });
});
