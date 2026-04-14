# Notes Type System — Design Spec

**Date:** 2026-04-13
**Status:** Approved

## Overview

Extend the existing notes system to support four distinct note types — `note`, `book`, `mindmap`, and `whiteboard` — each with type-specific frontmatter fields, a dedicated detail layout component, and type-aware index cards. The unified `/notes` collection, bilingual fallback system, and static-first build remain unchanged.

---

## 1. Content Model

### 1.1 Schema Changes (`src/content.config.ts`)

A `noteType` discriminator field is added to the notes collection schema. All type-specific fields are additive and optional in Zod; mandatory fields for each type are enforced by a build-time validation helper.

```ts
const noteType = z.enum(["note", "book", "mindmap", "whiteboard"]).default("note");

const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/notes" }),
  schema: z.object({
    // --- shared (all types) ---
    slug: z.string().min(1),
    title: z.string(),
    language,
    translationKey: z.string().min(1),
    publishedAt: z.coerce.date(),
    noteType,
    summary: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    colorToken: z.string().optional(),

    // --- book only ---
    author: z.array(z.string()).optional(),
    cover: z.string().url().optional(),
    pages: z.number().int().positive().optional(),
    rating: z.string().optional(),           // e.g. "★★★★"
    status: z.array(z.string()).optional(),  // ["finished"] | ["reading"] | ["abandoned"]
    dateRead: z.coerce.date().optional(),
    publishDate: z.coerce.date().optional(),
    relatedTo: z.array(z.string()).optional(),
    previousBook: z.string().optional(),
    nextBook: z.string().optional(),
  }),
});
```

Existing notes (`debugging-habits`, `rtos-scheduling`) omit `noteType` and default to `"note"` — no migration required.

### 1.2 Frontmatter Contract Per Type

**`note`** — existing fields only. No new requirements.

**`book`** — required: `author`, `cover`. Recommended: `pages`, `rating`, `status`, `dateRead`. Example:

```yaml
noteType: book
title: "A System for Writing"
author:
  - Bob Doto
cover: https://images.isbndb.com/covers/19158983488674.jpg
pages: 211
rating: ★★★★
status:
  - finished
dateRead: 2025-02-24
publishDate: 2024-07-09
tags: [book, note-taking, zettelkasten]
category: Productivity
```

**`mindmap`** — body must begin with an H1 (root node). Structure uses standard markdown headings (depth = level) and nested lists (further depth). No special syntax.

```yaml
noteType: mindmap
title: "Zettelkasten Overview"
tags: [pkm, zettelkasten]
```

**`whiteboard`** — body is regular markdown prose. Color conventions:
- `**bold**` → red ink
- `*italic*` → blue ink
- plain text → black ink
- `---` → hand-drawn divider

```yaml
noteType: whiteboard
title: "Auth Flow Sketch"
tags: [architecture, auth]
```

---

## 2. Build-Time Validation

`src/lib/content/validation.ts` gains two new checks, run during the Astro build:

- **Book notes** missing `author` or `cover` → build error (blocks publish)
- **Mindmap notes** with no H1 in body → build warning (mindmap needs a root node to render correctly)

This is consistent with the existing "Content as Contract" principle.

---

## 3. Mindmap Rendering

### 3.1 Remark Plugin (`src/lib/remark/mindmap.ts`)

A custom remark plugin transforms the markdown AST at build time for notes with `noteType: "mindmap"`. It walks the mdast and:

1. Collects headings (H1–H6) and list items into a tree structure
2. Replaces the AST nodes with a nested `<ul class="mindmap-tree">` HTML node structure
3. Annotates each node with `data-depth` for CSS depth-based coloring

The transformed AST is then rendered by the standard `<Content />` call in `MindmapLayout.astro` — no special rendering path needed. The plugin is registered only for mindmap notes — it does not affect other content.

### 3.2 Visual Style

- **Root (H1):** pill shape, `--accent` background, white text, centered at top
- **Branch nodes (H2):** colored pills using `--accent` tinted by depth
- **Leaf nodes (list items):** smaller, `--text-muted` color, small dot bullet
- **Connecting lines:** pure CSS using borders and pseudo-elements — no SVG
- **Layout:** horizontal fan for top two levels (root → H2 branches), vertical list for deeper levels
- **Hover:** connecting lines animate with `--duration-base` easing
- **`prefers-reduced-motion`:** animations disabled, static lines shown

### 3.3 MindmapLayout Component

`src/components/notes/layouts/MindmapLayout.astro` renders only the mindmap tree. The standard `.note-content.prose` wrapper is not used. A small legend shows the depth color mapping. Back link, title, tags, and date are rendered above the tree in the standard note header style.

---

## 4. Whiteboard Rendering

### 4.1 Visual Treatment

