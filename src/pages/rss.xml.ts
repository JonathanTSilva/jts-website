import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { marked } from 'marked';
import { contentLocalePath } from '../lib/content/locale';

export async function GET(context: any) {
  const blog = await getCollection('blog');

  const sortedPosts = blog.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );

  const items = await Promise.all(
    sortedPosts.map(async (post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.summary,
      link: contentLocalePath(post.data.language, `/blog/${post.data.slug}`),
      content: await marked.parse(post.body ?? ''),
    }))
  );

  return rss({
    title: "Jonathan's Blog",
    description: 'Writings on firmware, embedded systems, and automation.',
    site: context.site || 'https://www.jontobias.com',
    items,
    customData: `<language>en-us</language>`,
  });
}
