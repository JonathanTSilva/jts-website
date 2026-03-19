# jts-website

Bilingual, static-first personal website for a Senior Embedded Software Engineer. Built with [Astro](https://astro.build/).

## Features

- **Bilingual Support:** English (default) and Brazilian Portuguese (`/pt-br`).
- **Content Collections:** Blog, Notes, and Now page synced from a private Obsidian vault.
- **Strict Validation:** Frontmatter and content structure enforced via Zod and custom validation scripts.
- **Search:** Fast, locale-aware client-side search for blog and notes.
- **RSS Feeds:** Separate feeds for blog posts and notes.
- **Theme Support:** Light and dark modes with system preference detection and manual override.
- **Static First:** Entirely static build for performance and low operational cost.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/)

### Installation

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

The site will be available at `http://localhost:4321`.

### Build

To build the static site (including search index generation):

```bash
pnpm build
```

The output will be in the `dist/` directory.

## Content Workflow

### Structure

Content is stored in `src/content/`:
- `blog/`: Long-form articles.
- `notes/`: Short-form notes and snippets.
- `now/`: Current status and focus.
- `portfolio/`: Bio, experience, projects, and publications.

### Syncing Content

Content is synced from a private Obsidian repository. This is handled automatically via GitHub Actions but can be triggered manually.

```bash
pnpm sync:content
```

### Validation

All synced content is validated against strict contracts. If a file is malformed, the build will fail.

Run validation manually:

```bash
pnpm lint:content
```

Validation rules are defined in `src/lib/content/contracts.ts` and enforced in `src/content/config.ts`.

## Localization

- **English (en):** Primary language, served at root paths (e.g., `/blog/my-post`).
- **Portuguese (pt-br):** Secondary language, served at `/pt-br/` paths (e.g., `/pt-br/blog/my-post`).

Translation pairs are linked via a `translationKey` in the frontmatter. If a translation is missing, the site provides a notice and links to the available version.

## Theme Behavior

The site follows the user's system preference by default. A manual toggle in the header allows users to override this. The choice is persisted in `localStorage`.

## Testing

- **Unit Tests:** `pnpm test:unit` (Vitest)
- **E2E Tests:** `pnpm test:e2e` (Playwright)

Install Playwright browsers:

```bash
pnpm test:e2e:install
```

## Documentation

- [Design Specification](docs/superpowers/specs/2026-03-19-personal-website-design.md)
- [Implementation Plan](docs/superpowers/plans/2026-03-19-personal-website-implementation.md)
- [Content Templates](docs/content-contracts/)
- [Automation Docs](docs/automation/)
