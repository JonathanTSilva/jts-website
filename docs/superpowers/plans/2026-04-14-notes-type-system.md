# Notes Type System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `book`, `mindmap`, and `whiteboard` note types to the existing notes system, each with type-specific frontmatter fields, a dedicated detail layout, and type-aware index cards.

**Architecture:** Single `notes` Astro content collection extended with a `noteType` discriminator field and additive optional fields. `[slug].astro` delegates to one of four focused layout components (`DefaultNoteLayout`, `BookNoteLayout`, `MindmapLayout`, `WhiteboardLayout`). `NotesGrid` delegates to one of four card components. A custom remark plugin transforms mindmap markdown into a styled HTML tree at build time.

**Tech Stack:** Astro 5, Zod (content validation), `unist-util-visit` (remark plugin), Vitest (unit tests), Playwright (E2E tests), Caveat (Google Font, whiteboard only)

---

## File Map

**Created:**
- `src/lib/remark/mindmap.ts` — remark plugin: heading+list AST → mindmap HTML tree
- `src/components/notes/layouts/DefaultNoteLayout.astro` — extracted from current `[slug].astro`
- `src/components/notes/layouts/BookNoteLayout.astro` — book metadata header + prose
- `src/components/notes/layouts/MindmapLayout.astro` — renders mindmap tree output
- `src/components/notes/layouts/WhiteboardLayout.astro` — whiteboard canvas + share button
- `src/components/notes/cards/DefaultNoteCard.astro` — extracted from `NotesGrid`
- `src/components/notes/cards/BookNoteCard.astro` — cover thumbnail + rating
- `src/components/notes/cards/MindmapCard.astro` — with branch icon badge
- `src/components/notes/cards/WhiteboardCard.astro` — with marker icon badge
- `tests/unit/remark/mindmap.test.ts`

**Modified:**
- `src/lib/content/schemas.ts` — add `noteType` union + book fields to `notesSchema`
- `src/lib/content/validation.ts` — add book/mindmap checks
- `src/content.config.ts` — add `noteType` + book fields
- `astro.config.mjs` — register `remarkMindmap` plugin (conditional per noteType — see Task 3)
- `src/pages/notes/[slug].astro` — delegate to per-type layout
- `src/pages/pt-br/notes/[slug].astro` — same delegation
- `src/components/notes/NotesGrid.astro` — switch on noteType to per-type card
- `src/layouts/BaseLayout.astro` — conditional Caveat font link
- `tests/unit/content/contracts.test.ts` — add book/mindmap validation tests
- `tests/e2e/notes.spec.ts` — add book/mindmap/whiteboard E2E tests

---

## Task 1: Extend the notes schema

**Files:**
- Modify: `src/lib/content/schemas.ts`
- Modify: `src/content.config.ts`

- [ ] **Step 1: Update `notesSchema` in `src/lib/content/schemas.ts`**

Replace the existing `notesSchema` export with:

```ts
export const notesSchema = z.object({
  slug: z.string().min(1),
  title: z.string(),
  language: languageEnum,
  translationKey: z.string().min(1),
  publishedAt: z.coerce.date(),
  noteType: z.enum(["note", "book", "mindmap", "whiteboard"]).default("note"),
  summary: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  colorToken: z.string().optional(),
  // book only
  author: z.array(z.string()).optional(),
  cover: z.string().url().optional(),
  pages: z.number().int().positive().optional(),
  rating: z.string().optional(),
  status: z.array(z.string()).optional(),
  dateRead: z.coerce.date().optional(),
  publishDate: z.coerce.date().optional(),
  relatedTo: z.array(z.string()).optional(),
  previousBook: z.string().optional(),
  nextBook: z.string().optional(),
});
```

- [ ] **Step 2: Update `src/content.config.ts` to match**

The `notes` collection schema object should mirror `notesSchema`. Replace its `schema: z.object({...})` block with:

```ts
const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/notes" }),
  schema: z.object({
    slug: z.string().min(1),
    title: z.string(),
    language,
    translationKey: z.string().min(1),
    publishedAt: z.coerce.date(),
    noteType: z.enum(["note", "book", "mindmap", "whiteboard"]).default("note"),
    summary: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    colorToken: z.string().optional(),
    author: z.array(z.string()).optional(),
    cover: z.string().url().optional(),
    pages: z.number().int().positive().optional(),
    rating: z.string().optional(),
    status: z.array(z.string()).optional(),
    dateRead: z.coerce.date().optional(),
    publishDate: z.coerce.date().optional(),
    relatedTo: z.array(z.string()).optional(),
    previousBook: z.string().optional(),
    nextBook: z.string().optional(),
  }),
});
```

- [ ] **Step 3: Run type check to confirm no breakage**

```bash
npx astro check
```

Expected: 0 errors. If errors appear, they will be in `[slug].astro` where `note.data` is accessed — fix by adding `note.data.noteType ?? 'note'` guards as needed.

- [ ] **Step 4: Commit**

```bash
git add src/lib/content/schemas.ts src/content.config.ts
git commit -m "feat(notes): add noteType discriminator and book fields to schema"
```

---

## Task 2: Build-time validation for book and mindmap notes

**Files:**
- Modify: `src/lib/content/validation.ts`
- Modify: `tests/unit/content/contracts.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `tests/unit/content/contracts.test.ts`:

```ts
describe('validateContent — book notes', () => {
  const baseBook = {
    slug: 'test-book',
    title: 'Test Book',
    language: 'en',
    translationKey: 'test-book',
    publishedAt: '2026-01-01',
    noteType: 'book',
    author: ['Author Name'],
    cover: 'https://example.com/cover.jpg',
  };

  it('accepts a valid book note', () => {
    const result = validateContent('notes', baseBook, 'Some content');
    expect(result.success).toBe(true);
  });

  it('fails when author is missing', () => {
    const { author: _, ...noAuthor } = baseBook;
    const result = validateContent('notes', noAuthor, 'Some content');
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.includes('author'))).toBe(true);
  });

  it('fails when cover is missing', () => {
    const { cover: _, ...noCover } = baseBook;
    const result = validateContent('notes', noCover, 'Some content');
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.includes('cover'))).toBe(true);
  });
});

