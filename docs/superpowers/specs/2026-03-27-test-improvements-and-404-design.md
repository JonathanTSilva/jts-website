# Design Spec: Quality Fortress Test Suite & "Signal Lost" 404 Page

Date: 2026-03-27
Status: Approved
Owner: Jonathan

## 1. Overview
Implement a comprehensive, production-parity test suite to ensure 100% testability and zero regressions for the personal website. This includes a branded "Signal Lost" 404 page to gracefully handle error states.

## 2. Goals
- **100% Testability:** Every unique page and interaction (Search, Theme, Locale) must have an automated test.
- **Regression Detection:** Catch CSS/layout shifts, accessibility violations, and broken build-time assets.
- **Production-Parity:** Tests must run against the final production build (`pnpm build && pnpm preview`).
- **Branded 404:** A clean, creative 404 page that aligns with the "Embedded/Technical" visual language.

## 3. Design: "Signal Lost" 404 Page
The 404 page serves as the primary "error state" for the website.

### Visual Identity
- **Monospace Typography:** Large "404" heading using `var(--font-mono)`.
- **Technical Motif:** Re-use the PCB trace logic from `HeroBackground.astro` but with a "disconnected" or "glitched" animation effect.
- **Bilingual Content:**
  - **EN:** "404: Signal Lost. The requested memory address is invalid or has been reallocated."
  - **PT-BR:** "404: Sinal Perdido. O endereço de memória solicitado é inválido ou foi realocado."
- **Primary CTA:** "Back to main branch" (Home) with a secondary breadcrumb `ERROR_CODE: 0x404`.

### Implementation Details
- **File:** `src/pages/404.astro`.
- **Component:** `src/components/site/ErrorHero.astro` to encapsulate the glitched SVG logic.
- **Route:** Standard Astro 404 handling (root `/404.html` in static builds).

## 4. Design: "Quality Fortress" Test Suite
An exhaustive suite using Playwright and `@axe-core/playwright`.

### Production-Parity Configuration
- **Command:** `pnpm build && pnpm preview`.
- **Base URL:** `http://localhost:4321`.
- **Browser:** Chromium (Desktop & Mobile viewports).

### Test Pillars
#### A. Accessibility (A11y)
- **Tool:** `@axe-core/playwright`.
- **Coverage:** Run `axeBuilder.analyze()` on:
  - Homepage (EN/PT)
  - Portfolio (EN/PT)
  - Blog Index & Detail
  - Notes Index & Detail
  - Now Page
  - 404 Page
- **Standard:** WCAG 2.1 Level AA.

#### B. Visual Regression (Snapshotting)
- **Tool:** Playwright `toHaveScreenshot()`.
- **Snapshots:**
  - `hero-section.png` (Masking the typewriter text to prevent flakiness).
  - `header-fixed.png` (After scroll).
  - `footer-branding.png`.
  - `project-card-bento.png`.
  - `404-glitch-hero.png`.
- **Environment:** Snapshots generated for Linux (CI) to ensure consistency.

#### C. Behavioral Exhaustiveness
- **Search Flow:**
  - Typing "Firmware" -> Select first result -> Navigate -> Verify URL.
  - Typing "NonExistentTerm" -> Verify "No results found" UI.
  - Keyboard Navigation: `Tab` through search results, `Escape` to close.
- **Locale Isolation:**
  - EN Search should *only* return EN content.
  - PT Search should *only* return PT content.
- **Theme Persistence:**
  - Verify theme choice survives a hard reload and cross-page navigation.

#### D. Meta & Build Integrity
- **Sitemap Validation:** Script to verify all slugs in `src/content/` are present in `dist/sitemap-0.xml`.
- **RSS Validation:** Verify `dist/rss.xml` and `dist/notes/rss.xml` are valid XML and have 200 OK links.
- **OG Images:** Verify every blog post/note detail page has an `og:image` meta tag pointing to a reachable image.

## 5. Non-Goals
- **Cross-browser Snapshots:** Limiting snapshots to Chromium to minimize CI noise (Mandate: Minimal complexity).
- **Third-party A11y services:** Keeping everything within Playwright/Local scripts.

## 6. Success Criteria
- CI fails if an A11y violation is introduced.
- CI fails if a visual shift > 0.5% occurs in critical components.
- Search navigation is fully verified for both locales.
- 404 page is reachable and branded.
