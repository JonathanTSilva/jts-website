# Personal Content Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace placeholder and demo content across the site with a cohesive, bilingual professional profile that positions Jonathan as a Senior Embedded Software Engineer with credible leadership range.

**Architecture:** This is a content-first implementation that keeps the existing frontend structure intact while replacing placeholder identity data, homepage copy, portfolio narrative content, and structured profile data. The work should proceed from externally visible identity surfaces to deeper portfolio data, with verification after each content slice so regressions in copy, links, or route rendering are caught early.

**Tech Stack:** Astro, TypeScript, MD/MDX content files, Playwright, Vitest, pnpm

---

## File Map

- `docs/superpowers/specs/2026-03-23-personal-content-refresh-design.md`
  Design source of truth for positioning, scope, and verification requirements.
- `docs/superpowers/specs/personal-information.md`
  Raw factual source material assembled from CV, LinkedIn, and the old website.
- `src/components/home/Hero.astro`
  Homepage role label, supporting line, social/contact links, CTA adjacent credibility signals, and achievement box content.
- `src/pages/index.astro`
  English homepage wrapper, including hero `typewriterPrefix` and `typewriterPhrases`.
- `src/pages/pt-br/index.astro`
  Portuguese homepage wrapper, including hero `typewriterPrefix` and `typewriterPhrases`.
- `src/components/site/Footer.astro`
  Public identity/contact links and visible display name in the footer.
- `src/pages/blog/[slug].astro`
  English blog post author identity block beneath the article preamble.
- `src/pages/pt-br/blog/[slug].astro`
  Portuguese blog post author identity block beneath the article preamble.
- `src/content/portfolio/about.en.md`
  English professional summary.
- `src/content/portfolio/about.pt-br.md`
  Portuguese professional summary.
- `src/content/portfolio/experience.ts`
  Structured work and education timeline shown on the portfolio page.
- `src/content/portfolio/projects.ts`
  Structured featured projects shown on home/portfolio surfaces.
- `src/content/portfolio/publications.ts`
  Structured publications/talks/public outputs.
- `src/content/now/index.en.md`
  English current-focus summary.
- `src/content/now/index.pt-br.md`
  Portuguese current-focus summary.
- `src/pages/portfolio/index.astro`
  English portfolio page shell, including the CV download button target.
- `src/pages/pt-br/portfolio/index.astro`
  Portuguese portfolio page shell, including the CV download button target.
- `src/pages/rss.xml.ts`
  English RSS metadata fallback site URL.
- `src/pages/notes/rss.xml.ts`
  Notes RSS metadata fallback site URL.
- `src/components/home/ContactSection.astro`
  Removed homepage component that may still hold placeholder public links and should not be left stale if retained in the repo.
- `tests/e2e/home.spec.ts`
  Existing homepage/footer assertions that should still pass after content changes.
- `tests/e2e/portfolio.spec.ts`
  Existing portfolio page sanity checks for about/timeline/project surfaces.
- `tests/e2e/blog.spec.ts`
  Existing blog page assertions that cover author block rendering and post metadata surfaces.

## Source Priority Rules

Use the following order when facts differ:
1. `docs/superpowers/specs/personal-information.md` for working-session consolidated facts
2. CV for degree names, timeline details, role naming, and formal credentials
3. LinkedIn for current public role framing and public-facing wording
4. Old website only as supporting source for older public phrasing or links not present elsewhere

If a claim is still ambiguous after checking those sources, soften or omit it rather than guessing.

## Task 1: Audit Current Placeholder and Demo Content

**Files:**
- Read: `docs/superpowers/specs/2026-03-23-personal-content-refresh-design.md`
- Read: `docs/superpowers/specs/personal-information.md`
- Read: `src/components/home/Hero.astro`
- Read: `src/pages/index.astro`
- Read: `src/pages/pt-br/index.astro`
- Read: `src/components/site/Footer.astro`
- Read: `src/content/portfolio/about.en.md`
- Read: `src/content/portfolio/about.pt-br.md`
- Read: `src/content/portfolio/experience.ts`
- Read: `src/content/portfolio/projects.ts`
- Read: `src/content/portfolio/publications.ts`
- Read: `src/content/now/index.en.md`
- Read: `src/content/now/index.pt-br.md`
- Read: `src/pages/portfolio/index.astro`
- Read: `src/pages/pt-br/portfolio/index.astro`
- Read: `src/pages/blog/[slug].astro`
- Read: `src/pages/pt-br/blog/[slug].astro`
- Read: `src/pages/rss.xml.ts`
- Read: `src/pages/notes/rss.xml.ts`
- Read: `src/components/home/ContactSection.astro`

