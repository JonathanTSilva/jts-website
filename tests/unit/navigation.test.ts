import { describe, it, expect } from 'vitest';
import { getNavigation } from '../../src/lib/navigation';

describe('getNavigation', () => {
  it('returns 5 nav links for EN locale', () => {
    const nav = getNavigation('en');
    expect(nav).toHaveLength(5);
  });

  it('returns 5 nav links for PT-BR locale', () => {
    const nav = getNavigation('pt-br');
    expect(nav).toHaveLength(5);
  });

  it('EN links use unprefixed paths', () => {
    const nav = getNavigation('en');
    expect(nav.map(l => l.href)).toEqual(['/', '/portfolio', '/blog', '/notes', '/now']);
  });

  it('PT-BR links use /pt-br/ prefix', () => {
    const nav = getNavigation('pt-br');
    expect(nav.map(l => l.href)).toEqual([
      '/pt-br/',
      '/pt-br/portfolio',
      '/pt-br/blog',
      '/pt-br/notes',
      '/pt-br/now',
    ]);
  });

  it('EN labels are in English', () => {
    const nav = getNavigation('en');
    expect(nav.map(l => l.label)).toEqual(['Home', 'Portfolio', 'Blog', 'Notes', 'Now']);
  });

  it('PT-BR labels are in Portuguese', () => {
    const nav = getNavigation('pt-br');
    expect(nav.map(l => l.label)).toEqual(['Início', 'Portfólio', 'Blog', 'Notas', 'Agora']);
  });

  it('every link has a non-empty href and label', () => {
    for (const locale of ['en', 'pt-br'] as const) {
      for (const link of getNavigation(locale)) {
        expect(link.href.length).toBeGreaterThan(0);
        expect(link.label.length).toBeGreaterThan(0);
      }
    }
  });
});
