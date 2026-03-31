import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
  const notes = await getCollection('notes');

  const enNotes = notes
    .filter(note => note.data.language === 'en')
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  const items = enNotes.map(note => ({
    title: note.data.title,
    pubDate: note.data.publishedAt,
    description: note.data.summary || '',
    link: `/notes/${note.data.slug}`,
    content: note.rendered?.html ?? '',
  }));

  return rss({
    title: "Jonathan's Notes",
    description: 'Technical notes, cheat sheets, and bits of knowledge.',
    site: context.site || 'https://www.jontobias.com',
    items,
    customData: `<language>en-us</language>`,
  });
}
