import { visit, SKIP } from 'unist-util-visit';

/**
 * Minimal structural view of the hast nodes this plugin reads and writes.
 * (`@types/hast` is not a direct dependency, so the shape is declared locally.)
 */
interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

interface HastParent extends HastNode {
  children: HastNode[];
}

const TABLE_SCROLL_CLASS = 'table-scroll';

function isScrollWrapper(node: HastNode | undefined): boolean {
  const className = node?.properties?.className;
  return node?.tagName === 'div' && Array.isArray(className) && className.includes(TABLE_SCROLL_CLASS);
}

/**
 * Wraps every <table> in a horizontally scrollable container, so a table wider than the
 * viewport scrolls inside itself instead of widening the whole page. The wrapper is focusable
 * so keyboard users can scroll it.
 */
export function rehypeTableScroll() {
  return (tree: HastParent) => {
    visit(tree, 'element', (node: HastNode, index: number | undefined, parent: HastParent | undefined) => {
      if (node.tagName !== 'table' || index == null || !parent || isScrollWrapper(parent)) return;

      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: [TABLE_SCROLL_CLASS], tabIndex: 0 },
        children: [node],
      };
      return SKIP;
    });
  };
}
