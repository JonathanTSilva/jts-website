# CLAUDE.md — jts-website

## Project Source of Truth
- **Design Spec:** `docs/superpowers/specs/2026-03-19-personal-website-design.md`
- **Frontend Redesign Spec:** `docs/superpowers/specs/2026-03-19-frontend-redesign-design.md`
- **Implementation Plan:** `docs/superpowers/plans/2026-03-19-personal-website-implementation.md`
- **Frontend Redesign Plan:** `docs/superpowers/plans/2026-03-20-frontend-redesign.md`

## Engineering Core Principles
- **Static-First:** Astro, deterministic builds, no runtime services
- **Content as Contract:** Strict Zod validation, publish-blocking on invalid content
- **Bilingual by Design:** English default (`/`), Portuguese under `/pt-br/`
- **Component Discipline:** Small, focused Astro components, CSS variables only
- **Accessibility First:** Semantic markup, keyboard nav, focus states, correct contrast

## Design System

### Token Conventions
All visual values come from `src/styles/tokens.css`. Prefer CSS tokens over hardcoded values.
Intentional exceptions: toast status-semantic colors (`#22c55e`, `#ef4444`, `#f59e0b`) and
ThemeToggle thumb backgrounds (`#252538`, `#FFFFFF`) are hardcoded because no semantic token maps to them.

Key tokens:
- Colors: `--bg`, `--surface`, `--surface-high`, `--border`, `--text`, `--text-muted`, `--accent`, `--accent-hover`, `--accent-dim`
- Typography: `--font-sans` (Geist), `--font-mono` (Geist Mono), `--text-xs` through `--text-4xl`
- Spacing: `--space-1` through `--space-24`, `--section-gap`, `--content-gap`, `--card-padding`
- Layout: `--container-max` (68rem prose), `--wide-max` (88rem portfolio)
- Radii: `--radius-sm` (4px) / `--radius-md` (8px) / `--radius-lg` (12px) / `--radius-full` (9999px)
- Motion: `--duration-fast` (150ms) / `--duration-base` (250ms) / `--duration-slow` (350ms)
- Easing: `--ease-out` / `--ease-in-out`
- Shadows: `--shadow-sm` / `--shadow-md` / `--shadow-lg`

### Styling Conventions
- CSS variables from tokens.css exclusively — no Tailwind, no hardcoded values (except noted above)
- Component-scoped `<style>` blocks in Astro files
- Both `[data-theme='light']` and `[data-theme='dark']` must look polished
- Monospace font (`--font-mono`) for: dates, metadata labels, tag slugs, code, technical accents
- Sans font (`--font-sans`) for: all body text, headings, UI labels

### colorToken
Notes support an optional `colorToken` frontmatter field — a raw CSS color string.
Use directly as a CSS value; fall back to `var(--accent)` when absent.

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
