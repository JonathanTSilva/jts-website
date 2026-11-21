# Full site review — 2026-11-21

A whole-repository review of jts-website: correctness, SEO, performance, privacy, dependencies, tests, CI, automation, dead code, duplication and documentation. It also covers the publishing pipeline that feeds the site from the `jts-brain` vault and the `jts-skills` writing skills (see "How publishing works today"), because several fixes cross into those repositories. The remediation plan is [`docs/superpowers/plans/2026-11-21-site-review-remediation.md`](../superpowers/plans/2026-11-21-site-review-remediation.md).

- Reviewer: Claude (Opus 5.5), asked by Jonathan
- Commit reviewed: `8d20bd1` (branch `feat/70-gray-inactive-filter-badges`, one commit ahead of `main`)
- Scoring: **Priority = (Impact + Risk) × (6 − Effort)**, each from 1 to 5. Higher means fix sooner.

## Method and limits

What was run:

| Check | Command | Result |
|---|---|---|
| Type check | `pnpm run typecheck` | 0 errors, 0 warnings, 1 hint (F27) |
| Unit tests | `pnpm run test` | 34 files, 360 tests, all pass |
| Outdated packages | `pnpm outdated` | 24 packages behind, 8 of them by a major version (F05) |
| Advisories | `pnpm audit`, Dependabot alerts API | 159 audit findings; 100 open Dependabot alerts (6 critical, 35 high) |
| Built output | inspection of the existing `dist/` (`hreflang`, canonical, sitemap, bundles) | see F01, F08 |
| Dead code | manual grep for unimported files, unused exports and dependencies | see F24, F25 |
| Publishing pipeline | read `~/Projects/jts-brain/08-Publish`, its workflows and `99-Meta/Schema/schema.yaml`; read `~/Projects/jts-skills` (`blog-publish`, `check_pair.py`, `validate_website.sh`, `blog-share`, tests) | see "How publishing works today", F29, F30 |

What was not run:

- The Playwright E2E suite and a fresh `pnpm build`. The built-output findings come from the `dist/` folder already on disk, cross-checked against the source.
- `knip`. Downloading it was blocked by the session's permission policy, so dead-code detection was manual and may miss things. Task 8.3 of the plan adds `knip` as a dev dependency.

## What is healthy

Keep these. The plan does not change them.

- Strict Zod content schemas, a content linter and a validated vault sync that arrives as a PR.
- Third-party actions pinned by full SHA, least-privilege workflow permissions, gitleaks in pre-commit, secrets kept out of the repo.
- The consent-first Plausible setup, with consent state in one module (`src/lib/analytics/consent.ts`), which the old April audit had flagged as duplicated and which is now fixed.
- A deterministic, verified CV pipeline (Poppler check, deploy-boundary check, fixed PDF dates).
- Shared `getStaticPaths` factories (`src/lib/content/staticPaths.ts`) so the EN and PT pages already share routing logic.
- 360 fast unit tests and a broad E2E suite (SEO, a11y with axe, search, theme, consent, integrity).
- `/engineering` reads live data with a committed snapshot fallback and a nightly rebuild. The build is not strictly deterministic because of it, but that trade-off is deliberate and handled.

## Findings at a glance

