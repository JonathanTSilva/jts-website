# Share Cards Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Readable, branded Open Graph cards (design A) for blog posts and every note kind, a working default `/og-image.png`, and clean share titles.

**Architecture:** A small pure module builds the card label and accent color; `generateOGImage` renders design A with satori; the OG endpoints pass kind, category, locale and accent; `generateSeo` drops the title suffix for `og:title`/`twitter:title` on articles.

**Tech Stack:** Astro 5 static endpoints, satori + sharp, vitest.

**Spec:** `docs/superpowers/specs/2026-11-18-share-cards-design.md`

**Routing (Jonathan's instruction):** Opus plans and reviews. Tasks marked **[Flash]** go to Gemini 3.8 Flash via `agy -p --model gemini-3.8-flash-medium` with the task text and its verify command. Tasks marked **[Sonnet]** go to the `builder` agent. Fallback chain for **[Flash]** tasks: if Flash fails the verify command, the same task goes to Haiku (`mechanic` agent) as backup; if Haiku fails, it escalates to `builder`. No retries with a new approach at the same level.

## Global Constraints

- Card size 1200x630, background `#0A0A0F`, default accent `#6272EA`.
- Fonts: Geist (400/600/700) and Geist Mono (500) from `node_modules/geist/dist/fonts/`.
- Kind labels: blog → `Blog`/`Artigo`; note → `Note`/`Nota`; book → `Book`/`Livro`; mindmap → `Mind Map`/`Mapa Mental`; whiteboard → `Whiteboard`/`Quadro`.
- Browser `<title>` stays `Title | Tobias`; `SITE_NAME` stays `'Tobias'` (used by schema tests).
- `og:site_name` = `Jonathan Tobias`.
- Branch work only; never push to `main`. No `Co-Authored-By`. Before each commit: `pnpm run typecheck && pnpm run test`.

## Review Focus

1. `colorToken` that is not a hex color (`"red"`, `"var(--x)"`, `"#abc"` short hex) → card still renders with a valid accent (Task 1 test).
2. Entry with no `category` → label is only the kind, no dangling ` · ` (Task 1 test).
3. Title over 110 characters → stays inside the card above the author strip (Task 2 render test + visual check).
4. Portuguese titles with accents (`Construindo um Segundo Cérebro`, `Engenharia`) → render correctly in uppercase label (Task 1 test for `toLocaleUpperCase('pt-BR')`).
5. EN and PT-BR entries of the same note → each card uses its own locale's labels (Task 3 build check).

---

### Task 1: Share label and accent helpers [Flash]

**Files:**
- Create: `src/lib/og/shareLabel.ts`
- Test: `tests/unit/share-label.test.ts`

**Interfaces:**
- Produces:
  - `type ShareKind = 'blog' | 'note' | 'book' | 'mindmap' | 'whiteboard'`
  - `buildShareLabel(opts: { kind: ShareKind; category?: string | undefined; locale: Locale }): string` — uppercase `KIND · CATEGORY`, or `KIND` alone.
  - `resolveShareAccent(colorToken?: string): string` — returns `colorToken` if it matches `/^#([0-9a-f]{3}|[0-9a-f]{6})$/i`, else `'#6272EA'`.
  - `lightenHex(hex: string, amount?: number): string` — mixes toward white (default 0.55), returns `rgb(r,g,b)`; expands 3-digit hex.
  - `Locale` imported from `src/lib/content/locale`.

- [ ] **Step 1: Write failing tests** in `tests/unit/share-label.test.ts`:
  - `buildShareLabel({ kind: 'blog', category: 'Engineering', locale: 'en' })` → `'BLOG · ENGINEERING'`
  - `buildShareLabel({ kind: 'whiteboard', category: 'Engenharia', locale: 'pt-br' })` → `'QUADRO · ENGENHARIA'`
  - `buildShareLabel({ kind: 'mindmap', locale: 'pt-br' })` → `'MAPA MENTAL'`
  - `buildShareLabel({ kind: 'book', category: 'Produção é ótima', locale: 'pt-br' })` → `'LIVRO · PRODUÇÃO É ÓTIMA'`
  - `buildShareLabel({ kind: 'blog', category: 'Personal', locale: 'pt-br' })` → `'ARTIGO · PERSONAL'`
  - `resolveShareAccent('#0ea5e9')` → `'#0ea5e9'`; `resolveShareAccent('#abc')` → `'#abc'`; `resolveShareAccent('red')`, `('var(--x)')`, `(undefined)` → `'#6272EA'`
  - `lightenHex('#000000', 0.5)` → `'rgb(128,128,128)'`; `lightenHex('#fff')` → `'rgb(255,255,255)'`
- [ ] **Step 2:** `pnpm vitest run tests/unit/share-label.test.ts` → FAIL (module not found).
- [ ] **Step 3:** Implement `src/lib/og/shareLabel.ts`. Uppercase with `toLocaleUpperCase('pt-BR')` / `'en-US'` by locale.
- [ ] **Step 4:** `pnpm vitest run tests/unit/share-label.test.ts` → PASS; `pnpm run typecheck` → 0 errors.
- [ ] **Step 5:** Commit `feat(og): add share card label and accent helpers`.

### Task 2: Design A card renderer [Sonnet]

**Files:**
- Modify: `src/lib/ogImage.ts`
- Test: `tests/unit/og-image.test.ts` (keep existing defaults test)

**Interfaces:**
- Consumes: `lightenHex` from Task 1.
- Produces: `generateOGImage(opts: { title: string; label: string; accent?: string }): Promise<Buffer>` (accent default `'#6272EA'`). `DEFAULT_OG_*` exports unchanged.

- [ ] **Step 1: Write failing tests:**
  - `generateOGImage({ title: 'Welcome', label: 'BLOG · PERSONAL' })` → buffer; `sharp(buf).metadata()` gives `width 1200`, `height 630`, `format 'png'`.
  - Same for a 130-character title and `accent: '#0ea5e9'`.
  - (Tests take a few seconds; set `{ timeout: 20000 }`.)
- [ ] **Step 2:** `pnpm vitest run tests/unit/og-image.test.ts` → FAIL (type error / `label` unused, or old signature).
- [ ] **Step 3:** Rewrite the layout to the spec's design A. Values to use exactly: top bar 14px `accent`; padding `56px 72px 0`; label Geist Mono 500 30px, letterSpacing 2, color `lightenHex(accent)`; title marginTop 28, Geist 700, lineHeight 1.12, maxWidth 1050, fontSize 76 / 70 (>40 chars) / 62 (>70 chars) / 54 (>100 chars); author strip padding `0 72px 52px`, avatar 84px with `3px solid accent` ring, name 34px 600 `#E8E8F2`, role 24px `#8185A5`; logo 56px radius 12 + `jontobias.com` Geist Mono 28px `#E8E8F2`. Load Geist SemiBold and GeistMono-Medium alongside existing fonts. Reference render: `/tmp/claude-1000/-home-jonathan-Projects-jts-website/34d69c4f-a368-436e-b975-796ea12160ed/scratchpad/proto.mts` function `A`.
- [ ] **Step 4:** Tests PASS; typecheck clean (endpoints will fail typecheck until Task 3 — update both endpoint calls minimally to `label: ''` if needed, Task 3 replaces them).
- [ ] **Step 5:** Commit `feat(og): redesign share card for feed readability`.

### Task 3: Wire endpoints and default card [Flash]

**Files:**
- Modify: `src/pages/og/blog/[slug].png.ts`, `src/pages/og/notes/[slug].png.ts`
- Create: `src/pages/og-image.png.ts`

**Interfaces:**
- Consumes: `buildShareLabel`, `resolveShareAccent` (Task 1), `generateOGImage` (Task 2).

- [ ] **Step 1:** Blog endpoint: `label: buildShareLabel({ kind: 'blog', category: post.data.category, locale: post.data.language })`, accent default.
- [ ] **Step 2:** Notes endpoint: `kind: note.data.noteType ?? 'note'`, `locale: note.data.language`, `accent: resolveShareAccent(note.data.colorToken)`.
- [ ] **Step 3:** `src/pages/og-image.png.ts`: static `GET` returning `generateOGImage({ title: 'Senior Embedded Software Engineer', label: 'JONTOBIAS.COM' })` as `image/png`.
- [ ] **Step 4: Verify:** `pnpm build && ls dist/og-image.png dist/og/blog/2026-04-welcome.pt-br.png dist/og/notes/book-cheatsheet.en.png dist/og/notes/whiteboard-cheatsheet.pt-br.png` → all four exist.
- [ ] **Step 5:** Commit `feat(og): pass kind, category and accent to share cards`.

### Task 4: Clean share titles and site name [Flash]

**Files:**
- Modify: `src/lib/seo/metadata.ts`
- Test: `tests/unit/seo-metadata.test.ts`

**Interfaces:**
- Produces: `export const OG_SITE_NAME = 'Jonathan Tobias'`. `generateSeo` return shape unchanged.

- [ ] **Step 1: Write failing tests:**
  - `generateSeo({ locale: 'en', title: 'Welcome', ogType: 'article' })` → `.title === 'Welcome | Tobias'`, `.og.title === 'Welcome'`, `.twitter.title === 'Welcome'`, `.og.site_name === 'Jonathan Tobias'`.
  - `generateSeo({ locale: 'en', pageType: 'blog-index' })` → `.og.title === 'Blog | Tobias'` (non-articles unchanged).
- [ ] **Step 2:** `pnpm vitest run tests/unit/seo-metadata.test.ts` → FAIL.
- [ ] **Step 3:** In `generateSeo`, `shareTitle = ogType === 'article' && title ? title : fullTitle`; use for `og.title` and `twitter.title`; `site_name: OG_SITE_NAME`.
- [ ] **Step 4:** `pnpm run typecheck && pnpm run test` → all pass.
- [ ] **Step 5:** Commit `feat(seo): use bare titles for shared article links`.

### Task 5: Review and visual check [Opus]

- [ ] Read the four built PNGs from Task 3 and compare against design A; check long-title and no-category cards.
- [ ] `pnpm test:e2e` (seo, governance specs) → pass.
- [ ] Whole-branch review against the spec, then open the PR.
