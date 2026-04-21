import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { Locale } from './locale';
import { buildCategoryMap } from './i18n';

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
  ).sort();

  const tags = Array.from(new Set(notesToShow.flatMap(n => n.data.tags))).sort();

  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = notesToShow.filter(n => n.data.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const noteTypes = Array.from(
    new Set(notesToShow.map(n => n.data.noteType ?? 'note'))
  ).sort();

  const noteTypeCounts = noteTypes.reduce((acc, type) => {
    acc[type] = notesToShow.filter(n => (n.data.noteType ?? 'note') === type).length;
    return acc;
  }, {} as Record<string, number>);

  return { notesToShow, categories, tags, categoryCounts, noteTypes, noteTypeCounts };
}

/**
 * Returns a `getStaticPaths` function for a note detail page ([slug].astro).
 * Both EN and PT-BR pages use identical logic — the only difference is locale.
 */
export function makeNoteStaticPaths(locale: Locale) {
  return async function getStaticPaths() {
    const allNotes = await getCollection('notes');

    const sameLangNotes = allNotes
      .filter(n => n.data.language === locale)
      .sort((a, b) => a.data.publishedAt.getTime() - b.data.publishedAt.getTime());

    return allNotes.map(note => {
      const translations = allNotes.filter(n => n.data.translationKey === note.data.translationKey);
      const enNote = translations.find(n => n.data.language === 'en');
      const ptNote = translations.find(n => n.data.language === 'pt-br');

      const currentIdx = sameLangNotes.findIndex(n => n.id === note.id);
      // Guard currentIdx >= 0: cross-locale notes (language !== locale) return -1,
      // and sameLangNotes[-1 + 1] = sameLangNotes[0] would produce a phantom next link.
      const prev = currentIdx > 0 ? sameLangNotes[currentIdx - 1] : undefined;
      const next = currentIdx >= 0 && currentIdx < sameLangNotes.length - 1 ? sameLangNotes[currentIdx + 1] : undefined;

      const relatedNotes = allNotes
        .filter(n => {
          if (n.id === note.id || n.data.language !== locale) return false;
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
          translations: {
            ...(enNote ? { en: `/notes/${enNote.data.slug}` } : {}),
            ...(ptNote ? { 'pt-br': `/pt-br/notes/${ptNote.data.slug}` } : {}),
          },
        },
      };
    });
  };
}

/**
 * Returns a `getStaticPaths` function for a blog post detail page ([slug].astro).
 * Both EN and PT-BR pages use identical logic — the only difference is locale.
 */
export function makeBlogStaticPaths(locale: Locale) {
  return async function getStaticPaths() {
    const allPosts = await getCollection('blog');

    const uniqueTranslationKeys = Array.from(new Set(allPosts.map(p => p.data.translationKey)));

    const displayPosts = uniqueTranslationKeys
      .map(key => {
        const translations = allPosts.filter(p => p.data.translationKey === key);
        return (
          translations.find(p => p.data.language === locale) ||
          translations.find(p => p.data.language === 'en') ||
          translations[0]
        );
      })
      .filter((p): p is NonNullable<typeof p> => p != null)
      .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

    return uniqueTranslationKeys.flatMap(key => {
      const translations = allPosts.filter(p => p.data.translationKey === key);
      const displayPost = displayPosts.find(p => p.data.translationKey === key);
      const idx = displayPost ? displayPosts.indexOf(displayPost) : -1;
      const prevPost = idx >= 0 && idx < displayPosts.length - 1 ? displayPosts[idx + 1] : undefined;
      const nextPost = idx > 0 ? displayPosts[idx - 1] : undefined;

      return translations.map(post => {
        const enPost = translations.find(p => p.data.language === 'en');
        const ptPost = translations.find(p => p.data.language === 'pt-br');

        return {
          params: { slug: post.data.slug },
          props: {
            post,
            isTranslationFallback: post.data.language !== locale,
            prev: prevPost ? { title: prevPost.data.title, slug: prevPost.data.slug } : undefined,
            next: nextPost ? { title: nextPost.data.title, slug: nextPost.data.slug } : undefined,
            translations: {
              ...(enPost ? { en: `/blog/${enPost.data.slug}` } : {}),
              ...(ptPost ? { 'pt-br': `/pt-br/blog/${ptPost.data.slug}` } : {}),
            },
          },
        };
      });
    });
  };
}
