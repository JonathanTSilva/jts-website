import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { DEFAULT_OG_AUTHOR, DEFAULT_OG_SITE_NAME, generateOGImage } from '../../../lib/ogImage';

export const getStaticPaths: GetStaticPaths = async () => {
  const notes = await getCollection('notes');
  return notes.map(note => ({
    params: { slug: note.data.slug },
    props: { note },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { note } = props as { note: Awaited<ReturnType<typeof getCollection<'notes'>>>[0] };
  const png = await generateOGImage({
    title: note.data.title,
    siteName: DEFAULT_OG_SITE_NAME,
    author: DEFAULT_OG_AUTHOR,
    ...(note.data.category ? { category: note.data.category } : {}),
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
