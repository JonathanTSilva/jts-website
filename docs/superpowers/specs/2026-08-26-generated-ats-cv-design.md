# Generated ATS-Friendly CV Design

Date: 2026-08-26  
Status: Design approved  
Owner: Jonathan Tobias da Silva

## Overview

Replace the hand-maintained LaTeX CV and checked-in PDF with a deterministic CV system generated from the website's canonical career data. The system will improve the professional content shown on the website, generate a generic public PDF on every site build, and support three role-specific PDFs that are generated locally and never deployed.

The public generic CV will position Jonathan as a Senior Embedded/R&D Engineer with proven technical leadership and DevOps capability. The private variants will target leadership, embedded/R&D, and DevOps roles. All first-release PDFs will be English-only, use a conservative single-column layout, and contain at most two A4 pages.

## Problem

Career information is currently maintained in two independent representations:

- typed portfolio data used by the website; and
- a separate LaTeX document compiled and committed as `public/assets/cv/jonathan-cv.pdf`.

Every career update therefore requires editing both sources, recompiling LaTeX, and replacing the PDF. The two representations have already diverged. The current PDF also has observable parsing risks: its extracted text includes unexpanded LaTeX commands, and its two-column layout interleaves experience and education during text extraction.

The website's present content model is not rich enough to produce strong variants. Experience entries mix work and education, dates use inconsistent precision, Nova Smar role progression is flattened, skills are inferred from tag frequency, and highlights generally describe responsibilities more strongly than verified outcomes.

## Goals

- Make typed website career data the single source of truth for the website and every CV.
- Improve the visible portfolio content using concise, factual, action-and-impact language.
- Generate a fresh generic PDF before every production Astro build.
- Keep the existing public URL, download behavior, and analytics event stable.
- Generate leadership, embedded/R&D, and DevOps PDFs through local commands only.
- Keep private variants out of Git and the deployed static site.
- Produce readable, restrained, text-based, tagged PDFs with a logical extraction order.
- Enforce a maximum of two A4 pages without shrinking text to compensate for overflow.
- Block deployment on structural, rendering, or extraction defects.
- Report non-fatal content-quality warnings without inventing claims or metrics.
- Preserve an interface that a future private GitHub Actions workflow can call unchanged.

## Non-Goals

- Per-job-description tailoring in the first release.
- AI-written claims, inferred metrics, or automatic content invention.
- Portuguese CV generation.
- DOCX export.
- Runtime or server-side PDF generation.
- A public or hidden-in-the-site profile selector.
- Public routes or deployed HTML previews for private profiles.
- A private GitHub Actions workflow in the first release.
- Commercial ATS-scoring service integration.
- A claim of universal compatibility with every applicant-tracking system.

## Design Principles

### One factual model, multiple presentations

Career facts are stored once. The website and CV profiles may choose different verified highlights and summaries, but they do not maintain independent copies of dates, titles, employers, technologies, projects, education, or publications.

### ATS compatibility is observable, not a score

The project will enforce properties that can be tested: linear text extraction, semantic section headings, selectable text, conservative structure, correct page size, page count, required content, and absence of rendering artifacts. It will not display or promise an invented ATS score.

### Privacy is enforced by output boundaries

Only the generic profile is permitted to resolve to a path inside `public/`. Private profile output paths must be outside the Astro input tree and ignored by Git. No private profile route or UI is added to the site.

### Generation must fail closed

A clean production build cannot fall back to a stale binary. The generated public PDF is not tracked in Git, and PDF generation must complete before Astro builds the deployable site.

## Architecture

The system has five responsibility-focused layers.

### 1. Canonical career model

The portfolio content is normalized into typed, validated career entities:

- personal identity and contact methods;
- professional positioning;
- employers and individual positions;
- education;
- projects;
- publications;
- skills and competency groups; and
- career highlights.

Every entity has a stable ID. Dates use one normalized representation and an explicit precision where necessary. Localized website strings remain available in English and Brazilian Portuguese.

A career highlight contains verified localized website text, an optional concise English CV rendering of the same claim, and presentation metadata. The CV rendering may improve phrasing and density but may not change the underlying responsibility, outcome, scope, or metric. When it is absent, the CV uses the English website text. The metadata can identify themes such as `embedded`, `research`, `leadership`, and `devops`, as well as general display priority. It does not contain generated facts. This allows consumers to select and phrase relevant highlights while retaining one factual record.

