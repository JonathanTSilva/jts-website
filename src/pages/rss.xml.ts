import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
  const blog = await getCollection('blog');

  const enPosts = blog
    .filter(post => post.data.language === 'en')
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  const items = enPosts.map(post => ({
    title: post.data.title,
    pubDate: post.data.publishedAt,
    description: post.data.summary,
    link: `/blog/${post.data.slug}`,
    content: post.rendered?.html ?? '',
  }));

  return rss({
    title: "Jonathan's Blog",
    description: 'Writings on firmware, embedded systems, and automation.',
    site: context.site || 'https://www.jontobias.com',
    items,
    customData: `<language>en-us</language>`,
  });
}
