import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { DEFAULT_OG_AUTHOR, DEFAULT_OG_AUTHOR_ROLE, generateOGImage } from '../../../lib/ogImage';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.data.slug },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: Awaited<ReturnType<typeof getCollection<'blog'>>>[0] };
  const png = await generateOGImage({
    title: post.data.title,
    author: DEFAULT_OG_AUTHOR,
    authorRole: DEFAULT_OG_AUTHOR_ROLE,
    ...(post.data.category ? { category: post.data.category } : {}),
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