describe('validateContent — mindmap notes', () => {
  const baseMindmap = {
    slug: 'test-map',
    title: 'Test Map',
    language: 'en',
    translationKey: 'test-map',
    publishedAt: '2026-01-01',
    noteType: 'mindmap',
  };

  it('accepts a mindmap note with H1', () => {
    const result = validateContent('notes', baseMindmap, '# Root\n\n## Branch');
    expect(result.success).toBe(true);
    expect(result.warnings ?? []).toHaveLength(0);
  });

  it('warns when mindmap has no H1', () => {
    const result = validateContent('notes', baseMindmap, '## Branch\n\nNo root');
    expect(result.warnings?.some(w => w.includes('H1'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run tests/unit/content/contracts.test.ts
```

Expected: failures on the new test cases.

- [ ] **Step 3: Update `validateContent` in `src/lib/content/validation.ts`**

Change the `ValidationResult` interface and add book/mindmap checks:

```ts
export interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

export function validateContent(
  collection: CollectionType,
  frontmatter: Record<string, any>,
  body: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validate Frontmatter
  const schema = SCHEMAS[collection];
  const result = schema.safeParse(frontmatter);
  if (!result.success && result.error) {
    result.error.issues.forEach((err: { path: (string | number)[]; message: string }) => {
      errors.push(`Frontmatter: [${err.path.join(".")}] ${err.message}`);
    });
  }

  // 2. Validate Sections
  const required = CONTRACTS[collection];
  const missing = requireSections(body, required);
  missing.forEach((section) => {
    const display = section.split("|")[0];
    errors.push(`Content: Missing required section "## ${display}"`);
  });

  // 3. Type-specific validation
  if (collection === 'notes') {
    const noteType = frontmatter.noteType ?? 'note';

    if (noteType === 'book') {
      if (!frontmatter.author || (Array.isArray(frontmatter.author) && frontmatter.author.length === 0)) {
        errors.push('Book note missing required field: author');
      }
      if (!frontmatter.cover) {
        errors.push('Book note missing required field: cover');
      }
    }

    if (noteType === 'mindmap') {
      const hasH1 = /^#\s+\S/m.test(body);
      if (!hasH1) {
        warnings.push('Mindmap note has no H1 — the mindmap tree needs a root node (# Root Title)');
      }
    }
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
  };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run tests/unit/content/contracts.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/validation.ts tests/unit/content/contracts.test.ts
git commit -m "feat(notes): add book/mindmap build-time validation"
```

---

## Task 3: Mindmap remark plugin

**Files:**
- Create: `src/lib/remark/mindmap.ts`
- Create: `tests/unit/remark/mindmap.test.ts`

- [ ] **Step 1: Write the failing unit test**

Create `tests/unit/remark/mindmap.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkHtml from 'remark-html';
import { remarkMindmap } from '../../../src/lib/remark/mindmap';

async function transform(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkMindmap)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);
  return String(result);
}

describe('remarkMindmap', () => {
  it('wraps output in mindmap-tree root', async () => {
    const output = await transform('# Root\n\n## Branch A\n\n## Branch B\n');
    expect(output).toContain('class="mindmap-tree"');
  });

  it('sets data-depth="0" on root H1 node', async () => {
    const output = await transform('# Root\n\n## Branch\n');
    expect(output).toContain('data-depth="0"');
    expect(output).toContain('data-depth="1"');
  });

  it('renders H1 text as root content', async () => {
    const output = await transform('# My Root Topic\n\n## Branch\n');
    expect(output).toContain('My Root Topic');
  });

  it('handles list items under a heading', async () => {
    const output = await transform('# Root\n\n## Branch\n\n- leaf one\n- leaf two\n');
    expect(output).toContain('leaf one');
    expect(output).toContain('leaf two');
  });

  it('handles nested list items', async () => {
    const output = await transform('# Root\n\n## Branch\n\n- item\n    - nested\n');
    expect(output).toContain('nested');
  });

  it('produces no output for empty content', async () => {
    const output = await transform('');
    expect(output.trim()).toBe('');
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run tests/unit/remark/mindmap.test.ts
```

Expected: import error — module does not exist yet.

- [ ] **Step 3: Check available packages**

```bash
node -e "require('unified'); console.log('unified ok')"
node -e "require('remark-parse'); console.log('remark-parse ok')"
```

If either fails, install:

```bash
npm install unified remark-parse remark-stringify remark-html
```

- [ ] **Step 4: Create `src/lib/remark/mindmap.ts`**

```ts
import { visit } from 'unist-util-visit';
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
    const root: MindmapNode = { text: rootText, depth: 0, children: roots };

    let currentBranch: MindmapNode | null = null;

    for (let i = h1Index + 1; i < children.length; i++) {
      const node = children[i];
      if (node.type === 'heading') {
        const h = node as Heading;
        const text = phrasingToText(h.children as PhrasingContent[]);
        const branch: MindmapNode = { text, depth: h.depth, children: [] };
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
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npx vitest run tests/unit/remark/mindmap.test.ts
```

Expected: all 6 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/remark/mindmap.ts tests/unit/remark/mindmap.test.ts
git commit -m "feat(notes): add remarkMindmap remark plugin with unit tests"
```

---

## Task 4: Extract DefaultNoteLayout and DefaultNoteCard

**Files:**
- Create: `src/components/notes/layouts/DefaultNoteLayout.astro`
- Create: `src/components/notes/cards/DefaultNoteCard.astro`

The goal of this task is to extract the *existing* rendering into components so Tasks 5–7 can be built alongside it. No visual change.

- [ ] **Step 1: Create `src/components/notes/layouts/DefaultNoteLayout.astro`**

Copy the inner content of the current `[slug].astro` article (everything inside `<BaseLayout>`), accepting these props:

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../../../lib/content/locale';
import BackToTop from '../../site/BackToTop.astro';
import ShareButtons from '../../site/ShareButtons.astro';
import { getNoteAccentColor } from '../../../lib/notes';
import { getCollection } from 'astro:content';

interface Props {
  note: CollectionEntry<'notes'>;
  Content: any;
  locale: Locale;
}

const { note, Content, locale } = Astro.props;

const t = locale === 'en' ? {
  fallbackNotice: 'This note is not available in English. Showing the original version.',
  back: '← Back to notes',
  backHref: '/notes',
  relatedNotes: 'Related Notes',
} : {
  fallbackNotice: 'Esta nota não está disponível em Português. Exibindo a versão original.',
  back: '← Voltar para notas',
  backHref: '/pt-br/notes',
  relatedNotes: 'Notas Relacionadas',
};

const isTranslationFallback = note.data.language !== locale;

const allNotesForRelated = await getCollection('notes');
const relatedNotes = allNotesForRelated
  .filter(n =>
    n.data.slug !== note.data.slug &&
    n.data.language === locale &&
    n.data.category === note.data.category
  )
  .sort((a, b) => a.data.publishedAt.getTime() - b.data.publishedAt.getTime())
  .slice(-3);
---

<article class="container note-page" style={`--note-accent: ${getNoteAccentColor(note.data.colorToken, note.data.category)}`}>

  <a href={t.backHref} class="back-link">{t.back}</a>

  {note.data.category && (
    <span class="note-category-badge">{note.data.category}</span>
  )}

  <h1 class="note-title">{note.data.title}</h1>

  {note.data.summary && (
    <p class="note-subtitle">{note.data.summary}</p>
  )}

  <div class="note-meta">
    <time class="note-date" datetime={note.data.publishedAt.toISOString()}>
      {note.data.publishedAt.toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', { dateStyle: 'long' })}
    </time>
  </div>

  {note.data.tags && note.data.tags.length > 0 && (
    <div class="note-tags">
      {note.data.tags.map((tag: string) => <span class="tag-pill">#{tag}</span>)}
    </div>
  )}

  <hr class="preamble-divider" />

  {isTranslationFallback && (
    <div class="fallback-notice">
      <p>{t.fallbackNotice}</p>
    </div>
  )}

  <div class="note-content prose">
    <Content />
  </div>

  <ShareButtons
    title={note.data.title}
    url={Astro.url.href}
    type="note"
    locale={locale as 'en' | 'pt-br'}
  />

  {relatedNotes.length > 0 && (
    <section class="related-notes">
      <h2 class="related-title">{t.relatedNotes}</h2>
      <div class="related-grid">
        {relatedNotes.map((related: any) => (
          <a
            href={locale === 'en' ? `/notes/${related.data.slug}` : `/pt-br/notes/${related.data.slug}`}
            class="related-card"
            data-category={related.data.category ?? ''}
          >
            <span class="note-date">{related.data.publishedAt.toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', { dateStyle: 'medium' })}</span>
            <h3>{related.data.title}</h3>
            {related.data.category && <span class="note-category">{related.data.category}</span>}
          </a>
        ))}
      </div>
    </section>
  )}

</article>

<BackToTop />
```

Copy the `<style>` block from `[slug].astro` unchanged into this component.

- [ ] **Step 2: Create `src/components/notes/cards/DefaultNoteCard.astro`**

Extract the `<article class="note-card">` block from `NotesGrid.astro` into a standalone component:

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../../../lib/content/locale';
import { contentLocalePath } from '../../../lib/content/locale';
import { getNoteAccentColor } from '../../../lib/notes';

interface Props {
  note: CollectionEntry<'notes'> & { isTranslationMissing?: boolean };
  locale: Locale;
  translationMissingLabel: string;
}

const { note, locale, translationMissingLabel } = Astro.props;
---

<article
  class="note-card"
  data-category={note.data.category || 'uncategorized'}
  data-tags={note.data.tags.join(',')}
  style={`border-top: 3px solid ${getNoteAccentColor(note.data.colorToken, note.data.category)}`}
>
  <a href={contentLocalePath(locale, `/notes/${note.data.slug}`)} class="note-link">
    <header class="note-header">
      {note.data.category && (
        <span class="note-category">{note.data.category}</span>
      )}
      <time datetime={note.data.publishedAt.toISOString()} class="note-date">
        {note.data.publishedAt.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: '2-digit' })}
      </time>
    </header>
    <h2 class="note-title">
      {note.data.title}
      {note.isTranslationMissing && (
        <span class="translation-missing-tag">({translationMissingLabel})</span>
      )}
    </h2>
    {note.data.summary && <p class="note-summary">{note.data.summary}</p>}
    {note.data.tags && note.data.tags.length > 0 && (
      <div class="note-tags">
        {note.data.tags.map((tag: string) => (
          <span class="tag">#{tag}</span>
        ))}
      </div>
    )}
  </a>
</article>
```

Copy the `.note-card`, `.note-link`, `.note-header`, `.note-category`, `.note-date`, `.note-title`, `.translation-missing-tag`, `.note-summary`, `.note-tags`, `.tag` styles from `NotesGrid.astro` into this component's `<style>` block.

- [ ] **Step 3: Update `[slug].astro` (en) to use the new layout**

In `src/pages/notes/[slug].astro`, replace the entire article/script/style block with:

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import DefaultNoteLayout from '../../components/notes/layouts/DefaultNoteLayout.astro';

export async function getStaticPaths() {
  const allNotes = await getCollection('notes');
  const locale = 'en';

  return allNotes.map(note => {
    const translations = allNotes.filter(n => n.data.translationKey === note.data.translationKey);
    const enNote = translations.find(n => n.data.language === 'en');
    const ptNote = translations.find(n => n.data.language === 'pt-br');

    return {
      params: { slug: note.data.slug },
      props: {
        note,
        translations: {
          ...(enNote ? { en: `/notes/${enNote.data.slug}` } : {}),
          ...(ptNote ? { 'pt-br': `/pt-br/notes/${ptNote.data.slug}` } : {}),
        }
      },
    };
  });
}

const { note, translations } = Astro.props;
const { Content } = await render(note);
const locale = 'en';
---

<BaseLayout
  locale={locale}
  title={note.data.title}
  description={note.data.summary ?? undefined}
  image={`/og/notes/${note.data.slug}.png`}
  ogType="article"
  translations={translations}
>
  <DefaultNoteLayout note={note} Content={Content} locale={locale} />
</BaseLayout>
```

Also keep the mermaid `<script>` block from the original — move it into `DefaultNoteLayout.astro` at the end.

- [ ] **Step 4: Update `src/pages/pt-br/notes/[slug].astro` similarly**

Same structure, but `locale = 'pt-br'` and `backHref = '/pt-br/notes'`.

- [ ] **Step 5: Run build + existing notes E2E tests**

```bash
npx astro check && npx playwright test tests/e2e/notes.spec.ts
```

Expected: all existing tests pass. No visual change.

- [ ] **Step 6: Commit**

```bash
git add src/components/notes/layouts/DefaultNoteLayout.astro \
        src/components/notes/cards/DefaultNoteCard.astro \
        src/pages/notes/[slug].astro \
        src/pages/pt-br/notes/[slug].astro
git commit -m "refactor(notes): extract DefaultNoteLayout and DefaultNoteCard components"
```

---

## Task 5: BookNoteLayout and BookNoteCard

**Files:**
- Create: `src/components/notes/layouts/BookNoteLayout.astro`
- Create: `src/components/notes/cards/BookNoteCard.astro`

- [ ] **Step 1: Create `src/components/notes/layouts/BookNoteLayout.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../../../lib/content/locale';
import ShareButtons from '../../site/ShareButtons.astro';
import BackToTop from '../../site/BackToTop.astro';
import { getNoteAccentColor } from '../../../lib/notes';

interface Props {
  note: CollectionEntry<'notes'>;
  Content: any;
  locale: Locale;
}

const { note, Content, locale } = Astro.props;

const t = locale === 'en' ? {
  back: '← Back to notes',
  backHref: '/notes',
  by: 'by',
  pages: 'pages',
  readOn: 'Read on',
  status: { finished: 'Finished', reading: 'Reading', abandoned: 'Abandoned' },
  relatedTo: 'Related to',
  previous: '← Previous',
  next: 'Next →',
  fallbackNotice: 'This note is not available in English. Showing the original version.',
} : {
  back: '← Voltar para notas',
  backHref: '/pt-br/notes',
  by: 'por',
  pages: 'páginas',
  readOn: 'Lido em',
  status: { finished: 'Concluído', reading: 'Lendo', abandoned: 'Abandonado' },
  relatedTo: 'Relacionado a',
  previous: '← Anterior',
  next: 'Próximo →',
  fallbackNotice: 'Esta nota não está disponível em Português. Exibindo a versão original.',
};

const isTranslationFallback = note.data.language !== locale;
const accent = getNoteAccentColor(note.data.colorToken, note.data.category);
const statusKey = note.data.status?.[0] as 'finished' | 'reading' | 'abandoned' | undefined;
const statusLabel = statusKey ? t.status[statusKey] ?? statusKey : undefined;
const dateStr = note.data.dateRead
  ? note.data.dateRead.toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', { dateStyle: 'medium' })
  : undefined;
---

<article class="book-note-page" style={`--note-accent: ${accent}`}>
  <a href={t.backHref} class="back-link">{t.back}</a>

  <div class="book-header">
    {note.data.cover && (
      <img src={note.data.cover} alt={`Cover of ${note.data.title}`} class="book-cover" loading="lazy" />
    )}
    <div class="book-meta">
      {note.data.category && <span class="note-category-badge">{note.data.category}</span>}
      <h1 class="book-title">{note.data.title}</h1>
      {note.data.author && note.data.author.length > 0 && (
        <p class="book-author">{t.by} {note.data.author.join(', ')}</p>
      )}
      <div class="book-details">
        {note.data.rating && <span class="book-rating">{note.data.rating}</span>}
        {note.data.pages && <span class="book-pages">{note.data.pages} {t.pages}</span>}
        {statusLabel && <span class="book-status" data-status={statusKey}>{statusLabel}</span>}
        {dateStr && <span class="book-date-read">{t.readOn} {dateStr}</span>}
      </div>
      {note.data.tags && note.data.tags.length > 0 && (
        <div class="note-tags">
          {note.data.tags.map((tag: string) => <span class="tag-pill">#{tag}</span>)}
        </div>
      )}
    </div>
  </div>

  <hr class="preamble-divider" />

  {isTranslationFallback && (
    <div class="fallback-notice"><p>{t.fallbackNotice}</p></div>
  )}

  <div class="note-content prose">
    <Content />
  </div>

  {note.data.relatedTo && note.data.relatedTo.length > 0 && (
    <div class="book-related">
      <p class="book-related-label">{t.relatedTo}:</p>
      <ul class="book-related-list">
        {note.data.relatedTo.map((r: string) => (
          <li>{r.replace(/^\[\[|\]\]$/g, '')}</li>
        ))}
      </ul>
    </div>
  )}

  {(note.data.previousBook || note.data.nextBook) && (
    <nav class="book-nav">
      {note.data.previousBook
        ? <span class="book-nav-prev">{t.previous}: {note.data.previousBook}</span>
        : <span />
      }
      {note.data.nextBook && (
        <span class="book-nav-next">{note.data.nextBook} {t.next}</span>
      )}
    </nav>
  )}

  <ShareButtons title={note.data.title} url={Astro.url.href} type="note" locale={locale as 'en' | 'pt-br'} />
</article>

<BackToTop />

<style>
  .book-note-page {
    max-width: var(--container-max);
    margin: 0 auto;
    padding: var(--space-10) var(--space-6);
  }

  .back-link {
    display: block;
    color: var(--text-muted);
    font-size: var(--text-sm);
    text-decoration: none;
    margin-bottom: var(--space-6);
    transition: color var(--duration-fast) var(--ease-out);
  }
  .back-link:hover { color: var(--note-accent); }

  .book-header {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-8);
    align-items: start;
    margin-bottom: var(--space-6);
  }

  @media (max-width: 40rem) {
    .book-header { grid-template-columns: 1fr; }
    .book-cover { max-width: 10rem; }
  }

  .book-cover {
    width: 8rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    object-fit: cover;
  }

  .note-category-badge {
    display: inline-block;
    background: color-mix(in srgb, var(--note-accent) 12%, var(--surface));
    color: var(--note-accent);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    margin-bottom: var(--space-3);
  }

  .book-title {
    font-size: var(--text-2xl);
    font-weight: var(--weight-bold);
    margin-bottom: var(--space-2);
    line-height: 1.3;
  }

  .book-author {
    font-size: var(--text-base);
    color: var(--text-muted);
    margin-bottom: var(--space-3);
  }

  .book-details {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    align-items: center;
    margin-bottom: var(--space-4);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  .book-rating { color: var(--note-accent); letter-spacing: 0.05em; }

  .book-status {
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
  }
  .book-status[data-status="finished"] { background: color-mix(in srgb, #22c55e 15%, var(--surface)); color: #22c55e; }
  .book-status[data-status="reading"]  { background: color-mix(in srgb, #f59e0b 15%, var(--surface)); color: #f59e0b; }
  .book-status[data-status="abandoned"]{ background: color-mix(in srgb, #ef4444 15%, var(--surface)); color: #ef4444; }

  .note-tags { display: flex; flex-wrap: wrap; gap: var(--space-2); }
  .tag-pill {
    display: inline-block;
    background: var(--surface-high);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--text-muted);
  }

  .preamble-divider {
    border: none;
    border-top: 1px solid var(--note-accent);
    margin: var(--space-6) 0;
    opacity: 0.5;
  }

  .fallback-notice {
    background-color: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: var(--space-4);
    margin-bottom: var(--space-8);
    color: #92400e;
  }

  .note-content { margin-bottom: var(--space-10); }
  .note-content.prose { line-height: 1.6; }
  .note-content.prose :global(h2) { font-size: var(--text-2xl); margin-top: var(--space-8); margin-bottom: var(--space-4); }
  .note-content.prose :global(p) { margin-bottom: var(--space-4); }
  .note-content.prose :global(ul) { margin-bottom: var(--space-4); padding-left: var(--space-6); }

  .book-related {
    margin-top: var(--space-8);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border);
  }
  .book-related-label { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-2); }
  .book-related-list { list-style: disc; padding-left: var(--space-6); font-size: var(--text-sm); color: var(--text-muted); }

  .book-nav {
    display: flex;
    justify-content: space-between;
    margin-top: var(--space-10);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border);
    font-size: var(--text-sm);
    color: var(--text-muted);
    font-family: var(--font-mono);
  }
</style>
```

- [ ] **Step 2: Create `src/components/notes/cards/BookNoteCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../../../lib/content/locale';
import { contentLocalePath } from '../../../lib/content/locale';
import { getNoteAccentColor } from '../../../lib/notes';

interface Props {
  note: CollectionEntry<'notes'> & { isTranslationMissing?: boolean };
  locale: Locale;
  translationMissingLabel: string;
}

const { note, locale, translationMissingLabel } = Astro.props;
---

<article
  class="note-card book-note-card"
  data-category={note.data.category || 'uncategorized'}
  data-tags={note.data.tags.join(',')}
  style={`border-top: 3px solid ${getNoteAccentColor(note.data.colorToken, note.data.category)}`}
>
  <a href={contentLocalePath(locale, `/notes/${note.data.slug}`)} class="note-link">
    <div class="book-card-inner">
      {note.data.cover && (
        <img src={note.data.cover} alt="" class="book-card-cover" loading="lazy" aria-hidden="true" />
      )}
      <div class="book-card-body">
        <header class="note-header">
          {note.data.category && <span class="note-category">{note.data.category}</span>}
        </header>
        <h2 class="note-title">
          {note.data.title}
          {note.isTranslationMissing && (
            <span class="translation-missing-tag">({translationMissingLabel})</span>
          )}
        </h2>
        {note.data.author && note.data.author.length > 0 && (
          <p class="book-card-author">{note.data.author.join(', ')}</p>
        )}
        {note.data.rating && <p class="book-card-rating">{note.data.rating}</p>}
      </div>
    </div>
  </a>
</article>

<style>
  .book-card-inner {
    display: grid;
    grid-template-columns: 3rem 1fr;
    gap: var(--space-3);
    align-items: start;
  }
  .book-card-cover {
    width: 3rem;
    border-radius: var(--radius-sm);
    object-fit: cover;
    box-shadow: var(--shadow-sm);
  }
  .book-card-body { display: flex; flex-direction: column; }
  .book-card-author {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-bottom: var(--space-1);
  }
  .book-card-rating {
    font-size: var(--text-xs);
    letter-spacing: 0.05em;
    color: var(--accent);
    font-family: var(--font-mono);
  }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/notes/layouts/BookNoteLayout.astro \
        src/components/notes/cards/BookNoteCard.astro
git commit -m "feat(notes): add BookNoteLayout and BookNoteCard components"
```

---

## Task 6: MindmapLayout and MindmapCard

**Files:**
- Create: `src/components/notes/layouts/MindmapLayout.astro`
- Create: `src/components/notes/cards/MindmapCard.astro`

- [ ] **Step 1: Create `src/components/notes/layouts/MindmapLayout.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../../../lib/content/locale';
import BackToTop from '../../site/BackToTop.astro';
import ShareButtons from '../../site/ShareButtons.astro';
import { getNoteAccentColor } from '../../../lib/notes';

interface Props {
  note: CollectionEntry<'notes'>;
  Content: any;
  locale: Locale;
}

const { note, Content, locale } = Astro.props;

const t = locale === 'en'
  ? { back: '← Back to notes', backHref: '/notes', depthLegend: ['Root', 'Branch', 'Sub-branch', 'Leaf'] }
  : { back: '← Voltar para notas', backHref: '/pt-br/notes', depthLegend: ['Raiz', 'Ramo', 'Sub-ramo', 'Folha'] };

const accent = getNoteAccentColor(note.data.colorToken, note.data.category);
---

<article class="mindmap-page" style={`--note-accent: ${accent}`}>
  <a href={t.backHref} class="back-link">{t.back}</a>

  <h1 class="note-title">{note.data.title}</h1>

  {note.data.tags && note.data.tags.length > 0 && (
    <div class="note-tags">
      {note.data.tags.map((tag: string) => <span class="tag-pill">#{tag}</span>)}
    </div>
  )}

  <time class="note-date" datetime={note.data.publishedAt.toISOString()}>
    {note.data.publishedAt.toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', { dateStyle: 'long' })}
  </time>

  <div class="mindmap-legend" aria-hidden="true">
    {t.depthLegend.map((label, i) => (
      <span class="legend-item" data-depth={i}>{label}</span>
    ))}
  </div>

  <div class="mindmap-wrapper">
    <Content />
  </div>

  <ShareButtons title={note.data.title} url={Astro.url.href} type="note" locale={locale as 'en' | 'pt-br'} />
</article>

<BackToTop />

<style>
  .mindmap-page {
    max-width: var(--wide-max);
    margin: 0 auto;
    padding: var(--space-10) var(--space-6);
  }

  .back-link {
    display: block;
    color: var(--text-muted);
    font-size: var(--text-sm);
    text-decoration: none;
    margin-bottom: var(--space-6);
    transition: color var(--duration-fast) var(--ease-out);
  }
  .back-link:hover { color: var(--note-accent); }

  .note-title {
    font-size: var(--text-3xl);
    font-weight: var(--weight-bold);
    margin-bottom: var(--space-4);
  }

  .note-tags { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3); }
  .tag-pill {
    display: inline-block;
    background: var(--surface-high);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--text-muted);
  }

  .note-date {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-muted);
    margin-bottom: var(--space-8);
  }

  .mindmap-legend {
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
    margin-bottom: var(--space-8);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
  }
  .legend-item { display: flex; align-items: center; gap: var(--space-2); color: var(--text-muted); }
  .legend-item[data-depth="0"]::before { content: ''; display: inline-block; width: 12px; height: 12px; border-radius: var(--radius-full); background: var(--note-accent); }
  .legend-item[data-depth="1"]::before { content: ''; display: inline-block; width: 10px; height: 10px; border-radius: var(--radius-full); background: color-mix(in srgb, var(--note-accent) 70%, var(--bg)); }
  .legend-item[data-depth="2"]::before { content: ''; display: inline-block; width: 8px; height: 8px; border-radius: var(--radius-full); background: color-mix(in srgb, var(--note-accent) 40%, var(--bg)); }
  .legend-item[data-depth="3"]::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: var(--radius-full); background: var(--text-muted); }

  .mindmap-wrapper {
    overflow-x: auto;
    padding: var(--space-6) 0;
  }

  /* Mindmap tree styles */
  .mindmap-wrapper :global(.mindmap-tree) {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .mindmap-wrapper :global(.mindmap-node) {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    position: relative;
  }

  .mindmap-wrapper :global(.mindmap-label) {
    display: inline-block;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    font-weight: 500;
    white-space: nowrap;
    transition: box-shadow var(--duration-base) var(--ease-out);
  }

  .mindmap-wrapper :global(.mindmap-root > .mindmap-label) {
    background: var(--note-accent);
    color: #fff;
    font-size: var(--text-base);
    font-weight: 700;
    padding: var(--space-3) var(--space-6);
    box-shadow: var(--shadow-md);
  }

  .mindmap-wrapper :global(.mindmap-node[data-depth="1"] > .mindmap-label) {
    background: color-mix(in srgb, var(--note-accent) 70%, var(--bg));
    color: var(--text);
    box-shadow: var(--shadow-sm);
  }

  .mindmap-wrapper :global(.mindmap-node[data-depth="2"] > .mindmap-label) {
    background: color-mix(in srgb, var(--note-accent) 25%, var(--surface));
    color: var(--text);
    border: 1px solid var(--border);
  }

  .mindmap-wrapper :global(.mindmap-node[data-depth="3"] > .mindmap-label),
  .mindmap-wrapper :global(.mindmap-node[data-depth="4"] > .mindmap-label),
  .mindmap-wrapper :global(.mindmap-node[data-depth="5"] > .mindmap-label) {
    background: var(--surface-high);
    color: var(--text-muted);
    font-size: var(--text-xs);
    border: 1px solid var(--border);
  }

  .mindmap-wrapper :global(.mindmap-label:hover) {
    box-shadow: var(--shadow-md);
  }

  .mindmap-wrapper :global(.mindmap-children) {
    list-style: none;
    padding: 0;
    margin: 0;
    padding-left: var(--space-8);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    border-left: 2px solid color-mix(in srgb, var(--note-accent) 30%, var(--border));
    margin-left: var(--space-4);
    padding-top: var(--space-2);
    padding-bottom: var(--space-2);
  }

  @media (prefers-reduced-motion: no-preference) {
    .mindmap-wrapper :global(.mindmap-children) {
      transition: border-color var(--duration-base) var(--ease-out);
    }
    .mindmap-wrapper :global(.mindmap-node:hover > .mindmap-children) {
      border-color: var(--note-accent);
    }
  }
</style>
```

- [ ] **Step 2: Create `src/components/notes/cards/MindmapCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../../../lib/content/locale';
import { contentLocalePath } from '../../../lib/content/locale';
import { getNoteAccentColor } from '../../../lib/notes';

interface Props {
  note: CollectionEntry<'notes'> & { isTranslationMissing?: boolean };
  locale: Locale;
  translationMissingLabel: string;
}

const { note, locale, translationMissingLabel } = Astro.props;
---

<article
  class="note-card mindmap-note-card"
  data-category={note.data.category || 'uncategorized'}
  data-tags={note.data.tags.join(',')}
  style={`border-top: 3px solid ${getNoteAccentColor(note.data.colorToken, note.data.category)}`}
>
  <a href={contentLocalePath(locale, `/notes/${note.data.slug}`)} class="note-link">
    <header class="note-header">
      {note.data.category && <span class="note-category">{note.data.category}</span>}
      <span class="type-badge" aria-label="Mindmap note">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
          <line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="5" y2="17"/><line x1="12" y1="12" x2="19" y2="17"/>
        </svg>
      </span>
    </header>
    <h2 class="note-title">
      {note.data.title}
      {note.isTranslationMissing && (
        <span class="translation-missing-tag">({translationMissingLabel})</span>
      )}
    </h2>
    {note.data.summary && <p class="note-summary">{note.data.summary}</p>}
    {note.data.tags && note.data.tags.length > 0 && (
      <div class="note-tags">
        {note.data.tags.map((tag: string) => (<span class="tag">#{tag}</span>))}
      </div>
    )}
  </a>
</article>

<style>
  .type-badge { color: var(--text-muted); display: flex; align-items: center; }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/notes/layouts/MindmapLayout.astro \
        src/components/notes/cards/MindmapCard.astro
git commit -m "feat(notes): add MindmapLayout and MindmapCard components"
```

---

## Task 7: WhiteboardLayout and WhiteboardCard

**Files:**
- Create: `src/components/notes/layouts/WhiteboardLayout.astro`
- Create: `src/components/notes/cards/WhiteboardCard.astro`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add Caveat font support to `BaseLayout.astro`**

`BaseLayout.astro` accepts a new optional prop `noteType`. Add to its `Props` interface:

```ts
noteType?: string | undefined;
```

Add to destructuring:

```ts
const { title, description, image, ogType, locale = 'en', translations, structuredData, pageType, noteType } = Astro.props;
```

Inside `<head>`, after the existing `<link>` tags, add:

```astro
{noteType === 'whiteboard' && (
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap" rel="stylesheet" />
)}
```

- [ ] **Step 2: Create `src/components/notes/layouts/WhiteboardLayout.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../../../lib/content/locale';
import BackToTop from '../../site/BackToTop.astro';
import ShareButtons from '../../site/ShareButtons.astro';
import { getNoteAccentColor } from '../../../lib/notes';

interface Props {
  note: CollectionEntry<'notes'>;
  Content: any;
  locale: Locale;
}

const { note, Content, locale } = Astro.props;

const t = locale === 'en'
  ? { back: '← Back to notes', backHref: '/notes', copyImage: 'Copy as image', copied: 'Copied!' }
  : { back: '← Voltar para notas', backHref: '/pt-br/notes', copyImage: 'Copiar como imagem', copied: 'Copiado!' };

const accent = getNoteAccentColor(note.data.colorToken, note.data.category);
---

<article class="whiteboard-page" style={`--note-accent: ${accent}`}>
  <a href={t.backHref} class="back-link">{t.back}</a>

  <div class="whiteboard-frame" data-whiteboard>
    <div class="whiteboard-toolbar">
      <span class="whiteboard-title-label">{note.data.title}</span>
      <button
        class="whiteboard-copy-btn"
        data-copy-label={t.copyImage}
        data-copied-label={t.copied}
        aria-label={t.copyImage}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        {t.copyImage}
      </button>
    </div>
    <div class="whiteboard-canvas">
      <Content />
    </div>
  </div>

  {note.data.tags && note.data.tags.length > 0 && (
    <div class="note-tags below-board">
      {note.data.tags.map((tag: string) => <span class="tag-pill">#{tag}</span>)}
    </div>
  )}

  <ShareButtons title={note.data.title} url={Astro.url.href} type="note" locale={locale as 'en' | 'pt-br'} />
</article>

<BackToTop />

<script>
  function initWhiteboardCopy() {
    document.querySelectorAll<HTMLButtonElement>('.whiteboard-copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const canvas = btn.closest('.whiteboard-frame')?.querySelector<HTMLElement>('.whiteboard-canvas');
        if (!canvas) return;
        const copiedLabel = btn.dataset.copiedLabel ?? 'Copied!';
        try {
          const { default: html2canvas } = await import('html2canvas');
          const canvasEl = await html2canvas(canvas);
          canvasEl.toBlob(async (blob) => {
            if (!blob) return;
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            (window as any).showToast?.({ message: copiedLabel, variant: 'accent', duration: 2000 });
          });
        } catch {
          // Fallback: copy page URL
          await navigator.clipboard.writeText(window.location.href).catch(() => {});
        }
      });
    });
  }

  initWhiteboardCopy();
  document.addEventListener('astro:page-load', initWhiteboardCopy);
</script>

<style>
  .whiteboard-page {
    max-width: var(--wide-max);
    margin: 0 auto;
    padding: var(--space-10) var(--space-6);
  }

  .back-link {
    display: block;
    color: var(--text-muted);
    font-size: var(--text-sm);
    text-decoration: none;
    margin-bottom: var(--space-6);
    transition: color var(--duration-fast) var(--ease-out);
  }
  .back-link:hover { color: var(--note-accent); }

  .whiteboard-frame {
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    margin-bottom: var(--space-6);
  }

  .whiteboard-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) var(--space-6);
    background: #e8e0d0;
    border-bottom: 1px solid #c8bfaf;
  }

  .whiteboard-title-label {
    font-family: 'Caveat', cursive;
    font-size: var(--text-lg);
    color: #4a3f35;
    font-weight: 600;
  }

  .whiteboard-copy-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: transparent;
    border: 1px solid #c8bfaf;
    border-radius: var(--radius-sm);
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: #4a3f35;
    cursor: pointer;
    transition: background var(--duration-fast) var(--ease-out);
  }
  .whiteboard-copy-btn:hover { background: #ddd5c5; }

  .whiteboard-canvas {
    background-color: #f5f0e8;
    background-image: radial-gradient(circle, #b8b0a0 1px, transparent 1px);
    background-size: 24px 24px;
    padding: var(--space-10) var(--space-12);
    min-height: 40vh;
    font-family: 'Caveat', cursive;
    color: #1a1a1a;
    font-size: 1.25rem;
    line-height: 1.7;
  }

  /* Ink color conventions */
  .whiteboard-canvas :global(strong) {
    color: #c0392b;
    font-weight: 700;
  }
  .whiteboard-canvas :global(em) {
    color: #2980b9;
    font-style: normal;
  }

  /* Headings */
  .whiteboard-canvas :global(h1),
  .whiteboard-canvas :global(h2),
  .whiteboard-canvas :global(h3) {
    font-family: 'Caveat', cursive;
    color: #1a1a1a;
    border-bottom: 2px solid #1a1a1a;
    display: inline-block;
    transform: rotate(-0.4deg);
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-1);
  }
  .whiteboard-canvas :global(h1) { font-size: 2rem; }
  .whiteboard-canvas :global(h2) { font-size: 1.6rem; }
  .whiteboard-canvas :global(h3) { font-size: 1.35rem; }

  /* Lists */
  .whiteboard-canvas :global(ul) { list-style: none; padding-left: var(--space-6); }
  .whiteboard-canvas :global(ul li)::before {
    content: '●';
    margin-right: var(--space-2);
    color: #1a1a1a;
    font-size: 0.6em;
    vertical-align: middle;
  }

  /* HR */
  .whiteboard-canvas :global(hr) {
    border: none;
    border-top: 2px solid #1a1a1a;
    margin: var(--space-6) 0;
    transform: rotate(-0.3deg);
    opacity: 0.4;
  }

  /* Paragraphs */
  .whiteboard-canvas :global(p) { margin-bottom: var(--space-4); }

  .note-tags.below-board {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
  }
  .tag-pill {
    display: inline-block;
    background: var(--surface-high);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--text-muted);
  }
</style>
```

> **Note on screenshot:** The `html2canvas` import is a dynamic import that will fail gracefully if the package isn't installed. To enable it, run `npm install html2canvas`. The fallback copies the page URL instead.

- [ ] **Step 3: Create `src/components/notes/cards/WhiteboardCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../../../lib/content/locale';
import { contentLocalePath } from '../../../lib/content/locale';
import { getNoteAccentColor } from '../../../lib/notes';

interface Props {
  note: CollectionEntry<'notes'> & { isTranslationMissing?: boolean };
  locale: Locale;
  translationMissingLabel: string;
}

const { note, locale, translationMissingLabel } = Astro.props;
---

<article
  class="note-card whiteboard-note-card"
  data-category={note.data.category || 'uncategorized'}
  data-tags={note.data.tags.join(',')}
  style={`border-top: 3px solid ${getNoteAccentColor(note.data.colorToken, note.data.category)}`}
>
  <a href={contentLocalePath(locale, `/notes/${note.data.slug}`)} class="note-link">
    <header class="note-header">
      {note.data.category && <span class="note-category">{note.data.category}</span>}
      <span class="type-badge" aria-label="Whiteboard note">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </span>
    </header>
    <h2 class="note-title">
      {note.data.title}
      {note.isTranslationMissing && (
        <span class="translation-missing-tag">({translationMissingLabel})</span>
      )}
    </h2>
    {note.data.summary && <p class="note-summary">{note.data.summary}</p>}
    {note.data.tags && note.data.tags.length > 0 && (
      <div class="note-tags">
        {note.data.tags.map((tag: string) => (<span class="tag">#{tag}</span>))}
      </div>
    )}
  </a>
</article>

<style>
  .type-badge { color: var(--text-muted); display: flex; align-items: center; }
</style>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/notes/layouts/WhiteboardLayout.astro \
        src/components/notes/cards/WhiteboardCard.astro \
        src/layouts/BaseLayout.astro
git commit -m "feat(notes): add WhiteboardLayout, WhiteboardCard, and Caveat font support"
```

---

## Task 8: Wire up per-type routing and NotesGrid

**Files:**
- Modify: `src/pages/notes/[slug].astro`
- Modify: `src/pages/pt-br/notes/[slug].astro`
- Modify: `src/components/notes/NotesGrid.astro`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Register the mindmap plugin in `astro.config.mjs`**

Add the import:

```js
import { remarkMindmap } from './src/lib/remark/mindmap.ts';
```

Add to `remarkPlugins` array (before `remarkMath`):

```js
remarkMindmap,
```

The full `remarkPlugins` array becomes:

```js
remarkPlugins: [
  remarkNoteBlocks,
  remarkHighlights,
  remarkObsidianImages,
  remarkObsidianWikilinks,
  remarkMindmap,
  remarkMath,
  remarkTaskItems,
],
```

- [ ] **Step 2: Update `src/pages/notes/[slug].astro` to switch on noteType**

Replace the current `<BaseLayout>` usage with:

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import DefaultNoteLayout from '../../components/notes/layouts/DefaultNoteLayout.astro';
import BookNoteLayout from '../../components/notes/layouts/BookNoteLayout.astro';
import MindmapLayout from '../../components/notes/layouts/MindmapLayout.astro';
import WhiteboardLayout from '../../components/notes/layouts/WhiteboardLayout.astro';

export async function getStaticPaths() {
  const allNotes = await getCollection('notes');
  const locale = 'en';

  return allNotes.map(note => {
    const translations = allNotes.filter(n => n.data.translationKey === note.data.translationKey);
    const enNote = translations.find(n => n.data.language === 'en');
    const ptNote = translations.find(n => n.data.language === 'pt-br');

    return {
      params: { slug: note.data.slug },
      props: {
        note,
        translations: {
          ...(enNote ? { en: `/notes/${enNote.data.slug}` } : {}),
          ...(ptNote ? { 'pt-br': `/pt-br/notes/${ptNote.data.slug}` } : {}),
        },
      },
    };
  });
}

const { note, translations } = Astro.props;
const { Content } = await render(note);
const locale = 'en';

const layouts = {
  note:       DefaultNoteLayout,
  book:       BookNoteLayout,
  mindmap:    MindmapLayout,
  whiteboard: WhiteboardLayout,
} as const;

const NoteLayout = layouts[note.data.noteType ?? 'note'];
---

<BaseLayout
  locale={locale}
  title={note.data.title}
  description={note.data.summary ?? undefined}
  image={`/og/notes/${note.data.slug}.png`}
  ogType="article"
  translations={translations}
  noteType={note.data.noteType}
>
  <NoteLayout note={note} Content={Content} locale={locale} />
</BaseLayout>
```

- [ ] **Step 3: Apply identical change to `src/pages/pt-br/notes/[slug].astro`**

Same imports, same layout switch. Change `locale = 'en'` to `locale = 'pt-br'` and update path prefixes in `getStaticPaths` accordingly (they already use the correct pattern).

- [ ] **Step 4: Update `NotesGrid.astro` to use per-type cards**

Replace the single `notes.map(...)` block with:

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../../lib/content/locale';
import { contentLocalePath } from '../../lib/content/locale';
import DefaultNoteCard from './cards/DefaultNoteCard.astro';
import BookNoteCard from './cards/BookNoteCard.astro';
import MindmapCard from './cards/MindmapCard.astro';
import WhiteboardCard from './cards/WhiteboardCard.astro';

interface Props {
  notes: (CollectionEntry<'notes'> & { isTranslationMissing?: boolean })[];
  locale: Locale;
}

const { notes, locale } = Astro.props;

const translationMissingLabel = {
  en: 'Available in Portuguese only',
  'pt-br': 'Disponível apenas em Inglês',
}[locale];
---

<div class="notes-grid" id="notes-grid">
  {notes.map(note => {
    const type = note.data.noteType ?? 'note';
    const cardProps = { note, locale, translationMissingLabel };
    return type === 'book'       ? <BookNoteCard {...cardProps} />
         : type === 'mindmap'    ? <MindmapCard {...cardProps} />
         : type === 'whiteboard' ? <WhiteboardCard {...cardProps} />
         : <DefaultNoteCard {...cardProps} />;
  })}

  <div id="no-notes-message" class="no-notes-message" style="display: none;">
    <p>{locale === 'en' ? 'No notes found matching the selected filters.' : 'Nenhuma nota encontrada com os filtros selecionados.'}</p>
  </div>
</div>

<div class="cross-section-link">
  <a href={contentLocalePath(locale, '/blog')} class="cross-section-nav">
    {locale === 'pt-br' ? 'Ler o blog →' : 'Read the Blog →'}
  </a>
</div>
```

Keep only the `.notes-grid`, `.no-notes-message`, `.cross-section-link`, `.cross-section-nav` styles — the card-specific styles now live in each card component.

- [ ] **Step 5: Run full check**

```bash
npx astro check
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add astro.config.mjs \
        src/pages/notes/[slug].astro \
        src/pages/pt-br/notes/[slug].astro \
        src/components/notes/NotesGrid.astro
git commit -m "feat(notes): wire per-type layout routing and type-aware NotesGrid"
```

---

## Task 9: Add sample content files for each type

**Files:**
- Create: `src/content/notes/book-a-system-for-writing.en.md`
- Create: `src/content/notes/zettelkasten-overview.en.md`
- Create: `src/content/notes/auth-flow.en.md`

These are minimal working examples that let us verify rendering locally.

- [ ] **Step 1: Create book note sample**

`src/content/notes/book-a-system-for-writing.en.md`:

```markdown
---
slug: "book-a-system-for-writing.en"
title: "A System for Writing"
language: "en"
translationKey: "book-a-system-for-writing"
publishedAt: "2026-04-14"
noteType: book
author:
  - Bob Doto
cover: "https://images.isbndb.com/covers/19158983488674.jpg"
pages: 211
rating: "★★★★"
status:
  - finished
dateRead: "2025-02-24"
publishDate: "2024-07-09"
tags: [book, note-taking, zettelkasten, pkm]
category: "Productivity"
relatedTo:
  - "[[How to Take Smart Notes]]"
---

## Overview

Bob Doto's primer on Zettelkasten focuses on the *writing* workflow rather than the note collection habit.

## Key Ideas

- Notes are for **writing**, not storage
- The slip-box should force connections

## Conclusion

A concise, practical introduction to the method.
```

- [ ] **Step 2: Create mindmap note sample**

`src/content/notes/zettelkasten-overview.en.md`:

```markdown
---
slug: "zettelkasten-overview.en"
title: "Zettelkasten Overview"
language: "en"
translationKey: "zettelkasten-overview"
publishedAt: "2026-04-14"
noteType: mindmap
tags: [pkm, zettelkasten, note-taking]
category: "Productivity"
---

# Zettelkasten

## Principles

- Atomicity
    - One idea per note
- Connectivity
    - Links over hierarchy
    - Emergent structure

## Note Types

- Fleeting Notes
    - Quick captures
    - Temporary
- Literature Notes
    - Source summaries
- Permanent Notes
    - Your own words
    - Long-term value

## Tools

- Obsidian
- Roam
- Paper slips

## Workflow

- Capture
    - Fleeting first
- Process
    - Convert to permanent
- Connect
    - Link to existing notes
        - Use tags sparingly
        - Prefer direct links
```

- [ ] **Step 3: Create whiteboard note sample**

`src/content/notes/auth-flow.en.md`:

```markdown
---
slug: "auth-flow.en"
title: "Auth Flow Sketch"
language: "en"
translationKey: "auth-flow"
publishedAt: "2026-04-14"
noteType: whiteboard
tags: [architecture, auth, design]
category: "Engineering"
---

# Auth Flow

**User** → *Login Form* → **Server**

---

## Steps

1. User submits credentials
2. Server validates → **JWT issued**
3. Client stores token (*localStorage*)
4. Every request: *Bearer token* in header

---

## Edge Cases

- **Token expired** → redirect to login
- *Rate limiting* → 429 response
- **Invalid token** → 401, clear storage
```

- [ ] **Step 4: Run dev server and visually check all three**

```bash
npm run dev
```

Visit:
- `http://localhost:4321/notes/book-a-system-for-writing.en` — book layout with cover, rating, metadata
- `http://localhost:4321/notes/zettelkasten-overview.en` — mindmap tree
- `http://localhost:4321/notes/auth-flow.en` — whiteboard canvas with handwritten font

- [ ] **Step 5: Commit**

```bash
git add src/content/notes/book-a-system-for-writing.en.md \
        src/content/notes/zettelkasten-overview.en.md \
        src/content/notes/auth-flow.en.md
git commit -m "feat(notes): add sample book, mindmap, and whiteboard content"
```

---

## Task 10: E2E tests for new note types

**Files:**
- Modify: `tests/e2e/notes.spec.ts`

- [ ] **Step 1: Add tests for book, mindmap, and whiteboard**

Add to the existing `test.describe('Notes', ...)` block in `tests/e2e/notes.spec.ts`:

```ts
test('book note: renders cover image and metadata', async ({ page }) => {
  await page.goto('/notes/book-a-system-for-writing.en');
  await expect(page.locator('.book-cover')).toBeVisible();
  await expect(page.locator('.book-author')).toBeVisible();
  await expect(page.locator('.book-rating')).toBeVisible();
  await expect(page.locator('.book-status')).toBeVisible();
});

test('mindmap note: renders mindmap-tree element with root node', async ({ page }) => {
  await page.goto('/notes/zettelkasten-overview.en');
  await expect(page.locator('.mindmap-tree')).toBeVisible();
  const root = page.locator('.mindmap-root .mindmap-label').first();
  await expect(root).toBeVisible();
  await expect(root).toContainText('Zettelkasten');
});

test('whiteboard note: applies whiteboard canvas and Caveat font', async ({ page }) => {
  await page.goto('/notes/auth-flow.en');
  await expect(page.locator('[data-whiteboard]')).toBeVisible();
  await expect(page.locator('.whiteboard-canvas')).toBeVisible();
  const fontFamily = await page.locator('.whiteboard-canvas').evaluate(
    el => window.getComputedStyle(el).fontFamily
  );
  expect(fontFamily).toContain('Caveat');
});

test('book note card: shows cover thumbnail and rating in index', async ({ page }) => {
  await page.goto('/notes');
  const bookCard = page.locator('.book-note-card').first();
  await expect(bookCard).toBeVisible();
  await expect(bookCard.locator('.book-card-cover')).toBeVisible();
  await expect(bookCard.locator('.book-card-rating')).toBeVisible();
});

test('mindmap card: shows type badge in index', async ({ page }) => {
  await page.goto('/notes');
  const mindmapCard = page.locator('.mindmap-note-card').first();
  await expect(mindmapCard).toBeVisible();
  await expect(mindmapCard.locator('.type-badge')).toBeVisible();
});
```

- [ ] **Step 2: Run E2E tests**

```bash
npx astro build && npx playwright test tests/e2e/notes.spec.ts
```

Expected: all tests pass including the new ones.

- [ ] **Step 3: Run full test suite**

```bash
npx astro check && npm run test:unit && npx playwright test tests/e2e/notes.spec.ts
```

Expected: 0 errors, all unit and E2E tests pass.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/notes.spec.ts
git commit -m "test(notes): add E2E tests for book, mindmap, and whiteboard note types"
```

---

## Self-Review

**Spec coverage check:**

| Spec section | Covered by task |
|---|---|
| §1 Content model — noteType + book fields | Task 1 |
| §2 Build-time validation — book/mindmap | Task 2 |
| §3 Mindmap remark plugin | Task 3 |
| §3.2 Mindmap visual style | Task 6 (MindmapLayout styles) |
| §3.3 MindmapLayout component | Task 6 |
| §4 Whiteboard rendering | Task 7 |
| §4.3 WhiteboardLayout | Task 7 |
| §5 Per-type layouts — routing | Task 4 + Task 8 |
| §5.1 BookNoteLayout | Task 5 |
| §6 Type-aware cards | Tasks 5–7 + Task 8 |
| §7 Bilingual support | Task 4 (both slug pages), Task 8 |
| §8 Unit tests | Tasks 2, 3 |
| §8 E2E tests | Task 10 |
| §9 Sample content | Task 9 |

All sections covered. No gaps.
