import { visit } from 'unist-util-visit';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ---------------------------------------------------------------------------
// Content map — resolves [[wikilinks]] to website URLs
// ---------------------------------------------------------------------------

interface ContentEntry {
  collection: 'blog' | 'notes';
  slug: string;
  locale: string;
}

// Built once per process; safe since content files don't change during a build.
let mapCache: Map<string, ContentEntry[]> | null = null;

function buildContentMap(): Map<string, ContentEntry[]> {
  if (mapCache) return mapCache;

  const map = new Map<string, ContentEntry[]>();
  const contentDir = path.resolve(process.cwd(), 'src/content');

  const addEntry = (key: string, entry: ContentEntry) => {
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(entry);
  };

  for (const collection of ['blog', 'notes'] as const) {
    const dir = path.join(contentDir, collection);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => /\.(md|mdx)$/.test(f));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');

      // Extract the frontmatter slug field.
      const slugMatch = raw.match(/^slug:\s*"?([^"\n]+)"?\s*$/m);
      if (!slugMatch?.[1]) continue;
      const slug = slugMatch[1].trim();

      // Derive locale from filename: "debugging-habits.en.md" → locale="en"
      const withoutExt = file.replace(/\.(md|mdx)$/, '');
      const lastDot = withoutExt.lastIndexOf('.');
      const locale = lastDot !== -1 ? withoutExt.slice(lastDot + 1) : 'en';
      const baseName = lastDot !== -1 ? withoutExt.slice(0, lastDot) : withoutExt;

      const entry: ContentEntry = { collection, slug, locale };

      // Index under every key a writer might use in an Obsidian wikilink:
      //   [[debugging-habits]]               → baseName
      //   [[debugging-habits.en]]            → withoutExt
      //   [[debugging-habits.en.md]]         → file
      //   [[2026-03-markdown-cheatsheet.en]] → slug (may equal withoutExt)
      addEntry(baseName, entry);
      addEntry(withoutExt, entry);
      addEntry(file, entry);
      if (slug !== withoutExt) addEntry(slug, entry);
    }
  }

  mapCache = map;
  return map;
}

function resolveUrl(target: string, preferLocale: string): string | null {
  const map = buildContentMap();
  const normalized = target.replace(/\.(md|mdx)$/, '').trim();
  const entries = map.get(normalized);
  if (!entries || entries.length === 0) return null;

  const best: ContentEntry | undefined =
    entries.find(e => e.locale === preferLocale) ??
    entries.find(e => e.locale === 'en') ??
    entries[0];

  if (!best) return null;
  const prefix = best.locale === 'en' ? '' : `/${best.locale}`;
  return `${prefix}/${best.collection}/${best.slug}`;
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
      const w = parseInt(dim[1] ?? '0', 10);
      const h = dim[2] ? parseInt(dim[2], 10) : undefined;
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

function splitOnObsidianSyntax(text: string, locale: string): any[] {
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

      const url = resolveUrl(target, locale);

      if (url) {
        nodes.push({
          type: 'link',
          url: url + anchor,
          title: null,
          children: [{ type: 'text', value: display }],
        });
      } else {
        // Unresolved wikilink — keep raw text so nothing is silently lost.
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

/**
 * Remark plugin that converts Obsidian-specific syntax to standard MDAST nodes.
 *
 * Image embeds (![[…]]) become <img> elements served from /assets/uploads/.
 * Wikilinks ([[…]]) become <a> elements pointing to the correct page.
 *
 * Run `pnpm sync:content` to copy vault assets into public/assets/uploads/
 * before building so the image URLs resolve correctly.
 */
export function remarkObsidianWikilinks() {
  return (tree: any, file: any) => {
    const locale = extractLocale((file?.path ?? file?.history?.[0] ?? '') as string);

    // Collect replacements first — avoids mutating the tree while walking it.
    const replacements: Array<{ parent: any; index: number; nodes: any[] }> = [];

    visit(tree, 'text', (node: any, index, parent) => {
      if (typeof index !== 'number' || !parent) return;
      if (!(node.value as string).includes('[[')) return;

      const nodes = splitOnObsidianSyntax(node.value as string, locale);
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
