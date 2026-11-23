import type { Locale } from '../content/locale';

export type ShareKind = 'blog' | 'note' | 'book' | 'mindmap' | 'whiteboard';

const KIND_LABELS: Record<ShareKind, Record<Locale, string>> = {
  blog: { en: 'Blog', 'pt-br': 'Artigo' },
  note: { en: 'Note', 'pt-br': 'Nota' },
  book: { en: 'Book', 'pt-br': 'Livro' },
  mindmap: { en: 'Mind Map', 'pt-br': 'Mapa Mental' },
  whiteboard: { en: 'Whiteboard', 'pt-br': 'Quadro' },
};

const DEFAULT_ACCENT = '#6272EA';
const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function buildShareLabel(opts: {
  kind: ShareKind;
  category?: string | undefined;
  locale: Locale;
}): string {
  const localeTag = opts.locale === 'pt-br' ? 'pt-BR' : 'en-US';
  const kindText = KIND_LABELS[opts.kind][opts.locale];
  const categoryText = opts.category?.trim();

  if (categoryText) {
    return `${kindText} · ${categoryText}`.toLocaleUpperCase(localeTag);
  }

  return kindText.toLocaleUpperCase(localeTag);
}

export function resolveShareAccent(colorToken?: string): string {
  if (colorToken && HEX_COLOR_REGEX.test(colorToken)) {
    return colorToken;
  }
  return DEFAULT_ACCENT;
}

export function lightenHex(hex: string, amount = 0.55): string {
  let clean = hex.startsWith('#') ? hex.slice(1) : hex;
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);

  const lightenChannel = (v: number) => Math.round(v + (255 - v) * amount);
  return `rgb(${lightenChannel(r)},${lightenChannel(g)},${lightenChannel(b)})`;
}
