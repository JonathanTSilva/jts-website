import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { rehypeCallouts } from './src/lib/rehype/callouts.ts';
import { remarkHighlights } from './src/lib/remark/highlights.ts';
import { remarkObsidianImages } from './src/lib/remark/obsidian-images.ts';
import { remarkNoteBlocks } from './src/lib/remark/note-blocks.ts';
import { remarkTaskItems } from './src/lib/remark/task-items.ts';

export default defineConfig({
  site: 'https://www.jontobias.com',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      // Dual theme: light values are default inline styles,
      // dark values stored as --shiki-dark-* CSS variables.
      // CSS in global.css switches to dark values via [data-theme='dark'].
      themes: {
        light: 'github-light',
        dark:  'one-dark-pro',
      },
    },
    remarkPlugins: [
      remarkNoteBlocks,
      remarkHighlights,
      remarkObsidianImages,
      remarkMath,
      remarkTaskItems,
    ],
    rehypePlugins: [
      rehypeCallouts,
      [rehypeKatex, { strict: false }],
    ],
  },
});
