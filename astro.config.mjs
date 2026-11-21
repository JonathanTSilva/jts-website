import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { sitemapMeta } from './src/lib/content/sitemapRoutes.ts';
import { legacyRedirects } from './src/lib/content/legacyRedirects.ts';
import { LEGACY_SLUGS } from './src/data/legacy-slugs.ts';
import { rehypeCallouts } from './src/lib/rehype/callouts.ts';
import { remarkHighlights } from './src/lib/remark/highlights.ts';
import { remarkObsidianImages } from './src/lib/remark/obsidian-images.ts';
import { remarkObsidianWikilinks } from './src/lib/remark/obsidian-wikilinks.ts';
import { remarkNoteBlocks } from './src/lib/remark/note-blocks.ts';
import { remarkMindmap } from './src/lib/remark/mindmap.ts';
import { remarkTaskItems } from './src/lib/remark/task-items.ts';

const SITE = 'https://www.jontobias.com';

// Fallback pages (missing translation) stay out of the sitemap; articles carry lastmod.
const sitemapData = sitemapMeta('src/content', SITE);

export default defineConfig({
  site: SITE,
  compressHTML: true,
  // Old `<date>-<name>.<lang>` URLs redirect to the clean shared slugs (static meta-refresh pages).
  redirects: legacyRedirects(LEGACY_SLUGS),
  integrations: [
    mdx(),
    sitemap({
      // Both languages of a post share a slug, so the alternates map path-for-path.
      i18n: { defaultLocale: 'en', locales: { en: 'en', 'pt-br': 'pt-BR' } },
      filter: (page) => !sitemapData.exclude.has(page),
      serialize: (item) => ({ ...item, lastmod: sitemapData.lastmod.get(item.url) ?? item.lastmod }),
    }),
  ],
  vite: {
    build: {
      rollupOptions: {
        output: {
          // Mermaid 11.x produces 50+ micro-chunks (one per diagram type + cytoscape etc.).
          // Merge all of them into a single lazy vendor chunk to eliminate the waterfall
          // of parallel requests on pages that actually render diagrams.
          manualChunks(id) {
            if (
              id.includes('/node_modules/mermaid/') ||
              id.includes('/node_modules/cytoscape/') ||
              id.includes('/node_modules/khroma/') ||
              id.includes('/node_modules/dagre-d3-es/') ||
              id.includes('/node_modules/@braintree/sanitize-url/') ||
              id.includes('/node_modules/d3') ||
              id.includes('/node_modules/elkjs/')
            ) {
              return 'mermaid-vendor';
            }
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
