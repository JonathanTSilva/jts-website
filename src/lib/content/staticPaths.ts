import { getPublished } from './published';
import type { CollectionEntry } from 'astro:content';
import type { Locale } from './locale';
import { buildCategoryMap } from './i18n';
import { planLocalizedRoutes, type RouteEntry } from './routes';

/**
 * Computes all display data for the notes index page.
 * Both EN and PT-BR pages use identical logic — the only difference is locale.
 */
export function buildNoteIndex(allNotes: CollectionEntry<'notes'>[], locale: Locale) {
  const otherLocale: Locale = locale === 'en' ? 'pt-br' : 'en';
  const categoryMap = buildCategoryMap(allNotes, otherLocale, locale);

  const uniqueTranslationKeys = Array.from(new Set(allNotes.map(p => p.data.translationKey)));

  const notesToShow = uniqueTranslationKeys
    .map(key => {
      const translations = allNotes.filter(p => p.data.translationKey === key);
      const currentLocaleNote = translations.find(p => p.data.language === locale);
      if (currentLocaleNote) {
        return { ...currentLocaleNote, isTranslationMissing: false };
      }
      const fallbackNote = translations.find(p => p.data.language === 'en') || translations[0];
      if (!fallbackNote) return null;
      const rawCategory = fallbackNote.data.category;
      const normalizedCategory = rawCategory ? (categoryMap.get(rawCategory) ?? rawCategory) : rawCategory;
      return { ...fallbackNote, isTranslationMissing: true, data: { ...fallbackNote.data, category: normalizedCategory } };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  const categories = Array.from(
    new Set(notesToShow.map(n => n.data.category).filter((c): c is string => !!c))
  ).sort((a, b) => a.localeCompare(b));

  const tags = Array.from(new Set(notesToShow.flatMap(n => n.data.tags))).sort((a, b) => a.localeCompare(b));

  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = notesToShow.filter(n => n.data.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const noteTypes = Array.from(
    new Set(notesToShow.map(n => n.data.noteType ?? 'note'))
  ).sort((a, b) => a.localeCompare(b));

  const noteTypeCounts = noteTypes.reduce((acc, type) => {
    acc[type] = notesToShow.filter(n => (n.data.noteType ?? 'note') === type).length;
    return acc;
  }, {} as Record<string, number>);

  return { notesToShow, categories, tags, categoryCounts, noteTypes, noteTypeCounts };
}

/** Adapts a content collection entry to the shape the route planner needs. */
function toRouteEntry<T extends { data: { slug: string; language: Locale; translationKey: string; publishedAt: Date; updatedAt?: Date | undefined } }>(
  item: T,
): RouteEntry & { item: T } {
  return {
    slug: item.data.slug,
    language: item.data.language,
    translationKey: item.data.translationKey,
    publishedAt: item.data.publishedAt,
    updatedAt: item.data.updatedAt,
    item,
  };
}

/**
 * Returns a `getStaticPaths` function for a note detail page ([slug].astro).
 * Both EN and PT-BR pages use identical logic — the only difference is locale.
 * One page per translation group; a fallback page only when the locale's
 * translation is missing.
 */
export function makeNoteStaticPaths(locale: Locale) {
  return async function getStaticPaths() {
    const allNotes = await getPublished('notes');
    const routes = planLocalizedRoutes(allNotes.map(toRouteEntry), 'notes', locale);

    // Prev/next and related notes only consider notes written in this locale.
    const sameLangNotes = routes
      .filter(r => !r.isFallback)
      .map(r => r.entry.item)
      .sort((a, b) => a.data.publishedAt.getTime() - b.data.publishedAt.getTime());

    return routes.map(route => {
      const note = route.entry.item;

      const currentIdx = sameLangNotes.findIndex(n => n.id === note.id);
      // Fallback notes are not in sameLangNotes (idx -1): they get no prev/next,
      // otherwise sameLangNotes[-1 + 1] would produce a phantom next link.
      const prev = currentIdx > 0 ? sameLangNotes[currentIdx - 1] : undefined;
      const next = currentIdx >= 0 && currentIdx < sameLangNotes.length - 1 ? sameLangNotes[currentIdx + 1] : undefined;

      const relatedNotes = sameLangNotes
        .filter(n => {
          if (n.id === note.id) return false;
          const sameCategory = note.data.category && n.data.category === note.data.category;
          const sharedTags = note.data.tags?.some(tag => n.data.tags?.includes(tag)) ?? false;
          return sameCategory || sharedTags;
        })
        .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
        .slice(0, 3);

      return {
        params: { slug: note.data.slug },
        props: {
          note,
          prev,
          next,
          relatedNotes,
          isTranslationFallback: route.isFallback,
          translations: route.translations,
        },
      };
    });
  };
}

/**
 * Returns a `getStaticPaths` function for a blog post detail page ([slug].astro).
 * Both EN and PT-BR pages use identical logic — the only difference is locale.
 * One page per translation group; a fallback page only when the locale's
 * translation is missing.
 */
export function makeBlogStaticPaths(locale: Locale) {
  return async function getStaticPaths() {
    const allPosts = await getPublished('blog');
    const routes = planLocalizedRoutes(allPosts.map(toRouteEntry), 'blog', locale).sort(
      (a, b) => b.entry.publishedAt.getTime() - a.entry.publishedAt.getTime(),
    );

    return routes.map((route, idx) => {
      const post = route.entry.item;
      const prevPost = idx < routes.length - 1 ? routes[idx + 1]?.entry.item : undefined;
      const nextPost = idx > 0 ? routes[idx - 1]?.entry.item : undefined;

      return {
        params: { slug: post.data.slug },
        props: {
          post,
          isTranslationFallback: route.isFallback,
          prev: prevPost ? { title: prevPost.data.title, slug: prevPost.data.slug } : undefined,
          next: nextPost ? { title: nextPost.data.title, slug: nextPost.data.slug } : undefined,
          translations: route.translations,
        },
      };
    });
  };
}
