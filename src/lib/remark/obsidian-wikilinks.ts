import { visit } from 'unist-util-visit';
import matter from 'gray-matter';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { contentPath } from '../content/routes';
import { LOCALES, type Locale } from '../content/locale';
import { isPublished } from '../content/publish';

// ---------------------------------------------------------------------------
// Content map — resolves [[wikilinks]] to website URLs
// ---------------------------------------------------------------------------

export interface ContentEntry {
  collection: 'blog' | 'notes';
  slug: string;
  locale: string;
}

export type ContentMap = Map<string, ContentEntry[]>;

/**
 * Reads every blog post and note under `contentDir` and indexes it by each key
 * a writer might use in a wikilink. Vault wikilinks are filename stems
 * (`[[2026-11-low-cost-homelab-setup.en]]`); the clean slug
 * (`[[low-cost-homelab-setup]]`) works too. Both languages of a post share the
 * slug, so a slug key holds one entry per language.
 */
export function buildContentMap(contentDir: string): ContentMap {
  const map: ContentMap = new Map();

  const addEntry = (key: string, entry: ContentEntry) => {
    if (!map.has(key)) map.set(key, []);
    const list = map.get(key)!;
    if (!list.includes(entry)) list.push(entry);
  };

  for (const collection of ['blog', 'notes'] as const) {
    const dir = path.join(contentDir, collection);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => /\.(md|mdx)$/.test(f)).sort();
    for (const file of files) {
      const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf-8'));

      const slug = typeof data.slug === 'string' ? data.slug.trim() : '';
      if (!slug) continue;

      // A scheduled (future-dated) target has no page yet: leave links to it as text.
      // YAML parses a bare date to a Date and leaves a quoted one as a string.
      if (data.publishedAt != null) {
        const publishedAt = data.publishedAt instanceof Date ? data.publishedAt : new Date(String(data.publishedAt));
        if (!Number.isNaN(publishedAt.getTime()) && !isPublished({ publishedAt })) continue;
      }

      // Language: frontmatter first, then the filename suffix ("x.pt-br.md").
      const withoutExt = file.replace(/\.(md|mdx)$/, '');
      const lastDot = withoutExt.lastIndexOf('.');
      const fileLocale = lastDot !== -1 ? withoutExt.slice(lastDot + 1) : 'en';
      const baseName = lastDot !== -1 ? withoutExt.slice(0, lastDot) : withoutExt;
      const locale = (typeof data.language === 'string' ? data.language : fileLocale).trim();

      const entry: ContentEntry = { collection, slug, locale };

      // Index under every key a writer might use in an Obsidian wikilink:
      //   [[low-cost-homelab-setup]]               -> slug (shared by both languages)
      //   [[2026-11-low-cost-homelab-setup]]       -> filename without the language
      //   [[2026-11-low-cost-homelab-setup.en]]    -> filename stem (exactly one entry)
      //   [[2026-11-low-cost-homelab-setup.en.md]] -> filename
      addEntry(baseName, entry);
      addEntry(withoutExt, entry);
      addEntry(file, entry);
      addEntry(slug, entry);
    }
  }

  return map;
}

// One map per content directory, rebuilt whenever a content file or folder changes.
const mapCache = new Map<string, { stamp: string; map: ContentMap }>();

/**
 * Cheap change detector: the newest mtime and the number of entries under `dir`
 * (recursive, stat only, no file reads). Adding, editing or deleting a content
 * file changes it, so `pnpm dev` picks up new content without a restart.
 */
function contentStamp(dir: string): string {
  let newest = 0;
  let count = 0;
  const walk = (current: string) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    newest = Math.max(newest, fs.statSync(current).mtimeMs);
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(md|mdx)$/.test(entry.name)) {
        count++;
        newest = Math.max(newest, fs.statSync(full).mtimeMs);
      }
    }
  };
  walk(dir);
  return `${newest}:${count}`;
}

function getContentMap(contentDir: string): ContentMap {
  const stamp = contentStamp(contentDir);
  const cached = mapCache.get(contentDir);
  if (cached?.stamp === stamp) return cached.map;
  const map = buildContentMap(contentDir);
  mapCache.set(contentDir, { stamp, map });
  return map;
}

