// GENERATED from the content files, never typed by hand.
// Lists every post and note whose slug changed from `<filename stem>` to the
// clean shared slug, so the old URLs can redirect (see legacyRedirects.ts).
// Plain TypeScript: imported from astro.config.mjs.
import type { LegacySlug } from '../lib/content/legacyRedirects';

// Generated on 2026-11-21 when the slugs moved (#77). Keep every entry: links
// shared before then still use the old form.
export const LEGACY_SLUGS: LegacySlug[] = [
  { collection: 'blog', oldBase: '2026-03-markdown-cheatsheet', newSlug: 'markdown-cheatsheet' },
  { collection: 'blog', oldBase: '2026-04-welcome', newSlug: 'welcome' },
  { collection: 'blog', oldBase: '2026-11-chinese-cameras-internet', newSlug: 'chinese-cameras-internet' },
  { collection: 'blog', oldBase: '2026-11-low-cost-homelab-setup', newSlug: 'low-cost-homelab-setup' },
  { collection: 'notes', oldBase: 'book-cheatsheet', newSlug: 'book-cheatsheet' },
  { collection: 'notes', oldBase: 'mindmap-cheatsheet', newSlug: 'mindmap-cheatsheet' },
  { collection: 'notes', oldBase: 'note-cheatsheet', newSlug: 'note-cheatsheet' },
  { collection: 'notes', oldBase: 'whiteboard-cheatsheet', newSlug: 'whiteboard-cheatsheet' },
];
