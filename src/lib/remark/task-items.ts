import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

/** `data.hProperties` is read by mdast-util-to-hast to set attributes on the rendered element. */
type HProperties = { hProperties?: Record<string, unknown> };

const MARKER_MAP: Record<string, string> = {
  '>': 'scheduled',
  '-': 'cancelled',
  '?': 'question',
  '!': 'important',
};

/**
 * Extends GFM task list markers with Obsidian-style variants.
 *
 * Standard items ([ ] / [x] / [X]) are handled by remark-gfm which sets
 * listItem.checked. We add a data-task attribute so CSS can style them.
 *
 * Non-standard markers ([>] [-] [?] [!]) are not processed by remark-gfm
 * and remain as plain list items with the marker in the text. We strip the
 * marker from the text and add data-task so CSS renders the custom icon.
 */
export function remarkTaskItems() {
  return (tree: Root) => {
    visit(tree, 'listItem', (node) => {
      // Standard GFM task items (checked set by remark-gfm)
      if (node.checked === true || node.checked === false) {
        const data = (node.data ??= {}) as HProperties;
        data.hProperties = {
          ...data.hProperties,
          'data-task': node.checked ? 'checked' : 'unchecked',
        };
        return;
      }

      // Non-standard Obsidian markers
      const firstPara = node.children?.[0];
      if (!firstPara || firstPara.type !== 'paragraph') return;
      const firstText = firstPara.children?.[0];
      if (!firstText || firstText.type !== 'text') return;

      const match = /^\[([>\-?!])\] /.exec(firstText.value);
      if (!match) return;

      const taskType = MARKER_MAP[match[1]!];
      if (!taskType) return;

      // Remove marker from text content
      firstText.value = firstText.value.slice(match[0].length);

      const data = (node.data ??= {}) as HProperties;
      data.hProperties = {
        ...data.hProperties,
        'data-task': taskType,
      };
    });
  };
}
