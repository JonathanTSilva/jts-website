# Personal Website Design

Date: 2026-03-19
Status: Draft approved by user for spec writing
Owner: Jonathan

## Overview

Build a long-lived personal website for a Senior Embedded Software Engineer that can serve as the primary public web presence for the next 10 years.

The site must:

- present a professional portfolio and CV
- publish blog posts
- publish short-form notes
- support English and Brazilian Portuguese from the start
- remain maintainable, stable, and inexpensive to operate
- use a modern, clean, simple, direct visual language

The site is content-heavy and should be engineered as a static-first system with low operational complexity and deterministic builds.

## Goals

- Create a hybrid homepage that introduces the author and routes visitors to portfolio, blog, and notes.
- Make the portfolio page the authoritative professional profile, including downloadable PDF CV.
- Publish blog content from a private Obsidian repository folder at `08-Publish/Blog`.
- Publish notes content from a private Obsidian repository folder at `08-Publish/Notes`.
- Keep published content versioned inside the website repository after sync.
- Support bilingual navigation and content presentation with English as default and Portuguese (Brazil) as second locale.
- Preserve a strong writing and reading experience across desktop and mobile.
- Minimize long-term maintenance burden and framework churn.

## Non-Goals

- No runtime dependency on the private Obsidian repository.
- No headless CMS or admin panel in the initial version.
- No server-rendered application features unless a later requirement justifies them.
- No database-backed content system.
- No automatic machine translation as a publishing requirement.

## Recommended Technical Direction

### Stack

- Framework: Astro
- Language: TypeScript
- Styling: repo-local design system using CSS variables and component-scoped styles
- Content: Markdown/MDX for long-form content, structured typed data files for portfolio entities
- Hosting: static hosting platform with CI/CD
- Automation: GitHub Actions for content sync, validation, and deployment

### Rationale

Astro is the preferred choice because it balances current ecosystem maturity with low long-term complexity for a static-first, content-centric website. It supports modern component-based UI, strong performance defaults, and structured content handling without forcing a server runtime.

## Information Architecture

### Top-Level Routes

- `/` homepage
- `/portfolio` professional profile and CV
- `/blog` blog index
- `/blog/[slug]` blog post
- `/notes` notes index
- `/notes/[slug]` note detail
- locale-prefixed equivalents for Portuguese, with English as default and Portuguese under a distinct locale route strategy

### Homepage

The homepage is hybrid and should balance four jobs:

- identify the author and area of expertise quickly
- establish professional credibility
- surface recent writing
- surface recent notes

Recommended homepage sections:

- concise hero with name, role, positioning statement, and primary navigation
- selected projects or impact highlights
- selected publications or credentials
- latest blog posts
- latest notes
- call-to-action to full portfolio and CV download

### Portfolio Page

The portfolio page is the detailed professional page and should include:

- biography/about section
- experience timeline or grouped role history
- selected projects
- publications
- technical skills or domains of practice if they add signal
- CV PDF download

### Blog Page

The blog index should:

- group posts by year and month
- present entries in a list format
- optimize for scanning titles, dates, descriptions, and language availability

### Notes Page

The notes index should:

- feel more dynamic and exploratory than the blog
- use a filterable card gallery on desktop
- fall back to a simpler chronological/list-oriented presentation on constrained views
- support category color accents and tags
- support search

The notes page is intentionally less formal than the blog, but it must remain legible and fast to navigate.

## Content Sources and Content Model

### Source of Truth

The private Obsidian repository remains the authoring source for published writing.

Published content will live under:

- `08-Publish/Blog`
- `08-Publish/Notes`

### Website Repository Storage

The website repository stores a synced copy of publishable content. This is a hard requirement to ensure:

- deterministic builds
- simple local development
- auditability of published content
- independence from private repository runtime access

### Portfolio Content Model

Portfolio content uses a split model:

- Markdown/MDX for longer narrative sections such as biography or introductory copy
- structured data files for experience, projects, publications, and metadata

This keeps authoring ergonomic while preserving consistency and type safety for repeatable sections.

### Blog Content Model

Blog posts are Markdown-based content entries synced from `08-Publish/Blog`.

Required blog metadata should include:

- title
- slug
- translation key
- publication date
- language
- summary or description

Optional metadata may include:

- tags
- updated date
- canonical URL

### Notes Content Model

Notes are Markdown-based content entries synced from `08-Publish/Notes`.

Notes should support a mixed categorization model:

- folder structure provides a default section or grouping
- frontmatter provides categories, tags, and presentation metadata

Required note metadata should include:

- title
- slug
- translation key
- publication date
- language

