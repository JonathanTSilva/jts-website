# General Improvements and Bug Fixes — Design Spec

**Date:** 2026-03-21
**Source spec:** `docs/superpowers/specs/2026-03-21-general-improvements-and-bugfixes.md`

---

## Scope

Nine independent feature groups covering global layout, responsiveness, hero background, PT-BR legal pages, blog categories filter, individual blog post layout, notes individual page layout, back-to-top button, and social sharing thumbnails. Items already covered by existing plans (blog-improvements, portfolio-improvements, notes-category-colors) are noted but not re-specified here.

---

## Group 1: Global Layout Fixes

### 1.1 Scrollbar Gutter Stability

**Problem:** Pages without a scrollbar shift their content layout compared to pages with one, because the scrollbar's 15–17px width appears and disappears.

**Solution:** Add `scrollbar-gutter: stable` to the `html` element in the global CSS (`src/styles/global.css` or equivalent). This unconditionally reserves scrollbar space, making layout identical regardless of whether a scrollbar is present.

**Files changed:** `src/styles/global.css` (one line addition).

### 1.2 Content Width Increase

**Problem:** `--container-max: 52rem` and `--wide-max: 72rem` leave excessive empty space on modern widescreen displays.

**Solution:** Increase both tokens modestly in `src/styles/tokens.css`:

| Token | Current | New |
|-------|---------|-----|
| `--container-max` | `52rem` | `60rem` |
| `--wide-max` | `72rem` | `80rem` |

No structural changes — the auto-centering approach is preserved. All pages inherit the wider layout automatically.

**Files changed:** `src/styles/tokens.css` (two-line change).

---

## Group 2: Responsiveness Fixes

### 2.1 Mobile Hamburger: Theme Toggle Right-Aligned

**Problem:** In the mobile drawer, the ThemeToggle is left-aligned.

**Solution:** Apply `margin-left: auto` to the ThemeToggle wrapper inside the mobile drawer. This anchors it to the right side of the drawer row with no JS change.

**Files changed:** `src/components/site/Header.astro` or the relevant drawer component.

### 2.2 Mobile Hero: Correct Column Order

**Problem:** The hero section uses a two-column CSS grid. On mobile, the right column (image + achievements) renders above the left column (name, title, description, buttons).

**Solution:** Use CSS `order` property at the mobile breakpoint:
- Left column (text content): `order: 1`
- Right column (image + achievements): `order: 2`

No JS change required.

**Files changed:** `src/components/home/Hero.astro` (CSS only).

### 2.3 Mobile Search: Icon-Only Trigger → Existing Dialog

**Problem:** On mobile, the search box shows the full text input. The spec requires an icon-only trigger positioned before the hamburger menu.

**Solution:**
- At mobile breakpoint (`≤ 768px`), hide the search text input; show only the magnifying glass icon button
- Position the icon in the navbar row, directly before the hamburger icon
- Clicking the icon calls `window.openSearch()` — the existing `SearchDialog` component handles the overlay, focus trap, and input

No new dialog or overlay component is needed. The change is purely presentational (CSS + button rearrangement in the navbar markup).

**Files changed:** `src/components/site/Header.astro`, `src/components/search/SearchBar.astro` (or equivalent search trigger component).

### 2.4 Home Projects Bento: Single Column on Mobile

**Problem:** The projects bento grid on the home page does not collapse to a single column on small viewports.

**Solution:** Add a CSS media query at the mobile breakpoint to set `grid-template-columns: 1fr` and consistent `gap` on the home projects grid container. Card design (border, shadow, dot-pattern hover, lift hover) is untouched.

**Files changed:** `src/components/home/ProjectsSection.astro` (CSS only).

---

## Group 3: Hero Background Redesign

**Goal:** Replace the broken background effect with an SVG-based circuit board animation: a central CPU node connected by structured paths along which glowing data pulses travel.

### Component

New file: `src/components/home/HeroBackground.astro` (replaces the existing broken component).

The component renders a full-bleed `<svg>` positioned absolutely behind the hero content, spanning 100% width × 100vh height, `pointer-events: none`, `z-index: 0`.

