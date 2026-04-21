## Project Source of Truth
**GEMINI.md is the entry point.** For all detailed logic, task breakdowns, and architectural rationale, you MUST always refer to:
* **Design Spec:** `@docs/superpowers/specs/2026-03-19-personal-website-design.md`
* **Frontend Redesign Spec:** `@docs/superpowers/specs/2026-03-19-frontend-redesign-design.md`
* **Implementation Plan:** `@docs/superpowers/plans/2026-03-19-personal-website-implementation.md`
* **Frontend Redesign Plan:** `@docs/superpowers/plans/2026-03-20-frontend-redesign.md`

## Engineering Core Principles
You must adhere to these preferences in every interaction:
* **Static-First Architecture:** Minimize runtime complexity and backend services. The site must rely on deterministic static builds using Astro.
* **Content as Contract:** Treat all synced markdown content (Blog, Notes, Now) as contract-driven input. Strict-fail validation via Zod schemas is mandatory before any build or deploy.
* **Bilingual by Design:** English is default, Brazilian Portuguese (`/pt-br/`) is secondary. Fallback gracefully to original-language pages with clear notices; never generate synthetic translation pages.
* **Component Discipline:** Keep Astro layout and UI components small, responsibility-focused, and styled via CSS variables from `src/styles/tokens.css`. No hardcoded values, no Tailwind.
* **Accessibility & UX First:** Ensure semantic markup, keyboard navigation (especially search and theme toggles), and correct visual contrast for both light and dark themes.

## Architecture Facts
* **`src/lib/content/staticPaths.ts`** — shared factory functions (`makeNoteStaticPaths`, `makeBlogStaticPaths`, `buildNoteIndex`) used by all EN and PT-BR note/blog page pairs.
* **`src/components/notes/layouts/NoteLayoutWrapper.astro`** — shared wrapper for all 4 note layout types.
* **`src/lib/analytics/consent.ts`** — single source of truth for consent state; used by both `AnalyticsScripts.astro` and the consent dialog.
* **`src/styles/tokens.css`** — all design tokens. Intentional hardcoded exceptions: toast status colors and ThemeToggle thumb backgrounds only.
* **File naming:** `YYYY-MM-{slug}.{lang}.md` for blog/notes (e.g. `2026-04-welcome.en.md`).
* **Layout:** `--container-max` is 68rem (prose), `--wide-max` is 88rem (portfolio/bento).

## Plan Mode Protocol (MANDATORY)
Before making any code changes or processing content syncs, you must conduct a thorough review across these four pillars:

### 1. Architecture & Content Strategy Review
* Verify content model alignment (Blog, Notes, Now, Portfolio).
* Check that Obsidian sync boundaries are respected (only reading from designated directories).
* Evaluate routing logic for localized paths and translation fallbacks.

### 2. Validation & Quality Review
* Audit frontmatter structures against defined Zod schemas.
* **Aggressively** call out missing metadata (e.g., summary, tags, translation key, color tokens) or template structure violations.
* Ensure no malformed content is allowed to silently skip or partially publish.

### 3. Test & Verification Review
* Evaluate gaps in E2E tests (Playwright) for critical paths (Homepage, Search, Locale Switching, Theme toggling).
* Check unit test coverage for content utilities (validation scripts, locale path mapping).
* Audit static search index generation and RSS feed output correctness.

### 4. Build & Performance Review
* Verify static build determinism and execution of CI validation gates.
* Ensure search indexing remains statically generated and performant without a backend.
* Check SEO metadata generation and accessibility requirements (focus states, ARIA roles).

## Reporting & Interaction Rules
For every issue (validation failure, architectural smell, or test gap) found:
1.  **Describe:** State the problem concretely with file/line references or content properties.
2.  **Options:** Present 2-3 options for resolving the structural or validation issue.
3.  **Analysis:** For each option, specify implementation effort, alignment with the static-first mandate, and maintenance burden.
4.  **Recommend:** Provide your opinionated recommendation (always as **Option A**) based on my core principles.
5.  **Consent:** Use `AskUserQuestion` or explicitly pause to get approval before proceeding.

### Initialization Workflow
**BEFORE STARTING ANY WORK**, you must:
1. **Read the Design Spec:** `@docs/superpowers/specs/2026-03-19-personal-website-design.md`
2. **Read the Implementation Plan:** `@docs/superpowers/plans/2026-03-19-personal-website-implementation.md`
3. **Ask me to choose a mode:**
* **/BIG FEATURE:** Interactive review of all architectural, validation, and layout components.
* **/CONTENT SYNC:** Focus on validating synced markdown content and resolving schema conflicts.
* **/SMALL CHANGE:** Quick review with exactly ONE question per section.

### Output Formatting
* **Number** every issue (1, 2, 3…).
* **Letter** every option (A, B, C…).
* When confirming actions, refer specifically to the **Number** and **Letter** to ensure clarity.
* Always pause for feedback after each section.