| ID | Finding | Area | Score |
|---|---|---|---|
| F03 | Dependabot has never opened an npm PR; stale `package-lock.json` | Dependencies | 32 |
| F06 | Google Fonts loaded on every page before consent | Privacy, performance | 30 |
| F29 | The English Now page no longer syncs (`Now.en.md` vs `Now.md`) | Content pipeline | 30 |
| F04 | `geist` pulls in Next.js (all 6 critical alerts) | Dependencies | 28 |
| F02 | PT post "back to blog" link goes to the English blog | Bug | 25 |
| F07 | 2 MB hero PNG; 1920 px logo used as a 24 px icon and favicon | Performance | 25 |
| F01 | Every post and note is published at 4 URLs; `hreflang` points to the wrong language | SEO | 24 |
| F08 | Whiteboard "copy as image" never works in production | Bug | 20 |
| F09 | Invalid `packageManager`; Node 22/24/26 drift with no pin | Tooling | 20 |
| F11 | E2E tests depend on synced vault content | Tests | 18 |
| F30 | The content contract is encoded in four places across three repos, with drift and no shared check | Content pipeline | 18 |
| F12 | Content validation gaps (no cross-file checks, no scheduling) | Content pipeline | 18 |
| F13 | Sync script ships broken images and never removes orphans | Content pipeline | 18 |
| F05 | Framework one major behind (Astro 6 → 7 and seven more) | Dependencies | 16 |
| F14 | CI builds the site 4 times per PR; no deploy concurrency | CI | 16 |
| F15 | Visual tests accept 15 % pixel drift; no traces; Chromium only | Tests | 16 |
| F18 | Wikilink plugin untested; stale cache in dev; silent unresolved links | Content pipeline | 16 |
| F19 | Structured data, `updatedAt`, sitemap metadata gaps | SEO | 16 |
| F20 | Unescaped JSON-LD; inline handlers; no `security.txt` | Security | 16 |
| F22 | Dates formatted in the build machine's timezone | Bug | 16 |
| F16 | Dark-mode contrast failures (#40), hidden from the a11y test | Accessibility | 15 |
| F21 | Skip link English on PT pages; viewport meta incomplete | Accessibility | 15 |
| F26 | Stale and contradictory docs (`GEMINI.md`, README, `docs/ai`) | Documentation | 15 |
| F10 | EN/PT pages are copies; UI strings in ~30 files; domain hardcoded 10 times | Maintainability | 12 |
| F17 | No ESLint (#34) | Tooling | 12 |
| F23 | Uploaded images unoptimized; book covers hotlinked | Performance, longevity | 12 |
| F28 | Missing automation (link rot, uptime, auto-merge, budgets) | Automation | 12 |
| F24 | Unused `marked` dependency; generated search index committed and stale | Dead code | 10 |
| F27 | Deprecated `z.string().url()` | Dead code | 10 |
| F25 | Unused and test-only exports | Dead code | 8 |

The formula rewards cheap fixes, so a score is an ordering for scheduling, not a measure of importance. By impact alone, F01 (SEO) and F03/F04/F05 (dependencies) matter most for a site meant to last years.

## Correctness bugs

### F01 — Every post and note is published at 4 URLs, and `hreflang` points to the wrong page

Impact 4, Risk 4, Effort 3 → **24**

- `makeBlogStaticPaths` (`src/lib/content/staticPaths.ts:127-152`) returns one route per translation for **each** locale page, and `makeNoteStaticPaths` (`:67-101`) maps over **all** notes. So each translation pair produces four pages: `/blog/x.en/`, `/blog/x.pt-br/`, `/pt-br/blog/x.en/`, `/pt-br/blog/x.pt-br/`. The same holds for notes. Two of the four are "fallback" copies of a translation that actually exists.
- `generateSeo` (`src/lib/seo/metadata.ts:131-156`) builds alternates by stripping `/pt-br` from the path. On `/blog/x.en/` the `pt-br` alternate is `/pt-br/blog/x.en/`, which is the English text again, instead of `/pt-br/blog/x.pt-br/`. Confirmed in `dist/blog/2026-11-low-cost-homelab-setup.en/index.html`.
- Every duplicate declares itself canonical and every one is listed in `sitemap-0.xml`. Search engines see duplicate content across languages.
- `SeoHead` never receives the `translations` prop that `Header`, `Footer` and `LanguageSwitcher` already get, so the correct data is available but unused.
- Note pages show no translation-fallback notice at all; `NoteLayoutWrapper` has no fallback handling. Blog pages do show one.
- Slugs carry the language (`2026-11-low-cost-homelab-setup.en`), so URLs end in `.en` and `.pt-br`. `docs/site-operations/seo-checklist.md:62` documents the path-pair invariant that this naming breaks.
- The homelab post is already shared on LinkedIn. Any slug change needs redirects.
- The slug format is a cross-repo contract (see "How publishing works today"): changing it means changing `blog-publish`, `check_pair.py` and its tests, `blog-share`, and the `slug:` line of every file in `08-Publish`. Filenames can keep their language suffix, which keeps every existing wikilink working.

### F02 — PT post "back to blog" link goes to the English blog

Impact 3, Risk 2, Effort 1 → **25**

`src/pages/pt-br/blog/[slug].astro:43` hardcodes `<a href="/blog">` under the label "← Voltar ao blog". This is a direct consequence of F10: the PT page is a copy of the EN page.

### F08 — Whiteboard "copy as image" never works in production

Impact 2, Risk 2, Effort 1 → **20**

`astro.config.mjs:23` marks `html2canvas` as a Rollup `external`. The built chunk `dist/_astro/WhiteboardLayout.astro_astro_type_script_index_0_lang.*.js` keeps a bare `import("html2canvas")`, which browsers cannot resolve without an import map. The `catch` in `WhiteboardLayout.astro:72-90` then always falls back to copying the URL. The package is already a regular dependency, so the `external` entry and the `@ts-ignore` serve no purpose.

### F22 — Dates are formatted in the build machine's timezone

Impact 2, Risk 2, Effort 2 → **16**

13 call sites use `toLocaleDateString(locale, { dateStyle: 'long' })` with no `timeZone`. Date-only frontmatter (`2026-11-19`) is parsed as UTC midnight, so a build in UTC−3 (a local build in Brazil) shows the previous day. CI builds in UTC, so production is correct today, but only by accident.

## SEO

### F19 — Structured data and freshness metadata gaps

Impact 3, Risk 1, Effort 2 → **16**

- Blog `updatedAt` exists in the schema but is never rendered, never emitted as `dateModified`, and never used as sitemap `lastmod`.
- `generateArticleSchema` (`src/lib/seo/schema.ts:56`) omits `author`, `inLanguage`, `dateModified` and `mainEntityOfPage`.
- Notes get no Article structured data.
- `@astrojs/sitemap` supports an `i18n` option and `lastmod`; neither is configured.
- No `og:locale:alternate`.

## Performance and privacy

### F06 — Google Fonts loaded on every page before consent

Impact 3, Risk 3, Effort 1 → **30**

`src/styles/global.css:2` uses `@import url('https://fonts.googleapis.com/css2?family=Outfit…')` for the logo wordmark only (`--font-logo`, used in `Header.astro:253` and `Footer.astro:154`). It is a render-blocking third-party request that sends every visitor's IP address to Google before any consent, and `privacy.astro` does not mention Google. The guard test `tests/e2e/perf-regression.spec.ts` ("self-hosted fonts") only counts `<link>` tags, so it cannot see a CSS `@import`.

### F07 — 2 MB hero image; oversized logo and favicon

Impact 3, Risk 2, Effort 1 → **25**

- `src/components/home/Hero.astro:94` loads `profile_ai_transparent2.png`: 1447×1632, 2.0 MB, no `width`/`height` (layout shift), no `fetchpriority`, no WebP/AVIF. It is the likely LCP element of the home page.
- `profile2.jpg` (959×1280, 119 KB) on the portfolio has the same issues.
- `jts-logo-circle-simple.png` is 1920×1920 (72 KB) and is used as a 24 px header and footer image and as the favicon. There is no `favicon.ico`, no `apple-touch-icon` and no web manifest.
- Both `<img>` tags use inline `onerror=` handlers (see F20).

### F23 — Unoptimized uploads; hotlinked book covers

Impact 2, Risk 2, Effort 3 → **12**

- Images synced to `public/assets/uploads/` are served as-is (the current one is a 1600×1200, 292 KB JPEG). Nothing resizes them or strips EXIF. The current photo has no EXIF, but nothing guarantees the next one won't carry GPS data.
- Book notes require `cover` as an external URL (`schemas.ts:31`), and the vault skills enforce that too (`check_pair.py:415`). Hotlinked covers break when the host changes paths, which over a horizon of years is close to certain. Serving the cover through Astro's build-time image pipeline fixes this on the website side alone; switching to vault attachments would need changes in `blog-draft`, `blog-publish`, `check_pair.py` and the sync.

## Dependencies and tooling

### F03 — Dependabot has never opened an npm PR

Impact 3, Risk 5, Effort 2 → **32**

- `.github/dependabot.yml` configures npm, Actions and devcontainers. Actions and devcontainer PRs arrive (#35, #36, #64). No npm PR has ever been opened, in any state.
- 100 Dependabot alerts are open: 6 critical, 35 high, 45 medium, 14 low.
- A stale `package-lock.json` (last changed 2026-04-17, still `"version": "0.1.0"`) sits next to `pnpm-lock.yaml`. It is the most likely reason Dependabot's npm updater fails, and it is dead weight either way.
- The single npm group matches `*` including majors, so one failing major update can block every update.

### F04 — `geist` pulls Next.js into the dependency tree

Impact 3, Risk 4, Effort 2 → **28**

`geist@1.7.0` declares `next >=13.2.0` as a peer dependency, and pnpm installs missing peers automatically. All six critical advisories (Next.js remote code execution in image optimization, `use cache`, `next/og`) come from this path. The site uses only font files from the package:

- `src/styles/global.css:7,15`: `Geist-Variable.woff2`, `GeistMono-Variable.woff2`
- `src/lib/ogImage.ts:7-15`: `Geist-Regular.ttf`, `Geist-SemiBold.ttf`, `Geist-Bold.ttf`, `GeistMono-Medium.ttf`
- `src/lib/cv/pdf.ts:11-12`: `Geist-Regular.woff2`, `Geist-SemiBold.woff2`

None of this code runs in the browser, so the deployed static site is not exposed. The risk is to the build and dev machines, plus alert noise that hides real alerts.

### F05 — Framework one major version behind

Impact 3, Risk 5, Effort 4 → **16**

| Package | Current | Latest |
|---|---|---|
| astro | 6.1.1 | 7.4.13 |
| @astrojs/mdx | 5.0.3 | 8.1.6 |
| mermaid | 11.13.0 | 12.3.0 |
| vitest, @vitest/coverage-v8 | 4.1.12 | 5.1.1 |
| katex | 0.16.44 | 0.19.1 |
| satori | 0.26.0 | 0.63.2 |
| marked | 17.0.5 | 18.2.1 (unused, see F24) |
| typescript | 5.9.3 | 7.0.2 |

Plus 16 packages behind by a minor or patch version (sitemap, rss, Playwright 1.58 → 1.65, zod 4.3 → 4.6, sharp 0.34 → 0.35 and others). Astro below 7.4.5 has open advisories (AVIF RCE in image optimization, reflected XSS, SSRF); none of them reach a static GitHub Pages deployment, but they will once anything server-side is added. Client-shipped packages with advisories: `dompurify` and `lodash-es` through mermaid.

### F09 — Invalid `packageManager`; Node version drift

Impact 2, Risk 2, Effort 1 → **20**

- `package.json:5` `"packageManager": "pnpm@10"` is not a valid Corepack value; every pnpm command prints `Cannot switch to pnpm@10: "10" is not a valid version`. The devcontainer runs `corepack enable` and depends on it.
- Node is 22 in `pipeline.yml`, `sync-content.yml` and `update-snapshots.yml`, 24 in the devcontainer, and 26 locally. There is no `.node-version`, `.nvmrc` or `engines` field, and the shared `node.yml` workflow picks its own.

### F17 — No ESLint

Impact 2, Risk 2, Effort 3 → **12**

Open issue #34. The devcontainer still recommends the ESLint extension. There are 31 `@ts-ignore` / `as any` / `: any` occurrences in `src` and `scripts` that a linter would surface.

## Content pipeline

### How publishing works today

Content is not written in this repository. It flows through three repositories, and every one of them encodes part of the contract:

```text
jts-skills (blog, blog-draft, fact-check, humanizer, jts-finish, blog-publish, blog-share)
  └─ blog-publish writes the EN + PT pair into jts-brain/08-Publish/{Blog,Notes}/
       ├─ check_pair.py      slug == filename stem, stem shape, book cover is https, wikilinks/embeds published
       └─ validate_website.sh runs THIS repo's scripts/validate-content.ts with plain tsx, outside Astro
jts-brain (vault, private)
  ├─ 99-Meta/Schema/schema.yaml   "publish" rule for 08-Publish/** (checked by vaultprops, never auto-fixed)
  ├─ homelab server checkpoint commits and pushes once a day (23:30)
  └─ notify-website.yml           push touching 08-Publish/** → repository_dispatch sync_content
jts-website (this repo)
  ├─ sync-content.yml + scripts/sync-content.ts   mirror Blog/Notes, map Now files, copy referenced attachments, lint, open PR chore/1-sync-content
  ├─ pipeline.yml                                 build, test, deploy
  └─ remark plugins                               [[wikilinks]] and ![[embeds]] resolved at build time
```

Contract points a change here can break:

| Contract | Lives in | Consumers outside this repo |
|---|---|---|
| Filenames `<stem>.<lang>.md`; blog stem `YYYY-MM-<base>`, note stem `<base>` | `scripts/sync-content.ts`, `obsidian-wikilinks.ts`, `docs/site-operations/obsidian-pipeline.md` | `blog-publish` (writes them), `check_pair.py` (enforces them) |
| `slug` equals the filename stem, language suffix included | Frontmatter only; the website just uses the value | `blog-publish` step 3, `check_pair.py:385`, `test/blog-publish.bats`, `blog-share` (builds `jontobias.com/blog/<slug>` and `/og/blog/<slug>.png`) |
| Wikilinks written as filename stems (`[[2026-11-low-cost-homelab-setup.en\|…]]`) | `obsidian-wikilinks.ts` indexes filename, stem, base and slug | `check_pair.py` treats a link as published only if it matches a published **slug** or slug base |
| Frontmatter schema | `src/lib/content/schemas.ts`, `validation.ts` | `validate_website.sh` (imports them through plain `tsx`), `references/note-types.md`, `99-Meta/Schema/schema.yaml` |
| Book `cover` is an https URL | `schemas.ts:31` | `blog-draft`, `blog`, `note-types.md`, `check_pair.py:415` |
| `*-cheatsheet.*` notes | `08-Publish/Notes`, `08-Publish/Blog` | `blog-publish` and `note-types.md` use them as the examples of every kind; this repo's E2E tests navigate to them |

### F29 — The English Now page no longer syncs

Impact 3, Risk 3, Effort 1 → **30**

The vault holds `08-Publish/Now.en.md` and `Now.pt-br.md`. `scripts/sync-content.ts:59` maps `08-Publish/Now.md` → `now/index.en.md`, and `tests/unit/sync.test.ts:30` tests that old name. Every sync logs `[skip] Now.md (not found)` and leaves `src/content/now/index.en.md` as it was. The two files are identical today, so nothing is visibly wrong yet, but the next edit to the English Now page will never reach the site. `docs/site-operations/obsidian-pipeline.md:60` documents the old name too. The fix belongs on the website side (accept `Now.en.md`); the vault needs no change.

### F30 — The content contract is duplicated and drifting

Impact 3, Risk 3, Effort 3 → **18**

- The same rules live in `schemas.ts`/`validation.ts` (website), `check_pair.py` and `note-types.md` (jts-skills), and `99-Meta/Schema/schema.yaml` (jts-brain). Nothing checks that they agree.
- Drift already exists: the vault's `publish` rule does not list `dateRead`, `publishDate`, `relatedTo`, `previousBook` or `nextBook`, which the website accepts and book notes use, so vaultprops reports them as `unknown-key` warnings.
- `validate_website.sh` copies only the staged pair into a temp tree, so cross-file problems (a duplicate slug against an already published file) surface only after the pair is in `08-Publish`, when the sync PR fails.
- `validate_website.sh` depends on `scripts/validate-content.ts` and everything it imports staying runnable with plain `tsx`. Importing `astro:content` or `astro/zod` there, which an Astro upgrade or a refactor could easily do, would silently break `blog-publish`.
- The skill tells the user the files "go live at the server's 23:30 checkpoint". In fact they go live after the checkpoint push, the sync PR, its merge and the deploy.
- Outside this review's scope but worth noting: `jts-brain/.github/workflows/notify-website.yml` and `vault-props.yml` use actions by tag (`@v3`, `@v4`), not by SHA as the handbook requires.

### F12 — Content validation gaps

Impact 3, Risk 3, Effort 3 → **18**

`scripts/validate-content.ts` validates files one at a time. Missing:

- Cross-file checks: duplicate `slug` per collection and language; more than one file per language in a `translationKey` group; `language` frontmatter that does not match the filename suffix.
- Book-note rules (`author`, `cover`) live only in `validation.ts:54-62`, not in the Zod schema, so `astro build` accepts a book note that `lint:content` rejects.
- No scheduled publishing: a post with a future `publishedAt` goes live at once. The nightly build already exists, so future-dated posts could publish themselves. A `draft` flag is not needed: drafts live in the vault's `05-Fleeting` and only reach `08-Publish` through `blog-publish`.
- The `portfolio` collection is not linted at all.

### F13 — Sync script gaps

Impact 3, Risk 3, Effort 3 → **18**

In `scripts/sync-content.ts`:

- A referenced image that is missing only prints a warning (`:177-181`), so the sync PR ships a broken `<img>`.
- Images are only ever added; deleted or replaced images stay in `public/assets/uploads/` forever.
- No resize and no EXIF stripping (F23).

### F18 — Wikilink plugin

Impact 2, Risk 2, Effort 2 → **16**

`src/lib/remark/obsidian-wikilinks.ts` (265 lines) is the only remark plugin without unit tests. It parses frontmatter with a regex instead of `gray-matter`, keeps a process-wide cache (`:16`) so `pnpm dev` does not see new content until restarted, and turns unresolved links into plain text without any warning.

## Tests

### F11 — E2E tests depend on synced vault content

Impact 3, Risk 3, Effort 3 → **18**

Specs navigate to concrete synced content (which `blog-publish` also uses as its examples of every kind, so they should stay in the vault): `/notes/note-cheatsheet.en`, `/notes/whiteboard-cheatsheet.en`, `/notes/book-cheatsheet.en`, `/blog/2026-03-markdown-cheatsheet.en` and others (`perf-regression`, `markdown-rendering`, `notes`, `blog`, `seo` specs). The vault sync is a true mirror: removing or renaming those notes in Obsidian breaks CI for reasons unrelated to the change in the PR.

### F15 — Weak visual and E2E safety nets

Impact 2, Risk 2, Effort 2 → **16**

- `playwright.config.ts:9` `maxDiffPixelRatio: 0.15` lets 15 % of pixels change before a visual test fails.
- No `retries`, no `trace`, no CI reporter, so a red E2E run in CI is hard to diagnose.
- 4 fixed sleeps: `blog.spec.ts:193`, `portfolio.spec.ts:85`, `header.spec.ts:18`, `header.spec.ts:82`.
- Only Chromium runs. iPhone visitors use WebKit, which is never tested.
- `perf-regression.spec.ts` tests rendering, not performance; its name misleads.

### F16 — Dark-mode contrast

Impact 3, Risk 2, Effort 3 → **15**

Issue #40 lists the failures: `--accent` text on dark surfaces (4.13–4.44:1), white on accent buttons (4.1:1), the `one-dark-pro` syntax colors (3.72 and 4.38:1), status badges (1.7–2.1:1). The dark a11y test filters out color-contrast violations until it is fixed.

## Security

### F20 — Hardening gaps

Impact 2, Risk 2, Effort 2 → **16**

- `src/components/site/StructuredData.astro:9` writes `JSON.stringify(data)` into a `<script>` without escaping `<`. A title containing `</script>` would break out of the tag. Content is author-controlled, so this is hardening, not an exploit.
- Inline `onerror=` handlers (`Hero.astro`, `AboutSection.astro`) would block a future Content-Security-Policy `<meta>` tag.
- No `/.well-known/security.txt`.

## Accessibility and i18n

### F21 — Small gaps

Impact 2, Risk 1, Effort 1 → **15**

- `BaseLayout.astro:65` "Skip to content" is English on PT pages.
- `BaseLayout.astro:35` viewport meta is `width=device-width` without `initial-scale=1`.
- RSS `<link>` titles in `BaseLayout.astro:50-56` are hardcoded per locale branch instead of coming from a dictionary.

## Maintainability

### F10 — EN and PT pages are copies

Impact 3, Risk 3, Effort 4 → **12**

| Page | EN lines | PT lines | Differing lines |
|---|---|---|---|
| `blog/[slug].astro` | 354 | 353 | 39 |
| `portfolio/index.astro` | 195 | 195 | 34 |
| `index.astro` | 32 | 32 | 34 |
| `now/index.astro` | 107 | 123 | 26 |
| `notes/[slug].astro` | 35 | 35 | 16 |
| `notes/index.astro` | 81 | 81 | 14 |
| `rss.xml.ts`, `notes/rss.xml.ts` | 26 | 26 | 14 each |
| `engineering/index.astro` | 20 | 20 | 10 |
| `blog/index.astro` | 46 | 46 | 8 |
| `privacy.astro`, `terms.astro` | 111, 115 | 111, 115 | 64, 66 (prose, keep separate) |

- The differences are import depths and UI strings. Every fix must be applied twice, and F02 shows what happens when it isn't.
- UI strings live in about 30 files as local `const t = { … }` objects; there is no dictionary.
- `https://www.jontobias.com` is hardcoded in 10 places across `src/lib/seo/metadata.ts`, `src/lib/seo/schema.ts`, `src/lib/ogImage.ts`, `src/lib/analytics/config.ts`, both blog `[slug]` pages and four RSS endpoints, instead of `Astro.site`.
- PT `/now` builds its own fallback banner instead of using `TranslationFallbackNotice`.

## Dead code and duplication

### F24 — Unused dependency and committed build output

Impact 1, Risk 1, Effort 1 → **10**

- `marked` is a dependency with zero imports.
- `public/api/{en,pt-br}/search-index.json` is regenerated by `pnpm build:search` on every build but is also committed. The committed copy was last regenerated 2026-10-27, before the November content, so `pnpm dev` serves a stale index.

### F25 — Unused and test-only exports

Impact 1, Risk 1, Effort 2 → **8**

- Never used anywhere: `setTheme` and `THEME_STORAGE_KEY` (`src/lib/theme/theme.ts`).
- Used only by tests: `isDefaultLocale`, `isAnalyticsEventName`, `getAnalyticsEventCategory`, `ANALYTICS_EVENT_TAXONOMY_VERSION`, `matchOrderedTextFields`, `assertValidExtractedCvText`, `DEFAULT_OG_AUTHOR`, `DEFAULT_OG_AUTHOR_ROLE`, `DEFAULT_OG_DOMAIN`.
- About 20 interfaces and constants are exported but only used inside their own module (for example `GITHUB_OWNER`, `OG_SITE_NAME`, `CvQualityWarning`).

### F27 — Deprecated Zod API

Impact 1, Risk 1, Effort 1 → **10**

`src/lib/content/schemas.ts:31` `z.string().url()` is deprecated in Zod 4; use `z.url()`. This is the only `astro check` hint.

## Documentation

### F26 — Stale and contradictory docs

Impact 1, Risk 2, Effort 1 → **15**

- `GEMINI.md` is an old, diverged copy of the agent instructions instead of importing `AGENTS.md`, despite `AGENTS.md` calling itself "the single source". It describes a file-naming rule (`YYYY-MM-{slug}.{lang}.md`) that notes do not follow.
- `README.md:142` says the site deploys to a `gh-pages` branch. It deploys a Pages artifact.
- `docs/ai/audit-report.md`, `performance-report.md` and `test-coverage-report.md` (April) describe components and counts that no longer exist.
- Agent definitions exist in two places: `.github/agents/*.agent.md` (7 files) and `.claude/agents/` (3 files).
- `AGENTS.md` routes mechanical work to Haiku first. Jonathan's working preference is Gemini 3.8 Flash first with Haiku as the fallback. `AGENTS.md` is rendered from the template, so that change belongs in `template-repo`, not here.
- `docs/site-operations/seo-checklist.md:60-62` documents the `hreflang` behavior that F01 shows is wrong.

## CI and automation

### F14 — Redundant CI work; no deploy concurrency

Impact 2, Risk 2, Effort 2 → **16**

- On every PR, `pipeline.yml` builds and runs the full E2E suite, `ci.yml`'s `e2e` job builds and runs it again, `lighthouse` builds a third time and `node` runs the unit tests a second time.
- The Pages `deploy` job has no `concurrency` group, so a push and the nightly schedule can deploy at the same time.
- `AGENTS.md` says `pipeline.yml` "stays as it is", so trimming its PR trigger is Jonathan's call (decision D5 in the plan).

### F28 — Missing automation

Impact 2, Risk 2, Effort 3 → **12**

- No link check of the built site. `lychee.toml` excludes `src/content`, so links inside posts are never checked, and nothing watches external links rot over the years.
- No uptime or synthetic check of `www.jontobias.com`.
- No auto-merge for patch and minor dependency updates once CI is green.
- Lighthouse runs, but without performance budgets that fail the build.
- No reminder mechanism for anything that expires (a `security.txt` `Expires` field, for example).
