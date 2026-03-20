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

No architectural changes to the Astro structure, content collections, routing, or CI/CD pipelines. This is a pure visual and UX improvement. No new runtime dependencies (no React, no framer-motion, no Tailwind). All interactive effects are implemented with vanilla JS and CSS.

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
- **Active nav indicator (tubelight concept):** a `<span class="nav-indicator">` is a child of `<nav>`, which has `position: relative`. The indicator is `position: absolute`, `z-index: -1`, with `--surface-high` background, `--radius-full`, and a fixed height matching the nav link height (`~32px`). It is initially hidden and snaps to the active link's position on `DOMContentLoaded`. Position calculation: `indicator.style.left = activeLink.offsetLeft + 'px'` and `indicator.style.width = activeLink.offsetWidth + 'px'` — `offsetLeft` is relative to `offsetParent`, and `<nav>` is explicitly `position: relative` so it becomes the `offsetParent`, making the measurement correct. A hover interaction slides the indicator to preview hovered links (`mouseover` → translate to target, `mouseleave` → return to active link). Transition on the indicator: `left --duration-base --ease-out, width --duration-base --ease-out`. The indicator has `::before { content: ''; position: absolute; top: -4px; left: 50%; transform: translateX(-50%); width: 40%; height: 2px; border-radius: 1px; background: var(--accent); box-shadow: 0 0 8px 2px var(--accent); opacity: 0.8; }` — the glow lamp. On a standard Astro multi-page build there is no cross-route slide animation; each page load positions the indicator on its active link immediately (no transition on load). The hover preview animation is the only motion.
- Right (left to right): search icon button → language switcher → theme toggle — 20px icons/controls, `--text-muted` → `--text` on hover
- **Search icon:** calls `window.openSearch()` on click; `aria-label="Open search"`
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

Pill/track design (iOS-style) — replaces the previous icon-only button.

**DOM structure:**
```html
<button class="theme-toggle" role="switch" aria-checked="true" aria-label="Toggle theme">
  <span class="toggle-thumb"><!-- active icon SVG --></span>
  <span class="toggle-inactive" aria-hidden="true"><!-- inactive icon SVG --></span>
</button>
```

- Outer track (the `<button>` itself): `width: 3.5rem`, `height: 1.75rem`, `border-radius: var(--radius-full)`, `padding: 2px`, `display: flex`, `align-items: center`, `border: 1px solid var(--border)`, `position: relative`
- Track background: `--surface-high` in both themes (the pill background)
- `.toggle-thumb`: `width: 1.35rem`, `height: 1.35rem`, `border-radius: 50%`, `display: flex`, `align-items: center`, `justify-content: center`, `transition: transform --duration-base --ease-in-out`, `position: absolute`
  - Dark state: `transform: translateX(2px)`, thumb background `#252538` (a distinct mid-dark, clearly lighter than `--surface-high` `#16161F`), Moon SVG 14px, `color: var(--text)`
  - Light state: `transform: translateX(calc(3.5rem - 1.35rem - 4px))`, thumb background `#FFFFFF`, Sun SVG 14px, `color: var(--text)`
- `.toggle-inactive`: absolutely positioned on the opposite side of the thumb; `opacity: 0.35`; contains the opposite icon (Sun in dark, Moon in light). Dark: right-aligned at `right: 4px`. Light: left-aligned at `left: 4px`. Width/height same as thumb.
- Vanilla JS: on click calls existing `toggleTheme()`, then flips `aria-checked` and swaps the icon SVGs in both `.toggle-thumb` and `.toggle-inactive`
- Focus ring on `:focus-visible`

### LanguageSwitcher

- Two labels: `EN` / `PT` in Geist Mono `--text-sm`
- Active locale: `--text` weight 600
- Inactive locale: `--text-muted`, → `--text` on hover
- Separated by `/` in `--text-muted`

---

## Layer 3: Pages

### Files

- `src/components/home/Hero.astro` (+ background paths SVG + typewriter script)
- `src/components/home/HomeSections.astro`
- `src/components/home/ContactSection.astro`
- `src/components/blog/BlogList.astro`
- `src/components/notes/NotesGrid.astro`
- `src/components/notes/NotesFilters.astro`
- `src/components/portfolio/ProjectCard.astro` (bento grid card)
- `src/components/portfolio/TimelineItem.astro` (unified experience + education)
- `src/components/portfolio/PublicationItem.astro`
- `src/components/site/Toast.astro` (new)
- `src/components/search/SearchDialog.astro`
- `src/content/portfolio/experience.ts` (add `type: 'work' | 'education'` field + education entries)
- `src/pages/index.astro`
- `src/pages/portfolio/index.astro`
- `src/pages/blog/index.astro`
- `src/pages/blog/[slug].astro`
- `src/pages/notes/index.astro`
- `src/pages/notes/[slug].astro`
- `src/pages/now/index.astro`
- Portuguese route equivalents under `src/pages/pt-br/`

