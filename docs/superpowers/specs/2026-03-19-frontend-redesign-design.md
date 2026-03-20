# Frontend Redesign Design

Date: 2026-03-19
Status: Approved by user
Owner: Jonathan

## Overview

Redesign the visual layer of the personal website with a cohesive, modern, and maintainable design system. The aesthetic direction is technical minimalism (Linear, Vercel, Tailwind docs) with modern portfolio warmth (leerob.io, Rauno Frey), where the technical direction is primary.

The redesign is structured as three stable layers executed in sequence:

1. **Token layer** — design system foundations
2. **Shell layer** — site-wide layout and chrome
3. **Page layer** — page-level components and surfaces

No architectural changes to the Astro structure, content collections, routing, or CI/CD pipelines. This is a pure visual and UX improvement.

## Design Principles

- Technical without being sterile
- Clean, modern, and direct — the design disappears and the content leads
- Both light and dark themes are first-class; neither is degraded
- Coherent: typography, spacing, color, and motion follow a single system
- Built to be maintained and evolved for a decade

## Visual Direction

- **Aesthetic:** Technical minimalism (B) + Modern portfolio warmth (C), B primary
- **Theme:** Both dark and light are equal weight and first-class
- **Typography:** Humanist sans for body + monospace for code and technical accents
- **Accent:** RoyalBlue-family — `#6272EA` dark / `#4A5BD4` light
- **Spacing:** Balanced — disciplined, not cramped, not wasteful
- **Motion:** Subtle but intentional — site feels alive without distracting

---

## Layer 1: Token System

### File

`src/styles/tokens.css`

### Token Naming Migration

The existing codebase uses a `--color-*` prefix convention (e.g., `--color-bg`, `--color-text`, `--color-border`). The new token system drops the prefix in favor of shorter names (`--bg`, `--text`, `--border`). This change must be applied across all files in `src/` that reference the old names — not just `tokens.css`.

**Step 0 (before rewriting tokens): find-and-replace all old token references in `src/`:**

| Old name              | New name          |
|-----------------------|-------------------|
| `--color-bg`          | `--bg`            |
| `--color-surface`     | `--surface`       |
| `--color-text`        | `--text`          |
| `--color-text-muted`  | `--text-muted`    |
| `--color-accent`      | `--accent`        |
| `--color-accent-muted`| `--accent-dim`    |
| `--color-border`      | `--border`        |
| `--color-link`        | `--accent`        |
| `--color-link-hover`  | `--accent-hover`  |
| `--container-max-width` (BaseLayout) | `--container-max` |
| `--max-width` (tokens.css) | `--container-max` |

Affected scope: all `.astro`, `.css`, and `.ts` files under `src/`. Run a project-wide search for each old name before rewriting `tokens.css` to avoid a broken intermediate state.

### Colors

Dark theme uses blue-tinted near-blacks to give depth without sterility. Light theme uses a very slightly blue-tinted paper white.

The `@media (prefers-color-scheme: dark)` block in the current `tokens.css` is replaced by the inline script flash-prevention pattern already in place, which sets `data-theme` on `<html>` before paint. The theme token block therefore only needs `[data-theme='light']` and `[data-theme='dark']` selectors.

```css
[data-theme='dark'] {
  --bg:           #0A0A0F;
  --surface:      #111118;
  --surface-high: #16161F;
  --border:       #1E1E2E;
  --text:         #E8E8F2;
  --text-muted:   #6E7191;
  --accent:       #6272EA;
  --accent-hover: #7B8EF5;
  --accent-dim:   rgba(98, 114, 234, 0.10);

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.40);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.50);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.60);
}

[data-theme='light'] {
  --bg:           #F7F8FC;
  --surface:      #FFFFFF;
  --surface-high: #EEF0F8;
  --border:       #DDE0EE;
  --text:         #0F1117;
  --text-muted:   #60657A;
  --accent:       #4A5BD4;
  --accent-hover: #3A4BBE;
  --accent-dim:   rgba(74, 91, 212, 0.10);

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.10);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.16);
}
```