- [ ] **Step 1: Enumerate unresolved placeholder/demo values**

Run:
```bash
rg -n "example|/example|Acme|Tech Solutions|contact@example.com|linkedin.com/in/example|github.com/example|Senior Software Engineer & Educator" src
```

Expected: a concise list of current placeholders/demo entries to replace or verify.

- [ ] **Step 2: Create a working replacement checklist**

Write down, in implementation notes or task scratchpad, the exact values needed for:
- email
- LinkedIn
- GitHub
- visible name format
- homepage role/supporting line
- education labels
- timeline entries
- featured projects
- publications/talks
- now-page focus items

- [ ] **Step 3: Sanity-check that no layout changes are required**

Confirm from the spec and existing components that this task is copy/data only:
- no new components
- no route changes
- no schema redesign unless a factual field is impossible to represent

- [ ] **Step 4: Commit audit notes only if they live in tracked files**

If no tracked file changed, skip commit.

## Task 2: Replace Public Identity and Contact Endpoints

**Files:**
- Modify: `src/components/home/Hero.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/pt-br/index.astro`
- Modify: `src/components/site/Footer.astro`
- Modify: `src/pages/portfolio/index.astro`
- Modify: `src/pages/pt-br/portfolio/index.astro`
- Modify: `src/pages/blog/[slug].astro`
- Modify: `src/pages/pt-br/blog/[slug].astro`
- Modify: `src/pages/rss.xml.ts`
- Modify: `src/pages/notes/rss.xml.ts`
- Modify: `src/components/home/ContactSection.astro`
- Test: `tests/e2e/home.spec.ts`
- Test: `tests/e2e/blog.spec.ts`

- [ ] **Step 1: Update or add failing assertions only if current tests are too weak**

Inspect `tests/e2e/home.spec.ts` and strengthen only the assertions that matter for this task:
- hero social links should still expose `mailto:`, LinkedIn, and GitHub
- footer social links should still exist and point to non-placeholder destinations when practical to assert
- homepage CV download link should still target `/assets/cv/jonathan-cv.pdf`

Prefer targeted attribute checks over brittle text snapshots.

Inspect `tests/e2e/blog.spec.ts` and add or tighten only the assertions needed to protect the author block identity surface if current coverage is too loose.
Create or update a focused assertion for the rendered author subtitle so this task has a real red/green loop.

Inspect `tests/e2e/portfolio.spec.ts` and add a dedicated CV download href assertion if the portfolio page is not already covered.

Run only the already-existing baseline checks before adding the new assertions. After the assertions are added, use the new focused grep targets for the red/green loop.

- [ ] **Step 2: Run the focused homepage/footer tests before editing**

Run:
```bash
pnpm exec playwright test tests/e2e/home.spec.ts --grep "hero social contact row|footer brand row|footer legal row|CV download link is correct"
pnpm exec playwright test tests/e2e/blog.spec.ts --grep "blog post shows reading time in header|blog post: share buttons are visible"
```

Expected:
- homepage/footer checks PASS on current baseline
- existing blog post checks PASS on current baseline
- newly added portfolio CV and blog author-subtitle assertions are not run until after they are written

- [ ] **Step 3: Replace placeholder links and visible identity data**

Edit `src/components/home/Hero.astro`:
- replace placeholder `mailto:` target
- replace placeholder LinkedIn URL
- replace placeholder GitHub URL
- keep role/title positioning aligned with the approved spec

Edit `src/pages/index.astro` and `src/pages/pt-br/index.astro`:
- validate that homepage-level hero props and CV download wiring stay aligned with the refreshed public identity surface
- update only if those wrappers still carry stale positioning or CV-target assumptions

Edit `src/components/site/Footer.astro`:
- replace placeholder LinkedIn URL
- replace placeholder GitHub URL
- replace placeholder `mailto:` target
- confirm visible name formatting is correct
- keep RSS/legal links unchanged unless the factual identity spec requires otherwise

Edit `src/pages/blog/[slug].astro` and `src/pages/pt-br/blog/[slug].astro`:
- replace the outdated author subtitle so it matches the approved positioning
- keep visible author name/avatar behavior unchanged unless factual identity requires adjustment

Edit `src/pages/portfolio/index.astro` and `src/pages/pt-br/portfolio/index.astro`:
- validate that the portfolio CV download buttons point to `/assets/cv/jonathan-cv.pdf`
- update the href if it differs from the canonical asset