### Hero

The existing `Hero.astro` renders navigation links inside the hero. This is removed. The hero becomes a pure identity/CTA block with two visual enrichments: animated background paths and a typewriter phrase below the name.

**Layout:**
- Left-aligned, `--section-gap` top padding, `position: relative` to contain the background layer
- Stack (top to bottom):
  1. Monospace label: `// embedded systems engineer` — Geist Mono, `--text-sm`, `--text-muted`
  2. Name: `--text-4xl`, weight 700, `--text`
  3. Typewriter line (see below)
  4. Two CTA buttons: primary (filled `--accent`, links to `/portfolio`) + secondary (outlined `--border`, links to `/blog`)
- `src/pages/index.astro` and `src/pages/pt-br/index.astro` updated to remove nav-link props previously passed to Hero

**Background paths effect:**
- Inline `<svg viewBox="0 0 1200 500" fill="none">` inside the hero, `position: absolute`, `inset: 0`, `width: 100%`, `height: 100%`, `pointer-events: none`, `z-index: 0`. Hero content sits at `z-index: 1`.
- 36 cubic-bezier `<path>` elements. Path geometry: each path `i` (0–35) uses the formula `M${-380 - i*5} ${-189 + i*6} C${-380 - i*5} ${-189 + i*6} ${-312 - i*5} ${216 - i*6} ${152 - i*5} ${343 - i*6} C${616 - i*5} ${470 - i*6} ${684 - i*5} ${875 - i*6} ${684 - i*5} ${875 - i*6}` — this produces 36 sweeping parallel curves that cross the viewport diagonally.
- Animation: each path has `stroke-dasharray: 2000; stroke-dashoffset: 2000` and animates via `@keyframes flow { to { stroke-dashoffset: 0; } }` — the draw-on effect. After completing it loops back via `animation-direction: alternate`. Duration and delay assigned linearly: `duration = 20s + i * 0.42s` (index 0 → 20s, index 35 → 34.7s); `delay = -(i * 0.22s)` (negative delays ensure all paths are mid-animation on load rather than starting cold).
- Stroke color: `currentColor`, hero wrapper `color: var(--border)` — adapts to both themes automatically.
- Stroke opacity: linear across index — `opacity = 0.04 + i * 0.004` (index 0 → 0.04, index 35 → 0.18).
- Stroke width: linear across index — `width = 0.5 + i * 0.029` (index 0 → 0.5px, index 35 → 1.5px).
- Easing: `linear`, `infinite`, `alternate`.
- `@media (prefers-reduced-motion: reduce)`: `animation: none` on all paths; they render at their computed base opacity statically.

**Typewriter effect:**
- Vanilla JS in the component's `<script>` tag — no library.
- DOM structure: `<p class="typewriter-line"><span class="typewriter-prefix">born to </span><span class="typewriter-text"></span><span class="typewriter-cursor" aria-hidden="true">|</span></p>`
- The static prefix (`"born to "` in English, `"nascido para "` in PT-BR) is hardcoded in markup as a prop passed from the page: `<Hero typewriterPrefix="born to " typewriterPhrases={[...]} />`. The component renders the prefix in the markup and only the dynamic suffix is typed.
- `typewriterPhrases` in English: `["build reliable systems", "write clean code", "solve hard problems", "ship things that last"]`. PT-BR phrases prop is passed from the PT-BR page variant.
- Timing: type forward ~60ms/char → pause 2s at full phrase → delete ~35ms/char → pause 300ms → next phrase → loop.
- Blinking cursor: CSS `@keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }`, `animation: blink 0.8s step-end infinite` on `.typewriter-cursor`.
- Style: `--text-lg`, weight 400. `.typewriter-prefix` in `--text-muted`. `.typewriter-text` in `--accent`.
- `@media (prefers-reduced-motion: reduce)`: `typewriterPhrases[0]` set statically on `.typewriter-text` via JS before returning; cursor hidden via CSS.

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
- Bento-style cards (see Portfolio Page — Projects section for full spec)
- Homepage shows 2 items, one spanning 2 columns when viewport allows

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