### Visual Structure

**CPU Node**
- A styled SVG `<g>` group centered horizontally, vertically placed in the gap between the navbar bottom and the hero content top
- Rendered as a rectangle with inner grid lines and small pin marks on each side — evoking a chip without being literal
- Medium size: approximately 80×80px equivalent in SVG units
- Stroke color: `var(--accent)` at 60% opacity; fill: transparent

**Circuit Paths**
- Horizontal and vertical `<path>` elements radiating from the CPU node to the edges of the SVG
- Paths use right-angle bends only (no curves) to reinforce "engineered routing"
- Path distribution: 4–6 primary paths per direction (left, right, up, down), with secondary branches at junctions
- Paths start from the full visible area edges and converge toward the CPU
- Stroke: thin (1px), low opacity (20–30%) in dark mode; slightly higher contrast in light mode via `[data-theme='light']`

**Data Pulses**
- Each primary path hosts one animated `<circle>` (4–8px radius, filled, no stroke)
- Animation: CSS `stroke-dashoffset` keyframes cause each pulse to travel the full path length, looping indefinitely
- Staggered `animation-delay` values (0s to 3s) across pulses to create the impression of parallel simultaneous activity
- Pulse colors: 3–4 variants — `var(--accent)`, `var(--accent-dim)`, and two neutral muted tones — assigned to paths to suggest different data streams
- Glow effect: `filter: drop-shadow(0 0 4px currentColor)` on each pulse

**Lifecycle**
- Paths fade in over 0.8s on page load (`opacity` keyframe from 0 to final)
- Pulses begin after the path fade-in (0.8s `animation-delay` baseline + stagger)

**Theme Adaptation**
- Path and node strokes: `[data-theme='light']` uses slightly darker tone for contrast on light background; dark mode uses default accent values
- Pulse opacity is 80% in dark mode, 60% in light mode

**Reduced Motion**
All animations are wrapped in `@media (prefers-reduced-motion: no-preference)`. In reduced-motion mode, the SVG renders as a static low-opacity circuit diagram — paths and CPU node visible, no movement.

**Files changed:** `src/components/home/HeroBackground.astro` (new/replace), `src/pages/index.astro` and `src/pages/pt-br/index.astro` if the import needs updating.

---

## Group 4: PT-BR Legal Pages

**Problem:** `/pt-br/privacy` and `/pt-br/terms` return 404.

**Solution:** Create two new Astro pages using `BaseLayout`, structurally identical to the English versions but with Portuguese content.

| New file | English source |
|----------|---------------|
| `src/pages/pt-br/privacy.astro` | `src/pages/privacy.astro` |
| `src/pages/pt-br/terms.astro` | `src/pages/terms.astro` |

Content is a faithful Portuguese translation of the English pages. No new components or layout changes required.

**Files changed:** two new files.

---

## Group 5: Blog Categories Filter + Badge Counts

### 5.1 Schema: Category Field

Add `category` (required `z.string()`) to the blog post content schema in `src/content/config.ts`. All existing blog post MDX/MD files receive a `category:` frontmatter field.

### 5.2 Category Filter Bar

The blog list page gains a category filter bar above the post list, using the same visual design as the notes filter box:

- Buttons: text labels, no border, accent underline + foreground highlight on active state
- Active indicator: bottom-glow / accent underline (consistent with notes)
- "All" button always present; shows total post count badge
- Client-side filtering via `?category=` URL param (same pattern as notes tag filter)

### 5.3 Notification Badge Counts

Each category button displays a count badge:

- Position: absolute, top-right corner of the button
- Shape: small circle (`--radius-full`)
- Background: `var(--accent)`
- Text: white, `--font-mono`, `--text-xs`
- Min-width: wide enough for 2-digit numbers
- Shows the number of posts in that category

Tags on the **notes** filter bar do **not** show count badges — only category buttons show counts (both blog and notes categories).

### 5.4 Separator Lines

Separator lines are removed between individual blog posts. Separators remain between months (content-width) and between years (full content-width). This is consistent with the existing blog improvements plan.