/** Resolves a wikilink target to the page URL built from the entry's slug + language. */
export function resolveWikilinkUrl(map: ContentMap, target: string, preferLocale: string): string | null {
  const normalized = target.replace(/\.(md|mdx)$/, '').trim();
  const entries = map.get(normalized);
  if (!entries || entries.length === 0) return null;

  // A stem with a language suffix has exactly one entry; a slug or a base name
  // has one per language, so pick the linking page's language first.
  const best: ContentEntry | undefined =
    entries.find(e => e.locale === preferLocale) ??
    entries.find(e => e.locale === 'en') ??
    entries[0];

  if (!best) return null;
  const locale: Locale = (LOCALES as readonly string[]).includes(best.locale) ? (best.locale as Locale) : 'en';
  return contentPath(best.collection, locale, best.slug);
}

// ---------------------------------------------------------------------------
// Image embed helpers
// ---------------------------------------------------------------------------

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif', '.bmp']);

/** Base path where synced images are served from. */
const UPLOADS_PATH = '/assets/uploads';

function isImageFile(name: string): boolean {
  return IMAGE_EXTS.has(path.extname(name).toLowerCase());
}

/**
 * Build an MDAST image node from an Obsidian embed target + optional modifier.
 *
 * Modifier forms (same as Obsidian / remarkObsidianImages):
 *   300        → width 300 px
 *   300x200    → width 300, height 200 px
 *   alt text   → custom alt text
 */
function buildImageNode(target: string, modifier: string): any {
  const filename = target.split(/[/\\]/).pop() ?? target;
  const url = `${UPLOADS_PATH}/${filename}`;
  const defaultAlt = path.basename(filename, path.extname(filename));

  const node: any = { type: 'image', url, alt: defaultAlt, title: null };

  if (modifier) {
    const dim = modifier.match(/^(\d+)(?:x(\d+))?$/);
    if (dim) {
      const w = Number.parseInt(dim[1] ?? '0', 10);
      const h = dim[2] ? Number.parseInt(dim[2], 10) : undefined;
      node.data = {
        hProperties: {
          width: w,
          style: `max-width: ${w}px; width: 100%;`,
          ...(h ? { height: h } : {}),
        },
      };
    } else {
      node.alt = modifier; // plain text → use as alt
    }
  }

  return node;
}

// ---------------------------------------------------------------------------
// Unified text processor
// ---------------------------------------------------------------------------

function extractLocale(filePath: string): string {
  const name = path.basename(filePath).replace(/\.(md|mdx)$/, '');
  const lastDot = name.lastIndexOf('.');
  return lastDot !== -1 ? name.slice(lastDot + 1) : 'en';
}

/**
 * Matches Obsidian syntax inside a text node in a single pass:
 *   ![[image.png]]         — image embed
 *   ![[image.png|300]]     — image embed with width
 *   ![[image.png|300x200]] — image embed with width × height
 *   ![[image.png|alt text]]— image embed with custom alt
 *   [[slug]]               — internal wikilink
 *   [[slug|alias]]         — wikilink with custom label
 *   [[slug#heading]]       — wikilink with heading anchor
 *   [[slug#heading|alias]] — wikilink with heading anchor + label
 *
 * Non-image embeds (![[note]]) are left as plain text (can't render inline).
 */
const OBSIDIAN_SYNTAX = /(!?)\[\[([^\]]+)\]\]/g;

