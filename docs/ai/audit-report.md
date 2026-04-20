# Repository Audit Report — `jts-website` (Pre-v1.0.0)

## 1. Architecture Overview

The codebase is a **39-component, 25-page** Astro static site with bilingual EN/PT-BR routing, 4 Markdown collections, and a TypeScript-first approach under strict TypeScript config. Build pipeline: `build-search-index.ts` → Astro build → static dist. Test coverage: 165 unit tests + ~137 e2e tests across 30 spec files.

**Healthy patterns**: PascalCase components, flat kebab-case CSS, component-scoped styles, centralized design tokens, deterministic SSG builds.

---

## 2. Dead Code Candidates

| Priority | Item | Evidence |
|----------|------|----------|
| **HIGH** | ContactSection.astro | Zero imports anywhere in src. Deliberately removed from homepage; no longer test-referenced. **Safe to delete.** |
| **MEDIUM** | `consent.ts` exports: `createDefaultConsentState`, `serializeConsentState`, `parseConsentState`, `hasAnalyticsConsent` | AnalyticsScripts.astro **reimplements** `parseConsent()` and `hasAnalyticsConsent()` inline (lines 20-31). Only imports `CONSENT_STORAGE_KEY`. The 4 other exports exist solely for tests that validate logic production doesn't actually call. |
| **LOW** | 22 unnecessary public exports across lib | Interfaces (`NavLink`, `SkillEntry`, `OGImageOptions`, `ValidationResult`, `ArticleSchemaInput`, `AnalyticsConfig`, `AnalyticsEventName`, `AnalyticsEventCategory`) and values (`SITE_DESCRIPTION`, `HERO_POSITIONING`, `languageEnum`, `isDefaultLocale`, `ANALYTICS_EVENT_TAXONOMY_VERSION`, `isAnalyticsEventName`, `getAnalyticsEventCategory`, `DEFAULT_OG_DOMAIN`, `categoryColors` map) are exported but never imported outside their module or tests. Could be unexported. |

---

## 3. Unused Files / Assets

| Priority | Item | Size | Evidence |
|----------|------|------|----------|
| **HIGH** | profile_ai.png | **7.5 MB** | Zero references in src |
| **HIGH** | profile_ai_cropped.png | **3.9 MB** | Zero references in src |
| **HIGH** | profile_ai_transparent.png | **2.4 MB** | Zero references in src (only `profile_ai_transparent2.png` is used by Hero) |
| **LOW** | test.html | 5 KB | Standalone SVG CPU animation demo. Not linked, imported, or tested. |
| **LOW** | TASK_6_TODO.md | ~1 KB | All 4 checklist items are `[x]` complete. Stale. |
| **LOW** | Root CNAME | 13 B | Contains `jontobias.com` — redundant with CNAME (`www.jontobias.com`) which is what Astro copies to dist. |

**Total orphaned asset weight: 13.8 MB** — significant for a static site repo.

---

## 4. Code Smells

### 4a. consent.ts logic fork (MEDIUM)

AnalyticsScripts.astro defines local `parseConsent()` and `hasAnalyticsConsent()` functions that duplicate the logic in consent.ts. If consent parsing behavior diverges, the unit tests would pass while production uses different logic.

**Risk**: Tests validate logic production doesn't use — a false-green scenario.

### 4b. `@/` path alias configured but never used (LOW)

tsconfig.json defines `"@/*": ["src/*"]` but all 131 source files use relative paths exclusively. Dead config.

### 4c. CLAUDE.md stale token documentation (LOW)

| Token | CLAUDE.md says | Actual value (tokens.css) |
|-------|----------------|------|
| `--container-max` | 52rem | **68rem** |
| `--wide-max` | 72rem | **88rem** |

---

## 5. Duplication Hotspots

### 5a. EN/PT-BR page duplication — **~600+ duplicated lines** (HIGH)

6 page pairs are near-identical, differing only in `const locale = 'en'|'pt-br'` and inline translation objects:

| EN File | PT-BR File | Shared Logic |
|---------|-----------|-------------|
| [pages/notes/[slug].astro](src/pages/notes/[slug].astro) | [pages/pt-br/notes/[slug].astro](src/pages/pt-br/notes/[slug].astro) | ~80 lines `getStaticPaths` + template |
| [pages/blog/[slug].astro](src/pages/blog/[slug].astro) | [pages/pt-br/blog/[slug].astro](src/pages/pt-br/blog/[slug].astro) | ~100+ lines `getStaticPaths` + template + CSS |
| pages/notes/index.astro | pages/pt-br/notes/index.astro | ~60 lines collection filter/sort |
| pages/blog/index.astro | pages/pt-br/blog/index.astro | Similar |
| pages/portfolio/index.astro | pages/pt-br/portfolio/index.astro | Similar |
| pages/now/index.astro | pages/pt-br/now/index.astro | Similar |

**Impact**: Any bug fix or feature must be applied to both files manually. A shared `getStaticPaths` factory or parameterized page generator would eliminate this.

### 5b. Note layout shared boilerplate (~40% identical per layout) (MEDIUM)

All 4 note layouts in layouts repeat:
- Identical `Props` interface (6 lines × 4)
- Identical destructuring pattern
- Identical `locale === 'en' ? {...} : {...}` translation block
- Identical `isTranslationFallback` derivation
- Identical `getNoteAccentColor()` call
- Identical `<NoteFooter>`, `<BackToTop>`, `<TranslationFallbackNotice>` usage

A shared `NoteLayoutWrapper` component could extract ~30 lines from each layout.

### 5c. Inline translation objects — no centralized i18n (LOW)

The `locale === 'en' ? { back: '←...', ... } : { voltar: '←...' }` pattern appears in **15+ files** without a shared dictionary. Acceptable at current scale but becomes a maintenance burden with more locales.

---

## 6. Refactoring Opportunities

| Priority | Opportunity | Impact | Risk |
|----------|------------|--------|------|
| **HIGH** | Delete 3 orphaned profile images | **-13.8 MB** repo size | None |
| **HIGH** | Extract shared `getStaticPaths` helpers for notes + blog | -600+ duplicate lines, single source of truth | Medium — touches routing |
| **MEDIUM** | Reconcile `consent.ts` ↔ AnalyticsScripts.astro | Tests validate actual production logic | Low — contained to analytics |
| **MEDIUM** | Extract shared `NoteLayoutWrapper` | -120 duplicate lines across 4 layouts | Low — template-only change |
| **LOW** | Unexport 22 internal-only symbols | Cleaner public API surface | Very low |
| **LOW** | Remove dead `@/` alias from tsconfig or adopt it | Config hygiene | Very low |
| **LOW** | Delete `ContactSection.astro`, test.html, TASK_6_TODO.md, root CNAME | Repo hygiene | None |
| **LOW** | Fix stale CLAUDE.md token values | Doc accuracy | None |
| **INFO** | `public/api/*.json` committed build artifacts | Could .gitignore if CI guarantees rebuild | Design choice — not a bug |
