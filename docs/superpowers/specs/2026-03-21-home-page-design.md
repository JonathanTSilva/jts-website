# Home Page Design Spec
**Date:** 2026-03-21
**Branch base:** `feature/frontend-redesign`
**Scope:** Hero overhaul · Projects/Publications/Blog/Notes sections · Footer restructure · ContactSection removal

---

## Prerequisites

This spec builds on `feature/frontend-redesign` (and `feature/shell-fixes`, already merged). Tokens, globals, and header changes from those branches are assumed present.

---

## 1. Hero Section Overhaul

### 1a. Full-Viewport Height

The hero section fills the first viewport minus the fixed header:
```css
.hero {
  min-height: calc(100vh - var(--space-16)); /* --space-16 = 4rem = header height */
  display: flex;
  align-items: center;
}
```
No overflow. The next section starts below the fold.

### 1b. Two-Column Layout

The hero content splits into **left** (text + CTAs) and **right** (profile image + achievement boxes).

```
[left: 55%]                          [right: 45%]
  // embedded systems engineer          ┌─────────────┐
  Jonathan                              │  profile.jpg │
  Building [typewriter]                 └─────────────┘
                                        ┌──────┐ ┌──────┐
  ● mail  ● linkedin  ● github          │ 6yrs │ │  3   │
                                        │ exp  │ │ R&D  │
  Explore my work and insights          └──────┘ └──────┘
  [ View Portfolio ] [ Read Blog ]      ┌──────┐ ┌──────┐
                     [ Check Notes ]    │  30+ │ │ GPA  │
                                        │ proj │ │ best │
                                        └──────┘ └──────┘
```

**Breakpoint:** Stacks to single column below `48rem` (mobile). On mobile, image/achievements come first, then text content.

### 1c. Left Column Content

**Label + Name + Typewriter:** existing — keep as-is.