Optional metadata may include:

- category
- tags
- color token or display accent
- summary

## Bilingual Strategy

### Locales

- English is the default locale
- Brazilian Portuguese is the second locale

### Translation Policy

Strict parity is not required.

If content exists in only one language:

- the content pair must still be related through a shared translation key
- no synthetic detail page should be generated for a translation that does not exist
- locale-specific indexes should show the item with a clear availability label such as "available only in English" or "available only in Portuguese"
- if a user switches locale while viewing a detail page whose counterpart does not exist, the site should direct the user to the original-language page with a clear notice

This keeps the publishing workflow lightweight while preserving a coherent bilingual site structure.

### Portfolio Translation

Portfolio pages and navigation should be fully localized. Structured data and narrative content should be modeled to allow locale-specific values without hacks or duplicated layout logic.

### CV Localization

The initial version should use one canonical PDF CV file stored in the website repository. Locale-specific page copy may describe the CV in the active language, but the downloadable asset itself does not need separate localized versions in the first release.

### Locale Scope for Listing and Search

Blog and notes indexes should be locale-scoped by default. Search and filtering should operate within the active locale view. Entries that exist only in the opposite locale may still appear in indexes when useful, but they must be clearly labeled and route to the original-language version.

## Sync and Publishing Workflow

### Sync Model

The site must support both:

- automatic sync when the private repository changes
- manual sync on demand from the website repository

### Recommended Flow

1. Author edits content in the private Obsidian repository under `08-Publish/Blog` or `08-Publish/Notes`.
2. A GitHub Action in the private repository detects relevant changes.
3. The automation opens a pull request in the website repository containing the synced content updates.
4. The website repository validates content shape and builds preview checks.
5. After merge, the site is deployed by CI/CD.

Manual sync should remain available as a fallback workflow so the automation path is not the only recovery mechanism.

### Boundary Rules

- The public site build reads only from content already present in the website repository.
- Secrets required for cross-repository sync are confined to automation workflows.
- Content sync should be reviewable in PR form.

## UX and Visual Direction

### Design Principles

- modern
- clean
- simple
- direct
- technical without being sterile

### Visual Personality

The site should use a modern technical visual language rather than a loud portfolio style. Recommended traits:

- strong typography with clear hierarchy
- disciplined spacing
- restrained but intentional color system
- subtle motion and transitions
- data/system-inspired accents where useful, not decorative overload

### Blog Experience

The blog should feel editorial and highly readable. Typography, spacing, and metadata hierarchy matter more than visual novelty.

### Notes Experience

The notes section can carry more visual personality than the blog. It should encourage discovery through:

- card-based browsing
- category color accents
- tag or category filters
- search
- responsive adaptation to simpler list-style views where needed

## Engineering Principles

- static-first architecture
- deterministic builds
- content in git
- typed schemas for structured and Markdown frontmatter content
- minimal dependency count
- accessibility-first components
- SEO and social metadata by default
- image and asset optimization
- automated validation in CI
- avoid unnecessary backend services

## Performance and Quality Requirements

- fast static page loads
- responsive experience on desktop and mobile
- accessible semantic markup and keyboard navigation
- clear visual contrast and readable typography
- validation failures for malformed content metadata
- previewable PRs for content and design changes

## Maintainability Requirements

- clear content directories and naming conventions
- strongly typed structured data
- minimal hidden build logic
- no runtime coupling to private sources
- straightforward local development flow
- low hosting and operational burden

## Risks and Mitigations

### Risk: Content leakage from private knowledge base

Mitigation:

- publish only from explicit `08-Publish` directories
- keep sync scope narrow and automation reviewable

### Risk: Bilingual complexity growing over time

Mitigation:

- model locales from the start
- permit fallback to original-language content when translation is missing

### Risk: Over-engineering a static site

Mitigation:

- keep the initial system static-first
- add runtime services only when a concrete feature requires them

## Open Decisions Deferred to Planning

- exact route shape for localized default locale handling
- exact component structure and design token system
- exact CI workflow implementation details
- exact content schema fields beyond the required baseline
- exact search implementation approach for notes

These are implementation-planning decisions, not design blockers.

## Success Criteria

The design is successful if the implemented site:

- presents a strong professional identity on the homepage
- provides a detailed portfolio page and downloadable CV
- publishes blog posts from `08-Publish/Blog`
- publishes notes from `08-Publish/Notes`
- supports English and Brazilian Portuguese cleanly
- keeps content sync safe, reviewable, and easy to operate
- feels modern, clean, simple, and direct
- remains maintainable without server complexity
