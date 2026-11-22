import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { contentLocalePath, type Locale } from './content/locale';
import { useTranslations } from '../i18n/ui';
import { SITE_URL } from './site';

const FEED_LANGUAGE: Record<Locale, string> = {
  en: 'en-us',
  'pt-br': 'pt-br',
};

/**
 * Builds the RSS endpoint of a collection for one locale.
 * Only entries written in `locale` are listed, newest first.
 */
export function makeRssHandler(collection: 'blog' | 'notes', locale: Locale): APIRoute {
  return async (context) => {
    const t = useTranslations(locale);
    const entries = (await getCollection(collection))
      .filter((entry) => entry.data.language === locale)
      .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

    const items = entries.map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.publishedAt,
      description: entry.data.summary || '',
      link: contentLocalePath(locale, `/${collection}/${entry.data.slug}`),
      content: entry.rendered?.html ?? '',
    }));

    return rss({
      title: collection === 'blog' ? t.feeds.blogTitle : t.feeds.notesTitle,
      description: collection === 'blog' ? t.feeds.blogDescription : t.feeds.notesDescription,
      site: context.site || SITE_URL,
      items,
      customData: `<language>${FEED_LANGUAGE[locale]}</language>`,
    });
  };
}