Edit `src/pages/rss.xml.ts` and `src/pages/notes/rss.xml.ts`:
- replace placeholder `https://example.com` fallback site values with the real production site URL

Edit `src/components/home/ContactSection.astro`:
- replace stale placeholder public links if the file remains in the repository, even if the component is currently unused

- [ ] **Step 4: Run the focused homepage/footer tests again**

Run:
```bash
pnpm exec playwright test tests/e2e/home.spec.ts --grep "hero social contact row|footer brand row|footer legal row|CV download link is correct"
pnpm exec playwright test tests/e2e/portfolio.spec.ts --grep "portfolio CV download link is correct"
pnpm exec playwright test tests/e2e/blog.spec.ts --grep "blog post author subtitle matches homepage positioning"
pnpm build
rg -n "example.com" dist/rss.xml dist/notes/rss.xml
```

Expected:
- Playwright checks PASS
- portfolio CV download check PASS
- `pnpm build` succeeds
- `rg -n "example.com" dist/rss.xml dist/notes/rss.xml` returns no matches

- [ ] **Step 5: Commit the identity/contact cleanup**

```bash
git add src/components/home/Hero.astro src/pages/index.astro src/pages/pt-br/index.astro src/components/site/Footer.astro src/pages/portfolio/index.astro src/pages/pt-br/portfolio/index.astro src/pages/blog/[slug].astro src/pages/pt-br/blog/[slug].astro src/pages/rss.xml.ts src/pages/notes/rss.xml.ts src/components/home/ContactSection.astro tests/e2e/home.spec.ts tests/e2e/portfolio.spec.ts tests/e2e/blog.spec.ts
git commit -m "feat(content): replace public identity placeholders"
```

## Task 3: Refresh Homepage Positioning Copy

**Files:**
- Modify: `src/components/home/Hero.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/pt-br/index.astro`
- Test: `tests/e2e/home.spec.ts`

- [ ] **Step 1: Add or adjust assertions for the hero copy contract**

Ensure `tests/e2e/home.spec.ts` checks behavior, not exact marketing prose:
- hero label or equivalent visible role anchor exists
- hero tagline/supporting line is present
- achievement box count remains 4 unless intentionally reduced by spec-backed decision

Only add exact text assertions for stable role anchors like `Senior Embedded Software Engineer`.

- [ ] **Step 2: Run the focused hero tests before editing**

Run:
```bash
pnpm exec playwright test tests/e2e/home.spec.ts --grep "hero renders name|hero CTA area|pt-br hero tagline|hero has two-column layout"
```

Expected: PASS on current baseline.

- [ ] **Step 3: Rewrite homepage role/supporting content**

In `src/components/home/Hero.astro`:
- keep the primary role anchored to `Senior Embedded Software Engineer`
- rewrite the supporting/tagline copy so it emphasizes complex embedded software and systems problem-solving
- include a visible quick credibility signal for the M.Sc. on the homepage
- if the current hero sublayout cannot hold that cue in the intended spot, place it in the nearest existing hero credibility surface without introducing layout redesign
- keep AI/cybersecurity off the homepage headline/supporting line
- validate each achievement box against `personal-information.md`; replace uncertain numeric claims with defensible signals if needed

In `src/pages/index.astro` and `src/pages/pt-br/index.astro`:
- update `typewriterPrefix` and `typewriterPhrases` so the rotating text aligns with the approved homepage positioning
- keep the phrases specific to embedded software, systems, and leadership-capable delivery
- remove generic lines that weaken the role anchor

- [ ] **Step 4: Re-run focused hero tests**

Run:
```bash
pnpm exec playwright test tests/e2e/home.spec.ts --grep "hero renders name|hero CTA area|pt-br hero tagline|hero has two-column layout"
```

Expected: PASS after the copy refresh.

- [ ] **Step 5: Commit the homepage content pass**

```bash
git add src/components/home/Hero.astro src/pages/index.astro src/pages/pt-br/index.astro tests/e2e/home.spec.ts
git commit -m "feat(content): refresh homepage positioning copy"
```

## Task 4: Rewrite Portfolio About Copy in Both Locales

**Files:**
- Modify: `src/content/portfolio/about.en.md`
- Modify: `src/content/portfolio/about.pt-br.md`
- Test: `tests/e2e/portfolio.spec.ts`

- [ ] **Step 1: Review current portfolio page assertions**

Inspect `tests/e2e/portfolio.spec.ts` and confirm there are no overly specific text assertions that will fail on legitimate copy changes.

- [ ] **Step 2: Run portfolio smoke tests before editing**