function splitOnObsidianSyntax(
  text: string,
  locale: string,
  resolve: (target: string, preferLocale: string) => string | null,
  onUnresolved: (target: string) => void,
): any[] {
  const nodes: any[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(OBSIDIAN_SYNTAX)) {
    const matchIndex = match.index ?? 0;
    const isEmbed = match[1] === '!';
    const inner = match[2] ?? '';

    // Text before this token
    if (matchIndex > lastIndex) {
      nodes.push({ type: 'text', value: text.slice(lastIndex, matchIndex) });
    }

    if (isEmbed) {
      // --- Image embed: ![[file.png]] or ![[file.png|modifier]] ---
      const pipeIdx = inner.indexOf('|');
      const target = (pipeIdx !== -1 ? inner.slice(0, pipeIdx) : inner).trim();
      const modifier = pipeIdx !== -1 ? inner.slice(pipeIdx + 1).trim() : '';

      if (isImageFile(target)) {
        nodes.push(buildImageNode(target, modifier));
      } else {
        // Non-image embed (note transclusion etc.) — keep verbatim
        nodes.push({ type: 'text', value: match[0] });
      }
    } else {
      // --- Wikilink: [[slug]] or [[slug#heading|alias]] ---
      let target = inner;
      let display = '';
      let anchor = '';

      const pipeIdx = inner.indexOf('|');
      if (pipeIdx !== -1) {
        target = inner.slice(0, pipeIdx).trim();
        display = inner.slice(pipeIdx + 1).trim();
      }

      const hashIdx = target.indexOf('#');
      if (hashIdx !== -1) {
        anchor = '#' + target.slice(hashIdx + 1).replace(/\s+/g, '-').toLowerCase();
        target = target.slice(0, hashIdx).trim();
      }

      if (!display) display = target;

      const url = resolve(target, locale);

      if (url) {
        nodes.push({
          type: 'link',
          url: url + anchor,
          title: null,
          children: [{ type: 'text', value: display }],
        });
      } else {
        // Unresolved wikilink — keep raw text so nothing is silently lost, and say so.
        onUnresolved(target);
        nodes.push({ type: 'text', value: match[0] });
      }
    }

    lastIndex = matchIndex + match[0].length;
  }

  // Remaining text after the last match
  if (lastIndex < text.length) {
    nodes.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return nodes;
}

// ---------------------------------------------------------------------------
// Remark plugin
// ---------------------------------------------------------------------------

export interface WikilinkOptions {
  /** Folder holding the `blog/` and `notes/` collections. Defaults to `src/content`. */
  contentDir?: string;
  /** Called for each wikilink that points at nothing. Defaults to a `console.warn`. */
  onUnresolved?: (target: string, file?: string) => void;
}

function defaultOnUnresolved(target: string, file?: string): void {
  console.warn(`unresolved wikilink [[${target}]] in ${file ?? 'unknown file'}`);
}

/**
 * Remark plugin that converts Obsidian-specific syntax to standard MDAST nodes.
 *
 * Image embeds (![[…]]) become <img> elements served from /assets/uploads/.
 * Wikilinks ([[…]]) become <a> elements pointing to the correct page.
 *
 * Run `pnpm sync:content` to copy vault assets into public/assets/uploads/
 * before building so the image URLs resolve correctly.
 */
export function remarkObsidianWikilinks(options: WikilinkOptions = {}) {
  const contentDir = options.contentDir ?? path.resolve(process.cwd(), 'src/content');

  return (tree: any, file: any) => {
    const filePath: string | undefined = file?.path ?? file?.history?.[0] ?? undefined;
    const locale = extractLocale(filePath ?? '');
    const resolve = (target: string, preferLocale: string) =>
      resolveWikilinkUrl(getContentMap(contentDir), target, preferLocale);
    const onUnresolved = (target: string) =>
      (options.onUnresolved ?? defaultOnUnresolved)(target, filePath);

    // Collect replacements first — avoids mutating the tree while walking it.
    const replacements: Array<{ parent: any; index: number; nodes: any[] }> = [];

    visit(tree, 'text', (node: any, index, parent) => {
      if (typeof index !== 'number' || !parent) return;
      if (!(node.value as string).includes('[[')) return;

      const nodes = splitOnObsidianSyntax(node.value as string, locale, resolve, onUnresolved);
      // Skip if nothing actually changed.
      if (nodes.length === 1 && nodes[0].type === 'text' && nodes[0].value === node.value) return;

      replacements.push({ parent, index, nodes });
    });

    // Apply from end to start so earlier indices stay valid after splicing.
    for (let i = replacements.length - 1; i >= 0; i--) {
      const r = replacements[i];
      if (!r) continue;
      r.parent.children.splice(r.index, 1, ...r.nodes);
    }
  };
}
