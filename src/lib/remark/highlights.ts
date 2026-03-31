import { visit } from 'unist-util-visit';

const HIGHLIGHT_RE = /==([^=\n]+)==/g;

/**
 * Transforms ==text== into <mark>text</mark>.
 * Preserves surrounding text nodes.
 */
export function remarkHighlights() {
  return (tree: any) => {
    visit(tree, 'text', (node: any, index: number | undefined, parent: any) => {
      if (index == null || !parent) return;
      if (!node.value.includes('==')) return;

      const text: string = node.value;
      const newNodes: any[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      HIGHLIGHT_RE.lastIndex = 0;

      while ((match = HIGHLIGHT_RE.exec(text)) !== null) {
        if (match.index > lastIndex) {
          newNodes.push({ type: 'text', value: text.slice(lastIndex, match.index) });
        }
        newNodes.push({ type: 'html', value: `<mark>${match[1]}</mark>` });
        lastIndex = match.index + match[0].length;
      }

      if (newNodes.length === 0) return;
      if (lastIndex < text.length) {
        newNodes.push({ type: 'text', value: text.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...newNodes);
    });
  };
}
