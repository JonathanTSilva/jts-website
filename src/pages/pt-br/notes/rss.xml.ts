import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { marked } from 'marked';

export async function GET(context: any) {
  const notes = await getCollection('notes');

  const ptNotes = notes
    .filter(note => note.data.language === 'pt-br')
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  const items = await Promise.all(
    ptNotes.map(async (note) => ({
      title: note.data.title,
      pubDate: note.data.publishedAt,
      description: note.data.summary || '',
      link: `/pt-br/notes/${note.data.slug}`,
      content: await marked.parse(note.body ?? ''),
    }))
  );

  return rss({
    title: 'Notas do Jonathan',
    description: 'Notas técnicas, cheat sheets e fragmentos de conhecimento.',
    site: context.site || 'https://www.jontobias.com',
    items,
    customData: `<language>pt-br</language>`,
  });
}