**Files changed:** `src/content/config.ts`, all blog post MDX files (frontmatter), `src/components/blog/BlogList.astro`, `src/pages/blog/index.astro`, `src/pages/pt-br/blog/index.astro`.

---

## Group 6: Individual Blog Post — TOC Vertical Alignment

**Context:** The existing blog improvements plan specifies a two-column layout with a TOC sidebar. This group clarifies the precise vertical structure.

### Layout (top to bottom)

| Section | Width |
|---------|-------|
| Back to blog button | Full preamble width |
| Category badge | Full preamble width |
| Title | Full preamble width |
| Subtitle (optional) | Full preamble width |
| Metadata (date, reading time) | Full preamble width |
| Tags (badge row) | Full preamble width |
| Author block (avatar, name, subtitle) | Full preamble width |
| `<hr>` separator | Full preamble width |
| **Two-column grid begins here** | — |
| Main content (left) + Sticky TOC (right) | Content width |
| CTA card | Left column width only |
| Share section | Left column width only |
| Related posts | Full content width |

The TOC column does **not** extend above the separator. It begins aligned with the first line of body content.

**TOC sidebar styling:** `var(--surface)` background, `var(--border)` border, `--radius-md`, `--shadow-sm` — matching project and note card styles.

**Files changed:** `src/pages/blog/[slug].astro`, `src/pages/pt-br/blog/[slug].astro`, `src/components/blog/TableOfContents.astro`.

---

## Group 7: Notes Individual Page Layout

**Goal:** Overhaul the individual note page to match the blog post layout pattern, but without the heavier components.

### Layout (top to bottom)

| Section | Notes |
|---------|-------|
| Back to notes button (arrow + label) | Full width |
| Category badge | Uses `colorToken` accent |
| Title | Full width |
| Subtitle (optional) | Full width |
| Date metadata | Monospace, muted |
| Tags (badge row) | Same badge style as blog post |
| `<hr>` separator | Full width |
| Body content | Single column, full content width |
| Share this note section | Full width |
| Related notes (last 3 by category) | Full width, same card design as notes list |
| Back to top button | Fixed, bottom-right corner |

### Absent vs. Blog Post
No reading progress bar, no TOC sidebar, no two-column grid, no CTA card.

### Related Notes
Last 3 notes sharing the same category, ordered newest-first. Uses the same card component as the notes list page. Displayed in a row on desktop, stacked on mobile.

**Files changed:** `src/pages/notes/[slug].astro`, `src/pages/pt-br/notes/[slug].astro`.

---

## Group 8: Back to Top Button

### Component

New shared component: `src/components/site/BackToTop.astro`.

Used by: `src/pages/blog/[slug].astro`, `src/pages/pt-br/blog/[slug].astro`, `src/pages/notes/[slug].astro`, `src/pages/pt-br/notes/[slug].astro`.

### Behavior
- Hidden by default (`opacity: 0`, `pointer-events: none`)
- Becomes visible (`.visible` class) after user scrolls past 300px
- Visibility toggled by a vanilla JS `IntersectionObserver` watching a sentinel `<div>` at the top of the page
- Clicking triggers `window.scrollTo({ top: 0, behavior: 'smooth' })`
- `prefers-reduced-motion`: uses `behavior: 'instant'` instead; no fade transition

### Visual
- Fixed position: `bottom: var(--space-6)`, `right: var(--space-6)`, `z-index: 50`
- Circular button: `var(--surface-high)` background, `var(--border)` border, `--shadow-md`
- Icon: chevron-up SVG, `var(--accent)` color
- Hover: `var(--accent)` background, white icon
- Transition: `opacity var(--duration-base) var(--ease-out)` (disabled under `prefers-reduced-motion`)
- `aria-label="Back to top"`

**Files changed:** `src/components/site/BackToTop.astro` (new), 4 page files (import + usage).

---

## Group 9: Social Sharing Thumbnails (OG Images)

### Dependencies
Add `satori` and `sharp` to `devDependencies`. No runtime dependency.

### OG Image Route

