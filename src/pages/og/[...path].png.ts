import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublished } from '../../lib/content/published';
import type { CollectionEntry } from 'astro:content';
import { generateOGImage } from '../../lib/ogImage';
import { buildShareLabel, resolveShareAccent } from '../../lib/og/shareLabel';
import { ogRouteParam } from '../../lib/content/routes';

type Post = CollectionEntry<'blog'>;
type Note = CollectionEntry<'notes'>;

// One image per entry and language (both languages share a slug), mirroring the
// page URLs: /og/blog/<slug>.png and /og/pt-br/blog/<slug>.png (same for notes).
export const getStaticPaths: GetStaticPaths = async () => {
  const [posts, notes] = await Promise.all([getPublished('blog'), getPublished('notes')]);
  return [
    ...posts.map(post => ({
      params: { path: ogRouteParam('blog', post.data.language, post.data.slug) },
      props: { kind: 'blog' as const, entry: post },
    })),
    ...notes.map(note => ({
      params: { path: ogRouteParam('notes', note.data.language, note.data.slug) },
      props: { kind: 'notes' as const, entry: note },
    })),
  ];
};

export const GET: APIRoute = async ({ props }) => {
  const { kind, entry } = props as
    | { kind: 'blog'; entry: Post }
    | { kind: 'notes'; entry: Note };

  const png =
    kind === 'blog'
      ? await generateOGImage({
          title: entry.data.title,
          label: buildShareLabel({
            kind: 'blog',
            category: entry.data.category,
            locale: entry.data.language,
          }),
        })
      : await generateOGImage({
          title: entry.data.title,
          label: buildShareLabel({
            kind: entry.data.noteType ?? 'note',
            category: entry.data.category,
            locale: entry.data.language,
          }),
          accent: resolveShareAccent(entry.data.colorToken),
        });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
