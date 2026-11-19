import type { APIRoute } from 'astro';
import { generateOGImage } from '../lib/ogImage';

export const GET: APIRoute = async () => {
  const png = await generateOGImage({
    title: 'Embedded systems, software engineering, and what I\'m learning.',
    label: 'JONTOBIAS.COM',
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
