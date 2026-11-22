import type { Image, Root } from 'mdast';
import { visit } from 'unist-util-visit';

/** `data.hProperties` is read by mdast-util-to-hast to set attributes on the rendered element. */
type HProperties = { hProperties?: Record<string, unknown> };

/**
 * Handles Obsidian image sizing syntax: ![alt|200](url) and ![alt|400x300](url).
 * Strips the |size suffix from alt text and adds width/height attributes.
 */
export function remarkObsidianImages() {
  return (tree: Root) => {
    visit(tree, 'image', (node: Image) => {
      if (!node.alt?.includes('|')) return;

      const pipeIdx = node.alt.indexOf('|');
      const sizeStr = node.alt.slice(pipeIdx + 1).trim();
      node.alt = node.alt.slice(0, pipeIdx).trim();

      if (!sizeStr) return;

      const [wStr, hStr] = sizeStr.split('x');
      const width = Number.parseInt(wStr ?? '', 10);
      if (Number.isNaN(width)) return;

      const data = (node.data ??= {}) as HProperties;
      data.hProperties = {
        ...data.hProperties,
        width,
        style: `max-width: ${width}px; width: 100%;`,
        ...(hStr && !Number.isNaN(Number.parseInt(hStr, 10)) ? { height: Number.parseInt(hStr, 10) } : {}),
      };
    });
  };
}
