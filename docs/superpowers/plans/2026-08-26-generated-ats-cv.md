# Generated ATS-Friendly CV Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate one public generic CV and three private role-specific CVs from the website's canonical career data while improving portfolio content and enforcing ATS, privacy, and two-page quality gates.

**Architecture:** Normalize portfolio facts behind a Zod-validated career model, adapt that model to the existing website, and resolve deterministic CV profiles into a presentation-neutral view model. Render the view model as semantic single-column HTML, print it through Playwright/Chromium, normalize metadata with `pdf-lib`, and verify extraction and structure with PDF.js locally plus Poppler in CI. Only the generic profile may enter `public/`; private profiles are constrained to `.cv-output/`.

**Tech Stack:** Astro 6, TypeScript, Zod 4, Playwright/Chromium, PDF.js (`pdfjs-dist`), `pdf-lib`, Vitest, Playwright Test, Poppler, pnpm, GitHub Actions

---

## Working Context

- Execute in the existing worktree: `/home/jonathan/Projects/jts-website/.worktrees/generated-ats-cv`
- Branch: `feat/generated-ats-cv`
- Approved design: `docs/superpowers/specs/2026-08-26-generated-ats-cv-design.md`
- Preserve the stable public URL: `/assets/cv/jonathan-cv.pdf`
- Use `@superpowers:test-driven-development` for Tasks 1-9.
- Use `@superpowers:verification-before-completion` before Task 11 is declared complete.
- Do not invent professional facts, metrics, titles, dates, or outcomes. Record unresolved source conflicts in the factual-review document and pause for Jonathan's decision at the stated checkpoint.

## Planned File Structure

### Canonical career domain

- Create `src/content/portfolio/schema.ts` — Zod schemas and inferred domain types.
- Create `src/content/portfolio/person.ts` — identity, contact links, and public positioning.
- Rewrite `src/content/portfolio/experience.ts` — employers and distinct work positions.
- Create `src/content/portfolio/education.ts` — education records.
- Create `src/content/portfolio/skills.ts` — curated competency groups and skills.
- Modify `src/content/portfolio/projects.ts` — stable IDs, themes, and verified highlights.
- Modify `src/content/portfolio/publications.ts` — structured citation fields.
- Create `src/content/portfolio/career.ts` — aggregate and parse the canonical dataset once.
- Replace `src/content/portfolio/types.ts` with re-exports from the schema during migration, then remove it after consumers move.
- Create `src/lib/career/website.ts` — locale-aware adapters for timeline and skill consumers.
- Create `src/lib/career/quality.ts` — non-blocking content-quality diagnostics.

### CV domain

- Create `src/lib/cv/types.ts` — profile IDs, resolved sections, and verification result types.
- Create `src/lib/cv/profiles.ts` — four deterministic profile definitions.
- Create `src/lib/cv/resolve.ts` — pure selection, ordering, and deduplication.
- Create `src/lib/cv/output-policy.ts` — the only profile-to-output-path authority.
- Create `src/lib/cv/print-styles.ts` — A4, single-column, ATS-safe print CSS.
- Create `src/lib/cv/render.ts` — semantic HTML renderer.
- Create `src/lib/cv/pdf.ts` — Playwright generation, font embedding, and metadata normalization.
- Create `src/lib/cv/verify.ts` — PDF.js structural and extraction checks.
- Create `src/lib/cv/generate.ts` — orchestration with temporary files and atomic replacement.
- Create `scripts/generate-cv.ts` — non-interactive CLI.
- Create `scripts/check-cv-poppler.ts` — independent CI extraction check.
- Create `scripts/check-cv-dist.ts` — deploy-output privacy check.

### Website consumers

- Modify `src/components/home/Hero.astro` and `src/components/site/Footer.astro` — canonical contact data.
- Modify `src/lib/seo/schema.ts` — canonical identity and links.
- Modify `src/components/portfolio/TimelineItem.astro` — normalized website timeline view.
- Modify `src/components/portfolio/SkillsCloud.astro` — curated skills.
- Modify `src/components/portfolio/ProjectCard.astro` and `PublicationItem.astro` — normalized entities.
- Modify both portfolio pages and `HomeSections.astro` — canonical aggregate imports.
- Remove `src/lib/skills.ts` after all consumers migrate.
- Modify `src/content/portfolio/about.en.md` and `about.pt-br.md` only with verified wording.

### Tests, automation, and documentation

- Create focused unit suites under `tests/unit/career/` and `tests/unit/cv/`.
- Create `tests/integration/cv-generation.test.ts`.
- Create `tests/e2e/cv.spec.ts` and its approved screenshot.
- Modify existing portfolio, home, project, skill, and SEO tests.
- Modify `package.json`, `pnpm-lock.yaml`, `.gitignore`, and `.github/workflows/pipeline.yml`.
- Delete the tracked `public/assets/cv/jonathan-cv.pdf` after generation works.
- Create `docs/cv/factual-review.md` and `docs/cv/operations.md`.
- Modify `README.md`.

## Task 1: Define the canonical career contract

**Files:**
- Create: `src/content/portfolio/schema.ts`
- Test: `tests/unit/career/schema.test.ts`

- [ ] **Step 1: Write the failing schema tests**

Cover localized strings, stable IDs, date precision, URL validation, CV text fallback, duplicate IDs, and end-before-start dates.