Run:
```bash
pnpm exec playwright test tests/e2e/portfolio.spec.ts --grep "portfolio page loads|about section shows image or placeholder"
```

Expected: PASS on current baseline.

- [ ] **Step 3: Rewrite the English and Portuguese summaries**

In both about files:
- anchor identity to Senior Embedded Software Engineer
- describe hands-on embedded software/system expertise
- mention technical leadership and people/project management experience
- mention the M.Sc. briefly
- keep broader R&D scope as support, not the lead
- make the English sound native and the Portuguese sound native, rather than mirroring line-for-line

- [ ] **Step 4: Re-run the focused portfolio smoke tests**

Run:
```bash
pnpm exec playwright test tests/e2e/portfolio.spec.ts --grep "portfolio page loads|about section shows image or placeholder"
```

Expected: PASS with the new summary content rendered correctly.

- [ ] **Step 5: Commit the about-page rewrite**

```bash
git add src/content/portfolio/about.en.md src/content/portfolio/about.pt-br.md
git commit -m "feat(content): rewrite portfolio about copy"
```

## Task 5: Replace Structured Experience Timeline With Real Profile Data

**Files:**
- Modify: `src/content/portfolio/experience.ts`
- Test: `tests/e2e/portfolio.spec.ts`
- Test: `tests/unit/content/contracts.test.ts`

- [ ] **Step 1: Write or adjust a focused content contract test if needed**

If the current unit coverage does not protect the timeline data shape, add a small assertion to `tests/unit/content/contracts.test.ts` that the experience collection remains valid after replacing entries.

- [ ] **Step 2: Run the focused contract and portfolio timeline tests before editing**

Run:
```bash
pnpm test:unit
pnpm exec playwright test tests/e2e/portfolio.spec.ts --grep "portfolio unified timeline shows work and education entries"
```

Expected: PASS on current baseline.

- [ ] **Step 3: Replace demo timeline entries with real public data**

Update `src/content/portfolio/experience.ts` to reflect:
- real roles and institutions Jonathan is comfortable publishing
- accurate dates
- concise, defensible descriptions
- work plus education entries
- explicit education entries for:
  - M.Sc. in Electrical and Computer Engineering
  - Bachelor's degree in Electrical Engineering
  - Technical degree in Administration
- replacement of the current incorrect placeholder degree/institution data

Keep descriptions structured, scannable, and consistent across locales.

- [ ] **Step 4: Re-run focused timeline validation**

Run:
```bash
pnpm test:unit
pnpm exec playwright test tests/e2e/portfolio.spec.ts --grep "portfolio unified timeline shows work and education entries"
```

Expected: PASS with the updated real data.

- [ ] **Step 5: Commit the timeline refresh**

```bash
git add src/content/portfolio/experience.ts tests/unit/content/contracts.test.ts
git commit -m "feat(content): replace portfolio timeline data"
```

## Task 6: Replace Featured Projects and Publications

**Files:**
- Modify: `src/content/portfolio/projects.ts`
- Modify: `src/content/portfolio/publications.ts`
- Test: `tests/e2e/home.spec.ts`
- Test: `tests/e2e/portfolio.spec.ts`
- Test: `tests/unit/content/contracts.test.ts`

- [ ] **Step 1: Add focused tests only if real-data constraints require it**

Protect against obvious regressions:
- project cards still render
- publication row/list still renders
- structured content still satisfies expected schema

Do not add brittle exact-title snapshots unless a real title is part of the public contract.

- [ ] **Step 2: Run the focused project/publication checks before editing**

Run:
```bash
pnpm test:unit
pnpm exec playwright test tests/e2e/home.spec.ts --grep "projects section shows 3 project cards|publications section renders a horizontal card row|publications section has \"see all\" link to portfolio"
pnpm exec playwright test tests/e2e/portfolio.spec.ts --grep "portfolio bento grid renders project cards"
```

Expected: PASS on current baseline.

- [ ] **Step 3: Replace demo entries with real or truthfully generalized public entries**

In `src/content/portfolio/projects.ts`:
- replace generic examples with real projects or truthful generalized descriptions
- keep the count and card structure compatible with existing UI/tests
- ensure roles, dates, tags, and status are defensible

In `src/content/portfolio/publications.ts`:
- replace fake examples with real publications, talks, or public technical outputs
- prefer fewer real items over filler

- [ ] **Step 4: Re-run the focused project/publication checks**

Run:
```bash
pnpm test:unit
pnpm exec playwright test tests/e2e/home.spec.ts --grep "projects section shows 3 project cards|publications section renders a horizontal card row|publications section has \"see all\" link to portfolio"
pnpm exec playwright test tests/e2e/portfolio.spec.ts --grep "portfolio bento grid renders project cards"
```

