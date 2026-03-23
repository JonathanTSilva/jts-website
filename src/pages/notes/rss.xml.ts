import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { contentLocalePath } from '../../lib/content/locale';

export async function GET(context: any) {
  const notes = await getCollection('notes');
  const sortedNotes = notes.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  return rss({
    title: 'Jonathan’s Notes',
    description: 'Technical notes, cheat sheets, and bits of knowledge.',
    site: context.site || 'https://jontobias.com/',
    items: sortedNotes.map((note) => ({
      title: note.data.title,
      pubDate: note.data.publishedAt,
      description: note.data.summary || '',
      link: contentLocalePath(note.data.language, `/notes/${note.data.slug}`),
    })),
    customData: `<language>en-us</language>`,
  });
}
