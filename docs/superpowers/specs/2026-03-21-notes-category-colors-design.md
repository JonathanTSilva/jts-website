# Notes Category Color System Design Spec
**Date:** 2026-03-21
**Branch base:** `feature/frontend-redesign`
**Scope:** Utility function mapping note categories to accent colors; applied on notes index and individual note pages

---

## Prerequisites

This spec builds on `feature/frontend-redesign`. The notes content model, `NotesGrid`, `NotesFilters`, and individual note page files are assumed present.

---

## Overview

Notes cards currently use a per-note `colorToken` frontmatter field (raw CSS color string) for their accent color, falling back to `var(--accent)` when absent. This means notes without an explicit `colorToken` all share the default blue accent regardless of category.

The category color system adds a static map from category name to accent color, so notes in the same category automatically share a consistent visual identity. Per-note `colorToken` continues to work as an override.

**Priority chain:** `colorToken` (per-note frontmatter) → category map → `var(--accent)` fallback

---

## 1. Utility File

### File

Create `src/lib/notes.ts`.

### Content

```typescript
const categoryColors: Record<string, string> = {
  'Engineering':       '#22c55e',
  'Engenharia':        '#22c55e',
  'Real-Time Systems': '#f59e0b',
};

export function getNoteAccentColor(
  colorToken: string | undefined,
  category: string | undefined
): string {
  return colorToken ?? (category ? categoryColors[category] : undefined) ?? 'var(--accent)';
}
```

### Notes

- `categoryColors` is module-private — only `getNoteAccentColor` is exported.
- Both language variants of each category are listed as separate keys with the same color value (`'Engineering'` and `'Engenharia'` → `'#22c55e'`).
- Colors use the existing hardcoded exception palette from CLAUDE.md (`#22c55e` green, `#f59e0b` amber). These are already in the known-hardcoded list alongside toast status colors.
- Unknown categories (no entry in map, no `colorToken`) fall back to `var(--accent)`.
- New categories are added to `categoryColors` as content grows; no schema changes required.

---

## 2. Usage Sites

### 2.1 `src/components/notes/NotesGrid.astro`

**Current** (border-top inline style on each card):
```astro
style={`border-top: 3px solid ${note.data.colorToken ?? 'var(--accent)'}`}
```

**Replace with:**
```astro
style={`border-top: 3px solid ${getNoteAccentColor(note.data.colorToken, note.data.category)}`}
```

Add import at top of frontmatter:
```typescript
import { getNoteAccentColor } from '../../lib/notes';
```

### 2.2 `src/pages/notes/[slug].astro`

**Current** (inline style on `<header>`):
```astro
<header class="note-header" style={note.data.colorToken ? `--note-accent: ${note.data.colorToken}` : ''}>
```

**Replace with:**
```astro
<header class="note-header" style={`--note-accent: ${getNoteAccentColor(note.data.colorToken, note.data.category)}`}>
```

Add import:
```typescript
import { getNoteAccentColor } from '../../lib/notes';
```

### 2.3 `src/pages/pt-br/notes/[slug].astro`

Same change as 2.2. Import path: `'../../../lib/notes'`.

---

## 3. Scope

| Surface | Uses category color | Notes |
|---------|--------------------|-|
| Notes index grid card (`NotesGrid.astro`) | ✅ | `border-top` accent |
| Individual note page (`[slug].astro`) | ✅ | `--note-accent` → header border + category label |
| Home page note previews (`HomeSections.astro`) | ❌ | Unchanged — no accent color there |

---

## 4. Schema and Content

No schema changes. `colorToken` and `category` fields in `notesSchema` are unchanged.

No content file changes — existing notes do not need `colorToken` added; the category map handles color assignment automatically.

---

## 5. E2E Test

Add to `tests/e2e/notes.spec.ts` inside the existing `test.describe` block:

```typescript
test('notes index cards use category accent color', async ({ page }) => {
  await page.goto('/notes');
  const cards = page.locator('.note-card');
  const count = await cards.count();
  if (count === 0) return;
  // At least one card should have an explicit style attribute (category or colorToken color)
  const firstCard = cards.first();
  const style = await firstCard.getAttribute('style');
  expect(style).toBeTruthy();
});
```

---

## 6. File Changes Summary

| Action | File |
|--------|------|
| Create | `src/lib/notes.ts` |
| Modify | `src/components/notes/NotesGrid.astro` |
| Modify | `src/pages/notes/[slug].astro` |
| Modify | `src/pages/pt-br/notes/[slug].astro` |
| Modify | `tests/e2e/notes.spec.ts` |

---

## What Is NOT in Scope

- Home page note preview cards
- Schema changes or new frontmatter fields
- Any UI for managing categories or colors
- Validation that category strings in frontmatter match known map keys
