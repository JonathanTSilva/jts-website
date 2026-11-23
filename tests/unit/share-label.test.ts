import { describe, it, expect } from 'vitest';
import {
  buildShareLabel,
  resolveShareAccent,
  lightenHex,
} from '../../src/lib/og/shareLabel';

describe('buildShareLabel', () => {
  it('builds label for English blog with category', () => {
    expect(
      buildShareLabel({ kind: 'blog', category: 'Engineering', locale: 'en' })
    ).toBe('BLOG · ENGINEERING');
  });

  it('builds label for Portuguese whiteboard with category', () => {
    expect(
      buildShareLabel({
        kind: 'whiteboard',
        category: 'Engenharia',
        locale: 'pt-br',
      })
    ).toBe('QUADRO · ENGENHARIA');
  });

  it('builds label for Portuguese mindmap without category', () => {
    expect(buildShareLabel({ kind: 'mindmap', locale: 'pt-br' })).toBe(
      'MAPA MENTAL'
    );
  });

  it('builds label for Portuguese book with accented category', () => {
    expect(
      buildShareLabel({
        kind: 'book',
        category: 'Produção é ótima',
        locale: 'pt-br',
      })
    ).toBe('LIVRO · PRODUÇÃO É ÓTIMA');
  });

  it('builds label for Portuguese blog with category', () => {
    expect(
      buildShareLabel({ kind: 'blog', category: 'Personal', locale: 'pt-br' })
    ).toBe('ARTIGO · PERSONAL');
  });

  it('omits separator when category is undefined or blank', () => {
    expect(
      buildShareLabel({ kind: 'note', category: undefined, locale: 'en' })
    ).toBe('NOTE');
    expect(buildShareLabel({ kind: 'note', category: '', locale: 'en' })).toBe(
      'NOTE'
    );
    expect(
      buildShareLabel({ kind: 'note', category: '   ', locale: 'en' })
    ).toBe('NOTE');
  });
});

describe('resolveShareAccent', () => {
  it('returns valid 6-digit hex color', () => {
    expect(resolveShareAccent('#0ea5e9')).toBe('#0ea5e9');
  });

  it('returns valid 3-digit hex color', () => {
    expect(resolveShareAccent('#abc')).toBe('#abc');
  });

  it('falls back to default accent for invalid or missing color tokens', () => {
    expect(resolveShareAccent('red')).toBe('#6272EA');
    expect(resolveShareAccent('var(--x)')).toBe('#6272EA');
    expect(resolveShareAccent(undefined)).toBe('#6272EA');
    expect(resolveShareAccent()).toBe('#6272EA');
  });
});

describe('lightenHex', () => {
  it('lightens black with 0.5 amount to mid-gray', () => {
    expect(lightenHex('#000000', 0.5)).toBe('rgb(128,128,128)');
  });

  it('parses each channel of a 6-digit hex with and without the leading hash', () => {
    expect(lightenHex('#102030', 0)).toBe('rgb(16,32,48)');
    expect(lightenHex('ff8000', 0)).toBe('rgb(255,128,0)');
  });

  it('expands a 3-digit hex per channel', () => {
    expect(lightenHex('#1a2', 0)).toBe('rgb(17,170,34)');
  });

  it('lightens 3-digit white hex with default amount', () => {
    expect(lightenHex('#fff')).toBe('rgb(255,255,255)');
  });
});