**Social contact row** (new, below typewriter):
- Inline row of icon+label links: Email · LinkedIn · GitHub
- Icons: SVG inline (envelope, linkedin, github), `width="16" height="16"`, `aria-hidden="true"`
- Same links as ContactSection (user's actual email/LinkedIn/GitHub — keep current placeholder values from `ContactSection.astro`)
- Style: `display: flex; gap: var(--space-4); align-items: center;`
- Each link: icon + text, `color: var(--text-muted)`, hover → `var(--accent)`
- Transition: `color var(--duration-fast)`

**CTA area** (below social row):
- Small tagline text above buttons: "Explore my work and insights" (EN) / "Explore meu trabalho e insights" (PT)
  - Style: `font-size: var(--text-sm); color: var(--text-muted);`
- Buttons row: **View Portfolio** (btn-primary) · **Read Blog** (btn-secondary) · **Check my notes** (btn-ghost/link style)

### 1d. Right Column — Profile Image

- `<img src="/assets/images/profile.jpg" alt="Jonathan" class="profile-image" />`
- If file doesn't exist, use a CSS placeholder block (grey rectangle): `background: var(--surface-high); border-radius: var(--radius-md);`
- Dimensions: matches height of left text content (name + typewriter + contact row)
- `aspect-ratio: 1 / 1` (square)
- Style matches bento card aesthetic: `border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: var(--shadow-md); object-fit: cover;`
- `max-height: 18rem;`

### 1e. Right Column — Achievement Boxes

Below the profile image, a 2×2 grid of stat boxes:

| Box | Value | Label (EN) | Label (PT) |
|-----|-------|-----------|-----------|
| 1 | `{currentYear - 2020}+` | Years of Experience | Anos de Experiência |
| 2 | 3 | R&D Projects Coordinated | Projetos P&D Coordenados |
| 3 | 30+ | Professional Projects | Projetos Profissionais |
| 4 | ★ Best | Highest GPA (Grad + Master) | Maior GPA (Grad + Mestrado) |

- `currentYear - 2020` computed server-side in Astro frontmatter
- Grid: `display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);`
- Each box: `background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-3) var(--space-4);`
- Number: `font-size: var(--text-2xl); font-weight: var(--weight-bold); color: var(--text);`
- Label: `font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono);`

### 1f. Background Paths

Keep existing animated SVG paths. Change the hero `.color` to use `var(--border)` (already does). Ensure `overflow: hidden` on `.hero` and the SVG has `inset: 0` so it spans full hero area including under header content.

No change to path data or animation — just verify it renders correctly with the new two-column layout.

---

## 2. Projects Section — Bento Grid

### Layout

Change from simple `grid` to a proper bento layout:
- First project: **featured** — spans `grid-column: span 2` on desktop (≥ 48rem)
- Remaining projects: standard 1-column cells
- Show **3 projects** (currently 2)
- Grid: `grid-template-columns: repeat(2, 1fr)` on desktop, `1fr` on mobile

### Hover-Only Highlight

The "featured" span on the first card is a visual-only emphasis — **not** a default active/selected state. No card appears highlighted by default. On hover, the hovered card lifts:
```css
.project-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--accent);
}
```

Remove any default highlighted/active state on the first card (if present in `ProjectCard.astro` or the section).

---

## 3. Publications Section — Card Row

### Layout

Replace the list layout with a horizontal scrollable card row:
- `display: flex; flex-wrap: nowrap; gap: var(--space-4); overflow-x: auto;`
- Each publication: a card `min-width: 16rem; max-width: 20rem; flex-shrink: 0`
- Desktop: show all (max 6, take most recent if > 6)
- Below the row: "See all publications →" link pointing to `/portfolio`
- Show **5 publications** (all current ones)

### Card Design

```
┌────────────────────────────────┐
│ [type badge]          [date]   │
│                                │
│ Title of the Publication       │
│                                │
│ Publisher name                 │
│                           [→]  │
└────────────────────────────────┘
```

- Background: `var(--surface)`
- Border: `1px solid var(--border)`, `border-radius: var(--radius-md)`
- Padding: `var(--card-padding)`
- Type badge: `font-size: var(--text-xs); background: var(--accent-dim); color: var(--accent); border-radius: var(--radius-full); padding: 2px var(--space-2);` — text: `article` / `conference` / `journal` / `talk`
- Date: `font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted);`
- Title: `font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--text);`
- Publisher: `font-size: var(--text-xs); color: var(--text-muted);`
- Link arrow (→): only shown if `pub.link` exists; `color: var(--accent);`
- Hover: `box-shadow: var(--shadow-sm); border-color: var(--accent);`

---

## 4. Blog Section — Simple List

### Changes

- Show **5 posts** (currently 3)
- **Remove separator lines** between posts (remove `border-bottom` from `.blog-preview-row`)
- Keep: title left, date right, hover → accent color
- Vertical rhythm: `gap: var(--space-2)` between rows (currently `border-bottom` provides visual separation — replace with a small `padding-block: var(--space-1)` per row, no border)

---

## 5. Notes Section — Cards with Category

### Changes

- Show **3 notes** (already 3 — no change)
- Add **category** display inside each card
- Card layout (bottom of card):
  ```
  [date]
  [title]
  ─────────────
  [category badge]
  ```
- Category badge: `font-size: var(--text-xs); font-family: var(--font-mono); color: var(--text-muted); margin-top: auto;`
- If `note.data.category` is undefined, omit the badge row entirely
- Keep existing card hover behavior (`box-shadow`, `border-color: var(--accent)`)

---

## 6. Remove Contact Section

- Remove `<ContactSection />` from `src/pages/index.astro` and `src/pages/pt-br/index.astro`
- Remove the import
- Do **not** delete `ContactSection.astro` — it may be referenced by tests

---

## 7. Footer Restructure

### Structure

Two rows, constrained to `var(--container-max)` width, centered (same as header inner):

**Row 1 — 3 columns:**

| Left | Center | Right |
|------|--------|-------|
| Logo placeholder + "Jonathan" | Social icons (LinkedIn, GitHub, Email, RSS) | LanguageSwitcher pill |

- Logo placeholder: a small `var(--accent)` colored `16×16` square (actual logo TBD) + "Jonathan" text
- Social icons: SVG icons, `width="18" height="18"`, each wraps an `<a>` with `aria-label`; `color: var(--text-muted)`, hover → `var(--accent)`
- RSS: links to `/rss.xml` (if it exists) — add only if the file is present, otherwise omit
- LanguageSwitcher: see §8 below

**Row 2 — 2 columns:**

| Left | Right |
|------|-------|
| `© {currentYear} Jonathan. All rights reserved.` | `Privacy Policy` · `Terms of Service` |

- Copyright: `font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono);`
- Legal links: `font-size: var(--text-xs); color: var(--text-muted);`, hover → `var(--accent)`; link to `/privacy` and `/terms`

**Mobile (< 48rem):** Stack row 1 columns vertically, center-align. Row 2 stacks vertically.

**Row separator:** `border-top: 1px solid var(--border);` between rows.

### Footer container alignment
- `max-width: var(--container-max); margin-inline: auto; padding-inline: var(--space-6);`
- Remove old `.container` class reference

---

## 8. LanguageSwitcher Redesign

### Design

Exact same pill toggle as ThemeToggle, but switches between EN and PT:

```
[ EN | PT ]   (pill, active locale is highlighted)
```

- Component: `src/components/site/LanguageSwitcher.astro`
- `role="group"` wrapping two `<button>` elements (or a single toggle if preferred — use two buttons for simplicity)
- Active locale button: `background: var(--accent); color: var(--bg); border-radius: var(--radius-full);`
- Inactive locale button: `background: transparent; color: var(--text-muted);`
- Container: pill shape — `background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-full); display: inline-flex; padding: var(--space-1);`
- Font: `var(--font-mono); font-size: var(--text-xs); font-weight: var(--weight-semibold);`
- Each button: `padding: var(--space-1) var(--space-3);`

### Behavior — Navigate to Same Page

Clicking the inactive locale navigates to the **same page** in the other locale.

**Logic:**
- Accept `currentLocale: Locale` and `currentPath: string` props
- To compute the target URL:
  - From EN to PT: prepend `/pt-br` to `currentPath` (e.g. `/portfolio` → `/pt-br/portfolio`)
  - From PT to EN: strip `/pt-br` prefix (e.g. `/pt-br/portfolio` → `/portfolio`)
- The active locale button is `aria-current="true"` and `disabled`
- The inactive button is an `<a>` styled as a button (or a `<button>` with `data-href` + JS click handler — use `<a>` for simplicity; the whole component can be static HTML)

**Props:**
```ts
interface Props {
  currentLocale: Locale;
  currentPath: string;
}
```

**Usage in Footer:**
```astro
<LanguageSwitcher currentLocale={locale} currentPath={Astro.url.pathname} />
```

---

## 9. Placeholder Legal Pages

Create two stub pages:

- `src/pages/privacy.astro` — title "Privacy Policy"
- `src/pages/terms.astro` — title "Terms of Service"

Both render a centered message:
> "This page is under construction."

Use `BaseLayout` with the correct locale and title. No PT-BR counterpart needed yet.

---

## What Is NOT in Scope

- Logo image (to be provided later — §1d uses CSS placeholder)
- Profile image (to be provided — §1d uses CSS placeholder)
- RSS feed generation (just add the link if `/public/rss.xml` exists)
- Any Portfolio, Blog, or Notes page changes (separate specs)
- PT-BR counterpart for `/privacy` and `/terms`
