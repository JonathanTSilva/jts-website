# jts-website

Personal bilingual website built with Astro and deployed to GitHub Pages.

<!-- badges:start -->
[![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)](https://www.repostatus.org/#active)
[![CI](https://img.shields.io/github/actions/workflow/status/JonathanTSilva/jts-website/ci.yml?branch=main&style=flat-square&label=ci)](https://github.com/JonathanTSilva/jts-website/actions/workflows/ci.yml)
[![Scorecard](https://img.shields.io/ossf-scorecard/github.com/JonathanTSilva/jts-website?style=flat-square&label=scorecard)](https://scorecard.dev/viewer/?uri=github.com/JonathanTSilva/jts-website)
[![License](https://img.shields.io/badge/license-MIT_and_CC_BY_4.0-blue?style=flat-square)](LICENSE)
[![Codespaces](https://img.shields.io/badge/codespaces-open-181717?style=flat-square&logo=github)](https://codespaces.new/JonathanTSilva/jts-website)
<!-- badges:end -->

## What it is

Personal website for [Jonathan T. Silva](https://www.jontobias.com), Senior Embedded Software Engineer. Bilingual (English / Brazilian Portuguese), statically generated with [Astro](https://astro.build/) and deployed to GitHub Pages.

Live at **[www.jontobias.com](https://www.jontobias.com)**.

### Features

- **Bilingual:** English at `/`, Brazilian Portuguese at `/pt-br/`. Translation pairs linked via `translationKey`; missing translations fall back gracefully.
- **Content Collections:** Blog, Notes, Portfolio, and Now page — content authored in Obsidian, synced from a private vault.
- **Strict Content Validation:** Zod schemas + custom validation scripts block builds on malformed frontmatter.
- **Client-Side Search:** Locale-aware, statically pre-built search index for blog and notes.
- **RSS Feeds:** Separate feeds for blog posts and notes, one per locale.
- **Light / Dark Theme:** System preference detection with persistent manual override via `localStorage`.
- **Analytics (opt-in):** Plausible Analytics with explicit consent gate — no cookies, no tracking by default.
- **Static First:** Pure static build. No runtime services, no server, no database.
- **Generated ATS-Friendly CV:** Production builds generate and verify the generic public CV from the canonical career model; role-specific variants remain local and private.

## Quick start

Prerequisites: [Node.js](https://nodejs.org/) v18+ and [pnpm](https://pnpm.io/). Or open it in a dev container or GitHub Codespaces.

```sh
git clone https://github.com/JonathanTSilva/jts-website.git
cd jts-website
pnpm install
pnpm dev        # starts dev server at http://localhost:4321
```

## Usage

### Build and preview

```sh
pnpm build      # generates the public CV, search index, and static site → dist/
pnpm preview    # serves the built output locally
```

### Environment variables

Optional, required for Plausible Analytics:

```sh
PUBLIC_PLAUSIBLE_DOMAIN=www.jontobias.com
PUBLIC_PLAUSIBLE_API_HOST=https://plausible.io
PUBLIC_PLAUSIBLE_SCRIPT_SRC=https://plausible.io/js/script.js
```

### Content Workflow

Content lives in `src/content/`:

| Collection  | Path                     | Description                              |
| ----------- | ------------------------ | ---------------------------------------- |
| `blog`      | `src/content/blog/`      | Long-form articles                       |
| `notes`     | `src/content/notes/`     | Short-form notes, book notes, whiteboards |
| `now`       | `src/content/now/`       | Current focus and status                 |
| `portfolio` | `src/content/portfolio/` | Bio, experience, projects, publications  |

File naming convention: `YYYY-MM-{slug}.{lang}.md` for blog and notes (e.g. `2026-04-welcome.en.md`).

#### Syncing from Obsidian

Content is authored in a private Obsidian vault and synced via GitHub Actions or manually:

```bash
pnpm sync:content
```

#### Validation

Frontmatter is validated against Zod schemas before every build. To run manually:

```bash
pnpm lint:content
```

### Localization

| Locale    | Path prefix | Example                     |
| --------- | ----------- | --------------------------- |
| English   | *(none)*    | `/blog/my-post`             |
| PT-BR     | `/pt-br/`   | `/pt-br/blog/my-post`       |

Translation pairs are linked via a shared `translationKey` in frontmatter. If a translation is missing, the site shows a notice and links to the available version.

### Architecture Notes

- **`src/lib/content/staticPaths.ts`** — Factory functions (`makeNoteStaticPaths`, `makeBlogStaticPaths`, `buildNoteIndex`) shared by EN and PT-BR page pairs to eliminate routing duplication.
- **`src/components/notes/layouts/NoteLayoutWrapper.astro`** — Shared wrapper for all 4 note layout types (default, book, mindmap, whiteboard).
- **`src/lib/analytics/consent.ts`** — Single source of truth for consent state parsing and checking.
- **`src/styles/tokens.css`** — All design tokens (colors, spacing, typography, radii, motion). No hardcoded values elsewhere.

### Testing

```bash
pnpm test               # Vitest unit tests without the browser-based CV test (what the shared CI job runs)
pnpm test:unit          # All Vitest unit tests (src/lib, scripts), needs Playwright browsers
pnpm test:e2e           # Playwright E2E tests (requires built site)
pnpm test:all           # Unit and E2E tests together
pnpm test:e2e:install   # Install Playwright browsers (first run)
pnpm cv:check:poppler   # Independent PDF extraction/geometry check (requires Poppler)
pnpm cv:check:dist      # Verify no private CV artifacts enter dist/
pnpm run check          # Astro + TypeScript type check
```

### Deployment

Deployed to [GitHub Pages](https://pages.github.com/) via GitHub Actions on push to `main`. The build pipeline runs content validation, then `pnpm build`, then deploys `dist/` to the `gh-pages` branch.

## Docs

- [Design Specification](docs/superpowers/specs/2026-03-19-personal-website-design.md)
- [Implementation Plan](docs/superpowers/plans/2026-03-19-personal-website-implementation.md)
- [Analytics & Consent Ops](docs/site-operations/analytics-and-consent.md)
- [Plausible Setup for GitHub Pages](docs/site-operations/plausible-github-pages-setup.md)
- [Analytics Review Routine](docs/site-operations/analytics-review-routine.md)
- [Site Governance](docs/site-operations/site-governance.md)
- [Content Templates](docs/content-contracts/)
- [Automation Docs](docs/automation/)
- [SEO Checklist](docs/site-operations/seo-checklist.md) — metadata rules, structured data, multilingual SEO invariants
- [CV Operations](docs/cv/operations.md) — public/private generation, verification, privacy, and release review
- [Engineering handbook](https://github.com/JonathanTSilva/.github/blob/main/handbook/README.md): the conventions this repository follows

## Contributing

See the [contributing guide](https://github.com/JonathanTSilva/.github/blob/main/CONTRIBUTING.md). Branches are named `<type>/<issue>-<slug>`, commits and PR titles follow Conventional Commits, and PRs are squash-merged.

## License

This repository has two licenses. See [LICENSE](LICENSE).

- **Code** (source, scripts, configuration): [MIT License](https://opensource.org/license/mit).
- **Content** (written content such as blog posts, notes, documentation and images): [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/) (CC BY 4.0).
