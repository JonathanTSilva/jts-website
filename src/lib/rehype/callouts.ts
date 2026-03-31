import { visit } from 'unist-util-visit';

const TYPE_MAP: Record<string, string> = {
  note: 'note', seealso: 'note',
  abstract: 'abstract', summary: 'abstract', tldr: 'abstract',
  info: 'info', todo: 'info',
  tip: 'tip', hint: 'tip', important: 'tip',
  success: 'success', check: 'success', done: 'success',
  question: 'question', help: 'question', faq: 'question',
  warning: 'warning', caution: 'warning', attention: 'warning',
  failure: 'failure', fail: 'failure', missing: 'failure',
  danger: 'danger', error: 'danger',
  bug: 'bug',
  example: 'example',
  quote: 'quote', cite: 'quote',
};

export function rehypeCallouts() {
  return (tree: any) => {
    visit(tree, 'element', (node: any, index: number | undefined, parent: any) => {
      if (node.tagName !== 'blockquote' || index == null || !parent) return;

      const elChildren: any[] = node.children.filter(
        (c: any) => c.type === 'element'
      );
      if (!elChildren.length || elChildren[0].tagName !== 'p') return;

      const firstP = elChildren[0];
      const firstChild = firstP.children?.[0];
      if (!firstChild || firstChild.type !== 'text') return;

      // Match [!type], [!type]+, [!type]- at start of first text node
      const match = /^\[!(\w+)\]([+-]?)\s*(.*)/.exec(firstChild.value);
      if (!match) return;

      const [, rawType = '', foldable = '', titleLine = ''] = match;
      const type = TYPE_MAP[rawType.toLowerCase()] ?? 'note';
      const defaultTitle =
        rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
      const titleText = titleLine.trim() || defaultTitle;
      const isCollapsible = foldable === '+' || foldable === '-';
      const isOpen = foldable !== '-';

      // Build content: everything in firstP after the header text, plus remaining siblings
      const newlineIdx = firstChild.value.indexOf('\n');
      const contentNodes: any[] = [];

      if (newlineIdx !== -1) {
        // Content continues on next line within the same paragraph text node
        const restText = firstChild.value.slice(newlineIdx + 1).trimStart();
        if (restText || firstP.children.length > 1) {
          contentNodes.push({
            type: 'element',
            tagName: 'p',
            properties: {},
            children: [
              { ...firstChild, value: restText },
              ...firstP.children.slice(1),
            ].filter((c: any) => !(c.type === 'text' && c.value === '')),
          });
        }
      }
      // Remaining sibling block elements (separate paragraphs, lists, code, etc.)
      contentNodes.push(...elChildren.slice(1));

      const titleEl = {
        type: 'element',
        tagName: isCollapsible ? 'summary' : 'div',
        properties: { className: ['callout-title'] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['callout-icon'], 'aria-hidden': 'true' },
            children: [],
          },
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['callout-title-text'] },
            children: [{ type: 'text', value: titleText }],
          },
        ],
      };

      const contentEl = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['callout-content'] },
        children: contentNodes,
      };

      const properties: Record<string, unknown> = {
        className: ['callout', `callout-${type}`],
      };
      if (isCollapsible && isOpen) properties.open = true;

      parent.children[index] = {
        type: 'element',
        tagName: isCollapsible ? 'details' : 'div',
        properties,
        children: [titleEl, contentEl],
      };
    });
  };
}
