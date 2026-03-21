# Notes Category Color System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a category → accent color map so notes in the same category share a consistent color on the index grid and individual note pages, with per-note `colorToken` taking priority.

**Architecture:** A single utility function `getNoteAccentColor(colorToken, category)` in `src/lib/notes.ts` encapsulates the priority chain (`colorToken` → category map → `var(--accent)`). Three existing files import and call it, replacing their inline fallback expressions. No schema changes, no content changes.

**Tech Stack:** Astro 5, TypeScript, Playwright E2E

**Spec:** `docs/superpowers/specs/2026-03-21-notes-category-colors-design.md`

---

## Planned File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/lib/notes.ts` | `categoryColors` map + `getNoteAccentColor` utility |
| Modify | `src/components/notes/NotesGrid.astro` | Use utility for card `border-top` color |
| Modify | `src/pages/notes/[slug].astro` | Use utility for `--note-accent` CSS variable |
| Modify | `src/pages/pt-br/notes/[slug].astro` | Same as above, PT-BR locale |
| Modify | `tests/e2e/notes.spec.ts` | 1 new test for category color on grid cards |

---

## Task 1: Utility + NotesGrid

**Files:**
- Create: `src/lib/notes.ts`
- Modify: `src/components/notes/NotesGrid.astro` (line 25)
- Test: `tests/e2e/notes.spec.ts`

### Context

`NotesGrid.astro` line 25 currently reads:
```astro
style={`border-top: 3px solid ${note.data.colorToken ?? 'var(--accent)'}`}
```

The test data has notes with category `"Engineering"` (which should map to `#22c55e`). After the change, the `border-top` on those cards will contain `#22c55e` instead of `var(--accent)`. Use this to write a meaningful failing test.

---

- [ ] **Step 1: Write 1 failing E2E test**

Open `tests/e2e/notes.spec.ts`. Add the following **inside** the existing `test.describe('Notes', () => { ... })` block, before the closing `}`:

```typescript
  test('notes index cards reflect category color', async ({ page }) => {
    await page.goto('/notes');
    // The "Good Debugging Habits" note has category "Engineering" → should get #22c55e
    const cards = page.locator('.note-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    // At least one card should have a category-mapped color in its style
    let foundCategoryColor = false;
    for (let i = 0; i < count; i++) {
      const style = await cards.nth(i).getAttribute('style');
      if (style && (style.includes('#22c55e') || style.includes('#f59e0b'))) {
        foundCategoryColor = true;
        break;
      }
    }
    expect(foundCategoryColor).toBe(true);
  });
```

- [ ] **Step 2: Run to confirm failure**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/notes.spec.ts --grep "category color" 2>&1 | tail -10
```

Expected: FAIL — no card style contains `#22c55e` or `#f59e0b` (currently all use `var(--accent)`).

- [ ] **Step 3: Create `src/lib/notes.ts`**

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

- [ ] **Step 4: Update `src/components/notes/NotesGrid.astro`**

Add import at the top of the frontmatter block (after the existing imports):
```typescript
import { getNoteAccentColor } from '../../lib/notes';
```

Replace line 25:
```astro
style={`border-top: 3px solid ${note.data.colorToken ?? 'var(--accent)'}`}
```
with:
```astro
style={`border-top: 3px solid ${getNoteAccentColor(note.data.colorToken, note.data.category)}`}
```

- [ ] **Step 5: Run the new test**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/notes.spec.ts --grep "category color" 2>&1 | tail -10
```

Expected: PASS.

- [ ] **Step 6: Run full notes test suite**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/notes.spec.ts 2>&1 | tail -10
```

Expected: all existing tests + new test pass.

- [ ] **Step 7: Run full build**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm build 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 8: Commit**

```bash
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign add src/lib/notes.ts src/components/notes/NotesGrid.astro tests/e2e/notes.spec.ts
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign commit -m "feat: add category color utility and apply to notes grid"
```

---

## Task 2: Individual Note Pages

**Files:**
- Modify: `src/pages/notes/[slug].astro` (line 40)
- Modify: `src/pages/pt-br/notes/[slug].astro` (same line)

### Context

Both slug pages have this pattern on their `<header>` element:
```astro
<header class="note-header" style={note.data.colorToken ? `--note-accent: ${note.data.colorToken}` : ''}>
```

This must become:
```astro
<header class="note-header" style={`--note-accent: ${getNoteAccentColor(note.data.colorToken, note.data.category)}`}>
```

The CSS in both pages already defines `.note-header { --note-accent: var(--accent); }` as a fallback — but the utility now always returns a value, so the inline style always sets `--note-accent`. This is correct; the CSS fallback becomes unreachable but harmless.

The PT-BR file is at `src/pages/pt-br/notes/[slug].astro` — its import path is `'../../../lib/notes'` (one extra level).

---

- [ ] **Step 1: Update `src/pages/notes/[slug].astro`**

Add import after the existing imports in the frontmatter:
```typescript
import { getNoteAccentColor } from '../../lib/notes';
```

Replace (line 40):
```astro
<header class="note-header" style={note.data.colorToken ? `--note-accent: ${note.data.colorToken}` : ''}>
```
with:
```astro
<header class="note-header" style={`--note-accent: ${getNoteAccentColor(note.data.colorToken, note.data.category)}`}>
```

- [ ] **Step 2: Update `src/pages/pt-br/notes/[slug].astro`**

Same change. Import path: `'../../../lib/notes'`.

Add import after existing imports:
```typescript
import { getNoteAccentColor } from '../../../lib/notes';
```

Replace the same header line (find `note-header` + `style=`):
```astro
<header class="note-header" style={note.data.colorToken ? `--note-accent: ${note.data.colorToken}` : ''}>
```
with:
```astro
<header class="note-header" style={`--note-accent: ${getNoteAccentColor(note.data.colorToken, note.data.category)}`}>
```

- [ ] **Step 3: Run full notes test suite**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/notes.spec.ts 2>&1 | tail -10
```

Expected: all tests pass.

- [ ] **Step 4: Run `astro check`**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm check 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 5: Run full build**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm build 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign add src/pages/notes/[slug].astro src/pages/pt-br/notes/[slug].astro
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign commit -m "feat: apply category color to individual note page header"
```
