# CV operations

The website and all CV profiles use the validated career model in `src/content/portfolio/`. Profile selection lives in `src/lib/cv/profiles.ts`; resolution, HTML rendering, PDF generation, verification, and output policy live in `src/lib/cv/`.

## Prerequisites

- Node.js 22 and pnpm 10
- project dependencies from `pnpm install`
- Chromium from `pnpm test:e2e:install` (or `pnpm exec playwright install chromium`)
- Poppler's `pdfinfo` and `pdftotext` only for the independent `pnpm cv:check:poppler` gate; on Debian/Ubuntu install `poppler-utils`

If generation reports that Chromium is unavailable, install the browser and retry. Browser launch failures can also indicate missing Linux browser libraries; `pnpm test:e2e:install` installs those on supported systems.

## Public build

`pnpm build` first runs `pnpm cv:build:public`, then builds the search index and Astro site. The verified generic PDF is atomically written to `public/assets/cv/jonathan-cv.pdf` and Astro copies it to `dist/assets/cv/jonathan-cv.pdf`. Generation failure stops the build, so deployment cannot fall back to a stale PDF.

Only `pnpm cv:build:public` may write a CV under `public/`. Do not manually copy private outputs into `public/` or `dist/`.

## Private profiles

Generate profiles locally with explicit, non-interactive commands:

```bash
pnpm cv:build --profile leadership
pnpm cv:build --profile embedded-rd
pnpm cv:build --profile devops
pnpm cv:build:all
```

Their exact gitignored outputs are:

- `.cv-output/jonathan-tobias-cv-leadership.pdf`
- `.cv-output/jonathan-tobias-cv-embedded-rd.pdf`
- `.cv-output/jonathan-tobias-cv-devops.pdf`

`pnpm cv:build:all` creates exactly those three private PDFs. It does not generate the public generic profile.

## Quality and review

Generation errors are blocking structural, browser, PDF, or output-policy failures. Quality warnings identify content debt such as vague wording, density, repetition, or missing measurable impact; they do not invent replacement claims and do not block a structurally valid PDF.

Before release, complete `docs/cv/factual-review.md`. Review every title, date, technology, publication, outcome, and metric, then inspect all four PDFs for scanability, link destinations, page breaks, collisions, emphasis, and extraction order. Automated checks cannot establish factual truth or replace owner approval.

Run the local gates with:

```bash
pnpm lint:content
pnpm test:unit
pnpm check
pnpm build
pnpm cv:check:poppler
pnpm cv:check:dist
pnpm test:e2e
```

The Poppler check is independent of the JavaScript PDF verifier. It confirms A4 page geometry, the one-to-two-page limit, standard headings, representative reading order, and absence of known extraction artifacts. CI installs Poppler explicitly before validation.

The deploy-boundary check recursively scans `dist/` without following links. It permits only a regular file at `dist/assets/cv/jonathan-cv.pdf`; rejects every symlink, non-regular entry, extra PDF, and path containing a private profile ID; and scans HTML for selector syntax, private profile assignments, and the three exact private headlines. Private files remain outside Astro's input and output trees and are ignored by Git.

## Future private automation

A future private GitHub Actions workflow may invoke the existing explicit `pnpm cv:build --profile <profile>` commands and collect `.cv-output/` as access-controlled artifacts. It must not be added to the public deployment workflow, upload private PDFs to Pages, or weaken the output policy and deploy scan.