Employer history supports multiple positions so Nova Smar progression and similar future cases can be represented accurately rather than flattened. Publications contain structured authorship, venue, date, type, and link information sufficient for website presentation and CV citations. Skills use a curated taxonomy instead of tag frequency for CV ordering; entity tags remain available for website discovery and relevance selection.

Personal contact information and professional links currently repeated in website components will be consolidated into the canonical model where doing so serves the CV and prevents drift.

### 2. CV profile definitions

Four deterministic profiles describe how to present the same career model:

- `generic`: Senior Embedded/R&D Engineer with leadership and DevOps signals;
- `leadership`: Tech Lead and engineering-management emphasis;
- `embedded-rd`: embedded software, industrial systems, and research emphasis; and
- `devops`: CI/CD, automation, Linux, infrastructure, and engineering enablement emphasis.

A profile controls:

- target headline;
- professional summary;
- section ordering and inclusion;
- entity priority;
- relevant highlight themes and limits;
- selected projects and publications;
- skill-group and skill ordering; and
- space budget within the two-page limit.

Profiles may contain CV-optimized English summaries and highlight selection rules. They may not override factual dates, employers, titles, credentials, technologies, or outcomes.

### 3. Resolver and CV view model

A pure resolver accepts the canonical career model and a profile ID. It produces a presentation-neutral CV view model containing exactly the ordered content the renderer needs.

The resolver owns selection, prioritization, deduplication, chronology, and profile rules. The renderer owns no career-selection logic. This boundary permits profile tests without invoking a browser and allows a future private automation workflow to reuse the same command.

### 4. Semantic HTML renderer

One renderer converts the resolved view model into semantic HTML. The document order is the intended reading order. Print-specific CSS defines A4 geometry and page breaks. The renderer is independent of Astro routes and does not require a deployed or publicly addressable preview page.

### 5. PDF generator and verifier

Playwright opens the rendered local HTML in Chromium and generates a PDF using print media, CSS page sizing, embedded fonts, tagged-PDF output, and a document outline. The generator writes to a temporary file, verifies the result, and atomically replaces the final output only after all blocking checks pass.

## Content and Presentation

### Shared visual system

Every profile uses the same restrained design:

- A4 portrait pages;
- one linear column;
- one or two pages, never more;
- conservative, embedded sans-serif typography;
- readable type sizes and line height;
- strong but minimal hierarchy;
- restrained monochrome or near-monochrome color;
- standard section titles;
- real text and descriptive hyperlinks; and
- deliberate page-break rules that keep headings with their content.

The design excludes photographs, icons, charts, skill bars, sidebars, tables, text boxes, decorative graphics, and content-bearing page headers or footers. Contact data appears in the main document body. Links remain understandable when printed or extracted.

### Top-third hierarchy

The first part of page one contains:

1. full name;
2. profile-specific target headline;
3. location and contact links;
4. a concise three-to-four-line professional summary; and
5. prioritized technical competencies.

Experience is the dominant section. Education, selected projects, and publications are included according to profile relevance and available space. The resolver removes lower-priority content before any typography reduction is considered. The implementation must not shrink text to conceal overflow.

### Website content improvements

The visible portfolio will consume the normalized model and receive targeted content improvements:

- full and consistent job titles;
- consistent date display;
- explicit role progression;
- concise action-and-impact highlights;
- natural use of relevant technical terminology;
- separation of responsibilities and outcomes;
- removal of vague or duplicated claims; and
- verified metrics where Jonathan can supply them.

The website remains a bilingual, reader-oriented portfolio. "ATS-friendly website" means the underlying professional content is structured and written to CV quality; it does not mean redesigning the website as a resume or assuming ATS products ingest the web page.

No metric or achievement may be invented. Existing claims must be migrated faithfully and flagged for owner review when their provenance or wording is unclear.

## Data Flow

### Public production build

1. Load and validate the canonical career model.
2. Load and validate the `generic` profile.
3. Resolve the generic CV view model.
4. Render semantic local HTML with print CSS.
5. Generate a tagged PDF through Playwright/Chromium.
6. Verify structure, page count, extraction, metadata, and required content.
7. Atomically write `public/assets/cv/jonathan-cv.pdf`.
8. Build the search index and Astro site through the existing build pipeline.
9. Verify the public download links through existing E2E coverage.

The current checked-in PDF is removed from version control. Generated PDF paths are ignored by Git. CI's clean checkout and build ordering guarantee that a stale public PDF cannot be deployed.

