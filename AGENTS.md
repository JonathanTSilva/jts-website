# AGENTS.md

Instructions for AI coding agents working in this repository. This file is the single source; `CLAUDE.md` only imports it.

## Overview

jts-website: Personal bilingual website built with Astro and deployed to GitHub Pages.

- Kind: `jts`
- Stack: Node.js (pnpm, Astro, vitest, Playwright)
- Visibility: public
- Status: active
- License: MIT for code, CC BY 4.0 for content (see `LICENSE`)
- Live site: <https://www.jontobias.com>, deployed from `main` by `.github/workflows/pipeline.yml`

## Setup

```sh
pnpm install
pre-commit install --install-hooks
```

Or open the repository in a dev container or GitHub Codespaces, which runs the setup for you.

## Commands

| Task | Command |
|---|---|
| Dev server | `pnpm dev` |
| Build (CV, search index, site) | `pnpm build` |
| Unit tests without the browser-based CV integration test (what the shared `ci` node job runs) | `pnpm run test` |
| All unit tests (needs Playwright browsers, run by `pipeline.yml`) | `pnpm test:unit` |
| E2E tests (needs a built site and Playwright browsers) | `pnpm test:e2e` |
| Unit and E2E together | `pnpm test:all` |
| Type check | `pnpm run typecheck` (same as `pnpm check`) |
| Content validation | `pnpm lint:content` |

Run `pre-commit run --all-files` before you commit. In Claude Code it always asks for approval, because hooks run any command `.pre-commit-config.yaml` lists. For the same reason, never change `.pre-commit-config.yaml` without saying so in the pull request.