New file: `src/pages/og/[...slug].png.ts`

Uses Astro's `getStaticPaths()` to enumerate all blog posts and notes at build time. For each entry, renders an SVG template via Satori, converts to PNG with Sharp, and returns the binary response. Output: one PNG per post/note at `/og/[slug].png`.

### Template Design

A single template is used for both blog posts and notes:

| Element | Position | Style |
|---------|----------|-------|
| Dark background | Full | `#0f0f1a` (matches `--bg` dark value) |
| Circuit decoration | Background | Simplified 4-path SVG, 8% opacity |
| Site name | Top-left | `--font-sans`, small, `#888` |
| Title | Center | `--font-sans`, 48px bold, white, max 2 lines |
| Category badge | Below title | Accent pill, white text |
| Author + domain | Bottom-right | `--font-mono`, small, `#888` |

Dimensions: 1200×630px (standard OG).

### Meta Tag

The `<meta property="og:image">` tag in `BaseLayout.astro` (or the individual post layouts) is updated to reference `/og/[slug].png` when a post/note slug is available.

### Share Buttons

A new `ShareButtons.astro` component used by both blog posts and notes:

- Five buttons: LinkedIn, Twitter/X, Facebook, WhatsApp, Copy Link
- Platform share URLs constructed at Astro render time (server-side string interpolation) — no JS needed for URL construction
- Pre-filled message: `"Check out this post: [title] [canonical-url]"` (or "note" for notes)
- Copy Link button: client-side clipboard write via `navigator.clipboard.writeText()`, then calls `window.showToast({ message: 'Link copied!', variant: 'success', duration: 2000 })`
- Icons: simple SVG icons inline in the component
- Layout: horizontal row of icon buttons, centered below the post content

**Files changed:** `src/pages/og/[...slug].png.ts` (new), `src/components/site/ShareButtons.astro` (new), `src/layouts/BaseLayout.astro` or post layouts (og:image meta), 4 post/note page files (import ShareButtons).

---

## Relationship to Existing Plans

The following items in the source spec are already covered by existing implementation plans and are **not** re-specified here:

| Item | Covered by |
|------|-----------|
| Blog separator lines (between months/years) | `2026-03-21-blog-improvements.md` |
| Blog individual post: back button, reading progress, author block, TOC component, CTA card | `2026-03-21-blog-improvements.md` |
| Blog related posts | `2026-03-21-blog-improvements.md` |
| Portfolio skills cloud (auto-build + visual weight) | `2026-03-21-portfolio-improvements.md` |
| Portfolio skills filter buttons | `2026-03-21-portfolio-improvements.md` |
| Notes category colors | `2026-03-21-notes-category-colors.md` |

When implementing, cross-reference those plans to avoid duplicate work and ensure consistency.

---

## Files Summary

| Action | File |
|--------|------|
| Modify | `src/styles/global.css` |
| Modify | `src/styles/tokens.css` |
| Modify | `src/components/site/Header.astro` |
| Modify | `src/components/home/Hero.astro` |
| Modify | `src/components/home/ProjectsSection.astro` |
| Replace | `src/components/home/HeroBackground.astro` |
| Create | `src/pages/pt-br/privacy.astro` |
| Create | `src/pages/pt-br/terms.astro` |
| Modify | `src/content/config.ts` |
| Modify | All blog post MDX/MD files (frontmatter) |
| Modify | `src/components/blog/BlogList.astro` |
| Modify | `src/pages/blog/index.astro` |
| Modify | `src/pages/pt-br/blog/index.astro` |
| Modify | `src/pages/blog/[slug].astro` |
| Modify | `src/pages/pt-br/blog/[slug].astro` |
| Modify | `src/components/blog/TableOfContents.astro` |
| Modify | `src/pages/notes/[slug].astro` |
| Modify | `src/pages/pt-br/notes/[slug].astro` |
| Create | `src/components/site/BackToTop.astro` |
| Create | `src/pages/og/[...slug].png.ts` |
| Create | `src/components/site/ShareButtons.astro` |
| Modify | `src/layouts/BaseLayout.astro` |
