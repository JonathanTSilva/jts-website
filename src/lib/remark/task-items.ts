import { visit } from 'unist-util-visit';

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
  return (tree: any) => {
    visit(tree, 'listItem', (node: any) => {
      // Standard GFM task items (checked set by remark-gfm)
      if (node.checked === true || node.checked === false) {
        node.data = node.data ?? {};
        node.data.hProperties = {
          ...node.data.hProperties,
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

      node.data = node.data ?? {};
      node.data.hProperties = {
        ...node.data.hProperties,
        'data-task': taskType,
      };
    });
  };
}
