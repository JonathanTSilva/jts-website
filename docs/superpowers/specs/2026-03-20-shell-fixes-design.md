# Shell Fixes — Design Spec

**Date:** 2026-03-20
**Scope:** Global header/nav layer — positioning, nav behavior, search bar, mobile bugs, language switcher removal, moon icon fix.

> **Prerequisite:** This spec assumes the `feature/frontend-redesign` branch has been merged into `main`. All token references (`--container-max`, `--surface-high`, `--border`, `--surface`, `--radius-full`, `--duration-fast`, etc.) and shell components (tubelight indicator, hamburger drawer, `ThemeToggle`) refer to the redesigned codebase, not the original `main`.

---

## Goal

Fix all known bugs and UX issues in the site shell (header, nav, mobile drawer) and lay the groundwork for the footer-based language switcher that will be designed in Spec #2.

---

## 1. Header Positioning and Alignment

### Problem
The header uses `position: sticky`, which causes it to scroll with the page briefly before becoming fixed. On some pages it disappears during scroll. Navbar content is not aligned with the page layout container.

### Design
- Change header from `position: sticky` to `position: fixed` (top: 0, left: 0, full viewport width).
- Set a z-index above all page content.
- Add `padding-top` to `.site-wrapper` (not `<body>`) equal to the header height, so page content does not slide underneath the header.
- The header's inner content area must be horizontally centered and constrained to `--container-max` width — matching the rest of the page layout.
- This applies on all pages and all viewport sizes.

### Token reference
- Layout: `--container-max: 52rem` (from redesigned `tokens.css`)
- Z-index: add a `--z-header: 100` token to `tokens.css` and use it on the header element. The existing skip-link uses `z-index: 10000` so `100` sits safely below it.

---

## 2. Nav Link Behavior

### Problem
The tubelight indicator (sliding frame) moves on hover, creating a distracting effect. The active state frame should only sit on the current page's link. On PT routes, the indicator fails to land on the correct active link.

### Design

**Active state (tubelight frame):**
- The indicator is positioned on the active/current page link on page load.
- It never moves on hover — the JS that repositions the indicator on `mouseover` is removed.
- The indicator position is computed from `offsetLeft` and `offsetWidth` of the active `<a>` element after the DOM is fully painted (`DOMContentLoaded`).
- This calculation must work correctly for both `/` (EN) and `/pt-br/` (PT) routes — the active link is determined by matching `window.location.pathname` against each nav link's `href`.

**Hover state (CSS-only, no JS):**
- When a nav link is hovered, a small rounded background pill appears behind the link text.
- Style: `background: var(--surface-high); border-radius: var(--radius-full)`
- Transition: fade in/out using `--duration-fast`
- This pill is independent of the tubelight indicator and is implemented purely in CSS using `:hover`.

---

## 3. Search Bar Redesign

### Problem
The search trigger is an icon-only button that is invisible on mobile.

### Design

**Appearance:**
- Replace the icon button with an inline input field.
- The field has placeholder text `"Search..."`.
- A magnifying glass SVG icon sits on the right side inside the field, non-interactive (decorative).
- The field has a border using `var(--border)`, background `var(--surface)`, border-radius `var(--radius-full)` (pill shape), and text in `var(--font-sans)`.

**Behavior:**
- Clicking anywhere in the field (input area or icon) calls `window.openSearch()` and opens the existing search dialog.
- The field itself does not perform inline filtering — it is a styled trigger only.
- The `<input>` element has `readonly` attribute to prevent native keyboard on mobile from appearing; `cursor: pointer` to signal it is clickable.
- The click handler must guard against `window.openSearch` being undefined: `if (typeof window.openSearch === 'function') window.openSearch()`.

**Desktop:**
- The search field sits in the nav controls area on the right side of the header, before the theme toggle.
- Width: approximately `160px`, fixed.

**Mobile:**
- The search field is always visible in the header bar.
- It sits to the left of the hamburger button.
- Width: `120px` fixed so it fits without crowding the hamburger.

---

## 4. Mobile Fixes

### 4a. Hamburger Icon Bug

**Problem:**
The three-line menu icon and the X close icon are both visible simultaneously.

**Design:**
- Two separate SVG elements inside the hamburger button: `.icon-menu` (three lines) and `.icon-close` (X).
- Visibility controlled entirely by CSS based on the `aria-expanded` attribute:
  ```css
  [aria-expanded="false"] .icon-close { display: none; }
  [aria-expanded="true"]  .icon-menu  { display: none; }
  ```
- No JS required for the icon swap — the existing JS already sets `aria-expanded` on the button when toggling the drawer.

### 4b. Theme Toggle on Mobile

**Problem:**
The theme toggle in the mobile drawer does not respond to clicks.

**Design:**
- The `ThemeToggle` component currently uses `id="theme-toggle"` for its JS wiring. When two instances are rendered (desktop header + mobile drawer), only the first is reachable via `getElementById`.
- Fix: replace the `id` with a `data-theme-toggle` attribute on the toggle element in `ThemeToggle.astro`, and update its `<script>` to use `document.querySelectorAll('[data-theme-toggle]')` so all instances receive the click listener.

---

## 5. Language Switcher — Removal from Header

### Design
- Remove the `<LanguageSwitcher />` component import and usage from `Header.astro`.
- The space in the nav controls area collapses naturally.
- The `LanguageSwitcher.astro` component file is **not** deleted — it will be redesigned for the footer in Spec #2.

---

## 6. Moon Icon Fix

### Problem
The crescent moon SVG in `ThemeToggle.astro` renders as cut off or visually broken.

### Design
- Replace the existing moon SVG path with a correct, fully-visible crescent moon that renders cleanly within its `viewBox`.
- Use a standard crescent moon path: a filled circle with a smaller circle subtracted using a clip or by using two overlapping circles in SVG.
- The icon must look correct in both dark and light themes (it appears as the "activate dark mode" button in light theme, and the active state indicator in dark theme).
- Size matches the existing sun icon dimensions.

---

## Files Affected

| Action | File |
|--------|------|
| Modify | `src/components/site/Header.astro` |
| Modify | `src/components/site/ThemeToggle.astro` |
| Modify | `src/styles/global.css` (`.site-wrapper` padding-top) |
| Modify | `src/styles/tokens.css` (add `--z-header: 100`) |

---

## Testing

Each fix is independently verifiable:

1. **Header fixed:** scroll any page — header stays at top, content not hidden behind it.
2. **Nav tubelight:** hover nav links — indicator does not move. Navigate to a page — indicator lands on correct link. Switch to `/pt-br/` — indicator on Home link.
3. **Search bar:** visible on desktop and mobile. Click it — search dialog opens. No keyboard pops on mobile.
4. **Hamburger:** open mobile drawer — only X icon visible. Close it — only three-line icon visible.
5. **Theme toggle mobile:** toggle theme from mobile drawer — theme changes and persists on reload.
6. **Language switcher:** not present in header on any page.
7. **Moon icon:** switch to dark mode — moon renders fully without clipping.

---

## Out of Scope

- Logo (to be added later once asset is provided)
- Language switcher redesign (Spec #2 — Footer)
- Language switching to same-page equivalent locale (Spec #2 — Footer)
- Hero section changes (Spec #2 — Home page)
