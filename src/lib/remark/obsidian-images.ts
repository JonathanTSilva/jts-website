import { visit } from 'unist-util-visit';

/**
 * Handles Obsidian image sizing syntax: ![alt|200](url) and ![alt|400x300](url).
 * Strips the |size suffix from alt text and adds width/height attributes.
 */
export function remarkObsidianImages() {
  return (tree: any) => {
    visit(tree, 'image', (node: any) => {
      if (!node.alt?.includes('|')) return;

      const pipeIdx = node.alt.indexOf('|');
      const sizeStr = node.alt.slice(pipeIdx + 1).trim();
      node.alt = node.alt.slice(0, pipeIdx).trim();

      if (!sizeStr) return;

      const [wStr, hStr] = sizeStr.split('x');
      const width = parseInt(wStr, 10);
      if (isNaN(width)) return;

      node.data = node.data ?? {};
      node.data.hProperties = {
        ...node.data.hProperties,
        width,
        style: `max-width: ${width}px; width: 100%;`,
        ...(hStr && !isNaN(parseInt(hStr, 10)) ? { height: parseInt(hStr, 10) } : {}),
      };
    });
  };
}
