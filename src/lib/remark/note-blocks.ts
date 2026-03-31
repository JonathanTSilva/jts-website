import { visit } from 'unist-util-visit';

const NOTE_COLORS = new Set([
  'gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red',
]);

const AD_MAP: Record<string, string> = {
  'ad-tip': 'tip',
  'ad-warning': 'warning',
  'ad-note': 'note',
  'ad-info': 'info',
  'ad-danger': 'danger',
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Transforms note-COLOR and note-COLOR-background fenced code blocks
 * into styled <div class="note-block note-COLOR"> elements before Shiki
 * processes them (Shiki changes unknown lang names to "plaintext",
 * making data-language selectors unreliable).
 */
export function remarkNoteBlocks() {
  return (tree: any) => {
    visit(tree, 'code', (node: any, index: number | undefined, parent: any) => {
      if (index == null || !parent) return;
      const lang: string = node.lang ?? '';

      let classes = '';

      if (lang.startsWith('note-')) {
        const rest = lang.slice(5); // strip 'note-'
        const isBackground = rest.endsWith('-background');
        const color = isBackground ? rest.slice(0, -'-background'.length) : rest;
        if (NOTE_COLORS.has(color)) {
          classes = `note-block note-${color}${isBackground ? ' note-bg' : ''}`;
        }
      } else if (AD_MAP[lang]) {
        classes = `note-block note-${AD_MAP[lang]}`;
      }

      if (!classes) return;

      const content = node.value
        .split('\n')
        .map((line: string) => escapeHtml(line))
        .join('\n');

      parent.children[index] = {
        type: 'html',
        value: `<div class="${classes}">${content}</div>`,
      };
    });
  };
}