CI runs the same checks through the shared workflows in [`.github`](https://github.com/JonathanTSilva/.github); their single result is the `ci` check. Pull requests are also gated by `pr-checks.yml` (CV PDF checks, WebKit smoke test, internal link check, Lighthouse budgets), whose `unique-checks` and `lighthouse-budgets` jobs the `main` ruleset requires too. `pipeline.yml` builds, tests and deploys the site from `main` (also nightly and by hand), next to `sync-content.yml`, `update-snapshots.yml`, `site-health.yml` and `dependabot-auto-merge.yml`. See `docs/site-operations/obsidian-pipeline.md`.

## Conventions

- Branches: `<type>/<issue>-<slug>`, for example `feat/12-add-parser`. See [branches and commits](https://github.com/JonathanTSilva/.github/blob/main/handbook/branches-and-commits.md).
- Commits and PR titles: Conventional Commits. Squash-merge only.
- Names: lowercase kebab-case. See [naming](https://github.com/JonathanTSilva/.github/blob/main/handbook/naming.md).
- Layout of this repo: [repo anatomy](https://github.com/JonathanTSilva/.github/blob/main/handbook/repo-anatomy.md).
- Releases: release-please opens a release PR from Conventional Commits on `main`. Nobody edits the changelog or tags by hand. See [releases](https://github.com/JonathanTSilva/.github/blob/main/handbook/releases.md).
- Labels and issues: [labels and issues](https://github.com/JonathanTSilva/.github/blob/main/handbook/labels-and-issues.md).
- Security: [security](https://github.com/JonathanTSilva/.github/blob/main/handbook/security.md). Pin third-party actions by full commit SHA with a version comment.
- OpenSSF Best Practices: answers live in `.bestpractices.json`; see [security](https://github.com/JonathanTSilva/.github/blob/main/handbook/security.md#openssf-best-practices-badge).
- AI assistance is disclosed in the PR template: [AI assistance](https://github.com/JonathanTSilva/.github/blob/main/handbook/ai.md).
- Whole handbook: [handbook](https://github.com/JonathanTSilva/.github/blob/main/handbook/README.md).

## Boundaries

- Never commit secrets, tokens, `.env` files or real data.
- Never push to `main`. Work on a branch and open a pull request.
- Never force-push.
- Do not rename, archive, delete or change the visibility of this repository.
- Do not edit `LICENSE`.
- Do not change the build, the content or the deploy configuration unless the task is about them: this is the live site.
- Files rendered from the template (`.copier-answers.yml` and the standard files) change through `copier update`, not by hand.

## Model routing

Three subagents in `.claude/agents/` carry fixed models, and Gemini Flash runs through the `agy` CLI.

| Agent | Model | Use for |
|---|---|---|
| `architect` | Opus | Thinking: designs, plans, trade-offs, reviews, anything ambiguous or irreversible |
| `builder` | Sonnet | Building: implementing a scoped task from a plan, writing tests, refactors |
| `agy` (headless) | Gemini 3.8 Flash | Mechanical work, first choice: an exact edit checklist with a command that proves it is done |
| `mechanic` | Haiku | Mechanical work when Flash fails, or when the work needs shell commands |

Rules:

1. Opus thinks. Design, plans, reviews, and anything that cannot be undone.
2. Sonnet builds. Give it the task text, the files it may touch and the done-check.
3. Flash applies first. Run `agy --model gemini-3.8-flash-medium --mode accept-edits -p "<prompt>"` with `-p` last, or it takes the next flag as the prompt. The prompt names the files it may edit, gives the exact checklist and forbids shell commands: headless `agy` is edit-only and cannot read outside its allowed folders. The caller then checks the diff and runs the verify command.
4. Haiku is the backup. If Flash fails, restore only the files it touched and give the same checklist and verify command to `mechanic`. If that fails too, it escalates to Sonnet and does not improvise.
5. Jonathan decides. Approvals and irreversible GitHub actions (rename, archive, visibility change, delete) wait for him.

## Project Source of Truth

- **Design Spec:** `docs/superpowers/specs/2026-03-19-personal-website-design.md`
- **Frontend Redesign Spec:** `docs/superpowers/specs/2026-03-19-frontend-redesign-design.md`
- **Implementation Plan:** `docs/superpowers/plans/2026-03-19-personal-website-implementation.md`
- **Frontend Redesign Plan:** `docs/superpowers/plans/2026-03-20-frontend-redesign.md`

## Engineering Core Principles

- **Static-First:** Astro, deterministic builds, no runtime services
- **Content as Contract:** Strict Zod validation, publish-blocking on invalid content
- **Bilingual by Design:** English default (`/`), Portuguese under `/pt-br/`
- **Component Discipline:** Small, focused Astro components, CSS variables only
- **Accessibility First:** Semantic markup, keyboard nav, focus states, correct contrast

## Design System

### Token Conventions

All visual values come from `src/styles/tokens.css`. Prefer CSS tokens over hardcoded values.
Intentional exceptions: toast status-semantic colors (`#22c55e`, `#ef4444`, `#f59e0b`) and
ThemeToggle thumb backgrounds (`#252538`, `#FFFFFF`) are hardcoded because no semantic token maps to them.

Key tokens:

- Colors: `--bg`, `--surface`, `--surface-high`, `--border`, `--text`, `--text-muted`, `--accent`, `--accent-hover`, `--accent-dim`
- Typography: `--font-sans` (Geist), `--font-mono` (Geist Mono), `--text-xs` through `--text-4xl`
- Spacing: `--space-1` through `--space-24`, `--section-gap`, `--content-gap`, `--card-padding`
- Layout: `--container-max` (68rem prose), `--wide-max` (88rem portfolio)
- Radii: `--radius-sm` (4px) / `--radius-md` (8px) / `--radius-lg` (12px) / `--radius-full` (9999px)
- Motion: `--duration-fast` (150ms) / `--duration-base` (250ms) / `--duration-slow` (350ms)
- Easing: `--ease-out` / `--ease-in-out`
- Shadows: `--shadow-sm` / `--shadow-md` / `--shadow-lg`

### Styling Conventions

- CSS variables from tokens.css exclusively — no Tailwind, no hardcoded values (except noted above)
- Component-scoped `<style>` blocks in Astro files
- Both `[data-theme='light']` and `[data-theme='dark']` must look polished
- Monospace font (`--font-mono`) for: dates, metadata labels, tag slugs, code, technical accents
- Sans font (`--font-sans`) for: all body text, headings, UI labels

### colorToken

Notes support an optional `colorToken` frontmatter field — a raw CSS color string.
Use directly as a CSS value; fall back to `var(--accent)` when absent.

## Interactive Components

- **ThemeToggle:** pill/track with Moon+Sun SVGs, `role="switch"`, `aria-checked`, vanilla JS
- **LanguageSwitcher:** `EN` / `PT` in Geist Mono, active locale weight 600
- **SearchDialog:** opened via `window.openSearch()` or pressing `/`; focus trap; Esc closes
- **Header mobile drawer:** `aria-expanded`, `aria-controls`, closes on link click and Escape
- **Nav active indicator:** tubelight pill + glow, position calculated in vanilla JS on load
- **Toast:** `window.showToast({ message, variant, title?, duration? })`; 4 variants; auto-dismiss
- **Hero typewriter:** vanilla JS, cycles phrases, `prefers-reduced-motion` respected
- **Hero background paths:** CSS-animated SVG, `prefers-reduced-motion` respected
- **Bento project cards:** pure CSS hover (dot pattern, lift, border accent), no JS needed

## Plan Mode Protocol

Before any code changes, review:

1. Content model alignment with spec
2. Validation and schema compliance
3. Test coverage gaps
4. Build determinism and SEO metadata