- Layout uses `--wide-max` (72rem) for wider sections (projects grid, timeline) and `--container-max` for prose (about, publications)
- **About:** prose block, `--container-max`
- **CV download:** prominent button near the top of the page

**Timeline (Experience + Education):**

A single vertical timeline component covers both experience and education. They are visually unified as one chronological story rather than two separate lists.

- Vertical `2px solid var(--border)` line running down the left side
- Each entry has a circular dot marker (`10px`, `--accent` fill, `--surface` ring) on the line
- Entry types are visually distinguished by a small badge: `WORK` (in `--accent-dim` background) or `EDUCATION` (in a neutral `--surface-high` background) in Geist Mono `--text-xs`
- Entry layout:
  - Top row: badge + company/institution + date range in Geist Mono `--text-sm --text-muted`
  - Title row: role/degree in `--text-base` weight 600
  - Location in `--text-sm --text-muted`
  - Description in `--text-sm`, `--leading-relaxed`
  - Tags as small pills (`--surface-high`, `--radius-sm`, `--text-xs --text-muted`)
- `type: 'work' | 'education'` is a **required** field added to the entry type in `src/content/portfolio/experience.ts`. All existing work entries must be backfilled with `type: 'work'` at the same time new education entries are added — do not leave existing entries without the field.
- Entries are sorted **descending by start date** (most recent first) — both work and education interleaved chronologically.
- Mobile: dots and line remain; layout collapses to single column

**Projects (Bento Grid):**

Inspired by the bento grid pattern — variable-width cards on a 3-column CSS grid.

- Grid: `display: grid`, `grid-template-columns: repeat(3, 1fr)`, `gap: var(--space-3)`, responsive to 2-col tablet and 1-col mobile
- Featured projects can span 2 columns via a `featured?: boolean` field added to the project type in `src/content/portfolio/projects.ts` (renders as `grid-column: span 2`). This field is optional; existing projects without it default to single column.
- Card anatomy:
  - Background: `--surface`, border: `1px solid var(--border)`, `--radius-md`, `--card-padding`
  - Top row: project icon/emoji in a small `--surface-high` square + status badge (`Active` / `Archived` / `Featured`) in `--text-xs` Geist Mono
  - Title + `meta` (year) in `--text-base` weight 600 and `--text-sm --text-muted`
  - Description in `--text-sm --leading-relaxed`
  - Tags row: `--radius-sm` pills
  - Bottom row: GitHub / live links as icon+text anchors; `→` CTA label fades in on hover
- **Hover state:** subtle dot-pattern overlay appears — CSS only via `::after` pseudo-element on the card: `background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 4px 4px; opacity: 0.04; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;`. The card sets `color: var(--text)` so the dots use the text foreground color (neutral in both themes). Card lifts with `--shadow-md` and `translateY(-2px)`. Border transitions to `--accent`. All at `--duration-base`.
- Featured card (2-col span) gets the hover state applied persistently via an `.always-active` class. CSS rule: `.project-card.always-active { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--accent); } .project-card.always-active::after { opacity: 0.04; }` — the same properties triggered by `:hover` on normal cards are unconditionally applied.

**Publications:** simple list — title + publisher + date + type badge


### Now Page

- Single column, `--container-max`
- "Last updated" in Geist Mono `--text-sm --text-muted` below the title
- Status badge if present: pill with `--accent-dim` background
- Body prose identical to blog post

### Toast Notifications

A lightweight vanilla JS + CSS toast system. No external library.

- New file: `src/components/site/Toast.astro`
- Mounted once in `BaseLayout.astro` as a fixed-position container `#toast-container` (`position: fixed`, `bottom: var(--space-6)`, `right: var(--space-6)`, `z-index: 200`, `display: flex`, `flex-direction: column-reverse`, `gap: var(--space-2)`)
- Global API: `window.showToast({ message, variant, title?, duration? })` exposed from a `<script>` block in `Toast.astro`
- **4 variants** with token-mapped styles:

| Variant | Background | Border left | Icon color | Title color |
|---------|-----------|-------------|------------|-------------|
| `default` | `--surface` | `--border` | `--text-muted` | `--text` |
| `success` | `--surface` | `#22c55e` | `#22c55e` | `#22c55e` |
| `error` | `--surface` | `#ef4444` | `#ef4444` | `#ef4444` |
| `warning` | `--surface` | `#f59e0b` | `#f59e0b` | `#f59e0b` |