```ts
import { describe, expect, it } from 'vitest';
import { careerDateRangeSchema, careerHighlightSchema } from '../../../src/content/portfolio/schema';

describe('career schema', () => {
  it('accepts a verified highlight with optional CV wording', () => {
    expect(careerHighlightSchema.parse({
      id: 'reduced-test-time',
      webText: { en: 'Reduced manual testing time.', 'pt-br': 'Reduziu o tempo de testes manuais.' },
      cvText: 'Reduced manual testing time through internal automation tools.',
      themes: ['devops'],
      priority: 80,
    }).cvText).toContain('automation');
  });

  it('rejects an end date before a start date', () => {
    expect(() => careerDateRangeSchema.parse({
      start: { value: '2025-01', precision: 'month' },
      end: { value: '2024-12', precision: 'month' },
    })).toThrow(/end date/i);
  });
});
```

- [ ] **Step 2: Run the tests and confirm the missing-module failure**

Run: `pnpm test:unit tests/unit/career/schema.test.ts`  
Expected: FAIL because `src/content/portfolio/schema.ts` does not exist.

- [ ] **Step 3: Implement focused Zod schemas and inferred types**

Use explicit enums and discriminated records. Keep validation in the schema rather than scattering assertions across data files.

```ts
import { z } from 'zod';

export const localeSchema = z.enum(['en', 'pt-br']);
export const localizedStringSchema = z.object({
  en: z.string().trim().min(1),
  'pt-br': z.string().trim().min(1),
});
export const themeSchema = z.enum(['general', 'embedded', 'research', 'leadership', 'devops']);
export const careerHighlightSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  webText: localizedStringSchema,
  cvText: z.string().trim().min(1).optional(),
  themes: z.array(themeSchema).min(1),
  priority: z.number().int().min(0).max(100),
});
export const careerDateSchema = z.object({
  value: z.string().regex(/^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/),
  precision: z.enum(['year', 'month']),
}).superRefine((date, ctx) => {
  if (date.precision === 'year' && date.value.length !== 4) ctx.addIssue({ code: 'custom', message: 'year precision requires YYYY' });
  if (date.precision === 'month' && date.value.length !== 7) ctx.addIssue({ code: 'custom', message: 'month precision requires YYYY-MM' });
});

export const careerDateRangeSchema = z.object({
  start: careerDateSchema,
  end: careerDateSchema.optional(),
}).superRefine(({ start, end }, ctx) => {
  const startMonth = start.precision === 'year' ? `${start.value}-01` : start.value;
  const endMonth = end?.precision === 'year' ? `${end.value}-12` : end?.value;
  if (endMonth && endMonth < startMonth) ctx.addIssue({ code: 'custom', message: 'end date precedes start date' });
});
```

Define `Person`, `Employer`, `WorkPosition`, `Education`, `Project`, `Publication`, `SkillGroup`, and `CareerData` schemas. Add an aggregate `superRefine` for unique IDs, known employer references, and chronological ranges.

- [ ] **Step 4: Run the focused tests**

Run: `pnpm test:unit tests/unit/career/schema.test.ts`  
Expected: PASS.

- [ ] **Step 5: Run type checking**

Run: `pnpm check`  
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/content/portfolio/schema.ts tests/unit/career/schema.test.ts
git commit -m "feat(cv): define canonical career contract"
```

## Task 2: Migrate career facts into the canonical model

**Files:**
- Create: `src/content/portfolio/person.ts`
- Rewrite: `src/content/portfolio/experience.ts`
- Create: `src/content/portfolio/education.ts`
- Create: `src/content/portfolio/skills.ts`
- Modify: `src/content/portfolio/projects.ts`
- Modify: `src/content/portfolio/publications.ts`
- Create: `src/content/portfolio/career.ts`
- Modify: `src/content/portfolio/types.ts`
- Create: `docs/cv/factual-review.md`
- Test: `tests/unit/career/data.test.ts`

- [ ] **Step 1: Write failing canonical-data tests**

```ts
import { describe, expect, it } from 'vitest';
import { career } from '../../../src/content/portfolio/career';

