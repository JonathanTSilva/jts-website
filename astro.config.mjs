import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { SITE_URL } from './src/lib/site.ts';
import { isTestFixtureUrl, sitemapMeta } from './src/lib/content/sitemapRoutes.ts';
import { legacyRedirects } from './src/lib/content/legacyRedirects.ts';
import { LEGACY_SLUGS } from './src/data/legacy-slugs.ts';
import { rehypeCallouts } from './src/lib/rehype/callouts.ts';
import { remarkHighlights } from './src/lib/remark/highlights.ts';
import { remarkObsidianImages } from './src/lib/remark/obsidian-images.ts';
import { remarkObsidianWikilinks } from './src/lib/remark/obsidian-wikilinks.ts';
import { remarkNoteBlocks } from './src/lib/remark/note-blocks.ts';
import { remarkMindmap } from './src/lib/remark/mindmap.ts';
import { remarkTaskItems } from './src/lib/remark/task-items.ts';

const SITE = SITE_URL;

// Fallback pages (missing translation) stay out of the sitemap; articles carry lastmod.
const sitemapData = sitemapMeta('src/content', SITE);

export default defineConfig({
  site: SITE,
  compressHTML: true,
  // Book covers are https URLs in frontmatter; covers from these hosts are fetched and optimized
  // at build time. Kept narrow on purpose: every allowed host also turns remote images inside posts
  // into build-time downloads, and a dead host would then fail the deploy. A cover from another host
  // shows a placeholder (the build logs "cover unavailable"); add its host here to serve it.
  image: { remotePatterns: [{ protocol: 'https', hostname: 'covers.openlibrary.org' }] },
  // Old `<date>-<name>.<lang>` URLs redirect to the clean shared slugs (static meta-refresh pages).
  redirects: legacyRedirects(LEGACY_SLUGS),
  integrations: [
    mdx(),
    sitemap({
      // Both languages of a post share a slug, so the alternates map path-for-path.
      i18n: { defaultLocale: 'en', locales: { en: 'en', 'pt-br': 'pt-BR' } },
      filter: (page) => !sitemapData.exclude.has(page) && !isTestFixtureUrl(page),
      serialize: (item) => ({ ...item, lastmod: sitemapData.lastmod.get(item.url) ?? item.lastmod }),
    }),
  ],
  vite: {
    build: {
      rolldownOptions: {
        output: {
          // Mermaid produces 50+ micro-chunks (one per diagram type + cytoscape etc.).
          // Merge all of them into a single lazy vendor chunk to eliminate the waterfall
          // of parallel requests on pages that actually render diagrams.
          codeSplitting: {
            groups: [
              {
                name: 'mermaid-vendor',
                test: /[\\/]node_modules[\\/](mermaid|cytoscape|khroma|dagre-d3-es|@braintree[\\/]sanitize-url|d3[^\\/]*|elkjs)[\\/]/,
              },
            ],
          },
        },
      },
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkNoteBlocks,
        remarkHighlights,
        remarkObsidianImages,
        remarkObsidianWikilinks,
        remarkMindmap,
        remarkMath,
        remarkTaskItems,
      ],
      rehypePlugins: [
        rehypeCallouts,
        [rehypeKatex, { strict: false }],
      ],
    }),
    shikiConfig: {
      // Dual theme: light values are default inline styles,
      // dark values stored as --shiki-dark-* CSS variables.
      // CSS in global.css switches to dark values via [data-theme='dark'].
      themes: {
        light: 'github-light',
        dark:  'one-dark-pro',
      },
    },
  },
});