- Toast card: `max-width: 320px`, `--radius-md`, `--shadow-md`, `--card-padding`, `border: 1px solid var(--border)`, thick `4px` left border in variant color
- Icon: inline SVG (Info / CheckCircle / AlertCircle / AlertTriangle), 16px
- Layout: icon + text block (title optional, `--text-xs` weight 600 + message `--text-xs --text-muted`) + dismiss `×` button
- Entry animation: `translateY(8px) opacity(0)` → `translateY(0) opacity(1)` at `--duration-base`
- Exit animation: `opacity(1)` → `opacity(0) translateY(4px)`, then removed from DOM
- Auto-dismiss after `duration` ms (default 4000). Dismiss button also available.
- Used for: CV download confirmation, search no-results notice, lang-switch notice when translation is missing

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

1. Update `BaseLayout.astro`: apply new font, layout structure; mount `<Toast />` once
2. Redesign `Header.astro`: scroll behavior, nav styles + tubelight active indicator (JS position calc), right-side controls, mobile drawer
3. Redesign `Footer.astro`: new layout, social links
4. Update `ThemeToggle.astro`: pill/track design with Moon/Sun SVGs, vanilla JS toggle
5. Update `LanguageSwitcher.astro`: Geist Mono labels, new active/inactive styles
6. Create `Toast.astro`: 4-variant toast system, `window.showToast()` global
7. Run E2E theme tests to confirm no regressions

### Layer 3: Pages

1. Hero component: remove nav links, add CTA buttons, background paths SVG, typewriter script
2. HomeSections component: bento preview cards for projects
3. Blog index + blog post detail
4. Notes index (grid + filters) + note detail
5. Portfolio page:
   a. `ProjectCard.astro` → bento grid card with dot-pattern hover, variable col-span
   b. `TimelineItem.astro` → unified Experience + Education timeline (rename/replace `ExperienceItem.astro`)
   c. `PublicationItem.astro`
   d. Update `src/content/portfolio/experience.ts` with `type` field + education entries
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
All visual values come from `src/styles/tokens.css`. Prefer CSS tokens over hardcoded values. Intentional exceptions: toast status-semantic colors (`#22c55e`, `#ef4444`, `#f59e0b`) and ThemeToggle thumb backgrounds (`#252538`, `#FFFFFF`) are hardcoded because no semantic token maps to them.

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
- **ThemeToggle:** pill/track with Moon+Sun SVGs, `role="switch"`, `aria-checked`, vanilla JS
- **LanguageSwitcher:** `EN` / `PT` in Geist Mono, active locale weight 600
- **SearchDialog:** opened via `window.openSearch()` or pressing `/`; focus trap; Esc closes
- **Header mobile drawer:** `aria-expanded`, `aria-controls`, closes on link click and Escape
- **Nav active indicator:** tubelight pill + glow, position calculated in vanilla JS on load
- **Toast:** `window.showToast({ message, variant, title?, duration? })`; 4 variants; auto-dismiss
- **Hero typewriter:** vanilla JS, cycles phrases, `prefers-reduced-motion` respected
- **Hero background paths:** CSS-animated SVG, `prefers-reduced-motion` respected
- **Bento project cards:** pure CSS hover (dot pattern, lift, border accent), no JS needed

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
- The tubelight active indicator is correctly positioned on the active link on page load; hover preview slides it to hovered links
- The mobile hamburger drawer opens, closes, and is keyboard-accessible
- The ThemeToggle pill slides between Moon and Sun states at `--duration-base`
- The search icon in the header opens the search dialog via `window.openSearch()`
- Hero background paths animate subtly and respect `prefers-reduced-motion`
- Hero typewriter cycles through phrases and respects `prefers-reduced-motion`
- Notes cards render with their `colorToken` top border, falling back to `--accent`
- The notes grid filters work with the new card styles
- Portfolio page shows a unified Experience + Education timeline with `WORK` / `EDUCATION` badges
- Portfolio projects render as a bento grid with dot-pattern hover and variable col-spans
- `window.showToast()` fires correctly for all 4 variants (default, success, error, warning)
- The portfolio page uses `--wide-max` for wider sections and `--container-max` for prose
- The search dialog matches the new design and remains accessible
- All existing E2E tests still pass
- No new runtime dependencies added (no React, framer-motion, Tailwind, or shadcn)
- The site reads as modern, clean, and technically credible on desktop and mobile
