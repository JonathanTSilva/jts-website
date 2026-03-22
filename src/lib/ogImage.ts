import { readFileSync } from 'fs';
import { resolve } from 'path';
import satori from 'satori';
import sharp from 'sharp';

// Load fonts once at module level
const geistFont = readFileSync(
  resolve('node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf')
);
const geistBoldFont = readFileSync(
  resolve('node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf')
);
const geistMonoFont = readFileSync(
  resolve('node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf')
);

export interface OGImageOptions {
  title: string;
  category?: string;
  siteName?: string;
  author?: string;
}

export async function generateOGImage(options: OGImageOptions): Promise<Buffer> {
  const {
    title,
    category,
    siteName = 'jts.dev',
    author = 'Jonathan',
  } = options;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          background: '#0f0f1a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '60px 80px',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // Site name (top left)
          {
            type: 'p',
            props: {
              style: {
                position: 'absolute',
                top: '40px',
                left: '80px',
                fontFamily: 'Geist',
                fontSize: '16px',
                color: '#888',
                margin: '0',
              },
              children: siteName,
            },
          },
          // Category badge
          ...(category ? [{
            type: 'div',
            props: {
              style: {
                background: '#7c3aed',
                color: '#fff',
                fontFamily: 'Geist',
                fontSize: '14px',
                padding: '4px 16px',
                borderRadius: '9999px',
                marginBottom: '16px',
                display: 'flex',
              },
              children: category,
            },
          }] : []),
          // Title
          {
            type: 'h1',
            props: {
              style: {
                fontFamily: 'Geist',
                fontSize: '48px',
                fontWeight: '700',
                color: '#fff',
                lineHeight: '1.2',
                margin: '0',
                maxWidth: '900px',
              },
              children: title,
            },
          },
          // Author (bottom right)
          {
            type: 'p',
            props: {
              style: {
                position: 'absolute',
                bottom: '40px',
                right: '80px',
                fontFamily: 'GeistMono',
                fontSize: '14px',
                color: '#888',
                margin: '0',
              },
              children: `${author} · ${siteName}`,
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Geist', data: geistFont, weight: 400, style: 'normal' },
        { name: 'Geist', data: geistBoldFont, weight: 700, style: 'normal' },
        { name: 'GeistMono', data: geistMonoFont, weight: 400, style: 'normal' },
      ],
    }
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}