### Typography

Fonts are self-hosted via the `geist` npm package (`pnpm add geist`). The package provides `@font-face` declarations via importable CSS files. Import them at the top of `global.css`:

```css
@import 'geist/dist/fonts/geist-sans/style.css';
@import 'geist/dist/fonts/geist-mono/style.css';
```

This avoids a third-party CDN dependency and is consistent with the project's static-first, minimal-dependency principles. The font variables in `tokens.css` reference the family names declared by those imports.

```css
/* Declared in tokens.css under :root */
--font-sans: 'Geist', system-ui, sans-serif;
--font-mono: 'Geist Mono', ui-monospace, monospace;

--text-xs:   0.75rem;    /* 12px — timestamps, footnotes */
--text-sm:   0.875rem;   /* 14px — metadata, nav, tags */
--text-base: 1rem;       /* 16px — body */
--text-lg:   1.125rem;   /* 18px — lead text, card summaries */
--text-xl:   1.25rem;    /* 20px — section subtitles */
--text-2xl:  1.5rem;     /* 24px — section headings */
--text-3xl:  1.875rem;   /* 30px — page titles */
--text-4xl:  2.5rem;     /* 40px — hero heading */

--leading-tight:   1.2;  /* headings */
--leading-normal:  1.5;  /* UI elements */
--leading-relaxed: 1.7;  /* body prose */

--weight-normal:   400;
--weight-medium:   500;
--weight-semibold: 600;
--weight-bold:     700;
```

### Spacing

8-point scale with semantic aliases. Spacing tokens (`--space-*`) are unchanged from the existing system; only semantic aliases and the container token are added or renamed.

```css
/* --space-1 through --space-24 unchanged */

--section-gap:   var(--space-20); /* between homepage sections */
--content-gap:   var(--space-8);  /* between content items */
--card-padding:  var(--space-6);  /* inside cards */
--container-max: 52rem;           /* readable prose width — replaces --max-width and --container-max-width */
--wide-max:      72rem;           /* wider layout for portfolio page */
```

### Radii, Motion

```css
--radius-sm:   4px;
--radius-md:   8px;
--radius-lg:   12px;
--radius-full: 9999px;

--duration-fast:  150ms;
--duration-base:  250ms;
--duration-slow:  350ms;
--ease-out:       cubic-bezier(0, 0, 0.2, 1);
--ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1);
```

### colorToken Convention

Notes support an optional `colorToken` frontmatter field. This value is a raw CSS color string (e.g., `#7C3AED`, `oklch(65% 0.2 250)`). Components render it directly as a CSS value:

```astro
<div style={`border-top: 3px solid ${note.colorToken ?? 'var(--accent)'}`}>
```

If `colorToken` is absent, fall back to `--accent`.

---

## Layer 2: Shell

### Files

- `src/layouts/BaseLayout.astro`
- `src/components/site/Header.astro`
- `src/components/site/Footer.astro`
- `src/components/site/ThemeToggle.astro`
- `src/components/site/LanguageSwitcher.astro`
- `src/styles/global.css`

### BaseLayout

- Body uses `--bg`, `--text`, `--font-sans`
- `.site-wrapper` is a flex column with `min-height: 100vh`
- `main` gets `flex: 1` to push footer to the bottom
- No changes to `data-theme` logic or inline flash-prevention script

### Header

- Sticky, full-width
- Initial state: transparent background, no border
- Scrolled state (`.scrolled` class added via JS `IntersectionObserver` or `scroll` event): `--surface-high` background, `backdrop-filter: blur(12px)`, `border-bottom: 1px solid var(--border)`
- Left: logo — name in Geist Sans weight 600, `--text` color, `--accent` on hover
- Center: nav links — `--text-sm` weight 500, `--text-muted` default, `--text` on hover, `--accent` for active route
- Right (left to right): search icon button → language switcher → theme toggle — 20px icons/controls, `--text-muted` → `--text` on hover
- **Search icon:** calls `window.openSearch()` on click (the existing `SearchDialog` already exposes this global); `aria-label="Open search"`
- Transition: `--duration-base` on background and border

