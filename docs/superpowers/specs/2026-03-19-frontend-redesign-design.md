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

### Colors

Dark theme uses blue-tinted near-blacks to give depth without sterility. Light theme uses a very slightly blue-tinted paper white.

```css
/* Dark theme */
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

/* Light theme */
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

```css
--font-sans: 'Geist', 'Inter', system-ui, sans-serif;
--font-mono: 'Geist Mono', 'JetBrains Mono', monospace;

--text-xs:   0.75rem;    /* 12px — timestamps, footnotes */
--text-sm:   0.875rem;   /* 14px — metadata, nav, tags */
--text-base: 1rem;       /* 16px — body */
--text-lg:   1.125rem;   /* 18px — lead text, card summaries */
--text-xl:   1.25rem;    /* 20px — section subtitles */
--text-2xl:  1.5rem;     /* 24px — section headings */
--text-3xl:  1.875rem;   /* 30px — page titles */
--text-4xl:  2.5rem;     /* 40px — hero heading */

--leading-tight:  1.2;   /* headings */
--leading-normal: 1.5;   /* UI elements */
--leading-relaxed: 1.7;  /* body prose */

--weight-normal:  400;
--weight-medium:  500;
--weight-semibold: 600;
--weight-bold:    700;
```

### Spacing

8-point scale with semantic aliases:

```css
--space-1:  0.25rem;   /* 4px */
--space-2:  0.5rem;    /* 8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */

--section-gap:   var(--space-20); /* between homepage sections */
--content-gap:   var(--space-8);  /* between content items */
--card-padding:  var(--space-6);  /* inside cards */
--container-max: 52rem;           /* readable prose width */
--wide-max:      72rem;           /* wider layout sections */
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
- Scrolled state (`.scrolled` via JS): `--surface-high` background, `backdrop-filter: blur(12px)`, `border-bottom: 1px solid var(--border)`
- Left: logo — name in Geist Sans weight 600, `--text` color, `--accent` on hover
- Center: nav links — `--text-sm` weight 500, `--text-muted` default, `--text` on hover, `--accent` for active route
- Right: search icon + language switcher + theme toggle — 20px icons, `--text-muted` → `--text` on hover
- Mobile: nav collapses to a hamburger; links stack in a slide-down drawer
- Transition: `--duration-base` on background and border

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
- Portuguese route equivalents

### Hero

- Left-aligned layout, `--section-gap` top padding
- Stack (top to bottom):
  1. Small monospace label: `// embedded systems engineer` — Geist Mono, `--text-sm`, `--text-muted`
  2. Name: `--text-4xl`, weight 700, `--text`
  3. Positioning statement: `--text-lg`, weight 400, `--text-muted`, 1–2 lines
  4. Two CTA buttons: primary (filled `--accent`) + secondary (outlined `--border`)
- No background images, gradients, or decorative elements — typography leads

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
- 3px top border in note's `colorToken`
- Tags as small pills below the title
- Filter bar: horizontal pill buttons above grid — active: `--accent` fill; inactive: `--surface` + `--border`
- Hover: `--shadow-md` + `translateY(-2px)`, transition `--duration-base`

### Notes Detail

Same prose styling as blog post detail.

### Portfolio Page

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

1. Rewrite `src/styles/tokens.css` with the full token set defined above
2. Update `src/styles/global.css`: reset, base typography, layout utilities, button styles, focus states, smooth transitions
3. Add Geist Sans + Geist Mono font loading (via `<link>` in `SeoHead.astro` or CSS `@import`)
4. Fix CSS variable naming inconsistency (`--max-width` → `--container-max` used consistently)
5. Verify both themes render correctly across all existing pages

### Layer 2: Shell

1. Update `BaseLayout.astro`: apply new font, layout structure
2. Redesign `Header.astro`: scroll behavior, nav styles, right-side controls
3. Redesign `Footer.astro`: new layout, social links
4. Update `ThemeToggle.astro`: icon swap, new hover styles
5. Update `LanguageSwitcher.astro`: monospace labels, new active/inactive styles
6. Run E2E theme tests to confirm no regressions

### Layer 3: Pages

1. Hero component
2. HomeSections component
3. Blog index + blog post detail
4. Notes index (grid + filters) + note detail
5. Portfolio page components (ProjectCard, ExperienceItem, PublicationItem)
6. Now page
7. Search dialog
8. Portuguese route equivalents (inherit styles — verify locale-specific copy renders correctly)

---

## CLAUDE.md

A project-specific `CLAUDE.md` will be created at the repository root to capture:

- Design system token reference
- Layer execution protocol
- Typography and font loading approach
- Component styling conventions (CSS variables only, no inline styles, no Tailwind)
- Accessibility requirements for interactive components

---

## Success Criteria

The redesign is successful if:

- Both light and dark themes feel polished and first-class
- Typography is set in Geist Sans / Geist Mono consistently across all surfaces
- The token system is the single source of truth for all colors, spacing, and motion
- The header scrolls and responds correctly to scroll position
- The notes grid filters work with the new card styles
- The search dialog matches the new design and remains accessible
- All existing E2E tests still pass
- The site reads as modern, clean, and technically credible on desktop and mobile