describe('canonical career data', () => {
  it('contains the public identity and stable contact links', () => {
    expect(career.person.fullName).toBe('Jonathan Tobias da Silva');
    expect(career.person.links.map(link => link.kind)).toEqual(expect.arrayContaining(['email', 'website', 'linkedin', 'github']));
  });

  it('models Nova Smar progression as distinct positions', () => {
    expect(career.positions.filter(position => position.employerId === 'nova-smar').length).toBeGreaterThan(1);
  });

  it('has no duplicate entity or highlight IDs', () => {
    const ids = [
      career.person.id,
      ...career.employers.map(item => item.id),
      ...career.positions.flatMap(item => [item.id, ...item.highlights.map(highlight => highlight.id)]),
      ...career.education.flatMap(item => [item.id, ...item.highlights.map(highlight => highlight.id)]),
      ...career.projects.flatMap(item => [item.id, ...item.highlights.map(highlight => highlight.id)]),
      ...career.publications.map(item => item.id),
      ...career.skillGroups.flatMap(group => [group.id, ...group.skills.map(skill => skill.id)]),
    ];
    expect(ids.length).toBe(new Set(ids).size);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm test:unit tests/unit/career/data.test.ts`  
Expected: FAIL because the aggregate does not exist.

- [ ] **Step 3: Add identity, contact, and positioning data**

Move the name, location, email, website, LinkedIn, GitHub, and ORCID values from the existing site/PDF into `person.ts`. Store link labels separately from URLs so the PDF can show readable text. Keep public generic positioning as Senior Embedded/R&D Engineer with leadership and DevOps signals.

- [ ] **Step 4: Migrate experience and education without rewriting facts**

Create stable employer IDs (`act-digital`, `schneider-electric`, `datacom`, `nova-smar`) and separate work-position IDs. Preserve the current website's dates and claims first. Represent Nova Smar's known progression from the current PDF as separate provisional positions, and record every title/date discrepancy between the website and legacy PDF in `docs/cv/factual-review.md`.

The review table must include columns `Entity`, `Website value`, `Legacy PDF value`, `Proposed canonical value`, `Owner decision`, and `Status`. Do not mark unresolved conflicts approved.

- [ ] **Step 5: Migrate projects, publications, and curated skills**

Add stable IDs and theme tags to every existing project. Preserve all current bilingual descriptions and links. Convert publication strings into structured authors, venue, year/date, type, and link fields. Create curated skill groups for languages, embedded/platforms, networking/protocols, DevOps/tooling, leadership, and research; do not derive rank from occurrence counts.

- [ ] **Step 6: Parse the aggregate exactly once**

```ts
import { careerDataSchema } from './schema';
import { person } from './person';
import { employers, positions } from './experience';
import { education } from './education';
import { projects } from './projects';
import { publications } from './publications';
import { skillGroups } from './skills';

export const career = careerDataSchema.parse({ person, employers, positions, education, projects, publications, skillGroups });
```

Temporarily re-export inferred types from `types.ts` so existing Astro consumers remain buildable until Task 3. Also export a read-only legacy `experience` view derived from the canonical positions and education—never a second hand-maintained array—so the existing pages and `getSkills` continue to compile between commits. Mark the adapter for deletion in Task 3.

- [ ] **Step 7: Run validation and existing tests**

Run: `pnpm test:unit tests/unit/career/schema.test.ts tests/unit/career/data.test.ts tests/unit/projects.test.ts tests/unit/skills.test.ts`  
Expected: all focused tests PASS through the temporary derived compatibility view.

Run: `pnpm check`  
Expected: 0 errors.

Run: `pnpm test:unit`  
Expected: all baseline unit tests PASS before committing.

- [ ] **Step 8: Commit the factual migration separately**

```bash
git add src/content/portfolio docs/cv/factual-review.md tests/unit/career/data.test.ts
git commit -m "refactor(portfolio): normalize canonical career data"
```

### Factual Review Checkpoint

Pause and ask Jonathan to resolve every `Status: Pending` row in `docs/cv/factual-review.md` before Task 9 generates the public asset or replaces the legacy PDF. Structural work in Tasks 3-8 may proceed, but unverified values must not be presented as confirmed outcomes.

## Task 3: Adapt the existing website to canonical career data

**Files:**
- Create: `src/lib/career/website.ts`
- Modify: `src/components/portfolio/TimelineItem.astro`
- Modify: `src/components/portfolio/SkillsCloud.astro`
- Modify: `src/components/portfolio/ProjectCard.astro`
- Modify: `src/components/portfolio/PublicationItem.astro`
- Modify: `src/pages/portfolio/index.astro`
- Modify: `src/pages/pt-br/portfolio/index.astro`
- Modify: `src/components/home/HomeSections.astro`
- Delete: `src/lib/skills.ts`
- Modify: `tests/unit/projects.test.ts`
- Modify: `tests/unit/skills.test.ts`
- Create: `tests/unit/career/website.test.ts`
- Modify: `tests/e2e/portfolio.spec.ts`

- [ ] **Step 1: Rewrite failing website-adapter tests**

Test that timeline rows are reverse chronological, work and education both appear, distinct Nova Smar roles remain adjacent, localized highlights resolve correctly, and curated skills retain declared group/priority order.

```ts
const timeline = getWebsiteTimeline(career, 'en');
expect(timeline[0]?.kind).toBe('work');
expect(timeline.filter(item => item.employerId === 'nova-smar').length).toBeGreaterThan(1);
expect(getWebsiteSkills(career).map(skill => skill.id)).toEqual(expect.arrayContaining(['cpp', 'embedded-linux', 'cicd']));
```

- [ ] **Step 2: Run focused tests and confirm failures**

Run: `pnpm test:unit tests/unit/projects.test.ts tests/unit/skills.test.ts tests/unit/career/website.test.ts`  
Expected: FAIL because the adapters do not exist and old skill-frequency assertions no longer apply.

- [ ] **Step 3: Implement locale-aware website adapters**

Return small view types instead of exposing schema internals to Astro components. Format `YYYY-MM` as `MM/YYYY`, `YYYY` as `YYYY`, and open-ended work as `Present`/`Atual`.

- [ ] **Step 4: Update portfolio and homepage consumers**

Import the parsed `career` aggregate and adapters. Keep current class names, route behavior, card selection, and analytics hooks unless a schema change requires a focused adjustment. Render role progression as distinct timeline items and curated skills as grouped/prioritized pills.

- [ ] **Step 5: Remove the frequency-based skill helper and compatibility type file**

Delete `src/lib/skills.ts` only after `rg "getSkills|content/portfolio/types" src tests` returns no consumers. Delete `types.ts` once every import uses inferred schema types.

- [ ] **Step 6: Run website regression checks**

Run: `pnpm test:unit tests/unit/projects.test.ts tests/unit/skills.test.ts tests/unit/career`  
Expected: PASS.

Run: `pnpm build`  
Expected: PASS and refresh `dist/` for the preview-based E2E server.

Run: `pnpm test:e2e tests/e2e/portfolio.spec.ts tests/e2e/home.spec.ts`  
Expected: PASS with existing public CV link behavior unchanged.

Run: `pnpm check`  
Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/career src/components/portfolio src/components/home/HomeSections.astro src/pages/portfolio src/pages/pt-br/portfolio tests/unit tests/e2e/portfolio.spec.ts
git add -u src/lib/skills.ts src/content/portfolio/types.ts
git commit -m "refactor(portfolio): render canonical career data"
```

## Task 4: Centralize identity and contact consumers

**Files:**
- Modify: `src/components/home/Hero.astro`
- Modify: `src/components/site/Footer.astro`
- Modify: `src/lib/seo/schema.ts`
- Modify: `tests/unit/seo-metadata.test.ts`
- Modify: `tests/e2e/home.spec.ts`
- Modify: `tests/e2e/analytics-consent.spec.ts`

- [ ] **Step 1: Add failing assertions that consumers use canonical values**

Test `generatePersonSchema(career.person)` rather than duplicated constants. Preserve the exact current public email, LinkedIn, and GitHub URLs in E2E assertions.

- [ ] **Step 2: Run the tests and confirm the signature failure**

Run: `pnpm test:unit tests/unit/seo-metadata.test.ts`  
Expected: FAIL because `generatePersonSchema` does not accept canonical identity data.

- [ ] **Step 3: Pass canonical identity into website and SEO consumers**

Add small helpers such as `getPersonLink(person, 'linkedin')` that throw on missing required links. Do not centralize legal-page contact text in this task; those pages are outside the career/CV rendering path and can keep their current literal address.

- [ ] **Step 4: Run focused and E2E tests**

Run: `pnpm test:unit tests/unit/seo-metadata.test.ts`  
Expected: PASS.

Run: `pnpm build`  
Expected: PASS and refresh `dist/` for the preview-based E2E server.

Run: `pnpm test:e2e tests/e2e/home.spec.ts tests/e2e/analytics-consent.spec.ts`  
Expected: PASS with analytics metadata unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/Hero.astro src/components/site/Footer.astro src/lib/seo/schema.ts tests/unit/seo-metadata.test.ts tests/e2e/home.spec.ts tests/e2e/analytics-consent.spec.ts
git commit -m "refactor(site): centralize professional contact data"
```

## Task 5: Resolve deterministic CV profiles

**Files:**
- Create: `src/lib/cv/types.ts`
- Create: `src/lib/cv/profiles.ts`
- Create: `src/lib/cv/resolve.ts`
- Test: `tests/unit/cv/profiles.test.ts`
- Test: `tests/unit/cv/resolve.test.ts`

- [ ] **Step 1: Write failing profile-contract tests**

Assert exactly four IDs, English-only summaries, the approved generic headline, profile differentiation, explicit section ordering, and per-section limits.

```ts
expect(Object.keys(cvProfiles).sort()).toEqual(['devops', 'embedded-rd', 'generic', 'leadership']);
expect(cvProfiles.generic.headline).toContain('Embedded');
expect(cvProfiles.leadership.themeOrder[0]).toBe('leadership');
```

- [ ] **Step 2: Write failing resolver tests**

Use a minimal fixture to prove stable sorting, CV-text fallback, highlight-theme selection, deduplication, skill ordering, and exclusion of low-priority entities when limits are reached.

```ts
const view = resolveCv(career, cvProfiles['embedded-rd']);
expect(view.profileId).toBe('embedded-rd');
const highlightIds = view.experience.flatMap(role => role.highlights.map(highlight => highlight.id));
expect(new Set(highlightIds).size).toBe(highlightIds.length);
expect(view.sections.map(section => section.kind)).toEqual(cvProfiles['embedded-rd'].sectionOrder);
```

- [ ] **Step 3: Run the tests and confirm missing-module failures**

Run: `pnpm test:unit tests/unit/cv/profiles.test.ts tests/unit/cv/resolve.test.ts`  
Expected: FAIL because the CV domain does not exist.

- [ ] **Step 4: Implement immutable profile definitions**

```ts
export const profileIds = ['generic', 'leadership', 'embedded-rd', 'devops'] as const;
export type CvProfileId = (typeof profileIds)[number];

export interface CvProfile {
  id: CvProfileId;
  headline: string;
  summary: string;
  themeOrder: CareerTheme[];
  sectionOrder: CvSectionKind[];
  limits: { highlightsPerRole: number; projects: number; publications: number; skills: number };
}
```

Keep selection declarative. Do not add job-description input or keyword stuffing.

- [ ] **Step 5: Implement the pure resolver**

Resolver output contains strings, dates, and links ready for rendering but no HTML. Apply stable comparison keys (`priority`, normalized date, stable ID) so identical input always gives identical output.

- [ ] **Step 6: Run focused tests and type checks**

Run: `pnpm test:unit tests/unit/cv/profiles.test.ts tests/unit/cv/resolve.test.ts`  
Expected: PASS.

Run: `pnpm check`  
Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/cv/types.ts src/lib/cv/profiles.ts src/lib/cv/resolve.ts tests/unit/cv
git commit -m "feat(cv): add deterministic role profiles"
```

## Task 6: Enforce output privacy and content-quality diagnostics

**Files:**
- Create: `src/lib/cv/output-policy.ts`
- Create: `src/lib/career/quality.ts`
- Test: `tests/unit/cv/output-policy.test.ts`
- Test: `tests/unit/career/quality.test.ts`

- [ ] **Step 1: Write failing output-policy tests**

```ts
expect(getCvOutput({ profileId: 'generic', mode: 'public' })).toBe(resolve('public/assets/cv/jonathan-cv.pdf'));
expect(getCvOutput({ profileId: 'leadership', mode: 'private' })).toBe(resolve('.cv-output/jonathan-tobias-cv-leadership.pdf'));
expect(() => getCvOutput({ profileId: 'leadership', mode: 'public' })).toThrow(/private profile/i);
expect(() => getCvOutput({ profileId: 'generic', mode: 'test', testRoot: resolve('.') })).toThrow(/system temp/i);
```

- [ ] **Step 2: Write failing quality-warning tests**

Cover long highlights, passive openings, vague phrasing, near-duplicates, missing observable outcomes, excessive selected skills, and weak theme relevance. Assert warnings contain entity/profile IDs and never mutate content.

- [ ] **Step 3: Run the focused tests and confirm failures**

Run: `pnpm test:unit tests/unit/cv/output-policy.test.ts tests/unit/career/quality.test.ts`  
Expected: FAIL because both modules are missing.

- [ ] **Step 4: Implement the closed output policy**

Use fixed repository-relative destinations; do not accept an arbitrary `--output` CLI argument. `getCvOutput` accepts only `{ profileId, mode: 'public' | 'private' }` in production. A `mode: 'test'` branch requires a `testRoot` contained by `os.tmpdir()` and exists only so integration tests can avoid repository outputs. Resolve and containment-check every absolute path before writing.

- [ ] **Step 5: Implement diagnostic rules**

Return structured `{ code, severity: 'warning', entityId, message }` objects. Structural validation remains in Zod and the PDF verifier; quality diagnostics must never throw or synthesize replacement wording.

- [ ] **Step 6: Run tests**

Run: `pnpm test:unit tests/unit/cv/output-policy.test.ts tests/unit/career/quality.test.ts`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/cv/output-policy.ts src/lib/career/quality.ts tests/unit/cv/output-policy.test.ts tests/unit/career/quality.test.ts
git commit -m "feat(cv): enforce private outputs and quality warnings"
```

## Task 7: Render semantic ATS-safe HTML

**Files:**
- Create: `src/lib/cv/print-styles.ts`
- Create: `src/lib/cv/render.ts`
- Test: `tests/unit/cv/render.test.ts`

- [ ] **Step 1: Write failing semantic-renderer tests**

Parse the returned HTML and assert one `main`, ordered `section` headings, contact links in the body, `lang="en"`, and no `table`, `img`, `svg`, `header`, `footer`, CSS grid, columns, absolute positioning, or icon-font classes.

```ts
const html = renderCvHtml(resolveCv(career, cvProfiles.generic));
expect(html).toContain('<html lang="en">');
expect(html).toContain('<main class="cv">');
expect(html).not.toMatch(/<(table|img|svg|header|footer)\b/);
expect(headingOrder(html)).toEqual(view.sections.map(section => standardSectionHeading[section.kind]));
```

- [ ] **Step 2: Run the renderer test and confirm failure**

Run: `pnpm test:unit tests/unit/cv/render.test.ts`  
Expected: FAIL because the renderer does not exist.

- [ ] **Step 3: Implement print CSS invariants**

```css
@page { size: A4; margin: 12mm 14mm 13mm; }
* { box-sizing: border-box; }
html { font-family: 'Geist CV', Arial, sans-serif; color: #111; background: #fff; }
body { margin: 0; font-size: 9.75pt; line-height: 1.32; }
.cv { display: block; }
section { break-inside: auto; }
h2, .role-heading, .education-item { break-after: avoid; }
.role { break-inside: avoid-page; }
```

Reject automatic scale-down. Use minimum font-size assertions in tests and let the later page-count verifier fail overflow.

- [ ] **Step 4: Implement escaped semantic HTML**

Use a dedicated HTML escape helper for every data value. Keep DOM order identical to intended extraction order. Place contact data in `main`, use visible link labels, and emit standard headings only for included sections.

- [ ] **Step 5: Run renderer and resolver tests**

Run: `pnpm test:unit tests/unit/cv/render.test.ts tests/unit/cv/resolve.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/cv/print-styles.ts src/lib/cv/render.ts tests/unit/cv/render.test.ts
git commit -m "feat(cv): render semantic single-column resume"
```

## Task 8: Generate, normalize, and verify PDFs

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `src/lib/cv/pdf.ts`
- Create: `src/lib/cv/verify.ts`
- Create: `src/lib/cv/generate.ts`
- Test: `tests/unit/cv/verify.test.ts`
- Test: `tests/integration/cv-generation.test.ts`

- [ ] **Step 1: Add the PDF dependencies**

Run: `pnpm add -D pdfjs-dist pdf-lib`  
Expected: `package.json` and `pnpm-lock.yaml` contain both packages; do not hand-edit lockfiles.

- [ ] **Step 2: Write verifier unit tests against malformed fixtures**

Cover empty data, more than two pages, non-A4 viewports, missing structure tree, missing metadata, absent ordered anchors, leaked `\\csuse`, and missing link annotations. Keep small committed fixture PDFs only if generating them in-memory makes the test unreadable.

- [ ] **Step 3: Write the failing end-to-end generation test**

```ts
it('generates a tagged, parseable generic CV no longer than two A4 pages', async () => {
  const testRoot = await mkdtemp(join(tmpdir(), 'jts-cv-test-'));
  const result = await generateCv({ profileId: 'generic', mode: 'test', testRoot });
  expect(result.verification.pageCount).toBeGreaterThanOrEqual(1);
  expect(result.verification.pageCount).toBeLessThanOrEqual(2);
  expect(result.verification.hasStructTree).toBe(true);
  expect(result.verification.text).toContain('Jonathan Tobias da Silva');
});
```

- [ ] **Step 4: Run the tests and confirm missing implementation failures**

Run: `pnpm test:unit tests/unit/cv/verify.test.ts tests/integration/cv-generation.test.ts`  
Expected: FAIL because PDF generation and verification do not exist.

- [ ] **Step 5: Implement Playwright generation and metadata normalization**

Embed Geist Regular and SemiBold as data-URL `@font-face` sources read from the installed `geist` package. Generate with:

```ts
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready.then(() => undefined));
const fontsLoaded = await page.evaluate(() =>
  document.fonts.check('400 10pt "Geist CV"') && document.fonts.check('600 10pt "Geist CV"')
);
assert(fontsLoaded, 'Required Geist CV fonts did not load');
const bytes = await page.pdf({
  format: 'A4',
  preferCSSPageSize: true,
  printBackground: true,
  tagged: true,
  outline: true,
});
```

Load the bytes with `pdf-lib`, set title, author, subject, keywords, creator, and producer, and set catalog `/Lang` to `en-US`. Save to a temporary path; do not write the destination here.

- [ ] **Step 6: Implement portable PDF.js verification**

```ts
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdf = await getDocument({ data: new Uint8Array(bytes) }).promise;
const metadata = await pdf.getMetadata();
assert(metadata.hasStructTree, 'PDF must contain a structure tree');
assert(pdf.numPages >= 1 && pdf.numPages <= 2, 'PDF must contain one or two pages');
for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  assertA4(viewport.width, viewport.height);
  const text = await page.getTextContent();
  const annotations = await page.getAnnotations();
  // Collect text and link annotations for ordered-anchor and URL checks.
}
```

Check ordered anchors by increasing string index, not full whitespace equality. Fail on template syntax, replacement glyphs, missing identity/sections, invalid links, and profile-specific required content.

- [ ] **Step 7: Implement orchestration and atomic replacement**

Resolve the destination through `getCvOutput` and create its parent first. Create the final staging directory with `mkdtemp(join(destinationParent, '.cv-stage-'))` so staging and destination are guaranteed to use the same filesystem; render, normalize, and verify the staged PDF there, then atomically rename it over the destination. Auxiliary HTML may use `os.tmpdir()`. Always clean staging and auxiliary files in `finally`. In test mode, return the verified output under the caller's system-temp root and let the test clean that root. Emit quality warnings before returning the result.

- [ ] **Step 8: Run focused and full unit tests**

Run: `pnpm test:unit tests/unit/cv tests/integration/cv-generation.test.ts`  
Expected: PASS with Chromium available.

Run: `pnpm test:unit`  
Expected: all tests PASS.

- [ ] **Step 9: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/cv/pdf.ts src/lib/cv/verify.ts src/lib/cv/generate.ts tests/unit/cv/verify.test.ts tests/integration/cv-generation.test.ts
git commit -m "feat(cv): generate and verify tagged PDFs"
```

## Task 9: Add commands, build integration, and stale-asset prevention

Task 9 changes the feature branch's generated public asset flow. Do not merge or deploy this branch until Task 11's four-profile manual release review is approved.

**Files:**
- Create: `scripts/generate-cv.ts`
- Modify: `package.json`
- Modify: `.gitignore`
- Delete: `public/assets/cv/jonathan-cv.pdf`
- Test: `tests/unit/cv/cli.test.ts`

- [ ] **Step 1: Enforce the factual-review gate**

Run: `rg -n "Pending|TBD|TODO" docs/cv/factual-review.md`  
Expected: no unresolved owner-decision rows. If any remain, stop and ask Jonathan. Task 9 must not generate or replace the public CV until this command is clean.

- [ ] **Step 2: Write failing CLI tests**

Test exact accepted forms: `--profile leadership`, `--profile embedded-rd`, `--profile devops`, and `--all-private`. Reject `generic` through the private command, unknown profiles, arbitrary output paths, and conflicting flags. Test the public entrypoint independently.

- [ ] **Step 3: Run CLI tests and confirm failure**

Run: `pnpm test:unit tests/unit/cv/cli.test.ts`  
Expected: FAIL because the script does not exist.

- [ ] **Step 4: Implement a thin argument parser**

Keep parsing exportable and side effects behind `main()`. The CLI calls `getCvOutput` and `generateCv`; it never constructs destinations itself.

- [ ] **Step 5: Add scripts and ignore rules**

```json
{
  "scripts": {
    "cv:build:public": "tsx scripts/generate-cv.ts --public",
    "build:cv": "pnpm cv:build:public",
    "cv:build": "tsx scripts/generate-cv.ts",
    "cv:build:all": "tsx scripts/generate-cv.ts --all-private",
    "build": "pnpm build:cv && pnpm build:search && astro build"
  }
}
```

Append `.cv-output/` and `public/assets/cv/*.pdf` to `.gitignore`. Temporary working files use destination-local dot directories that are removed in `finally`, plus `os.tmpdir()` for auxiliary HTML; they need no repository ignore rule. Preserve the public directory at build time by having the generator create it; do not commit a placeholder PDF.

- [ ] **Step 6: Remove the tracked legacy PDF before regeneration**

Run: `git rm public/assets/cv/jonathan-cv.pdf`  
Expected: Git stages deletion and removes the legacy binary from the working tree.

- [ ] **Step 7: Generate all four outputs and inspect filenames**

Run: `pnpm cv:build:public`  
Expected: only a fresh ignored `public/assets/cv/jonathan-cv.pdf` is created in `public/`; the staged legacy deletion remains staged.

Run: `pnpm cv:build:all`  
Expected: exactly three files are created under `.cv-output/` and none under `public/` or `dist/`.

- [ ] **Step 8: Prove a clean build cannot use a tracked fallback**

Run: `mv public/assets/cv/jonathan-cv.pdf /tmp/jts-cv-stale-check.pdf`  
Expected: the public source path is absent while a recoverable copy exists under `/tmp`.

Run: `pnpm build`  
Expected: the generic PDF is regenerated before Astro and copied to `dist/`. Restore nothing manually; the build output is authoritative.

Run: `git ls-files public/assets/cv`  
Expected: no PDF is listed.

- [ ] **Step 9: Run CLI, build, and link tests**

Run: `pnpm test:unit tests/unit/cv/cli.test.ts`  
Expected: PASS.

Run: `pnpm build`  
Expected: PASS and `dist/assets/cv/jonathan-cv.pdf` exists.

Run: `pnpm test:e2e tests/e2e/portfolio.spec.ts tests/e2e/home.spec.ts`  
Expected: PASS with the stable download URL and analytics metadata.

- [ ] **Step 10: Commit**

```bash
git add scripts/generate-cv.ts package.json .gitignore tests/unit/cv/cli.test.ts
git commit -m "feat(cv): generate the public CV during builds"
```

## Task 10: Improve verified recruiter-facing content

**Files:**
- Modify: `src/content/portfolio/person.ts`
- Modify: `src/content/portfolio/experience.ts`
- Modify: `src/content/portfolio/projects.ts`
- Modify: `src/content/portfolio/skills.ts`
- Modify: `src/content/portfolio/about.en.md`
- Modify: `src/content/portfolio/about.pt-br.md`
- Modify: `src/lib/cv/profiles.ts`
- Modify: `docs/cv/factual-review.md`
- Test: `tests/unit/career/quality.test.ts`
- Test: `tests/unit/cv/resolve.test.ts`

- [ ] **Step 1: Confirm the factual-review checkpoint is complete**

Run: `rg -n "Pending|TBD|TODO" docs/cv/factual-review.md`  
Expected: no unresolved owner-decision rows. If any remain, stop and ask Jonathan; do not guess.

- [ ] **Step 2: Add failing expectations for approved content**

Assert the approved generic headline, exact normalized titles/dates, profile summaries, distinct Nova Smar roles, key technical terms, and maximum highlight/summary lengths. Do not test stylistic action-verb lists as brittle exact prose unless Jonathan approved the exact sentence.

- [ ] **Step 3: Rewrite only from verified facts**

Use concise action-and-impact language, natural role keywords, and optional `cvText` on the same highlight record. Preserve Portuguese meaning when updating website text. Add metrics only when the factual-review document contains an approved value and source.

- [ ] **Step 4: Run quality diagnostics for all profiles**

Run: `pnpm cv:build:all`  
Expected: three valid private PDFs plus actionable warnings; no structural failure.

Run: `pnpm cv:build:public`  
Expected: a valid generic PDF no longer than two pages.

- [ ] **Step 5: Run content, resolver, and website tests**

Run: `pnpm test:unit tests/unit/career tests/unit/cv/resolve.test.ts`  
Expected: PASS.

Run: `pnpm check`  
Expected: 0 errors.

- [ ] **Step 6: Commit content separately for reviewability**

```bash
git add src/content/portfolio src/lib/cv/profiles.ts docs/cv/factual-review.md tests/unit/career tests/unit/cv/resolve.test.ts
git commit -m "content: strengthen verified career positioning"
```

## Task 11: Add independent CI, visual, privacy, and operations gates

**Files:**
- Create: `scripts/check-cv-poppler.ts`
- Create: `scripts/check-cv-dist.ts`
- Create: `tests/e2e/cv.spec.ts`
- Create: `tests/e2e/cv.spec.ts-snapshots/chromium-desktop/cv-generic.png`
- Modify: `.github/workflows/pipeline.yml`
- Modify: `package.json`
- Create: `docs/cv/operations.md`
- Modify: `README.md`

- [ ] **Step 1: Write failing Poppler and deploy-boundary tests**

`check-cv-poppler.ts` must run `pdfinfo` and `pdftotext -layout` through `execFile`, assert 1-2 A4 pages, assert ordered anchors, and reject `\\csuse`, replacement glyphs, and missing standard headings. `check-cv-dist.ts` must allow only `dist/assets/cv/jonathan-cv.pdf` and reject filenames containing `leadership`, `embedded-rd`, or `devops` anywhere under `dist/`.

- [ ] **Step 2: Run checks and confirm they fail before scripts exist**

Run: `pnpm cv:check:poppler`  
Expected: FAIL because the script is not defined.

Run: `pnpm cv:check:dist`  
Expected: FAIL because the script is not defined.

- [ ] **Step 3: Implement independent checks and package scripts**

Add:

```json
{
  "scripts": {
    "cv:check:poppler": "tsx scripts/check-cv-poppler.ts public/assets/cv/jonathan-cv.pdf",
    "cv:check:dist": "tsx scripts/check-cv-dist.ts dist"
  }
}
```

Poppler absence must produce a direct installation message locally. CI installs it explicitly.

- [ ] **Step 4: Add the private renderer visual regression**

In `tests/e2e/cv.spec.ts`, call the resolver and renderer directly, load HTML with `page.setContent`, wait for `document.fonts.ready`, use an A4-proportional fixed viewport, and snapshot only the generic printable document. Call `test.skip(testInfo.project.name !== 'chromium-desktop', 'CV snapshot is desktop-print only')` before the screenshot assertion so the mobile project does not seek a nonexistent baseline. Also assert there is no public profile selector or route in the built site.

- [ ] **Step 5: Update CI in the correct order**

Add `sudo apt-get update` and `sudo apt-get install -y poppler-utils` before validation. Keep the existing sequence, with these gates:

1. `pnpm test:unit`
2. `pnpm build` (which generates the generic CV)
3. `pnpm cv:check:poppler`
4. `pnpm cv:check:dist`
5. `pnpm test:e2e`

Do not generate private variants in the public workflow.

- [ ] **Step 6: Write operations documentation**

Document prerequisites, source files, public build behavior, each of the three individual private-profile commands, `pnpm cv:build:all`, exact output paths, warning interpretation, factual-review process, browser troubleshooting, Poppler CI role, privacy guarantees, and the future private Actions extension point. Update README features, build flow, and testing commands.

- [ ] **Step 7: Run the full verification suite**

Run: `pnpm lint:content`  
Expected: PASS.

Run: `pnpm test:unit`  
Expected: all tests PASS.

Run: `pnpm check`  
Expected: 0 errors.

Run: `pnpm build`  
Expected: PASS; generic PDF exists in both `public/` and `dist/`.

Run: `pnpm cv:check:poppler`  
Expected: PASS with ordered, artifact-free text.

Run: `pnpm cv:check:dist`  
Expected: PASS with no private variants.

Run: `pnpm test:e2e`  
Expected: all browser and visual tests PASS.

Run: `pnpm cv:build:all`  
Expected: exactly three private PDFs in `.cv-output/`, each valid and at most two pages.

- [ ] **Step 8: Perform the manual release review**

Open all four PDFs and confirm scanability, link destinations, page breaks, no collisions, correct emphasis, and factual accuracy. Copy/paste each PDF into plain text and compare its order with the visual document. Jonathan must approve all four before release.

- [ ] **Step 9: Inspect the final repository boundary**

Run: `git status --short`  
Expected: only intended source, tests, workflow, docs, and snapshot changes; no generated PDF or `.cv-output/` files.

Run: `git ls-files '*.pdf' '.cv-output/**'`  
Expected: no generated CV PDF or private output is tracked.

- [ ] **Step 10: Commit**

```bash
git add scripts/check-cv-poppler.ts scripts/check-cv-dist.ts tests/e2e/cv.spec.ts tests/e2e/cv.spec.ts-snapshots/chromium-desktop/cv-generic.png .github/workflows/pipeline.yml package.json docs/cv/operations.md README.md
git commit -m "ci(cv): enforce ATS and privacy quality gates"
```

## Final Acceptance Checklist

- [ ] One canonical career edit feeds both website locales and all CV profiles.
- [ ] `pnpm build` generates only the public generic English CV before Astro.
- [ ] The public download URL and analytics attributes are unchanged.
- [ ] Three local private profiles use fixed gitignored paths.
- [ ] No arbitrary output path can bypass the privacy policy.
- [ ] All PDFs are A4, single-column, text-based, tagged, and at most two pages.
- [ ] PDF.js and Poppler extract required anchors in logical order.
- [ ] No LaTeX/template artifacts or replacement glyphs remain.
- [ ] Content-quality warnings never invent facts or block valid builds.
- [ ] The public deployment contains no private profile route, control, HTML, or PDF.
- [ ] The legacy tracked PDF is removed.
- [ ] Jonathan has approved every factual-review row and all four rendered PDFs.
