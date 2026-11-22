import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublished } from './publish';

/**
 * Blog posts or notes that are live: publishedAt has passed. The dev server
 * shows everything so a scheduled post can be previewed.
 *
 * Needs astro:content, so scripts/validate-content.ts never imports this file.
 */
export async function getPublished<C extends 'blog' | 'notes'>(
  collection: C,
): Promise<CollectionEntry<C>[]> {
  return getCollection(collection, ({ data }) => import.meta.env.DEV || isPublished(data));
}