**Mobile (below 48rem):**
- Logo stays left; hamburger button (`☰` / `✕`) appears right; nav links and right controls move into the drawer
- Drawer: slides down from header bottom; `--surface-high` background; `z-index: 100`; full-width; `--space-4` padding
- Drawer animation: `max-height` transition at `--duration-slow` `--ease-out` (height-based slide, avoids layout shift)
- Hamburger button: `aria-expanded="true/false"`, `aria-controls="mobile-nav"`, icon swaps between `☰` and `✕`
- Drawer closes on nav link click and on Escape key

### Footer

- Single row on desktop, stacked on mobile
- `border-top: 1px solid var(--border)`, `--space-8` vertical padding
- Left: copyright in `--text-sm --text-muted`
- Center: social icon links (GitHub, LinkedIn, RSS) — 20px SVGs, `--text-muted` → `--text` on hover
- Right: language switcher links in `--text-sm --text-muted`

### ThemeToggle

- Icon-only button with `aria-label`
- Sun icon visible in dark mode (click → switch to light), moon icon in light mode
- `--accent-dim` background on hover/active
- Icon swap: cross-fade at `--duration-fast`

### LanguageSwitcher

- Two labels: `EN` / `PT` in Geist Mono `--text-sm`
- Active locale: `--text` weight 600
- Inactive locale: `--text-muted`, → `--text` on hover
- Separated by `/` in `--text-muted`

---

## Layer 3: Pages

### Files

- `src/components/home/Hero.astro`
- `src/components/home/HomeSections.astro`
- `src/components/home/ContactSection.astro`
- `src/components/blog/BlogList.astro`
- `src/components/notes/NotesGrid.astro`
- `src/components/notes/NotesFilters.astro`
- `src/components/portfolio/ProjectCard.astro`
- `src/components/portfolio/ExperienceItem.astro`
- `src/components/portfolio/PublicationItem.astro`
- `src/components/search/SearchDialog.astro`
- `src/pages/index.astro`
- `src/pages/portfolio/index.astro`
- `src/pages/blog/index.astro`
- `src/pages/blog/[slug].astro`
- `src/pages/notes/index.astro`
- `src/pages/notes/[slug].astro`
- `src/pages/now/index.astro`
- Portuguese route equivalents under `src/pages/pt-br/`

### Hero

The existing `Hero.astro` renders navigation links inside the hero. This is removed. The hero becomes a pure identity/CTA block.

- Left-aligned layout, `--section-gap` top padding
- Stack (top to bottom):
  1. Monospace label: `// embedded systems engineer` — Geist Mono, `--text-sm`, `--text-muted`
  2. Name: `--text-4xl`, weight 700, `--text`
  3. Positioning statement: `--text-lg`, weight 400, `--text-muted`, 1–2 lines
  4. Two CTA buttons: primary (filled `--accent`, links to `/portfolio`) + secondary (outlined `--border`, links to `/blog`)
- No background images, gradients, or decorative elements — typography leads
- `src/pages/index.astro` and `src/pages/pt-br/index.astro` updated to remove nav-link props previously passed to Hero

### Homepage Sections Pattern

Each section uses a consistent structure:

```
[Monospace section label — --text-xs, Geist Mono, --text-muted, uppercase, letter-spaced]
[Section heading — --text-2xl, weight 600]
[Items]
[→ View all — --text-sm, --accent, hover underline]
```

**Blog preview (3 items):**
- Simple list, no cards
- One line per item: `[Title]  ·  [date in Geist Mono --text-sm --text-muted]`
- Title: `--text` → underline in `--accent` on hover
- Lang pill if single-locale: `--text-xs`, `--surface-high`, `--radius-sm`

**Notes preview (3 items):**
- Small cards: `--surface`, `--border`, `--radius-md`, `--card-padding`
- Card header: category colored dot + label + date in Geist Mono
- Title: `--text-base` weight 600
- Summary: `--text-sm --text-muted`, 2-line clamp
- Hover: `--shadow-md` + border → `--accent`