Expected: PASS with the refreshed structured content.

- [ ] **Step 5: Commit the projects/publications refresh**

```bash
git add src/content/portfolio/projects.ts src/content/portfolio/publications.ts tests/unit/content/contracts.test.ts
git commit -m "feat(content): replace project and publication demos"
```

## Task 7: Refresh the Now Page Copy

**Files:**
- Modify: `src/content/now/index.en.md`
- Modify: `src/content/now/index.pt-br.md`
- Test: `tests/e2e/now.spec.ts`

- [ ] **Step 1: Run the now-page tests before editing**

Run:
```bash
pnpm exec playwright test tests/e2e/now.spec.ts
```

Expected: PASS on current baseline.

- [ ] **Step 2: Rewrite the now-page entries**

Update both locale files so they:
- reflect Jonathan's current professional/technical focus
- remain consistent with the broader personal-site positioning
- avoid stale references to building the site itself unless still true and intentional

- [ ] **Step 3: Re-run the now-page tests**

Run:
```bash
pnpm exec playwright test tests/e2e/now.spec.ts
```

Expected: PASS with the refreshed content.

- [ ] **Step 4: Commit the now-page refresh**

```bash
git add src/content/now/index.en.md src/content/now/index.pt-br.md
git commit -m "feat(content): refresh now page content"
```

## Task 8: Full Content Sweep for Leftover Placeholders

**Files:**
- Read/Modify as needed: `src/components/**`
- Read/Modify as needed: `src/content/**`
- Test: `tests/e2e/home.spec.ts`
- Test: `tests/e2e/portfolio.spec.ts`
- Test: `tests/e2e/blog.spec.ts`

- [ ] **Step 1: Search for leftover placeholder values**

Run:
```bash
rg -n "example|/example|Acme|Tech Solutions|contact@example.com|linkedin.com/in/example|github.com/example|Senior Software Engineer & Educator" src
```

Expected: no matches, or only intentionally retained values that are not user-facing placeholders.

- [ ] **Step 2: Remove any remaining user-facing placeholders**

Clean up any stragglers discovered in components, content, metadata, or author surfaces.

- [ ] **Step 3: Re-run focused smoke checks**

Run:
```bash
pnpm exec playwright test tests/e2e/home.spec.ts --grep "homepage exposes|hero social contact row|footer"
pnpm exec playwright test tests/e2e/portfolio.spec.ts
pnpm exec playwright test tests/e2e/blog.spec.ts --grep "blog post author subtitle matches homepage positioning"
```

Expected: PASS with no placeholder regressions.

- [ ] **Step 4: Commit the cleanup if tracked files changed**

```bash
git add [exact paths returned by the placeholder sweep]
git commit -m "chore(content): remove leftover placeholders"
```

Skip this commit if the search yields no additional changes.

## Task 9: Final Verification

**Files:**
- Verify entire edited surface

- [ ] **Step 1: Run the full unit suite**

Run:
```bash
pnpm test:unit
```

Expected: all unit tests pass.

- [ ] **Step 2: Run Astro checks**

Run:
```bash
pnpm check
```

Expected: no errors; existing non-blocking hints may remain acceptable if unchanged.

- [ ] **Step 3: Run the full end-to-end suite**

Run:
```bash
pnpm test
```

Expected: full suite passes in the verified execution environment.

- [ ] **Step 4: Review git diff for factual and editorial consistency**

Run:
```bash
git status --short
git diff --stat
git diff -- src/components/home/Hero.astro src/pages/index.astro src/pages/pt-br/index.astro src/components/site/Footer.astro src/pages/portfolio/index.astro src/pages/pt-br/portfolio/index.astro src/pages/blog/[slug].astro src/pages/pt-br/blog/[slug].astro src/pages/rss.xml.ts src/pages/notes/rss.xml.ts src/components/home/ContactSection.astro src/content/portfolio/about.en.md src/content/portfolio/about.pt-br.md src/content/portfolio/experience.ts src/content/portfolio/projects.ts src/content/portfolio/publications.ts src/content/now/index.en.md src/content/now/index.pt-br.md
```

Expected: only intended content-refresh changes remain.

- [ ] **Step 5: Create a final implementation commit if needed**

If prior task commits already leave the branch in a clean, intentional state, skip this step. Otherwise:

```bash
git add [exact remaining changed files from this content refresh only]
git commit -m "feat(content): complete personal site content refresh"
```