### Public download

The English and Portuguese website links continue to use `/assets/cv/jonathan-cv.pdf`, the `download` attribute, and the existing `cv_download` analytics metadata. The download remains an ordinary static asset request: instant, cacheable, and independent of a runtime service.

### Private local generation

Local commands select one or all private profiles and write descriptive filenames to the gitignored `.cv-output/` directory. The command interface is:

```text
pnpm cv:build --profile leadership
pnpm cv:build --profile embedded-rd
pnpm cv:build --profile devops
pnpm cv:build:all
```

The three files are `.cv-output/jonathan-tobias-cv-leadership.pdf`, `.cv-output/jonathan-tobias-cv-embedded-rd.pdf`, and `.cv-output/jonathan-tobias-cv-devops.pdf`. A separate non-interactive `pnpm cv:build:public` command is the only command allowed to write the generic profile to `public/assets/cv/jonathan-cv.pdf`. Private outputs cannot be written inside `public/` or `dist/`.

The command is non-interactive and uses explicit profile arguments so a future private GitHub Actions workflow can invoke it without architectural changes.

## Validation and Error Handling

### Blocking structural errors

Generation and production deployment fail for:

- invalid canonical data;
- unknown profile IDs;
- missing identity, contact, headline, summary, experience, skills, or education essentials;
- invalid or contradictory dates;
- duplicate stable IDs;
- missing required links or invalid link formats;
- profile rules that select no meaningful content;
- a private profile targeting a public output location;
- renderer or browser failures;
- missing required fonts or an unavailable Playwright browser;
- image-only, empty, or extraction-corrupted output;
- missing required PDF metadata or tag structure;
- an unexpected page size; or
- output longer than two pages.

Errors identify the entity, profile, field, or verification rule responsible and provide a corrective message.

### Non-blocking content warnings

Generation reports warnings for:

- overly long or dense highlights;
- passive or vague phrasing;
- repeated phrases or near-duplicate highlights;
- responsibilities without an observable outcome;
- missing measurable impact;
- excessive skill lists;
- unbalanced profile emphasis; and
- selected content with weak relevance to the active profile.

Warnings do not fabricate a replacement or block deployment. They make content debt visible for human review.

### Atomic output behavior

The generator writes to a temporary location, verifies the temporary PDF, then replaces the destination. Temporary files are cleaned on success and failure. A failed generation never presents a partial file as valid, and the production build stops before Astro can package an old or invalid asset.

## Testing Strategy

### Unit tests

Unit tests cover:

- canonical schema validation;
- stable IDs and normalized dates;
- role-progression representation;
- deterministic resolver output;
- chronological ordering;
- profile-specific headlines, summaries, skills, and highlights;
- profile differentiation;
- selection limits and deduplication;
- required generic-profile content; and
- rejection of private-to-public output paths.

### Renderer tests

Renderer tests confirm:

- semantic section order matches DOM order;
- standard headings are used;
- forbidden layout constructs are absent;
- contact information is in the main content flow;
- hyperlinks have meaningful visible labels; and
- print CSS defines A4, single-column layout and approved typography limits.

### PDF integration tests

Generated-PDF checks cover:

- one or two A4 pages;
- selectable non-image text;
- correct linear extraction order using a JavaScript PDF parser;
- a second extraction check using Poppler in CI;
- expected identity, contact, role, company, education, and section text;
- absence of leaked template syntax, broken glyphs, and unexpected backslash commands;
- embedded hyperlinks;
- title, author, subject, language, and profile-appropriate metadata;
- tagged document structure and logical reading order; and
- no private CV files in the Astro build output.

Extraction-order assertions verify representative ordered anchors across both pages rather than matching one monolithic whitespace-sensitive string.

### Visual and browser tests

A focused fixed-dimension screenshot regression protects the printable layout from overflow, collisions, missing content, and accidental styling drift. Existing Playwright tests continue to verify the generic download URL, `download` behavior, and analytics metadata in both website locales.

### Manual factual review

Before the first generated CV replaces the current PDF, Jonathan reviews every migrated title, date, technology, publication, outcome, and metric. The review also confirms the emphasis and scanability of all four profiles. Automated validation supplements this review but cannot establish whether a professional claim is true.

## CI and Operational Changes

The existing pipeline will retain its static-first sequence and add CV-specific gates before deployment:

