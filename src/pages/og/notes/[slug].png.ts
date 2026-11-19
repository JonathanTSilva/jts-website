import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateOGImage } from '../../../lib/ogImage';
import { buildShareLabel, resolveShareAccent } from '../../../lib/og/shareLabel';

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
    label: buildShareLabel({
      kind: note.data.noteType ?? 'note',
      category: note.data.category,
      locale: note.data.language,
    }),
    accent: resolveShareAccent(note.data.colorToken),
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