**Projects preview (2 items):**
- Cards same structure as notes but with tag chips and role label
- Tags: `--radius-sm` pills, `--surface-high` background, `--text-sm --text-muted`

### Blog Index

- Two-column layout on desktop: sticky year label left (Geist Mono `--text-sm --text-muted`), entries right
- Each entry: title + `·` + date + optional lang pill
- No cards — clean list, editorial feel
- Generous `--content-gap` between year groups

### Blog Post Detail

- Max `--container-max` centered
- Title: `--text-3xl`, date + read-time in Geist Mono `--text-sm --text-muted`
- Translation notice (if applicable): banner with `--accent-dim` background
- Body: `--text-base`, `--leading-relaxed`, generous paragraph spacing
- Code blocks: Geist Mono, `--surface`, `--border`, `--radius-md`
- `h2` headings: subtle `3px solid var(--accent)` left border

### Notes Index

- 3-column grid desktop, 2-column tablet, 1-column mobile
- Cards: `--surface`, `--border`, `--radius-md`, `--card-padding`
- 3px top border using note's `colorToken` value (see colorToken Convention above)
- Tags as small pills below the title
- Filter bar: horizontal pill buttons above grid — active: `--accent` fill; inactive: `--surface` + `--border`
- Hover: `--shadow-md` + `translateY(-2px)`, transition `--duration-base`

### Notes Detail

Same prose styling as blog post detail.

### Portfolio Page

- Layout uses `--wide-max` (72rem) for wider sections (projects grid, experience) and `--container-max` for prose (about, publications)
- **About:** prose block, `--container-max`
- **Experience:** vertical timeline — `1px solid var(--border)` line, `--accent` dot marker, role/company/dates in monospace
- **Projects:** full cards with description, tags, GitHub/live links, role label
- **Publications:** simple list — title + publisher + date + type badge
- **CV download:** prominent button near the top of the page

### Now Page

- Single column, `--container-max`
- "Last updated" in Geist Mono `--text-sm --text-muted` below the title
- Status badge if present: pill with `--accent-dim` background
- Body prose identical to blog post

### Search Dialog

- Full-screen overlay: `backdrop-filter: blur(8px)` + semi-transparent scrim
- Centered panel: `--surface`, `--radius-lg`, `--shadow-lg`, max-width 560px
- Input: `--text-lg`, no border — bottom rule only, placeholder in `--text-muted`
- Results: type badge (BLOG / NOTE in Geist Mono `--text-xs`) + title + summary excerpt
- Active result: `--accent-dim` background
- Footer: `↵ to open · ↑↓ to navigate · Esc to close` in `--text-xs --text-muted`

---

## Implementation Approach

Execute in three sequential layers. Each layer is independently reviewable before the next begins.

### Layer 1: Token System

0. **Create `CLAUDE.md`** at the repository root (see CLAUDE.md section below) — do this first so conventions are in place before any implementation begins
1. **Token migration:** project-wide find-and-replace old `--color-*` names to new names per the migration table above; rename `--container-max-width` in `BaseLayout.astro` to `--container-max`
2. **Rewrite `src/styles/tokens.css`** with the full token set defined in this document
3. **Update `src/styles/global.css`:** add Geist font imports at top, update reset, base typography, layout utilities, button styles, focus states, smooth transitions
4. **Install `geist` npm package:** `pnpm add geist`; import font CSS at top of `global.css`
5. Verify both themes render correctly across all existing pages before proceeding to Layer 2

### Layer 2: Shell

1. Update `BaseLayout.astro`: apply new font, layout structure
2. Redesign `Header.astro`: scroll behavior, nav styles, right-side controls, mobile drawer
3. Redesign `Footer.astro`: new layout, social links
4. Update `ThemeToggle.astro`: icon swap, new hover styles
5. Update `LanguageSwitcher.astro`: monospace labels, new active/inactive styles
6. Run E2E theme tests to confirm no regressions

### Layer 3: Pages

