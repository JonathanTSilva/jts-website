import { readFileSync } from 'fs';
import { resolve } from 'path';
import satori from 'satori';
import sharp from 'sharp';
import { lightenHex } from './og/shareLabel';
import { SITE_DISPLAY_NAME } from './site';

const FONT_DIR = 'src/assets/fonts/geist';
const loadFont = (file: string) => readFileSync(resolve(FONT_DIR, file));

// Load fonts once at module level
const fonts = [
  { name: 'Geist', data: loadFont('Geist-Regular.ttf'), weight: 400, style: 'normal' },
  { name: 'Geist', data: loadFont('Geist-SemiBold.ttf'), weight: 600, style: 'normal' },
  { name: 'Geist', data: loadFont('Geist-Bold.ttf'), weight: 700, style: 'normal' },
  { name: 'Geist Mono', data: loadFont('GeistMono-Medium.ttf'), weight: 500, style: 'normal' },
] as const;

// Load images as base64 data URIs
const logoBase64 = (() => {
  const data = readFileSync(resolve('public/assets/images/jts-logo-rounded-square.png'));
  return `data:image/png;base64,${data.toString('base64')}`;
})();

const avatarBase64 = (() => {
  const data = readFileSync(resolve('public/assets/images/profile.jpg'));
  return `data:image/jpeg;base64,${data.toString('base64')}`;
})();

interface OGImageOptions {
  title: string;
  label: string;
  accent?: string;
}

export const DEFAULT_OG_AUTHOR = 'Jonathan Tobias';
export const DEFAULT_OG_AUTHOR_ROLE = 'Senior Embedded Software Engineer';
export const DEFAULT_OG_DOMAIN = SITE_DISPLAY_NAME;

const BG = '#0A0A0F';
const TEXT = '#E8E8F2';
const MUTED = '#8185A5';
const DEFAULT_ACCENT = '#6272EA';

function titleFontSize(title: string): number {
  if (title.length > 100) return 54;
  if (title.length > 70) return 62;
  if (title.length > 40) return 70;
  return 76;
}

type Node = { type: string; props: { style?: Record<string, unknown>; [key: string]: unknown } };

const box = (style: Record<string, unknown>, ...children: unknown[]): Node => ({
  type: 'div',
  props: {
    style: { display: 'flex', ...style },
    children: children.length === 1 ? children[0] : children,
  },
});

const image = (src: string, size: number, style: Record<string, unknown> = {}): Node => ({
  type: 'img',
  props: { src, width: size, height: size, style },
});

export async function generateOGImage(options: OGImageOptions): Promise<Buffer> {
  const { title, label, accent = DEFAULT_ACCENT } = options;

  const card = box(
    { width: 1200, height: 630, background: BG, flexDirection: 'column', fontFamily: 'Geist' },
    box({ height: 14, width: 1200, background: accent }),
    box(
      { flex: 1, flexDirection: 'column', padding: '56px 72px 0 72px', overflow: 'hidden' },
      box(
        { fontFamily: 'Geist Mono', fontWeight: 500, fontSize: 30, color: lightenHex(accent), letterSpacing: 2 },
        label
      ),
      box(
        {
          marginTop: 28,
          fontSize: titleFontSize(title),
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.12,
          maxWidth: 1050,
        },
        title
      )
    ),
    box(
      { alignItems: 'center', justifyContent: 'space-between', padding: '0 72px 52px 72px' },
      box(
        { alignItems: 'center', gap: 20 },
        image(avatarBase64, 84, { boxSizing: 'border-box', borderRadius: 9999, border: `3px solid ${accent}` }),
        box(
          { flexDirection: 'column' },
          box({ fontSize: 34, fontWeight: 600, color: TEXT }, DEFAULT_OG_AUTHOR),
          box({ fontSize: 24, color: MUTED }, DEFAULT_OG_AUTHOR_ROLE)
        )
      ),
      box(
        { alignItems: 'center', gap: 14 },
        image(logoBase64, 56, { borderRadius: 12 }),
        box({ fontSize: 28, color: TEXT, fontFamily: 'Geist Mono', fontWeight: 500 }, DEFAULT_OG_DOMAIN)
      )
    )
  );

  const svg = await satori(card as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [...fonts],
  });

  return sharp(Buffer.from(svg)).png().toBuffer();
}
