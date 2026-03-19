import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { contentLocalePath } from '../lib/content/locale';

export async function GET(context: any) {
  const blog = await getCollection('blog');
  
  // Sort posts by publication date
  const sortedPosts = blog.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  return rss({
    title: 'Jonathan’s Blog',
    description: 'Writings on firmware, embedded systems, and automation.',
    site: context.site || 'https://example.com',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.summary,
      link: contentLocalePath(post.data.language, `/blog/${post.data.slug}`),
    })),
    customData: `<language>en-us</language>`,
  });
}