- **Background:** `#f5f0e8` (warm off-white), subtle dot grid via CSS `background-image` — always applied regardless of `data-theme`
- **Font:** [Caveat](https://fonts.google.com/specimen/Caveat) (Google Fonts, loaded conditionally via `BaseLayout` when `noteType === 'whiteboard'`)
- **Ink colors:**
  - Plain text → `#1a1a1a` (black marker)
  - `**bold**` → `#c0392b` (red marker)
  - `*italic*` → `#2980b9` (blue marker)
- **Headings:** larger size, hand-drawn underline (CSS border + `transform: rotate(-0.5deg)`)
- **Lists:** `::before` circle bullets, slightly imperfect via border-radius
- **`---` rules:** hand-drawn divider line (CSS)
- **Aspect ratio:** max-width `72rem`, aspect ratio close to 16:9, so it screenshots cleanly as a shareable image

### 4.2 Theme Independence

The whiteboard always renders with off-white background and black/red/blue ink, ignoring `[data-theme]`. It is a physical artifact, not a UI component.

### 4.3 WhiteboardLayout Component

`src/components/notes/layouts/WhiteboardLayout.astro` wraps `<Content />` in `<div class="whiteboard-canvas">`. A "Share" button (top-right corner of the frame) extends the existing `ShareButtons` pattern with a screenshot-to-clipboard action using the Canvas API.

---

## 5. Per-Type Layout Components

All layout components live in `src/components/notes/layouts/`.

```
src/components/notes/layouts/
  DefaultNoteLayout.astro    ← existing [slug].astro rendering, extracted
  BookNoteLayout.astro       ← book metadata header + prose body
  MindmapLayout.astro        ← mindmap tree, no prose wrapper
  WhiteboardLayout.astro     ← whiteboard canvas + share button
```

`src/pages/notes/[slug].astro` (and the `pt-br` equivalent) becomes:

```astro
---
const layouts = {
  note:       DefaultNoteLayout,
  book:       BookNoteLayout,
  mindmap:    MindmapLayout,
  whiteboard: WhiteboardLayout,
};
const NoteLayout = layouts[note.data.noteType ?? 'note'];
---
<BaseLayout ...>
  <NoteLayout note={note} Content={Content} locale={locale} />
</BaseLayout>
```

### 5.1 BookNoteLayout

- Two-column header (mobile: stacked): cover image left (max `8rem` wide), metadata right
- Metadata shown: title, author list, rating (stars), page count, read date, status badge, publish date
- Below header: standard `.note-content.prose` for the prose body
- `relatedTo` list rendered as cross-links at the bottom. Values use Obsidian wiki-link format (`[[Book Title]]`) — the existing `obsidian-wikilinks` remark plugin (`src/lib/remark/obsidian-wikilinks.ts`) handles stripping brackets; plain text fallback if no matching slug exists.
- `previousBook` / `nextBook` rendered as prev/next navigation links at the bottom of the page, below the prose body, styled as `← Previous` / `Next →` text links.

---

## 6. Notes Index — Type-Aware Cards

Cards live in `src/components/notes/cards/`. `NotesGrid.astro` switches on `noteType`:

```
src/components/notes/cards/
  DefaultNoteCard.astro
  BookNoteCard.astro
  MindmapCard.astro
  WhiteboardCard.astro
```

**Type indicators on cards:**

- **book:** small cover thumbnail (left edge of card), author name below title, star rating in metadata row
- **mindmap:** small branch/tree SVG icon badge (top-right corner)
- **whiteboard:** small marker/pen SVG icon badge (top-right corner)
- **note:** no change from current card design

Icons are inline SVGs, `1rem`, `var(--text-muted)` color. No external icon library.

The sidebar filters (category, tags) are unchanged for v1. A type filter can be added later.

---

## 7. Bilingual Support

No changes to the translation fallback system. Type-specific fields (`author`, `cover`, `noteType`, etc.) are language-neutral — they appear identically in both `en` and `pt-br` files. Only the prose body is translated. Both slug page routes (`/notes/[slug].astro` and `/pt-br/notes/[slug].astro`) use the same layout component switch.

---

## 8. Testing

### Unit Tests
- `src/lib/remark/mindmap.ts` — input mdast → expected HTML output (various depths, list nesting)
- `src/lib/content/validation.ts` — book note missing `author` throws; book note missing `cover` throws; mindmap missing H1 warns

### E2E Tests (Playwright, following existing patterns)
- Book note detail: cover image renders, author/rating/page count visible
- Mindmap detail: `.mindmap-tree` element present, root node matches H1 title
- Whiteboard detail: `data-whiteboard` attribute or class present, Caveat font loaded

---

## 9. New Files Summary

| File | Purpose |
|---|---|
| `src/components/notes/layouts/DefaultNoteLayout.astro` | Extracted from current `[slug].astro` |
| `src/components/notes/layouts/BookNoteLayout.astro` | Book metadata + prose |
| `src/components/notes/layouts/MindmapLayout.astro` | Mindmap tree renderer |
| `src/components/notes/layouts/WhiteboardLayout.astro` | Whiteboard canvas |
| `src/components/notes/cards/DefaultNoteCard.astro` | Extracted from `NotesGrid` |
| `src/components/notes/cards/BookNoteCard.astro` | Book card with cover + rating |
| `src/components/notes/cards/MindmapCard.astro` | Card with branch icon badge |
| `src/components/notes/cards/WhiteboardCard.astro` | Card with marker icon badge |
| `src/lib/remark/mindmap.ts` | Remark plugin: md AST → mindmap HTML |

### Modified Files

| File | Change |
|---|---|
| `src/content.config.ts` | Add `noteType` + book fields to notes schema |
| `src/lib/content/validation.ts` | Add book + mindmap validation checks |
| `src/pages/notes/[slug].astro` | Delegate to per-type layout component |
| `src/pages/pt-br/notes/[slug].astro` | Same delegation |
| `src/components/notes/NotesGrid.astro` | Switch on `noteType` to per-type card |

### No New Runtime Dependencies

Caveat loaded via Google Fonts `<link>` in `BaseLayout` (conditional on `noteType === 'whiteboard'`). All other rendering is CSS + the existing remark/rehype plugin pipeline.

The whiteboard "screenshot to clipboard" button uses the browser-native Canvas API — no external JS library. This is the only new client-side JavaScript introduced by this feature.
