import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
  const blog = await getCollection('blog');

  const ptPosts = blog
    .filter(post => post.data.language === 'pt-br')
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  const items = ptPosts.map(post => ({
    title: post.data.title,
    pubDate: post.data.publishedAt,
    description: post.data.summary,
    link: `/pt-br/blog/${post.data.slug}`,
    content: post.rendered?.html ?? '',
  }));

  return rss({
    title: 'Blog do Jonathan',
    description: 'Escritos sobre firmware, sistemas embarcados e automação.',
    site: context.site || 'https://www.jontobias.com',
    items,
    customData: `<language>pt-br</language>`,
  });
}
