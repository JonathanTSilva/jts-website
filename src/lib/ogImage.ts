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

// Load images as base64 data URIs
const logoBase64 = (() => {
  const data = readFileSync(resolve('public/assets/images/jts-logo-rounded-square.png'));
  return `data:image/png;base64,${data.toString('base64')}`;
})();

const avatarBase64 = (() => {
  const data = readFileSync(resolve('public/assets/images/profile.jpg'));
  return `data:image/jpeg;base64,${data.toString('base64')}`;
})();

export interface OGImageOptions {
  title: string;
  category?: string;
  author?: string;
  authorRole?: string;
}

export const DEFAULT_OG_AUTHOR = 'Jonathan Tobias';
export const DEFAULT_OG_AUTHOR_ROLE = 'Senior Embedded Software Engineer';
export const DEFAULT_OG_DOMAIN = 'jontobias.com';

export async function generateOGImage(options: OGImageOptions): Promise<Buffer> {
  const {
    title,
    category,
    author = DEFAULT_OG_AUTHOR,
    authorRole = DEFAULT_OG_AUTHOR_ROLE,
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
          // Background accent glow (top-right)
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '-120px',
                right: '-80px',
                width: '400px',
                height: '400px',
                borderRadius: '9999px',
                background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
                display: 'flex',
              },
            },
          },

          // Top-left: logo + domain
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '44px',
                left: '80px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              },
              children: [
                {
                  type: 'img',
                  props: {
                    src: logoBase64,
                    width: 28,
                    height: 28,
                    style: { borderRadius: '6px' },
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      fontFamily: 'Geist',
                      fontSize: '18px',
                      fontWeight: '400',
                      color: '#c0c0d0',
                    },
                    children: DEFAULT_OG_DOMAIN,
                  },
                },
              ],
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
                marginBottom: '20px',
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
                fontSize: title.length > 60 ? '40px' : '52px',
                fontWeight: '700',
                color: '#ffffff',
                lineHeight: '1.2',
                margin: '0',
                maxWidth: '960px',
              },
              children: title,
            },
          },

          // Bottom-right: author block
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '44px',
                right: '80px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              },
              children: [
                {
                  type: 'img',
                  props: {
                    src: avatarBase64,
                    width: 48,
                    height: 48,
                    style: { borderRadius: '9999px', objectFit: 'cover' },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontFamily: 'Geist',
                            fontSize: '17px',
                            fontWeight: '700',
                            color: '#ffffff',
                          },
                          children: author,
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontFamily: 'Geist',
                            fontSize: '13px',
                            fontWeight: '400',
                            color: '#888899',
                          },
                          children: authorRole,
                        },
                      },
                    ],
                  },
                },
              ],
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
      ],
    }
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}