1. Hero component (remove nav links, add CTA buttons)
2. HomeSections component
3. Blog index + blog post detail
4. Notes index (grid + filters) + note detail
5. Portfolio page components (ProjectCard, ExperienceItem, PublicationItem)
6. Now page
7. Search dialog
8. Portuguese route equivalents (inherit styles — verify locale-specific copy renders correctly)

---

## CLAUDE.md

Create `CLAUDE.md` at the repository root as the first deliverable of Layer 1. Content:

```markdown
# CLAUDE.md — jts-website

## Project Source of Truth
- **Design Spec:** `docs/superpowers/specs/2026-03-19-personal-website-design.md`
- **Frontend Redesign Spec:** `docs/superpowers/specs/2026-03-19-frontend-redesign-design.md`
- **Implementation Plan:** `docs/superpowers/plans/2026-03-19-personal-website-implementation.md`

## Engineering Core Principles
- **Static-First:** Astro, deterministic builds, no runtime services
- **Content as Contract:** Strict Zod validation, publish-blocking on invalid content
- **Bilingual by Design:** English default (`/`), Portuguese under `/pt-br/`
- **Component Discipline:** Small, focused Astro components, CSS variables only
- **Accessibility First:** Semantic markup, keyboard nav, focus states, correct contrast

## Design System

### Token Conventions
All visual values come from `src/styles/tokens.css`. Never use hardcoded hex values, px values, or inline styles in components.

Key tokens:
- Colors: `--bg`, `--surface`, `--surface-high`, `--border`, `--text`, `--text-muted`, `--accent`, `--accent-hover`, `--accent-dim`
- Typography: `--font-sans` (Geist), `--font-mono` (Geist Mono), `--text-xs` through `--text-4xl`
- Spacing: `--space-1` through `--space-24`, `--section-gap`, `--content-gap`, `--card-padding`
- Layout: `--container-max` (52rem prose), `--wide-max` (72rem portfolio)
- Radii: `--radius-sm/md/lg/full`
- Motion: `--duration-fast/base/slow`, `--ease-out`, `--ease-in-out`
- Shadows: `--shadow-sm/md/lg`

### Styling Conventions
- Use CSS variables from tokens.css exclusively — no Tailwind, no hardcoded values
- Component-scoped `<style>` blocks in Astro files
- Both `[data-theme='light']` and `[data-theme='dark']` must look polished
- Monospace font (`--font-mono`) for: dates, metadata labels, tag slugs, code, technical accents
- Sans font (`--font-sans`) for: all body text, headings, UI labels

### colorToken
Notes support an optional `colorToken` frontmatter field — a raw CSS color string. Use directly as a CSS value; fall back to `var(--accent)` when absent.

## Interactive Components
- **ThemeToggle:** icon-only, `aria-label`, cross-fade icon swap
- **LanguageSwitcher:** `EN` / `PT` in Geist Mono, active locale weight 600
- **SearchDialog:** opened via `window.openSearch()` or pressing `/`; focus trap; Esc closes
- **Header mobile drawer:** `aria-expanded`, `aria-controls`, closes on link click and Escape

## Plan Mode Protocol
Before any code changes, review:
1. Content model alignment with spec
2. Validation and schema compliance
3. Test coverage gaps
4. Build determinism and SEO metadata
```

---

## Success Criteria

The redesign is successful if:

- Both light and dark themes feel polished and first-class
- Geist Sans and Geist Mono load and render correctly on all pages in both themes
- The token system is the single source of truth for all colors, spacing, and motion
- Typography is set in Geist Sans / Geist Mono consistently across all surfaces
- The header scroll behavior works correctly (transparent → blurred surface on scroll)
- The mobile hamburger drawer opens, closes, and is keyboard-accessible
- The search icon in the header opens the search dialog via `window.openSearch()`
- Notes cards render with their `colorToken` top border, falling back to `--accent`
- The notes grid filters work with the new card styles
- The portfolio page uses `--wide-max` for wider sections and `--container-max` for prose
- The search dialog matches the new design and remains accessible
- All existing E2E tests still pass
- The site reads as modern, clean, and technically credible on desktop and mobile
