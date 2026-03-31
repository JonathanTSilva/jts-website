import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { marked } from 'marked';
import { contentLocalePath } from '../../lib/content/locale';

export async function GET(context: any) {
  const notes = await getCollection('notes');

  const sortedNotes = notes.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );

  const items = await Promise.all(
    sortedNotes.map(async (note) => ({
      title: note.data.title,
      pubDate: note.data.publishedAt,
      description: note.data.summary || '',
      link: contentLocalePath(note.data.language, `/notes/${note.data.slug}`),
      content: await marked.parse(note.body ?? ''),
    }))
  );

  return rss({
    title: "Jonathan's Notes",
    description: 'Technical notes, cheat sheets, and bits of knowledge.',
    site: context.site || 'https://www.jontobias.com',
    items,
    customData: `<language>en-us</language>`,
  });
}
