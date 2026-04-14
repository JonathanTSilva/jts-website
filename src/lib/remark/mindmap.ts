import type { Root, Heading, List, ListItem, PhrasingContent } from 'mdast';

interface MindmapNode {
  text: string;
  depth: number;
  children: MindmapNode[];
}

function phrasingToText(nodes: PhrasingContent[]): string {
  return nodes.map(n => {
    if (n.type === 'text') return n.value;
    if ('children' in n) return phrasingToText(n.children as PhrasingContent[]);
    return '';
  }).join('');
}

function listItemsToNodes(items: ListItem[], depth: number): MindmapNode[] {
  return items.map(item => {
    const textNode = item.children?.[0];
    let text = '';
    if (textNode?.type === 'paragraph') {
      text = phrasingToText(textNode.children as PhrasingContent[]);
    }
    const nestedList = item.children?.find(c => c.type === 'list') as List | undefined;
    const children = nestedList ? listItemsToNodes(nestedList.children, depth + 1) : [];
    return { text, depth, children };
  });
}

function renderNode(node: MindmapNode): string {
  const childrenHtml = node.children.length
    ? `<ul class="mindmap-children">${node.children.map(renderNode).join('')}</ul>`
    : '';
  return `<li class="mindmap-node" data-depth="${node.depth}"><span class="mindmap-label">${escapeHtml(node.text)}</span>${childrenHtml}</li>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function remarkMindmap() {
  return (tree: Root) => {
    const children = tree.children;
    if (children.length === 0) return;

    // Find root H1
    const h1Index = children.findIndex(n => n.type === 'heading' && (n as Heading).depth === 1);
    if (h1Index === -1) return;

    const h1 = children[h1Index] as Heading;
    const rootText = phrasingToText(h1.children as PhrasingContent[]);

    // Build tree: walk remaining nodes, group lists under their preceding heading
    const roots: MindmapNode[] = [];

    let currentBranch: MindmapNode | null = null;

    for (let i = h1Index + 1; i < children.length; i++) {
      const node = children[i];
      if (!node) continue;
      if (node.type === 'heading') {
        const h = node as Heading;
        const text = phrasingToText(h.children as PhrasingContent[]);
        const branch: MindmapNode = { text, depth: h.depth - 1, children: [] };
        roots.push(branch);
        currentBranch = branch;
      } else if (node.type === 'list' && currentBranch) {
        const list = node as List;
        currentBranch.children.push(...listItemsToNodes(list.children, currentBranch.depth + 1));
      }
    }

    const html = `<ul class="mindmap-tree"><li class="mindmap-node mindmap-root" data-depth="0"><span class="mindmap-label">${escapeHtml(rootText)}</span>${roots.length ? `<ul class="mindmap-children">${roots.map(renderNode).join('')}</ul>` : ''}</li></ul>`;

    // Replace entire tree with single html node
    tree.children = [{ type: 'html', value: html } as any];
  };
}