1. install dependencies and the Playwright browser;
2. run Astro/type checks and content validation;
3. run career-model and resolver unit tests;
4. generate and verify the generic CV;
5. build the Astro site;
6. assert that only the generic CV exists in deployable output;
7. run E2E and visual checks; and
8. deploy only after every blocking gate passes.

Poppler is installed in CI for an independent extraction check. The local generator uses a JavaScript PDF parser for portable baseline validation; Poppler is not required for ordinary local generation.

Developer documentation will describe browser prerequisites, generic build behavior, private commands, output locations, quality warnings, factual review, and troubleshooting.

## Repository and Worktree Strategy

The design specification is committed before implementation planning, following the repository's established documentation workflow. After the written specification and implementation plan are approved, feature implementation begins in a dedicated Git worktree. The main working tree is not used for feature code.

The implementation plan will choose the safe worktree path and branch name according to the repository's worktree conventions. Creating the worktree is an implementation transition, not part of this design-writing step.

## Migration Strategy

Implementation proceeds in dependency order:

1. define the normalized career schema and representative failing tests;
2. migrate existing facts without changing public presentation;
3. add profile definitions and the pure resolver;
4. update portfolio consumers to the normalized model;
5. add the semantic renderer and print design;
6. add Playwright generation and local private commands;
7. add PDF verification and quality diagnostics;
8. integrate generic generation into the production build and CI;
9. remove the tracked legacy PDF; and
10. complete factual, visual, ATS-extraction, and privacy review.

Intermediate commits must keep career facts reviewable. Content rewriting and structural migration should not be hidden inside a single large mechanical diff.

## Risks and Mitigations

### Risk: profile metadata becomes a second content system

Mitigation: profiles may select and order verified facts but cannot redefine them. Factual fields remain in the canonical entities.

### Risk: two-page overflow causes unreadably small text

Mitigation: define explicit content budgets and remove lower-priority content. Treat overflow as a blocking error. Do not auto-shrink typography.

### Risk: browser-generated PDF looks correct but extracts incorrectly

Mitigation: use linear semantic HTML, tagged-PDF generation, JavaScript extraction locally, independent Poppler extraction in CI, and ordered-anchor tests.

### Risk: private variants leak into the public site

Mitigation: enforce profile-to-output policy in code, keep private output outside Astro directories, ignore it in Git, and scan `dist/` during CI.

### Risk: stale binary is deployed after generation fails

Mitigation: stop tracking the generated PDF, generate before Astro, use clean CI runners, and fail closed before packaging.

### Risk: stronger wording introduces inaccurate claims

Mitigation: prohibit invention, warn rather than synthesize, keep migrations reviewable, and require owner factual approval before release.

### Risk: browser installation increases local build setup

Mitigation: reuse the Playwright dependency and browser already required by project E2E tests, document the prerequisite, and emit a direct corrective error when Chromium is unavailable.

## Reference Basis

- Greenhouse identifies columns, tables, graphics, headers, footers, text boxes, contact information in headers/footers, unclear sections, and incomplete titles as common causes of partial or failed resume parsing: <https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse>
- Playwright's current PDF API supports print CSS, CSS page sizing, tagged PDF output, and document outlines: <https://github.com/microsoft/playwright/blob/main/docs/src/api/class-page.md>
- Adobe explains that PDF structure tags define reading order and identify headings, paragraphs, sections, lists, links, and other document elements: <https://developer.adobe.com/document-services/docs/overview/pdf-accessibility-auto-tag-api/>
- W3C documents that PDF reading order is primarily determined by tag order and warns that untagged multi-column content can be interpreted incorrectly: <https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF3>

## Success Criteria

The feature is complete when:

- one edit to canonical career data updates both the website and all generated CV profiles;
- production builds regenerate the generic English PDF before Astro packages the site;
- the public URL and analytics behavior remain stable;
- leadership, embedded/R&D, and DevOps PDFs can be generated locally without entering Git or deployable output;
- every generated PDF is text-based, tagged, single-column, A4, and no longer than two pages;
- representative extraction order is correct in both JavaScript and Poppler checks;
- structural and privacy defects block deployment while content-quality concerns appear as warnings;
- the visible website presents normalized, concise, factual career content in both locales;
- the current LaTeX extraction artifacts are absent;
- no stale checked-in PDF remains; and
- Jonathan has approved the factual content and the recruiter-facing presentation of all four profiles.
