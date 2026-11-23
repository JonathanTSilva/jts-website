# Site Review Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Every task carries a model tag; dispatch it to that model as described in **Orchestration** below.

**Goal:** Fix every finding (F01–F30) of the 2026-11-21 full site review so the site stays correct, fast, private and cheap to maintain for years, without ever breaking the writing pipeline that publishes from the `jts-brain` vault through the `jts-skills` skills.

**Architecture:** 17 workstreams, one PR each, grouped in 7 phases. Phase 1 removes risk cheaply; phase 2 fixes URLs and SEO; phase 3 moves to Astro 7; phase 4 collapses the EN/PT page copies into one component per page; phases 5–7 harden content, tests, tooling and automation. Logic changes land as small pure modules in `src/lib/` with unit tests, and page files become thin locale wrappers.

**Tech Stack:** Astro 6 → 7, TypeScript, Zod 4, Vitest, Playwright, pnpm 10, sharp, GitHub Actions, GitHub Pages.

**Spec:** [`docs/reviews/2026-11-21-full-site-review.md`](../../reviews/2026-11-21-full-site-review.md). Finding IDs (`F01`…) in this plan refer to it. Its section "How publishing works today" lists the cross-repo contract points; read it together with [`docs/site-operations/obsidian-pipeline.md`](../../site-operations/obsidian-pipeline.md).

## Global Constraints

- Never push to `main`; one branch and one squash-merged PR per workstream, named `<type>/<issue>-<slug>`; Conventional Commits for commits and PR titles.
- No `Co-Authored-By` trailer in commits.
- Before every commit: `pnpm run typecheck && pnpm test:unit` must pass.
- pnpm runs through mise: `mise exec node@26.7.0 -- pnpm …` until WS1 pins the version, then `mise exec node@<pinned> -- pnpm …`.
- Styling: CSS variables from `src/styles/tokens.css` only, no Tailwind, no new hardcoded values except the exceptions listed in `AGENTS.md`; both `[data-theme='light']` and `[data-theme='dark']` must look polished.
- Bilingual: English at `/`, Portuguese under `/pt-br/`; every user-visible string exists in both languages.
- Pin every third-party action by full commit SHA with a version comment.
- Do not edit `LICENSE`. Template-rendered files (`.copier-answers.yml`, `AGENTS.md`, `CLAUDE.md`, `ci.yml`, `.pre-commit-config.yaml` and the other standard files) change through `copier update`, not by hand.
- Deploy, build and content config change only in the workstream that is about them; this is the live site.
- Outward-facing or irreversible actions (creating issues, pushing, opening or merging PRs, repo settings, vault edits) wait for Jonathan.

**Publishing pipeline contract** (applies to every task):

- `scripts/validate-content.ts` and everything it imports (`src/lib/content/schemas.ts`, `validation.ts`, `contracts.ts`, `locale.ts`, and any new module they import) must run under plain `tsx`, outside Astro: no `astro:*` virtual modules and no `astro/zod`. `jts-skills/blog-publish/scripts/validate_website.sh` runs it that way.
- Content filenames keep the `<stem>.<lang>.md` shape and the sync keeps mirroring `08-Publish/{Blog,Notes}` and the `Now.*.md` files. The vault's wikilinks are written as filename stems (`[[2026-11-low-cost-homelab-setup.en|…]]`) and must keep resolving.
- Never delete or rename the `*-cheatsheet.*` content; `blog-publish` uses it as the example of every kind.
- Agents never write in `~/Projects/jts-brain` without Jonathan's yes in the same turn, and never commit or push there (the homelab server's daily checkpoint does that). Changes in `~/Projects/jts-skills` follow that repo's own `AGENTS.md`: own branch, own PR.
- A task that changes the contract (schemas, slugs, filenames, sync mapping, URL shape, validation messages the skills parse) ships its jts-skills and jts-brain counterparts in the same rollout, per the **Publishing pipeline impact** table, and passes the **vault compatibility gate** before its PR is pushed.
- A new frontmatter key is also added to the `publish` rule in `jts-brain/99-Meta/Schema/schema.yaml` (vaultprops reports unknown keys).
- The checked-out branch is live for the writing pipeline: `~/.claude/skills/*` are symlinks into `~/Projects/jts-skills`, and `validate_website.sh` validates against `~/Projects/jts-website` by default. Contract-changing work happens in git worktrees (`superpowers:using-git-worktrees`), so the main checkouts stay on `main` and `blog-publish` keeps working while a workstream is open.

## Review Focus

1. **A post that exists in only one language.** The other locale's fallback page must render with a visible notice, carry `noindex, follow`, stay out of the sitemap, and its language switcher must lead to the original, not a 404. Pinned by tests in Tasks 3.1, 3.3, 3.4 and 11.2.
2. **Old URLs already shared on LinkedIn** (`/blog/2026-11-low-cost-homelab-setup.en/`) must still land on the post after the slug change. Pinned in Task 4.4.
3. **A vault sync that references a missing image** must fail the sync PR loudly instead of shipping a broken `<img>`. Pinned in Task 9.1.
4. **Publishing a new pair after any contract change.** A pair produced by `blog-publish` after the change must pass `check_pair.py`, `validate_website.sh`, the sync, `lint:content` and the build, and links to already-published posts written as filename stems must stay links. Pinned by the vault compatibility gate (run by every contract-changing workstream) and the tests in Tasks 1.4, 4.2 and 10.1. Date handling in UTC−3 builds is pinned separately in Task 7.2.
5. **Dark theme after the contrast changes** must pass axe with no rule filtered, and the refreshed visual snapshots must be looked at by a human before they are committed. Pinned in Task 13.2.

---

## Orchestration

### Model routing

| Tag | Model | How to dispatch | Use for |
|---|---|---|---|
| 🧠 **Opus** | Opus 5.5 | The orchestrating session itself, or the `architect` agent | Decisions, designs, triage, color and copy choices, reviewing every PR before it is pushed |
| 🔨 **Sonnet** | Sonnet 5.5 | `builder` agent | Normal implementation: TDD, refactors, workflows, anything needing judgment inside a defined scope |
| ⚙️ **Flash → Haiku** | Gemini 3.8 Flash first, Haiku as the redundant backup | `agy` headless (edit-only), then the `mechanic` agent | Exact, checklist-driven edits where the plan gives the text to write and a command that proves it |
| 👤 **Jonathan** | — | Ask | Decisions D1–D9, vault edits, repo settings, pushes, merges |

### Protocol for every task

1. **Orchestrator (Opus)** opens the workstream branch, reads the task, and confirms its prerequisites are merged.
2. **⚙️ tasks**
   1. Run Flash. agy headless cannot run shell commands with the current permissions, so the prompt is edit-only and the orchestrator runs every shell step itself (installs, `git rm`, verification):

      ```bash
      agy --model gemini-3.8-flash-medium --mode accept-edits -p "$(cat <<'EOF'
      You are editing the repository at /home/jonathan/Projects/jts-website.
      Do not run any shell command. Edit only these files: <FILES>.
      Do not create, delete or touch any other file.
      Checklist:
      <EXACT CHECKLIST FROM THE TASK>
      When done, list the files you changed.
      EOF
      )"
      ```

   2. The orchestrator checks `git diff --stat` (only the allowed files may change) and runs the task's verify command.
   3. On any failure, restore only the files Flash touched (`git restore <those files>`), then dispatch the `mechanic` agent (Haiku) with the same checklist plus the verify command. Haiku may run shell commands.
   4. If Haiku also fails, escalate to `builder` (Sonnet) with the failure output. Never improvise a fourth attempt at the same tier.
3. **🔨 tasks:** dispatch `builder` with the task text verbatim, the allowed files, the Interfaces block of the task and of any task it consumes, and the done-check. The builder follows TDD and does not commit. If it fails twice, the orchestrator takes the task back to Opus.
4. **🧠 tasks:** the orchestrator does them directly or through `architect` when a fresh context helps. They end with a written decision (in the PR description or this plan's decision log).
5. **Review gate (Opus):** before a branch is pushed, run `superpowers:requesting-code-review` (or `architect`) on the whole branch diff against the task list. Fix findings through the same routing.
6. **Commit:** the orchestrator stages the task's files and commits if allowed; if `git commit` is permission-blocked, it hands Jonathan the exact `! git commit -m "…"` line.
7. **Push and PR:** after Jonathan approves the branch, push and open the PR with the AI-assistance disclosure from the PR template, linking the finding IDs.

### Workstream map

| Phase | WS | Issue | Branch type | Findings | Depends on |
|---|---|---|---|---|---|
| 0 | WS0 Kickoff | #73 | `docs` | — | — |
| 1 | WS1 Dependency hygiene and the vault validator | #74 | `chore` | F03, F04, F09, F24, F30 | WS0 |
| 1 | WS2 Quick wins, including the Now sync | #75 | `fix` | F02, F06, F07, F08, F20 (handlers), F21, F29 | WS0 |
| 2 | WS3 Localized routes and SEO | #76 | `fix` | F01, F19 (sitemap) | WS1 |
| 2 | WS4 Clean slugs and redirects, across website, jts-skills and jts-brain (if D1 = A) | #77 | `feat` | F01, F30 | WS3, Task 1.4 |
| 3 | WS5 Astro 7 and major upgrades | #78 | `chore` | F05 | WS1, WS3 |
| 4 | WS6 One component per page, UI dictionary | #79 | `refactor` | F10, F21 | WS5 |
| 4 | WS7 Structured data, dates, site URL | #80 | `feat` | F19, F20 (JSON-LD), F22, F10 (domain) | WS6 |
| 5 | WS8 Content validation and scheduled publishing | #81 | `feat` | F12, F27, F30 | WS3 |
| 5 | WS9 Sync images and book covers | #82 | `fix` | F13, F23 | WS8 |
| 5 | WS10 Wikilink plugin tests and fixes | #83 | `test` | F18 | WS8 |
| 6 | WS11 E2E fixtures decoupled from the vault | #84 | `test` | F11 | WS6, WS8 |
| 6 | WS12 E2E hardening | #85 | `test` | F15 | WS11 |
| 6 | WS13 Dark-mode contrast (#40) | #40 | `fix` | F16 | WS12 |
| 7 | WS14 ESLint, knip, dead exports (#34) | #34 | `chore` | F17, F25 | WS6 |
| 7 | WS15 Docs cleanup | #86 | `docs` | F26 | WS0 (any time) |
| 7 | WS16 CI hygiene | #87 | `ci` | F14 | WS1 |
| 7 | WS17 Site health automation | #88 | `ci` | F28, F20 (`security.txt`) | WS16 |

WS15 and WS16 have no code dependencies and can run in parallel with anything after WS1.

### Publishing pipeline impact

Every workstream checked against the pipeline (`jts-skills` → `jts-brain/08-Publish` → sync → build). "None" means the vault and the skills keep working unchanged; the gate still runs where marked.

| WS | Impact on jts-brain / jts-skills | Required counterpart | Gate |
|---|---|---|---|
| WS1 | Adds `validate-content.ts --vault` (Task 1.4), a new tool the skills can use. Nothing breaks. | Optional, done in Task 8.4: `validate_website.sh` switches to `--vault`. | Yes (1.4 creates it) |
| WS2 | Task 2.5 fixes the `Now.en.md` mapping (F29). The vault already uses `Now.en.md`, so it needs no change. | None. | Yes (2.5) |
| WS3 | URLs keep their shape; duplicate pages disappear, so the `/pt-br/blog/<en-slug>` copies no longer exist. `blog-share` links use the same-language URL, so they still work. | None. | Yes |
| WS4 | **Breaking.** `slug` stops matching the filename stem. | jts-skills: `blog-publish` (`SKILL.md`, `references/note-types.md`), `check_pair.py` (slug rule and the published-links set), `test/blog-publish.bats`, `blog-share` (URL text). jts-brain: the `slug:` line of every file in `08-Publish`. Landing order in Task 4.5. | Yes |
| WS5 | Risk only: an upgrade can tempt `astro/zod` or `astro:content` into `schemas.ts`, which would break `validate_website.sh`. | None if the Global Constraint holds. | Yes |
| WS6, WS7 | None (pages and metadata only). `updatedAt` starts to show; `blog-publish` never sets it (updating published posts is out of its scope), so it appears only when Jonathan edits a published file by hand. | Optional follow-up for jts-skills: an "update a published post" flow that sets `updatedAt`. | No |
| WS8 | Stricter validation runs inside `validate_website.sh` and the sync job. Scheduling changes what a future `publishedAt` means. Book-rule messages gain a `Frontmatter: [author]` prefix; nothing parses them. | jts-skills: `blog-publish` step 7 report text ("goes live on `publishedAt`") and `blog-share` (expect 404 until then); `validate_website.sh` passes `--vault` so cross-file checks run before the pair is written (Task 8.4). | Yes |
| WS9 | A missing image now fails the sync instead of shipping a broken `<img>`. `check_pair.py` already rejects embeds missing from `99-Meta/Attachments`, so a pair from `blog-publish` cannot trigger it; only a hand edit can. Book covers stay https URLs (D9 = A). | None for D9 = A. D9 = B needs `blog-draft`, `blog`, `blog-publish`, `note-types.md`, `check_pair.py:415` and the sync. | Yes |
| WS10 | Unresolved wikilinks start to warn. Must keep resolving filename-stem links. | None. | Yes |
| WS11 | The E2E suite stops depending on the cheatsheets, but they stay in the vault as the skills' examples. | None. | No |
| WS12–WS14, WS16 | None. | None. | No |
| WS15 | `obsidian-pipeline.md` is corrected to match reality. | None. | No |
| WS17 | Link-rot issues point at content that lives in the vault. | The issue body names the vault file to fix (`src/content/blog/X.md` → `08-Publish/Blog/X.md`). | No |

#### Vault compatibility gate

The orchestrator runs this before pushing any workstream marked "Yes" above. All commands must pass.

```bash
# 1. The website validator over the real vault, as the sync would map it (Task 1.4 adds --vault)
mise exec node@<pinned> -- pnpm lint:content --vault ~/Projects/jts-brain

# 2. Sync dry run in a throwaway worktree, then validate and build there
git worktree add <scratchpad>/sync-check HEAD
cd <scratchpad>/sync-check && pnpm install --frozen-lockfile \
  && SYNC_SOURCE_DIR=~/Projects/jts-brain pnpm sync:content \
  && pnpm lint:content && pnpm build
git worktree remove <scratchpad>/sync-check --force

# 3. The skills' own checks against this branch's code (WEBSITE = the branch checkout or the worktree above)
cd ~/Projects/jts-skills && bats test/blog-publish.bats
for kind in Notes/book-cheatsheet Notes/note-cheatsheet Blog/2026-03-markdown-cheatsheet; do
  ~/Projects/jts-skills/blog-publish/scripts/validate_website.sh --website "$WEBSITE" \
    ~/Projects/jts-brain/08-Publish/$kind.en.md ~/Projects/jts-brain/08-Publish/$kind.pt-br.md
done
```

Expected: every step exits 0. Until Task 1.4 is merged, step 1 is skipped. The sync dry run must not delete or add any file in `src/content` other than vault changes not yet synced (compare `git status` in the worktree with the vault's recent edits). Until WS4 lands the slug change, the skills' bats suite runs unchanged; from WS4 on it runs the updated suite from the jts-skills branch.

### Decisions for Jonathan

Each has a recommendation, marked **A**. Tasks that depend on a decision say so.

| ID | Decision | Options |
|---|---|---|
| D1 | Slug format | **A:** the slug becomes `<base>`, the filename stem without the `YYYY-MM-` date and the language (`/blog/low-cost-homelab-setup/`, `/pt-br/blog/low-cost-homelab-setup/`), the same in both languages. Filenames keep their shape, so every wikilink keeps working. Redirects from every old URL. Needs the jts-skills and vault changes in WS4. Cheapest now, with 8 pairs. **B:** keep `.en` / `.pt-br` slugs; WS4 is skipped and nothing outside this repo changes. |
| D2 | Pages for a missing translation | **A:** keep the fallback page with a notice, `noindex, follow`, out of the sitemap. **B:** do not build it; the language switcher goes straight to the original. |
| D3 | TypeScript 7 | **A:** stay on TypeScript 5.x until `@astrojs/check` supports 7, decided in Task 5.1. **B:** upgrade with Astro 7. |
| D4 | E2E content | **A:** repo-owned fixture collections rendered under `/test-fixtures/`, stripped from `dist/` before deploy. **B:** tests discover whatever real content exists and skip missing types. |
| D5 | Duplicate CI on PRs | **A:** remove the `pull_request` trigger from `pipeline.yml`; `ci` stays the required PR gate and `pipeline.yml` stays the deploy gate on `main` and nightly. This overrides "pipeline.yml stays as it is" in `AGENTS.md`. **B:** keep both. |
| D6 | `.github/agents/*.agent.md` (7 files) | **A:** delete if no Copilot agent uses them. **B:** keep. |
| D7 | WebKit in E2E | **A:** a WebKit mobile project running only the smoke, header and theme specs. **B:** none. |
| D8 | Dependabot auto-merge | **A:** auto-merge patch and minor updates once `ci` passes (needs the repo setting "Allow auto-merge"). **B:** manual merges. |
| D9 | Book covers | **A:** keep https cover URLs (the skills already require them) and serve them through Astro's build-time image pipeline, so the site never hotlinks at runtime; a dead cover falls back to a placeholder and is reported by the link-rot job. Website-only. **B:** covers as vault attachments; needs changes in `blog-draft`, `blog`, `blog-publish`, `note-types.md`, `check_pair.py` and the sync. |

---

## Phase 0 — Kickoff

### Task 0.1: Land the review and this plan 🧠 Opus

**Files:**
- Create: `docs/reviews/2026-11-21-full-site-review.md` (exists, uncommitted)
- Create: `docs/superpowers/plans/2026-11-21-site-review-remediation.md` (this file)
- Modify: `README.md` (Docs list)

- [x] **Step 1:** Add two lines to the `## Docs` list in `README.md`: `- [Site review 2026-11-21](docs/reviews/2026-11-21-full-site-review.md)` and `- [Site review remediation plan](docs/superpowers/plans/2026-11-21-site-review-remediation.md)`.
- [ ] **Step 2:** `pre-commit run --all-files`. Expected: all hooks pass. (`.markdownlint-cli2.yaml` ignores `docs/**`, so only `README.md` is markdown-linted by the shared `lint-docs` job.)
- [x] **Step 3:** Commit on a `docs/73-site-review` branch: `docs: add the 2026-11-21 site review and remediation plan`.

### Task 0.2: Decisions and issues 👤 Jonathan + 🧠 Opus

- [x] **Step 1:** Jonathan answers D1–D9. Opus records the answers in a "Decision log" section at the end of this file.
- [x] **Step 2:** Opus drafts one GitHub issue per workstream (title, finding IDs, task list, labels per the handbook). Jonathan approves; Opus creates them with `gh issue create` and writes each issue number into the workstream map so branch names can be formed.

---

## Phase 1 — Quick wins and supply chain

### WS1 — Dependency hygiene and the vault validator (`chore/74-dependency-hygiene`)

#### Task 1.1: Lockfile, package manager, Node pin, unused dependency, generated index ⚙️ Flash → Haiku

**Files:**
- Delete: `package-lock.json`
- Modify: `package.json`, `.gitignore`, `.github/dependabot.yml`, `.github/workflows/pipeline.yml`, `.github/workflows/sync-content.yml`, `.github/workflows/update-snapshots.yml`, `.devcontainer/devcontainer.json`
- Create: `.node-version`
- Untrack: `public/api/`

- [ ] **Step 1 (orchestrator):** Read the Node major the shared workflow uses: `gh api repos/JonathanTSilva/.github/contents/.github/workflows/node.yml -q .content | base64 -d | grep -n node-version`. Call it `N`. Read the exact pnpm version: `mise exec node@26.7.0 -- pnpm --version`. Call it `P`.
- [ ] **Step 2 (orchestrator):** `git rm package-lock.json`, `git rm -r --cached public/api`, `mise exec node@26.7.0 -- pnpm remove marked`.
- [ ] **Step 3 (Flash checklist):**
  - `package.json`: `"packageManager": "pnpm@P"`; add `"engines": { "node": ">=N" }`; change `"dev"` to `"pnpm build:search && astro dev"`.
  - `.gitignore`: add `/public/api/` under `# Build outputs`.
  - `.node-version`: the single line `N`.
  - The three workflows: replace `node-version: 22` with `node-version-file: .node-version` (in `sync-content.yml`: `node-version-file: website-repo/.node-version`).
  - `.devcontainer/devcontainer.json`: node feature `"version": "N"`.
  - `.github/dependabot.yml`, npm entry: replace the `node-dependencies` group with `npm-minor-patch: { patterns: ["*"], update-types: ["minor", "patch"] }` and add `open-pull-requests-limit: 10`, so majors arrive as separate PRs.
- [ ] **Step 4: Verify:** `pnpm install --frozen-lockfile` prints no `Cannot switch to pnpm` warning; `pnpm run typecheck && pnpm test && pnpm build` pass; `git ls-files public/api` prints nothing; `ls dist/api/en/search-index.json` exists.
- [ ] **Step 5:** Commit `chore: drop the stale npm lockfile, pin pnpm and Node, remove unused marked`.

#### Task 1.2: Vendor the Geist fonts and drop the `geist` package 🔨 Sonnet

**Files:**
- Create: `src/assets/fonts/geist/` with `Geist-Variable.woff2`, `GeistMono-Variable.woff2`, `Geist-Regular.ttf`, `Geist-SemiBold.ttf`, `Geist-Bold.ttf`, `GeistMono-Medium.ttf`, `Geist-Regular.woff2`, `Geist-SemiBold.woff2`, `LICENSE.txt` (copied from `node_modules/geist/`, SIL OFL)
- Modify: `src/styles/global.css:7,15`, `src/lib/ogImage.ts:7-15`, `src/lib/cv/pdf.ts:9-14`, `package.json`
- Test: `tests/unit/og-image.test.ts`, `tests/unit/cv/pdf.test.ts`

**Interfaces:**
- Produces: `FONT_DIR` in `src/lib/ogImage.ts` = `'src/assets/fonts/geist'`; `getGeistFontCss(): Promise<string>` keeps its signature and reads from `src/assets/fonts/geist/` resolved via `new URL('../../assets/fonts/geist/', import.meta.url)`.

- [ ] **Step 1:** Copy the eight font files and the license; point the three call sites at the new folder.
- [ ] **Step 2:** `pnpm remove geist`.
- [ ] **Step 3: Verify:** `pnpm why next` prints nothing; `pnpm test:unit` passes (includes the CV PDF integration test and OG image tests); `pnpm build` passes; open `dist/og-image.png` and `dist/assets/cv/jonathan-cv.pdf` and confirm Geist still renders.
- [ ] **Step 4:** Commit `chore: vendor Geist fonts and drop the geist package (removes Next.js)`.

#### Task 1.3: Confirm Dependabot works 🧠 Opus + 👤 Jonathan

- [ ] **Step 1:** After WS1 merges, Jonathan opens Insights → Dependency graph → Dependabot → npm → "Check for updates".
- [ ] **Step 2:** Opus reads the job log. Expected: at least one npm PR within 24 hours, and the six Next.js alerts closed automatically. If the job fails, record the error in the WS1 issue and fix it in a follow-up commit before starting WS5.

#### Task 1.4: Validate the vault directly (`--vault`) 🔨 Sonnet

One validator for the whole pipeline (F30): the sync job, the vault compatibility gate and, from Task 8.4, `blog-publish` all run the same code over the same files the sync would produce.

**Files:**
- Modify: `scripts/validate-content.ts`
- Create: `src/lib/content/vaultSource.ts`
- Test: `tests/unit/content/vault-source.test.ts`

**Interfaces:**
- Produces:

  ```ts
  // src/lib/content/vaultSource.ts — plain Node, no astro:* imports
  export interface SourceFile { path: string; collection: CollectionType; destName: string } // destName = filename the sync would write
  export function listVaultFiles(vaultRoot: string): SourceFile[];   // 08-Publish/Blog/*.md|mdx → blog, Notes/* → notes, Now.en.md (or legacy Now.md) → now/index.en.md, Now.pt-br.md → now/index.pt-br.md
  export function listRepoFiles(contentRoot: string): SourceFile[];  // today's behavior over src/content
  export function withExtraFiles(base: SourceFile[], extra: string[]): SourceFile[]; // collection = notes when frontmatter has noteType, else blog; an extra file replaces a base file with the same destName
  ```

  CLI: `validate-content.ts [--vault <dir>] [extra files…]`. Without arguments it behaves exactly as today. `pnpm lint:content --vault ~/Projects/jts-brain` works because pnpm forwards the arguments.

- [ ] **Step 1: Write the failing tests** with a temp vault tree: `listVaultFiles` maps `08-Publish/Blog/a.en.md` to `{ collection: 'blog', destName: 'a.en.md' }`, `Now.en.md` to `{ collection: 'now', destName: 'index.en.md' }`, falls back to `Now.md` only when `Now.en.md` is absent, and ignores every folder outside `08-Publish`. `withExtraFiles` replaces a same-named base file and puts a file with `noteType` in `notes`.
- [ ] **Step 2:** Run; expect FAIL. Implement; `validate-content.ts` builds its file list from these helpers and keeps its output format.
- [ ] **Step 3: Verify:** tests pass; `pnpm lint:content` output is unchanged; `pnpm lint:content --vault ~/Projects/jts-brain` passes (it also validates vault pairs not yet synced, such as `2026-11-chinese-cameras-internet`); the existing `validate_website.sh` still passes on a cheatsheet pair (gate step 3).
- [ ] **Step 4:** Commit `feat(content): validate the vault's 08-Publish directly`.

### WS2 — Quick wins, including the Now sync (`fix/75-perf-privacy-quick-wins`)

#### Task 2.1: Self-host the Outfit logo font ⚙️ Flash → Haiku

**Files:**
- Modify: `src/styles/global.css:2`, `tests/e2e/perf-regression.spec.ts`, `package.json`

- [ ] **Step 1 (orchestrator):** `pnpm add @fontsource/outfit`.
- [ ] **Step 2 (Flash checklist):**
  - `global.css`: replace line 2 with `@import '@fontsource/outfit/600.css';` and `@import '@fontsource/outfit/700.css';`.
  - `perf-regression.spec.ts`: replace the body of the "whiteboard note loads self-hosted fonts" test with a network check:

    ```ts
    const hits: string[] = [];
    page.on('request', (r) => { if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) hits.push(r.url()); });
    for (const path of ['/', '/pt-br/', '/notes/whiteboard-cheatsheet.en']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }
    expect(hits).toEqual([]);
    await expect(page.locator('[data-whiteboard]')).toBeVisible();
    ```

- [ ] **Step 3: Verify:** on `main` (before the change) the new test fails; on the branch, `pnpm build && pnpm exec playwright test perf-regression` passes; `grep -r googleapis dist/_astro` prints nothing.
- [ ] **Step 4:** Commit `fix(privacy): self-host the Outfit logo font instead of Google Fonts`.

#### Task 2.2: Optimized hero, about and logo images; icons and manifest 🔨 Sonnet

**Files:**
- Move: `public/assets/images/profile_ai_transparent2.png` → `src/assets/images/profile-hero.png`; `public/assets/images/profile2.jpg` → `src/assets/images/profile-about.jpg`; copy `public/assets/images/jts-logo-circle-simple.png` → `src/assets/images/jts-logo.png` (keep the public copy; `ogImage.ts` and old links use it)
- Modify: `src/components/home/Hero.astro`, `src/components/portfolio/AboutSection.astro`, `src/components/site/Header.astro`, `src/components/site/Footer.astro`, `src/layouts/BaseLayout.astro`
- Create: `public/favicon-32x32.png`, `public/apple-touch-icon.png` (180), `public/icon-192.png`, `public/icon-512.png`, `public/site.webmanifest`
- Test: `tests/e2e/home.spec.ts`

- [ ] **Step 1: Write the failing tests** in `home.spec.ts`:
  - `hero image is optimized`: wait for the response whose URL contains `profile-hero` while loading `/`; assert body length `< 250_000` and that the `<img>` has `width`, `height` and `fetchpriority="high"`.
  - `icons and manifest are linked`: `link[rel="icon"]` href ends with `favicon-32x32.png`; `link[rel="manifest"]` href is `/site.webmanifest` and `GET /site.webmanifest` returns 200 with `"name": "Jonathan Tobias"`.
- [ ] **Step 2:** Run them; expect FAIL.
- [ ] **Step 3: Implement:** use `<Picture>` from `astro:assets` with `formats={['avif', 'webp']}`, `widths={[320, 480, 720]}`, a `sizes` matching the hero column, `loading="eager"`, `fetchpriority="high"` for the hero and lazy for the about image; `<Image width={24} height={24} densities={[1, 2]}>` for the header and footer logo. Delete both inline `onerror=` attributes and the `.profile-placeholder` / `.about-placeholder` CSS they toggled (a build-time import cannot be missing). Generate the four icons from the logo once with sharp in a throwaway script (not committed). Manifest: `name` "Jonathan Tobias", `short_name` "Tobias", `theme_color` and `background_color` matching the light `--bg` value, both icons. `BaseLayout.astro`: replace the favicon `<link>` with icon, apple-touch-icon and manifest links.
- [ ] **Step 4: Verify:** the new tests pass; `pnpm build`; visual snapshots unchanged or differences explained; both themes checked by screenshot.
- [ ] **Step 5:** Commit `perf: serve responsive hero, about and logo images; add icons and manifest`.

#### Task 2.3: Make whiteboard "copy as image" work ⚙️ Flash → Haiku

**Files:**
- Modify: `astro.config.mjs:20-23`, `src/components/notes/layouts/WhiteboardLayout.astro:73`

- [ ] **Step 1 (Flash checklist):** delete the `external: ['html2canvas'],` line and its three comment lines above it; delete the `// @ts-ignore …` line above `await import('html2canvas')`.
- [ ] **Step 2: Verify:** `pnpm run typecheck` passes; `pnpm build`; `grep -rl 'import("html2canvas")' dist/_astro` prints nothing; `ls dist/_astro | grep -i html2canvas` shows a chunk.
- [ ] **Step 3:** Commit `fix(notes): bundle html2canvas so whiteboard copy-as-image works in production`.

#### Task 2.4: PT back link, localized skip link, viewport ⚙️ Flash → Haiku

**Files:**
- Modify: `src/pages/pt-br/blog/[slug].astro:43`, `src/layouts/BaseLayout.astro:35,65`
- Test: `tests/e2e/blog.spec.ts`, `tests/e2e/a11y.spec.ts`

- [ ] **Step 1 (Flash checklist):**
  - `pt-br/blog/[slug].astro:43`: `href="/pt-br/blog"`.
  - `BaseLayout.astro:35`: `content="width=device-width, initial-scale=1"`.
  - `BaseLayout.astro:65`: link text `{locale === 'pt-br' ? 'Pular para o conteúdo' : 'Skip to content'}` (moves into the dictionary in WS6).
  - `blog.spec.ts`, new test `PT post back link stays in Portuguese`: open the first PT post from `/pt-br/blog`, assert `.back-link` has `href` `/pt-br/blog`.
  - `a11y.spec.ts`, new test `PT skip link is Portuguese`: on `/pt-br/`, `.skip-link` has text `Pular para o conteúdo`.
- [ ] **Step 2: Verify:** both new tests fail on `main` and pass on the branch.
- [ ] **Step 3:** Commit `fix(i18n): keep the PT back link in Portuguese and localize the skip link`.

#### Task 2.5: Sync the English Now page from `Now.en.md` (F29) 🔨 Sonnet

The vault already uses `Now.en.md`; only the website changes.

**Files:**
- Modify: `scripts/sync-content.ts:12,58-61`, `docs/site-operations/obsidian-pipeline.md` (vault tree and mapping table)
- Test: `tests/unit/sync.test.ts`

**Interfaces:**
- Produces: `FILE_MAPPINGS` entries may list several sources in priority order: `{ src: ['08-Publish/Now.en.md', '08-Publish/Now.md'], dest: 'now/index.en.md' }`; the first existing source wins. Task 1.4's `listVaultFiles` uses the same order.

- [ ] **Step 1: Write the failing tests:** with only `08-Publish/Now.en.md` in the source, `now/index.en.md` gets its content; with only the legacy `Now.md`, it still syncs; with both, `Now.en.md` wins. Keep the existing `Now.md` test.
- [ ] **Step 2:** Run; expect FAIL on the first case. Implement. Run; expect PASS.
- [ ] **Step 3: Verify:** run the vault compatibility gate; in the worktree, after the sync, `git diff --stat src/content/now` is empty today (the files match), and editing `~/Projects/jts-brain/08-Publish/Now.en.md` in a scratch copy of the vault makes the diff appear.
- [ ] **Step 4:** Commit `fix(sync): read the English Now page from Now.en.md`.

---

## Phase 2 — Correct URLs and SEO

### WS3 — Localized routes and SEO (`fix/76-localized-routes-seo`)

#### Task 3.1: Route planner 🔨 Sonnet

**Files:**
- Create: `src/lib/content/routes.ts`
- Test: `tests/unit/content/routes.test.ts`

**Interfaces:**
- Produces:

  ```ts
  export interface RouteEntry {
    slug: string; language: Locale; translationKey: string;
    publishedAt: Date; updatedAt?: Date | undefined;
  }
  export interface LocalizedRoute<T extends RouteEntry> {
    entry: T;              // the entry rendered on this page
    locale: Locale;        // the page's URL locale
    path: string;          // with trailing slash, e.g. '/pt-br/blog/x/'
    isFallback: boolean;   // entry.language !== locale
    translations: Partial<Record<Locale, string>>; // real translations only, each in its own locale
  }
  export function contentPath(base: string, locale: Locale, slug: string): string;
  export function planLocalizedRoutes<T extends RouteEntry>(entries: T[], base: string, locale: Locale): LocalizedRoute<T>[];
  ```

  `base` is `'blog'` or `'notes'` now; WS11 passes `'test-fixtures/blog'`.

- [ ] **Step 1: Write the failing tests:**
  - `contentPath('blog', 'en', 'x')` → `'/blog/x/'`; `contentPath('notes', 'pt-br', 'x')` → `'/pt-br/notes/x/'`.
  - `a translation pair yields one non-fallback route per locale`: entries `a.en` (en, key `a`) and `a.pt-br` (pt-br, key `a`); `planLocalizedRoutes(e, 'blog', 'en')` has length 1, `entry.slug === 'a.en'`, `isFallback === false`, `translations` equals `{ en: '/blog/a.en/', 'pt-br': '/pt-br/blog/a.pt-br/' }`.
  - `a missing translation yields a fallback route`: only `b.en`; for `'pt-br'` the single route has `path '/pt-br/blog/b.en/'`, `isFallback true`, `translations { en: '/blog/b.en/' }`.
  - `fallback prefers English, then the first entry`: only `c.pt-br`; for `'en'` the route renders `c.pt-br` with `isFallback true`.
- [ ] **Step 2:** Run `pnpm vitest run tests/unit/content/routes.test.ts`; expect FAIL (module missing).
- [ ] **Step 3:** Implement: group by `translationKey`; pick the entry in `locale`, else the `en` entry, else the first.
- [ ] **Step 4:** Run; expect PASS.
- [ ] **Step 5:** Commit `feat(routing): add a localized route planner`.

#### Task 3.2: Static paths use the planner; notes get the fallback notice 🔨 Sonnet

**Files:**
- Modify: `src/lib/content/staticPaths.ts:59-154`, `src/components/notes/layouts/NoteLayoutWrapper.astro`, `src/pages/notes/[slug].astro`, `src/pages/pt-br/notes/[slug].astro`
- Test: `tests/unit/content/staticPaths.test.ts`

**Interfaces:**
- Consumes: `planLocalizedRoutes`, `contentPath` (Task 3.1).
- Produces: blog and note page props both include `isTranslationFallback: boolean` and `translations: Partial<Record<Locale, string>>` (paths with trailing slash). Prev/next and related-notes logic is unchanged and computed over same-locale routes.

- [ ] **Step 1: Write the failing tests:**
  - `EN blog paths contain no PT entry when its EN translation exists`: collection with `a.en`/`a.pt-br`; `makeBlogStaticPaths('en')()` params slugs equal `['a.en']`.
  - `EN note paths contain a fallback for a PT-only note`: `beta.pt-br` only; the EN route for `beta.pt-br` has `props.isTranslationFallback === true`, `prev` and `next` undefined.
  - Update the existing cross-locale test to the new semantics.
- [ ] **Step 2:** Run; expect FAIL.
- [ ] **Step 3:** Rewrite both factories on top of `planLocalizedRoutes`; pass `isTranslationFallback` to the note pages; render `TranslationFallbackNotice` in `NoteLayoutWrapper` when it is true, with the same copy the blog pages use.
- [ ] **Step 4:** Run `pnpm test`; expect PASS.
- [ ] **Step 5:** Commit `fix(routing): build one page per translation and locale`.

#### Task 3.3: Translation-aware `hreflang` and `noindex` 🔨 Sonnet

**Files:**
- Modify: `src/lib/seo/metadata.ts`, `src/components/site/SeoHead.astro`, `src/layouts/BaseLayout.astro`, the four `[slug].astro` pages, `docs/site-operations/seo-checklist.md:58-62`
- Test: `tests/unit/seo-metadata.test.ts`, `tests/e2e/seo.spec.ts`

**Interfaces:**
- Produces: `SeoProps` gains `translations?: Partial<Record<Locale, string>> | undefined` and `noindex?: boolean | undefined`; `generateSeo` returns `robots: 'noindex, follow' | undefined`. `BaseLayout` gains `noindex?: boolean` and forwards `translations` and `noindex` to `SeoHead`.

- [ ] **Step 1: Write the failing unit tests:**
  - `translations drive alternates`: `generateSeo({ locale: 'en', currentPath: '/blog/a.en/', translations: { en: '/blog/a.en/', 'pt-br': '/pt-br/blog/a.pt-br/' } }).alternateLocales` equals `[{ locale: 'en', href: 'https://www.jontobias.com/blog/a.en/' }, { locale: 'pt-br', href: 'https://www.jontobias.com/pt-br/blog/a.pt-br/' }, { locale: 'x-default', href: 'https://www.jontobias.com/blog/a.en/' }]`.
  - `a single translation emits no alternates`: `translations: { en: '/blog/b/' }` → `alternateLocales` is `[]`.
  - `noindex emits robots and no alternates`: `noindex: true` → `robots === 'noindex, follow'`, `alternateLocales` is `[]`.
  - All existing path-based tests stay green (static pages still use path stripping).
- [ ] **Step 2:** Run; expect FAIL.
- [ ] **Step 3:** Implement. `x-default` is `translations.en ?? translations['pt-br']`. `SeoHead` emits `<meta name="robots" content=…>` when `robots` is set. The four `[slug]` pages pass `noindex={isTranslationFallback}` (D2 = A) and `translations`. Rewrite `seo-checklist.md` lines 58–62 to describe the translation-driven behavior.
- [ ] **Step 4:** Add e2e test `article hreflang points to the real translation`: on the first EN post from `/blog`, `link[hreflang="pt-br"]` href is not the same path with `/pt-br` prefixed (it ends with `.pt-br/` while D1 = B, or equals the PT page URL once WS4 lands).
- [ ] **Step 5:** Run `pnpm test` and `pnpm build && pnpm exec playwright test seo`; expect PASS.
- [ ] **Step 6:** Commit `fix(seo): derive hreflang from real translations and noindex fallback pages`.

#### Task 3.4: Sitemap excludes fallback pages and carries `lastmod` 🔨 Sonnet

**Files:**
- Create: `src/lib/content/sitemapRoutes.ts`
- Modify: `astro.config.mjs` (sitemap options)
- Test: `tests/unit/content/sitemap-routes.test.ts`

**Interfaces:**
- Consumes: `planLocalizedRoutes`, `RouteEntry` (Task 3.1).
- Produces:

  ```ts
  export function readRouteEntries(contentRoot: string, collection: 'blog' | 'notes'): RouteEntry[]; // gray-matter over *.md|*.mdx
  export function sitemapMeta(contentRoot: string, siteUrl: string): { exclude: Set<string>; lastmod: Map<string, string> }; // absolute URLs
  ```

- [ ] **Step 1: Write the failing tests** with a temp content dir: an EN-only post `b` puts `https://www.jontobias.com/pt-br/blog/b.en/` in `exclude`; a post with `updatedAt: 2026-11-20` maps its URL to `'2026-11-20T00:00:00.000Z'`, and one without maps to its `publishedAt`.
- [ ] **Step 2:** Run; expect FAIL.
- [ ] **Step 3:** Implement; in `astro.config.mjs` compute `sitemapMeta('src/content', SITE)` once and pass `sitemap({ filter: (page) => !meta.exclude.has(page), serialize: (item) => ({ ...item, lastmod: meta.lastmod.get(item.url) ?? item.lastmod }) })`. Do not enable the sitemap `i18n` option here (it infers alternates from paths; WS4 enables it once paths match).
- [ ] **Step 4: Verify:** tests pass; `pnpm build`; `grep -c '<lastmod>' dist/sitemap-0.xml` is at least the number of posts and notes.
- [ ] **Step 5:** Commit `feat(seo): exclude fallback pages from the sitemap and add lastmod`.

#### Task 3.5: Update E2E URLs that pointed at removed duplicates ⚙️ Flash → Haiku

**Files:** whatever `grep -rnE "/blog/[^'\"]*\.pt-br|/pt-br/blog/[^'\"]*\.en|/notes/[^'\"]*\.pt-br|/pt-br/notes/[^'\"]*\.en" tests/e2e` lists (orchestrator runs it and pastes the list into the checklist).

- [ ] **Step 1 (Flash checklist):** for each listed line, switch the URL to the same-language form (`/blog/x.pt-br` → `/pt-br/blog/x.pt-br`, `/pt-br/blog/x.en` → `/blog/x.en`).
- [ ] **Step 2: Verify:** `pnpm build && pnpm test:e2e` passes; `ls dist/blog` shows only `.en` folders and `ls dist/pt-br/blog` only `.pt-br` folders; the vault compatibility gate passes (including the not-yet-synced vault pairs); the URLs `blog-share` writes (`/blog/<en slug>`, `/pt-br/blog/<pt slug>`) still answer in `pnpm preview`.
- [ ] **Step 3:** Commit `test(e2e): follow the one-page-per-locale routes`.

### WS4 — Clean slugs across the pipeline (`feat/77-clean-slugs`, D1 = A)

Three repositories, one coordinated landing (Task 4.5): website branch `feat/77-clean-slugs`, a jts-skills branch named per that repo's conventions, and a vault edit approved by Jonathan. Filenames do not change, so every wikilink in the vault keeps resolving.

**The slug rule, shared by all three repos:** `slug` = the filename without `.md`/`.mdx`, without `.en`/`.pt-br`, and for a blog post without the leading `YYYY-MM-`. `2026-11-low-cost-homelab-setup.en.md` → `low-cost-homelab-setup`; `book-cheatsheet.pt-br.md` → `book-cheatsheet`. Both languages share it.

#### Task 4.1: Website slug rule and redirects 🔨 Sonnet

**Files:**
- Create: `src/lib/content/slug.ts`, `src/lib/content/legacyRedirects.ts`, `src/data/legacy-slugs.ts`
- Modify: `src/lib/content/validation.ts` (`validateContent` gains an optional `filename` argument), `scripts/validate-content.ts` (passes each file's `destName` from Task 1.4), `astro.config.mjs`
- Test: `tests/unit/content/slug.test.ts`, `tests/unit/content/legacy-redirects.test.ts`, `tests/unit/content/contracts.test.ts`

**Interfaces:**
- Consumes: `SourceFile.destName` (Task 1.4).
- Produces (all plain Node, importable by `tsx`):

  ```ts
  export function expectedSlug(filename: string, collection: 'blog' | 'notes'): string;
  export function validateContent(collection: CollectionType, frontmatter: Record<string, any>, body: string, filename?: string): ValidationResult;
  export interface LegacySlug { collection: 'blog' | 'notes'; oldBase: string; newSlug: string }
  export function legacyRedirects(items: LegacySlug[]): Record<string, string>;
  export const LEGACY_SLUGS: LegacySlug[]; // one per published pair at landing time, generated in Task 4.4 from the files, never typed by hand
  ```

- [ ] **Step 1: Write the failing tests:**
  - `expectedSlug('2026-11-low-cost-homelab-setup.en.md', 'blog')` → `'low-cost-homelab-setup'`; `expectedSlug('book-cheatsheet.pt-br.md', 'notes')` → `'book-cheatsheet'`; `expectedSlug('2026-11-x.en.md', 'notes')` → `'2026-11-x'` (notes keep a date if their name has one).
  - `validateContent('blog', { …valid, slug: '2026-04-welcome.en' }, body, '2026-04-welcome.en.md')` has the error `slug "2026-04-welcome.en" must be "welcome" (the filename without the date and the language)`; without `filename` no slug error is raised.
  - `legacyRedirects([{ collection: 'blog', oldBase: '2026-04-welcome', newSlug: 'welcome' }])` equals exactly `{ '/blog/2026-04-welcome.en': '/blog/welcome', '/blog/2026-04-welcome.pt-br': '/pt-br/blog/welcome', '/pt-br/blog/2026-04-welcome.en': '/blog/welcome', '/pt-br/blog/2026-04-welcome.pt-br': '/pt-br/blog/welcome' }`.
- [ ] **Step 2:** Run; expect FAIL. Implement; `astro.config.mjs` gets `redirects: legacyRedirects(LEGACY_SLUGS)` (empty list for now). Run; expect PASS.
- [ ] **Step 3:** `pnpm lint:content` now fails on the real content. Expected until Task 4.4. Do not commit until Task 4.4 Step 4.

#### Task 4.2: jts-skills follows the slug rule 🔨 Sonnet

Work in a **git worktree** of `~/Projects/jts-skills`, never in the main checkout: `~/.claude/skills/*` are symlinks into that checkout, so a branch checked out there is live for every writing session.

**Files (in jts-skills):**
- Modify: `blog-publish/SKILL.md` (step 1 "Names used below", step 3 `slug` bullet), `blog-publish/references/note-types.md` (the "Common to every kind" line), `blog-publish/scripts/check_pair.py`, `test/blog-publish.bats`, `blog-share/SKILL.md` (lines 36–37, 78, 86: `<slug>` is the frontmatter slug, the same in both languages, with no suffix)

**Interfaces:**
- Produces in `check_pair.py`: `expected_slug(stem: str, is_note: bool) -> str` (same rule as the website); `check_file` reports `pair` with `slug {slug!r} must be {expected!r} (filename without date and language)`; `published_info` adds to `bases` the slug, every published **filename stem**, its `base_of(stem)`, and for blog posts the stem without `YYYY-MM-`, so wikilinks written as filename stems (`[[2026-11-low-cost-homelab-setup.en|…]]`) still count as published.

- [ ] **Step 1: Write the failing bats tests:** `pair: a slug different from the base is a pair hit`; `pair: a blog slug drops the YYYY-MM- prefix`; `link: a wikilink by filename stem to a published file passes after the slug change` (published file `2026-11-a.en.md` with `slug: "a"`, staged file linking `[[2026-11-a.en|x]]`, exit 0). Update the existing fixtures to the new slugs.
- [ ] **Step 2:** `bats test/blog-publish.bats`; expect FAIL. Implement. Run `bats test/`; expect PASS.
- [ ] **Step 3:** Commit in the jts-skills worktree branch; do not merge before Task 4.5.

#### Task 4.3: Rename the slugs in the vault ⚙️ Flash → Haiku, 👤 approval

Run only inside Task 4.5, step 3.

**Files:** every `*.md` in `~/Projects/jts-brain/08-Publish/Blog/` and `Notes/` (16 today), `slug:` line only.

- [ ] **Step 1 (orchestrator):** generate the exact list `file → new slug` with `expectedSlug` and paste it into the checklist. Jonathan approves the list.
- [ ] **Step 2 (Flash checklist):** in each listed file replace the `slug:` line with `slug: "<new slug>"`. Change nothing else. Do not run any shell command; do not commit.
- [ ] **Step 3: Verify:** `git -C ~/Projects/jts-brain diff --stat -- 08-Publish` lists exactly those files with one changed line each; `pnpm lint:content --vault ~/Projects/jts-brain` passes on the WS4 website branch; `check_pair.py` from the jts-skills worktree exits 0 on every pair.

#### Task 4.4: Website follow-through ⚙️ Flash → Haiku

**Files:**
- Modify: `src/content/**` (by the sync), `src/data/legacy-slugs.ts`, e2e specs containing old content URLs (orchestrator greps and pastes the list), `astro.config.mjs` (sitemap `i18n`), `docs/site-operations/obsidian-pipeline.md`, `docs/content-contracts/blog-template.md`, `docs/content-contracts/note-template.md`
- Test: `tests/e2e/seo.spec.ts`

- [ ] **Step 1 (orchestrator):** in the WS4 branch run `SYNC_SOURCE_DIR=~/Projects/jts-brain pnpm sync:content`, so the content lands in the same PR as the redirects. Generate `LEGACY_SLUGS` from the synced files (one entry per `translationKey`: `oldBase` = old slug without suffix, `newSlug` = new slug); this includes any pair published since this plan was written.
- [ ] **Step 2 (Flash checklist):**
  - Replace each listed old URL in the e2e specs with its clean form.
  - `sitemap({ …, i18n: { defaultLocale: 'en', locales: { en: 'en', 'pt-br': 'pt-BR' } } })` (paths now match across languages).
  - In the three docs: the slug rule above, the wikilink examples with the new URLs, and "filenames keep the language suffix".
  - `seo.spec.ts`, new tests (Review Focus 2): `old shared URL still reaches the post` (`/blog/2026-11-low-cost-homelab-setup.en/` → `waitForURL(/\/blog\/low-cost-homelab-setup\/?$/)`, `h1` visible) and the same for one PT post and one note.
- [ ] **Step 3: Verify:** the full vault compatibility gate with the jts-skills worktree; `pnpm build && pnpm test:e2e`; in `dist/`, the homelab and chinese-cameras posts link to each other with `href="/blog/…"` clean URLs (wikilinks still resolve).
- [ ] **Step 4:** Commit Tasks 4.1 and 4.4 together: `feat(routing): move to clean slugs with redirects from the old URLs`.

#### Task 4.5: Coordinated landing 🧠 Opus + 👤 Jonathan

- [ ] **Step 1:** Both branches are reviewed: website WS4 (Tasks 4.1 and 4.4 ready except the sync) and the jts-skills branch (Task 4.2).
- [ ] **Step 2 (👤):** Freeze publishing: no `blog-publish` run until Step 6. A pair already in progress is published first, under the old rule; it is migrated with the rest.
- [ ] **Step 3:** Task 4.3 (vault edit), then Task 4.4 Steps 1–3, in one sitting. The vault reaches GitHub only at the server checkpoint (23:30) or a manual one; if the automatic sync PR (`chore/1-sync-content`) appears before the website PR merges, leave it unmerged.
- [ ] **Step 4 (👤):** push and merge the website PR. After deploy, check live: an old URL redirects, the new URL answers 200, the OG image of the new slug answers 200.
- [ ] **Step 5 (👤):** merge the jts-skills PR and fast-forward `~/Projects/jts-skills` to it (the symlinks make it live; rerun `./install.sh` only if a skill folder was added).
- [ ] **Step 6:** After the next vault checkpoint, the sync finds no difference and opens no PR; close any stale `chore/1-sync-content` PR whose diff is already on `main`. Unfreeze publishing. The first `blog-share` after this writes the new URL form.
- [ ] **Rollback:** if the website PR is reverted, revert the vault `slug:` lines too (`git -C ~/Projects/jts-brain` restore before the checkpoint, or a second edit after it) and keep the jts-skills branch unmerged.

---

## Phase 3 — Framework upgrade

### WS5 — Astro 7 and major upgrades (`chore/78-astro-7`)

#### Task 5.1: Upgrade triage 🧠 Opus

- [ ] **Step 1:** With Context7 and the changelogs, list the breaking changes that touch this repo for: astro 7, @astrojs/mdx 8, @astrojs/sitemap, @astrojs/rss, vitest 5 and @vitest/coverage-v8 5, mermaid 12, katex 0.19, satori 0.63, sharp 0.35, Playwright 1.65, typescript 7.
- [ ] **Step 2:** Decide D3 (TypeScript 7 only if `@astrojs/check` supports it).
- [ ] **Step 3:** Write the checklist into the WS5 PR description, one line per breaking change with the file it touches. Tasks 5.2–5.4 execute it.

#### Task 5.2: Minor and patch updates 🔨 Sonnet

- [ ] **Step 1:** `pnpm update` within current ranges (no majors).
- [ ] **Step 2: Verify (the full gate, used by every WS5 task):** `pnpm run typecheck && pnpm test:unit && pnpm lint:content && pnpm build && pnpm cv:check:poppler && pnpm cv:check:dist && pnpm test:e2e`.
- [ ] **Step 3:** Commit `chore(deps): update minor and patch versions`.

#### Task 5.3: Astro 7 and integrations 🔨 Sonnet

- [ ] **Step 1:** Upgrade `astro`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`, `@astrojs/check`; apply the Task 5.1 checklist items for them (config, content layer, redirects, image service). `src/lib/content/schemas.ts` keeps importing the plain `zod` package even if Astro 7 recommends `astro/zod`; `content.config.ts` may use whatever Astro needs (Global Constraint: the validator must run under plain `tsx`).
- [ ] **Step 2:** Run the full gate and the vault compatibility gate. Compare `dist/` page counts before and after (`find dist -name index.html | wc -l`); they must match.
- [ ] **Step 3:** Commit `chore(deps): upgrade to Astro 7`.

#### Task 5.4: Remaining majors 🔨 Sonnet

- [ ] **Step 1:** vitest 5 + coverage, then mermaid 12 (check `MermaidRenderer.astro` against the new API), then katex 0.19, then satori 0.63 and sharp 0.35, then TypeScript per D3, then `zod` and `gray-matter` (both used by `validate_website.sh` through the validator). One commit each, full gate after each; the vault compatibility gate after the `zod`/`gray-matter` commit. Mermaid and KaTeX render the vault's diagrams and math, so compare the markdown-cheatsheet pages before and after by screenshot.
- [ ] **Step 2:** Orchestrator opens a generated OG image and a mermaid page and confirms they look unchanged.
- [ ] **Step 3: Verify:** `pnpm audit --prod` reports no high or critical advisory; `pnpm outdated` lists nothing except packages held back by D3.

---

## Phase 4 — One codebase per page

### WS6 — One component per page and a UI dictionary (`refactor/79-i18n-pages`)

#### Task 6.1: UI string dictionary 🔨 Sonnet, reviewed by 🧠 Opus

**Files:**
- Create: `src/i18n/ui.ts`
- Test: `tests/unit/i18n/ui.test.ts`

**Interfaces:**
- Produces:

  ```ts
  const en = { /* nested by area: site, blog, notes, now, portfolio, home, engineering, feeds */ } as const;
  export type UiStrings = typeof en;
  export const ui: Record<Locale, UiStrings>; // 'pt-br' object must `satisfies UiStrings`
  export function useTranslations(locale: Locale): UiStrings;
  ```

- [ ] **Step 1: Write the failing test** `every English key has a non-empty Portuguese value`: walk `ui.en` recursively and assert the same path in `ui['pt-br']` is a non-empty string.
- [ ] **Step 2:** Inventory every `const t = {…}`, `labels`, and `locale === 'pt-br' ? … : …` string in `src/` (about 30 files) and move them into `ui.ts`, including the skip link, RSS link titles and fallback notices.
- [ ] **Step 3 (🧠 gate):** Opus reviews key names and copy before any page migrates.
- [ ] **Step 4:** Run; expect PASS. Commit `refactor(i18n): add a typed UI dictionary`.

#### Task 6.2: Locale-aware page components and thin route files 🔨 Sonnet

**Files:**
- Create: `src/components/pages/{BlogPostPage,BlogIndexPage,NotePage,NotesIndexPage,NowPage,PortfolioPage,HomePage,EngineeringPage}.astro`, `src/lib/rss.ts`
- Modify: the 12 EN/PT route pairs listed in F10 except `privacy` and `terms` (their prose stays separate)

**Interfaces:**
- Consumes: `useTranslations` (6.1), route props from Task 3.2.
- Produces: each page component takes `{ locale: Locale }` plus the route's props; `makeRssHandler(collection: 'blog' | 'notes', locale: Locale): APIRoute` in `src/lib/rss.ts`. A route file becomes:

  ```astro
  ---
  import BlogPostPage from '../../components/pages/BlogPostPage.astro';
  import { makeBlogStaticPaths } from '../../lib/content/staticPaths';
  export const getStaticPaths = makeBlogStaticPaths('en');
  ---
  <BlogPostPage locale="en" {...Astro.props} />
  ```

- [ ] **Step 1 (orchestrator):** build `main` and save it: `pnpm build && cp -r dist <session scratchpad>/dist-before`.
- [ ] **Step 2:** Migrate one pair at a time, starting with `blog/[slug]`. PT `/now` uses `TranslationFallbackNotice` instead of its own banner. All internal links go through `contentLocalePath`.
- [ ] **Step 3: Verify after each pair:** `pnpm build`, then `diff -r <(normalize dist-before) <(normalize dist)` where normalize strips `/_astro/*` hashes (`sed -E 's/\.[A-Za-z0-9_-]{8}\.(js|css)/.H.\1/g'`). Expected: no differences except the PT `/now` notice markup.
- [ ] **Step 4:** `pnpm test:all` passes. Commit per pair: `refactor(pages): share the <page> component across locales`.

### WS7 — Structured data, dates, site URL (`feat/80-structured-data-dates`)

#### Task 7.1: One site URL ⚙️ Flash → Haiku

**Files:**
- Create: `src/lib/site.ts` with `export const SITE_URL = 'https://www.jontobias.com';`, `export const SITE_HOST = 'jontobias.com';`, `export function absoluteUrl(path: string): string { return new URL(path, SITE_URL).toString(); }`
- Modify: `astro.config.mjs` (`site: SITE_URL`), `src/lib/seo/metadata.ts:112`, `src/lib/seo/schema.ts:4`, `src/lib/ogImage.ts:37`, `src/lib/analytics/config.ts:12`, `src/lib/rss.ts`, `src/components/pages/BlogPostPage.astro`

- [ ] **Step 1 (Flash checklist):** replace each hardcoded `https://www.jontobias.com` / `jontobias.com` with `SITE_URL` / `SITE_HOST` / `absoluteUrl(...)`.
- [ ] **Step 2: Verify:** `grep -rn "jontobias.com" src scripts astro.config.mjs --include=*.ts --include=*.astro --include=*.mjs | grep -v "src/content\|src/lib/site.ts"` prints nothing; `pnpm test && pnpm build` pass.
- [ ] **Step 3:** Commit `refactor: read the site URL from one constant`.

#### Task 7.2: UTC-stable date formatting 🔨 Sonnet

**Files:**
- Create: `src/lib/format.ts`
- Modify: the 13 `toLocaleDateString` call sites (`grep -rn toLocaleDateString src`)
- Test: `tests/unit/format.test.ts`

**Interfaces:**
- Produces: `formatDate(date: Date, locale: Locale): string` using `Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' })`.

- [ ] **Step 1: Write the failing test** `date-only values keep their day in UTC−3`: set `process.env.TZ = 'America/Sao_Paulo'`; `formatDate(new Date('2026-11-19'), 'en')` equals `'November 19, 2026'` and `formatDate(new Date('2026-11-19'), 'pt-br')` equals `'19 de novembro de 2026'`.
- [ ] **Step 2:** Run; expect FAIL. Implement; replace all call sites. Run; expect PASS.
- [ ] **Step 3:** Commit `fix(dates): format dates in UTC so builds in any timezone agree`.

#### Task 7.3: Article structured data, "updated on", JSON-LD escaping 🔨 Sonnet

**Files:**
- Modify: `src/lib/seo/schema.ts`, `src/components/site/StructuredData.astro`, `src/components/pages/BlogPostPage.astro`, `src/components/pages/NotePage.astro`, `src/i18n/ui.ts`
- Test: `tests/unit/seo/schema.test.ts` (new)

**Interfaces:**
- Produces:

  ```ts
  interface ArticleSchemaInput { title: string; description: string; url: string; publishedAt: Date; updatedAt?: Date; image?: string; locale: Locale }
  export function generateArticleSchema(input: ArticleSchemaInput): Record<string, unknown>;
  export function serializeJsonLd(data: object): string; // JSON.stringify(data).replace(/</g, '\\u003c')
  ```

- [ ] **Step 1: Write the failing tests:**
  - The schema has `author: { '@type': 'Person', name: 'Jonathan Tobias', url: SITE_URL }`, `inLanguage` `'en'` or `'pt-BR'`, `mainEntityOfPage` equal to `url`, and `dateModified` equal to `(updatedAt ?? publishedAt).toISOString()`.
  - `serializeJsonLd({ t: '</script>' })` does not contain `</script>` and `JSON.parse` of it round-trips.
- [ ] **Step 2:** Run; expect FAIL. Implement; `StructuredData.astro` uses `serializeJsonLd`; notes get Article schema too; blog and note pages show `ui.blog.updatedOn` + `formatDate(updatedAt)` when `updatedAt` is set. Run; expect PASS.
- [ ] **Step 3:** Commit `feat(seo): richer article structured data and visible update dates`.

---

## Phase 5 — Content pipeline

### WS8 — Content validation and scheduled publishing (`feat/81-content-validation`)

These rules also run inside `validate_website.sh` (step 5 of `blog-publish`) and the sync job, so every rule must pass on the current vault (`pnpm lint:content --vault ~/Projects/jts-brain`) before it is merged. If the vault breaks a new error rule, fix the vault content first (👤 approval) or demote the rule to a warning.

#### Task 8.1: Cross-file corpus checks 🔨 Sonnet

**Files:**
- Create: `src/lib/content/corpus.ts`
- Modify: `scripts/validate-content.ts`, `src/lib/content/validation.ts` (add `portfolio` to `COLLECTIONS` with `portfolioAboutSchema`)
- Test: `tests/unit/content/corpus.test.ts`

**Interfaces:**
- Produces:

  ```ts
  export interface CorpusFile { path: string; collection: CollectionType; data: Record<string, unknown> }
  export function validateCorpus(files: CorpusFile[]): { errors: string[]; warnings: string[] };
  ```

- [ ] **Step 1: Write the failing tests** with these exact messages:
  - Error `Duplicate slug "x" in blog (en): a.en.md, b.en.md`.
  - Error `More than one pt-br file for translationKey "k" in notes: a.pt-br.md, b.pt-br.md`.
  - Error `language "en" does not match the filename suffix of x.pt-br.md`.
  - Warning `translationKey "k" in blog has no pt-br translation`.
  - Warning (only if D1 = A) `translationKey "k" in blog uses different slugs per language`.
- [ ] **Step 2:** Run; expect FAIL. Implement (plain Node, no `astro:*` imports); `validate-content.ts` builds its file list with Task 1.4's helpers, runs per-file validation, then `validateCorpus`, and exits 1 on any error. Run; expect PASS.
- [ ] **Step 3: Verify:** `pnpm lint:content` and `pnpm lint:content --vault ~/Projects/jts-brain` pass; the vault compatibility gate passes.
- [ ] **Step 4:** Commit `feat(content): validate the corpus across files`.

#### Task 8.2: Book rules in the schema; `z.url()` ⚙️ Flash → Haiku

**Files:**
- Modify: `src/lib/content/schemas.ts`, `src/lib/content/validation.ts:54-62`

- [ ] **Step 1 (Flash checklist):**
  - `schemas.ts:31`: `cover: z.url().optional(),` (same contract the skills enforce: an https URL).
  - Append to `notesSchema` a `.superRefine((d, ctx) => { if (d.noteType === 'book') { if (!d.author?.length) ctx.addIssue({ code: 'custom', path: ['author'], message: 'Book note missing required field: author' }); if (!d.cover) ctx.addIssue({ code: 'custom', path: ['cover'], message: 'Book note missing required field: cover' }); } })`.
  - Delete the duplicate book checks in `validation.ts:54-62`.
- [ ] **Step 2: Verify:** `pnpm run typecheck` shows 0 hints; `pnpm test` passes (existing book-validation tests keep their messages, now prefixed `Frontmatter: [author]` — update the two assertions if needed); `pnpm build` passes; the vault compatibility gate passes (its step 3 validates the book-cheatsheet pair through `validate_website.sh`).
- [ ] **Step 3:** Commit `refactor(content): enforce book rules in the schema`.

#### Task 8.3: Scheduled publishing 🔨 Sonnet

No `draft` flag: drafts already live in the vault's `05-Fleeting` and reach `08-Publish` only through `blog-publish`, so a second draft mechanism would duplicate the pipeline. Scheduling fills a real gap: today a future `publishedAt` goes live at once.

**Files:**
- Create: `src/lib/content/publish.ts` (plain `isPublished`, importable by `tsx`), `src/lib/content/published.ts` (`getPublished`, imports `astro:content`; the validator never imports this file)
- Modify: every `getCollection('blog' | 'notes')` call site (13 files, see the review's grep), `scripts/build-search-index.ts`, `src/lib/content/sitemapRoutes.ts`, `src/lib/remark/obsidian-wikilinks.ts` (an unpublished target renders as text), `docs/content-contracts/blog-template.md`, `docs/content-contracts/note-template.md`, `docs/site-operations/obsidian-pipeline.md`
- Test: `tests/unit/content/publish.test.ts`

**Interfaces:**
- Produces:

  ```ts
  // publish.ts
  export function isPublished(data: { publishedAt: Date }, now?: Date): boolean; // publishedAt <= now (UTC)
  // published.ts
  export function getPublished<C extends 'blog' | 'notes'>(collection: C): Promise<CollectionEntry<C>[]>; // in dev (import.meta.env.DEV) also returns future posts
  ```

- [ ] **Step 1: Write the failing tests:** `publishedAt` one day after `now` → false; equal to `now` → true; past → true.
- [ ] **Step 2:** Run; expect FAIL. Implement; replace every call site; scripts use `isPublished` directly. Document in the three docs: "a future `publishedAt` goes live with the first nightly build on or after that date (04:17 UTC), as long as the sync PR is merged before".
- [ ] **Step 3: Verify:** tests pass; set a copied post's `publishedAt` to next year locally, `pnpm build`, confirm it is absent from `dist/`, the RSS, the sitemap and the search index, and that a wikilink to it renders as text; remove it. Run the vault compatibility gate.
- [ ] **Step 4:** Commit `feat(content): publish future-dated posts on their date`.

#### Task 8.4: jts-skills uses the vault validator and knows about scheduling 🔨 Sonnet

In a git worktree of `~/Projects/jts-skills` (Global Constraints), own branch and PR. Merge after WS8 is deployed.

**Files (in jts-skills):** `blog-publish/scripts/validate_website.sh`, `blog-publish/SKILL.md` (steps 5 and 7), `blog-share/SKILL.md` (the 404 note), `test/blog-publish.bats`

- [ ] **Step 1: Write the failing bats test** `validate_website: a staged slug that duplicates a published one fails`: a temp vault with a published `a.en.md` (`slug: "a"`) and a staged pair whose EN file also uses `slug: "a"`; expect exit 1 and the website's `Duplicate slug` message.
- [ ] **Step 2:** `validate_website.sh` runs `validate-content.ts --vault "$VAULT" EN_FILE PT_FILE` (new `--vault DIR` option, default `~/Projects/jts-brain`) instead of copying the pair into an empty tree, so cross-file checks run before anything is written to `08-Publish`. Keep exit 2 for missing tooling.
- [ ] **Step 3:** `blog-publish` step 7 reports "goes live after the sync PR is merged and deployed; with a future `publishedAt`, on that date". `blog-share` says a 404 before `publishedAt` is expected.
- [ ] **Step 4: Verify:** `bats test/` passes in the worktree; a real dry run of steps 4–5 on a staged copy of a cheatsheet pair (renamed to a new key) exits 0.
- [ ] **Step 5:** Commit in jts-skills: `feat(blog-publish): validate against the whole vault and explain scheduled publishing`.

### WS9 — Sync images and book covers (`fix/82-sync-images`)

#### Task 9.1: Fail on missing images, prune orphans, strip metadata 🔨 Sonnet

`check_pair.py` already refuses embeds missing from `99-Meta/Attachments`, so a pair from `blog-publish` cannot trip the new failure; a hand edit in `08-Publish`, or an attachment that the daily checkpoint has not pushed yet, can. A failed "Sync Content" run in jts-website Actions is the signal; the fix is in the vault.

**Files:**
- Modify: `scripts/sync-content.ts`, `docs/site-operations/obsidian-pipeline.md` (Troubleshooting: "Sync Content failed with Missing images")
- Test: `tests/unit/sync.test.ts`

**Interfaces:**
- Produces (exported for tests):

  ```ts
  export async function copyReferencedImages(attachmentsDir: string, refs: Set<string>, dest: string): Promise<{ copied: string[]; missing: string[] }>;
  export async function pruneOrphanUploads(dest: string, refs: Set<string>): Promise<string[]>; // files directly in dest only, never subfolders
  export async function processImage(src: string, dest: string): Promise<void>; // jpg/jpeg/png/webp: rotate(), resize width ≤ 2000 without enlargement, re-encode without metadata; other types copied as-is
  ```

  `syncContent` throws `Error('Missing images referenced in content: a.png, b.jpg')` when `missing` is non-empty. `refs` keeps coming from every markdown file under `08-Publish` (Blog, Notes and the Now files), so pruning never removes an image the Now page uses. The vault's attachments are never modified; only the copies in `public/assets/uploads/` are processed.

- [ ] **Step 1: Write the failing tests** (temp dirs): missing image → `syncContent` rejects with a message containing the filename (Review Focus 3); an upload not in `refs` is deleted and one in `refs` is kept, including one referenced only from `Now.en.md`; a 3000 px JPEG with EXIF comes out ≤ 2000 px wide and `(await sharp(out).metadata()).exif` is `undefined`; the source file in the temp vault is byte-identical afterwards.
- [ ] **Step 2:** Run; expect FAIL. Implement. Run; expect PASS.
- [ ] **Step 3: Verify:** the vault compatibility gate (its sync dry run must copy the same set of uploads as today and remove none that is referenced).
- [ ] **Step 4:** Commit `fix(sync): fail on missing images, prune orphans and strip image metadata`.

#### Task 9.2: Book covers through the build-time image pipeline (D9 = A) 🔨 Sonnet

Website-only. Covers stay https URLs, as the skills write them.

**Files:**
- Create: `src/lib/content/cover.ts`
- Modify: `astro.config.mjs` (`image.remotePatterns: [{ protocol: 'https' }]`), `src/components/notes/cards/BookNoteCard.astro`, `src/components/notes/layouts/BookNoteLayout.astro`
- Test: `tests/unit/content/cover.test.ts`

**Interfaces:**
- Produces: `resolveCover(url: string): Promise<{ src: string; width: number; height: number } | null>` wrapping `getImage({ src: url, inferSize: true, format: 'webp', width: 400 })`; on any error it logs `cover unavailable: <url>` and returns `null`, and the card and layout render the existing placeholder. A dead cover never fails the build.

- [ ] **Step 1:** Tests with `getImage` mocked: success returns the optimized src; a rejection returns `null` and logs the URL. Run; FAIL. Implement. Run; PASS.
- [ ] **Step 2: Verify:** `pnpm build`; the book-cheatsheet page's cover `src` starts with `/_astro/`; with the network blocked (`HTTPS_PROXY=http://127.0.0.1:9`), the build still passes and shows the placeholder.
- [ ] **Step 3:** Commit `perf(notes): serve book covers from the site instead of hotlinking`.

### WS10 — Wikilink plugin (`test/83-wikilinks`)

#### Task 10.1: Tests, gray-matter, fresh cache, unresolved warnings 🔨 Sonnet

**Files:**
- Modify: `src/lib/remark/obsidian-wikilinks.ts`
- Test: `tests/unit/remark/obsidian-wikilinks.test.ts`, fixtures under `tests/unit/remark/fixtures/wikilinks/`

**Interfaces:**
- Produces: `buildContentMap(contentDir: string): Map<string, ContentEntry[]>` (exported, gray-matter, skips unpublished via `isPublished`); plugin options `{ contentDir?: string; onUnresolved?: (target: string, file?: string) => void }`, default `onUnresolved` is `console.warn`; the cache is keyed by `contentDir` plus the newest file mtime so `pnpm dev` sees new content.

- [ ] **Step 1: Write the tests first** against the current behavior: resolves `[[base]]`, `[[base.en]]`, `[[base.en.md]]` and `[[slug]]`; prefers the page locale, then `en`; keeps `#anchor`; `[[x|label]]` uses the label; unresolved stays text. Include the exact form the vault uses today, `[[2026-11-low-cost-homelab-setup.en|post about my homelab]]` from `2026-11-chinese-cameras-internet.en.md`, and (if D1 = A) the same link resolving to `/blog/low-cost-homelab-setup` when the target's `slug` is `low-cost-homelab-setup` while its filename keeps the suffix.
- [ ] **Step 2:** Add failing tests for the new behavior: unresolved calls `onUnresolved('missing-note', <file>)`; adding a file to the fixture dir after a first call is visible on the next call.
- [ ] **Step 3:** Implement. Run; all PASS. Commit `test(remark): cover wikilink resolution and warn on unresolved links`.

---

## Phase 6 — Tests

### WS11 — E2E fixtures decoupled from the vault (`test/84-e2e-fixtures`, D4 = A)

The vault's `*-cheatsheet.*` files stay where they are: `blog-publish` reads them as the example of every kind. The fixtures are copies, so the vault can change them freely without breaking CI.

#### Task 11.1: Fixture collections and routes 🔨 Sonnet

**Files:**
- Create: `tests/fixtures/content/blog/*.md`, `tests/fixtures/content/notes/*.md`, `src/pages/test-fixtures/blog/[slug].astro`, `src/pages/test-fixtures/notes/[slug].astro`, `src/pages/pt-br/test-fixtures/blog/[slug].astro`, `src/pages/pt-br/test-fixtures/notes/[slug].astro`
- Modify: `src/content.config.ts` (collections `fixtureBlog`, `fixtureNotes`, same schemas, `base: './tests/fixtures/content/…'`), `src/lib/content/staticPaths.ts` (factories take `source: { collection: 'blog' | 'fixtureBlog'; base: string }` and the notes equivalent, defaulting to the real collection), `src/lib/content/sitemapRoutes.ts` (exclude `/test-fixtures/`), `.github/workflows/pipeline.yml` (after E2E: `rm -rf dist/test-fixtures dist/pt-br/test-fixtures` before the Pages upload)

Fixture set, copied from today's cheatsheets: a markdown-syntax blog pair `fixture-markdown`; one note per type (`fixture-note`, `fixture-book`, `fixture-mindmap`, `fixture-whiteboard`) in both languages; an English-only post `fixture-en-only`. Every fixture page renders with `noindex`.

- [ ] **Step 1: Verify:** `pnpm build`; `ls dist/test-fixtures/notes` lists the four types; `grep -c test-fixtures dist/sitemap-0.xml` is 0; `dist/api/en/search-index.json` has no fixture entry.
- [ ] **Step 2:** Commit `test(e2e): add repo-owned fixture content`.

#### Task 11.2: Move specs to fixtures and discovery ⚙️ Flash → Haiku, then 🔨 Sonnet

**Files:**
- Create: `tests/e2e/helpers/content.ts` with `readSearchIndex(locale: Locale): SearchItem[]` (reads `dist/api/<locale>/search-index.json`)
- Modify: `perf-regression`, `markdown-rendering`, `notes`, `blog`, `seo` specs

- [ ] **Step 1 (Flash checklist):** replace each cheatsheet URL with its fixture URL from this table: `note-cheatsheet` → `fixture-note`, `book-cheatsheet` → `fixture-book`, `mindmap-cheatsheet` → `fixture-mindmap`, `whiteboard-cheatsheet` → `fixture-whiteboard`, `markdown-cheatsheet` → `fixture-markdown`, each under `/test-fixtures/…` (and `/pt-br/test-fixtures/…` for PT URLs).
- [ ] **Step 2 (Sonnet):** tests that check real listings (home latest posts, blog and notes index counts) use `readSearchIndex` instead of hardcoded titles. New test `fallback page for a missing translation` (Review Focus 1): `/pt-br/test-fixtures/blog/fixture-en-only/` shows the fallback notice, has `meta[name="robots"][content="noindex, follow"]`, and its PT/EN switcher links to `/test-fixtures/blog/fixture-en-only/`.
- [ ] **Step 3: Verify:** `grep -rn cheatsheet tests/e2e` prints nothing; `pnpm build && pnpm test:e2e` passes; deleting `src/content/notes/*cheatsheet*` locally and rebuilding still passes E2E (restore after).
- [ ] **Step 4:** Commit `test(e2e): run against fixtures instead of synced content`.

### WS12 — E2E hardening (`test/85-e2e-hardening`)

#### Task 12.1: Playwright config and file rename ⚙️ Flash → Haiku

**Files:**
- Modify: `playwright.config.ts`
- Rename: `tests/e2e/perf-regression.spec.ts` → `tests/e2e/rendering-regression.spec.ts` (describe title `Rendering regression guards`)

- [ ] **Step 1 (Flash checklist):** add `forbidOnly: !!process.env.CI`, `retries: process.env.CI ? 2 : 0`, `reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list'`, `use.trace: 'on-first-retry'`; set `maxDiffPixelRatio: 0.02`. The orchestrator does the `git mv`.
- [ ] **Step 2: Verify:** `pnpm test:e2e` locally; visual tests failing only on the threshold are expected.
- [ ] **Step 3 (orchestrator + 👤):** run the "Update Visual Snapshots" workflow on the branch; Opus and Jonathan look at every changed PNG before accepting the commit.
- [ ] **Step 4:** Commit `test(e2e): stricter visual threshold, retries and traces in CI`.

#### Task 12.2: Remove fixed sleeps 🔨 Sonnet

**Files:** `tests/e2e/blog.spec.ts:193`, `tests/e2e/portfolio.spec.ts:85`, `tests/e2e/header.spec.ts:18,82`

- [ ] **Step 1:** Replace each `waitForTimeout` with a web-first assertion on the state it waited for (`toHaveCSS`, `toBeInViewport`, `expect.poll` on scroll position).
- [ ] **Step 2: Verify:** `grep -rn waitForTimeout tests/e2e` prints nothing; `pnpm exec playwright test --repeat-each=5 blog portfolio header` passes.
- [ ] **Step 3:** Commit `test(e2e): replace sleeps with web-first assertions`.

#### Task 12.3: WebKit mobile smoke (D7 = A) 🔨 Sonnet

- [ ] **Step 1:** Add project `webkit-mobile` with `devices['iPhone 14']` and `testMatch: ['smoke.spec.ts', 'header.spec.ts', 'theme.spec.ts']`; fix any WebKit-only failure in the product code, not the test.
- [ ] **Step 2: Verify:** `pnpm exec playwright test --project=webkit-mobile` passes.
- [ ] **Step 3:** Commit `test(e2e): run smoke, header and theme specs on WebKit`.

### WS13 — Dark-mode contrast (`fix/40-dark-contrast`)

#### Task 13.1: Choose compliant values 🧠 Opus

- [ ] **Step 1:** For each failure in issue #40, compute WCAG contrast for candidates (a small Node script in the scratchpad) and pick values ≥ 4.5:1 for text and ≥ 3:1 for large text and UI: dark `--accent` and `--accent-hover`, the text color on accent buttons, a Shiki dark theme replacing `one-dark-pro` (candidates `github-dark-default`, `github-dark-high-contrast`), and the three status badge pairs.
- [ ] **Step 2:** Write the chosen values and their ratios into the WS13 PR description; keep the light theme unchanged.

#### Task 13.2: Apply and unfilter 🔨 Sonnet

**Files:** `src/styles/tokens.css`, `astro.config.mjs` (Shiki theme), the badge styles, `tests/e2e/a11y.spec.ts`, `AGENTS.md` exception list only if a hardcoded color changes (through the template if it is template-rendered)

- [ ] **Step 1:** Remove the color-contrast filter from the dark a11y test first; run it; expect FAIL.
- [ ] **Step 2:** Apply the Task 13.1 values. Run; expect PASS in both themes (Review Focus 5).
- [ ] **Step 3:** Refresh visual snapshots through the workflow; Opus and Jonathan review every changed PNG.
- [ ] **Step 4:** Commit `fix(a11y): meet contrast in dark mode` (closes #40).

---

## Phase 7 — Tooling, docs, automation

### WS14 — ESLint, knip, dead exports (`chore/34-eslint`)

#### Task 14.1: ESLint 🔨 Sonnet

**Files:** `eslint.config.js` (flat config: `@eslint/js` recommended, `typescript-eslint` recommended, `eslint-plugin-astro` recommended), `package.json` (`"lint": "eslint ."`), `.pre-commit-config.yaml` (through `copier update` if the template has the hook; otherwise ask Jonathan)

- [ ] **Step 1:** Install, configure, run `pnpm lint`. Fix every error; each remaining `any` or `@ts-ignore` gets a typed fix or an inline disable with a reason.
- [ ] **Step 2: Verify:** `pnpm lint` exits 0; `pre-commit run --all-files` passes.
- [ ] **Step 3:** Commit `chore: add ESLint for TypeScript and Astro` (closes #34).

#### Task 14.2: knip 🔨 Sonnet

- [ ] **Step 1:** Add `knip` as a dev dependency, `knip.json` with the Astro, Vitest and Playwright plugins and `scripts/*.ts` as entries, and `"deadcode": "knip"`.
- [ ] **Step 2:** Triage the report: delete truly dead code; whitelist entry points knip cannot see.
- [ ] **Step 3: Verify:** `pnpm deadcode` exits 0. Commit `chore: add knip for dead-code detection`.

#### Task 14.3: Remove dead exports ⚙️ Flash → Haiku

- [ ] **Step 1 (Flash checklist):** delete `setTheme` and `THEME_STORAGE_KEY` from `src/lib/theme/theme.ts` if knip confirms they are unused; drop the `export` keyword from the module-internal names knip lists; in `AnalyticsScripts.astro` replace `ANALYTICS_EVENT_NAMES.includes(eventName as never)` with `isAnalyticsEventName(eventName)`; delete `scripts/.gitkeep`, `tests/e2e/.gitkeep`, `tests/unit/.gitkeep`.
- [ ] **Step 2: Verify:** `pnpm deadcode && pnpm run typecheck && pnpm test` pass.
- [ ] **Step 3:** Commit `refactor: remove dead exports`.

### WS15 — Docs cleanup (`docs/86-docs-cleanup`) ⚙️ Flash → Haiku

- [ ] **Step 1 (orchestrator):** check whether `template-repo` renders `GEMINI.md`; if it does, change it through `copier update` and drop that item from the checklist.
- [ ] **Step 2 (Flash checklist):**
  - `GEMINI.md`: replace the whole file with the single line `@AGENTS.md`.
  - `README.md:142`: "…then uploads `dist/` as a GitHub Pages artifact and deploys it." Remove the claim about a `gh-pages` branch.
  - Delete `docs/ai/audit-report.md`, `docs/ai/performance-report.md`, `docs/ai/test-coverage-report.md` (git history keeps them).
  - If D6 = A, delete `.github/agents/*.agent.md`.
  - `docs/site-operations/obsidian-pipeline.md`: describe the real flow. The vault reaches GitHub through the homelab server's daily checkpoint (23:30) or a manual one; the sync PR branch is `chore/1-sync-content`, not `sync/content`; the "Vault structure" tree shows `Now.en.md` (Task 2.5 already fixed the mapping table); add a "Writing pipeline" section linking `jts-skills` (`blog` → `blog-publish` → `blog-share`) and the contract table from the review; the `pipeline.yml` section matches D5.
- [ ] **Step 3: Verify:** `pre-commit run --all-files` passes; `grep -rn "docs/ai" --include=*.md .` prints nothing; `grep -n "sync/content\|Now.md" docs/site-operations/obsidian-pipeline.md` prints nothing.
- [ ] **Step 4:** Commit `docs: remove stale reports, point GEMINI.md at AGENTS.md, correct the Obsidian pipeline doc`.
- [ ] **Follow-ups outside this repo (👤):**
  - The Flash-first routing preference belongs in `template-repo`'s `AGENTS.md` template.
  - jts-brain: add `dateRead`, `publishDate`, `relatedTo`, `previousBook`, `nextBook` to the `publish` rule's `optional` list in `99-Meta/Schema/schema.yaml` (F30 drift), and pin `peter-evans/repository-dispatch`, `actions/checkout` and `astral-sh/setup-uv` by SHA in its two workflows. Jonathan approves; the server checkpoint commits.

### WS16 — CI hygiene (`ci/87-pipeline-hygiene`)

#### Task 16.1: Concurrency, PR trigger, internal link check 🔨 Sonnet

**Files:** `.github/workflows/pipeline.yml`

- [ ] **Step 1:** Add to the `deploy` job `concurrency: { group: pages, cancel-in-progress: false }`; add workflow-level `concurrency: { group: pipeline-${{ github.ref }}, cancel-in-progress: ${{ github.event_name == 'pull_request' }} }`.
- [ ] **Step 2:** If D5 = A, remove the `pull_request` trigger.
- [ ] **Step 3:** After the build step, add an offline link check of `dist/` with `lycheeverse/lychee-action` pinned by SHA (look it up with `gh api repos/lycheeverse/lychee-action/releases/latest`), args `--offline --no-progress --root-dir ${{ github.workspace }}/dist dist`.
- [ ] **Step 4: Verify:** `actionlint` (or the shared lint-docs job) passes; push the branch and confirm the pipeline run is green, including a deliberately broken internal link in a throwaway commit that the check catches (then revert it).
- [ ] **Step 5:** Commit `ci: serialize deploys, cancel stale runs and check internal links`.

### WS17 — Site health automation (`ci/88-site-health`)

#### Task 17.1: `security.txt` ⚙️ Flash → Haiku

- [ ] **Step 1 (Flash checklist):** create `public/.well-known/security.txt`:

  ```text
  Contact: https://github.com/JonathanTSilva/jts-website/security/advisories/new
  Expires: 2027-11-21T00:00:00.000Z
  Preferred-Languages: en, pt
  Canonical: https://www.jontobias.com/.well-known/security.txt
  ```

- [ ] **Step 2: Verify:** `pnpm build && ls dist/.well-known/security.txt`. Commit `feat: publish security.txt`.

#### Task 17.2: Uptime, link rot and expiry watch 🔨 Sonnet

**Files:** `.github/workflows/site-health.yml`

- [ ] **Step 1:** Two schedules: `0 */6 * * *` runs the uptime job (`curl -fsS` with a 200 check on `/`, `/pt-br/`, `/rss.xml`, `/sitemap-index.xml`, `/.well-known/security.txt`, and a check that `security.txt`'s `Expires` is more than 30 days away); `0 6 * * 1` runs the link-rot job (build the site, lychee with remote checks on `dist/`, honoring `lychee.toml` excludes). On failure, create or update one open issue per job (labels `site-health` and the job name) with `gh issue`; permissions `issues: write`, `contents: read`. Actions pinned by SHA. A broken link inside a post is fixed in the vault, not here, so the link-rot issue lists each failing URL with its vault source (`dist/blog/<slug>/` → the file in `src/content/blog/` whose `slug` matches → `jts-brain/08-Publish/Blog/<same filename>`).
- [ ] **Step 2: Verify:** trigger with `workflow_dispatch` (add it), confirm both jobs pass; temporarily point the uptime list at a 404 path on the branch and confirm an issue is opened; revert.
- [ ] **Step 3:** Commit `ci: add uptime, link-rot and expiry checks`.

#### Task 17.3: Dependabot auto-merge (D8 = A) 🔨 Sonnet + 👤 Jonathan

- [ ] **Step 1 (👤):** enable Settings → General → "Allow auto-merge".
- [ ] **Step 2:** If `JonathanTSilva/.github` has a reusable auto-merge workflow, call it; otherwise add `.github/workflows/dependabot-auto-merge.yml` using `dependabot/fetch-metadata` (SHA-pinned) that runs `gh pr merge --auto --squash "$PR_URL"` when `update-type` is `version-update:semver-patch` or `version-update:semver-minor`, only for `github.actor == 'dependabot[bot]'`.
- [ ] **Step 3: Verify:** the next minor Dependabot PR merges itself after `ci` passes.
- [ ] **Step 4:** Commit `ci: auto-merge patch and minor dependency updates`.

#### Task 17.4: Lighthouse budgets 🔨 Sonnet

- [ ] **Step 1:** Read the inputs of the shared `lighthouse.yml@v1`. If it accepts a config path, add `lighthouserc.json` asserting `categories:performance >= 0.9`, `categories:accessibility >= 0.95`, `largest-contentful-paint <= 2500`, `cumulative-layout-shift <= 0.1` for `/` and `/pt-br/`. If it does not, open an issue on `JonathanTSilva/.github` instead (👤 approves) and stop here.
- [ ] **Step 2: Verify:** the `lighthouse` job passes on the branch and fails when the hero image is temporarily swapped back to the 2 MB PNG.
- [ ] **Step 3:** Commit `ci: enforce Lighthouse budgets`.

---

## Coverage check (finding → task)

| Finding | Tasks |
|---|---|
| F01 | 3.1–3.5, 4.1–4.5 |
| F02 | 2.4 |
| F03 | 1.1, 1.3 |
| F04 | 1.2 |
| F05 | 5.1–5.4 |
| F06 | 2.1 |
| F07 | 2.2 |
| F08 | 2.3 |
| F09 | 1.1 |
| F10 | 6.1, 6.2, 7.1 |
| F11 | 11.1, 11.2 |
| F12 | 8.1–8.4 |
| F13 | 9.1 |
| F14 | 16.1 |
| F15 | 12.1–12.3 |
| F16 | 13.1, 13.2 |
| F17 | 14.1 |
| F18 | 10.1 |
| F19 | 3.4, 7.3 |
| F20 | 2.2 (handlers), 7.3 (JSON-LD), 17.1 |
| F21 | 2.4, 6.1 |
| F22 | 7.2 |
| F23 | 9.1, 9.2 |
| F24 | 1.1 |
| F25 | 14.2, 14.3 |
| F26 | 15, 3.3 (seo checklist), 4.3 (pipeline docs) |
| F27 | 8.2 |
| F28 | 16.1, 17.2–17.4 |
| F29 | 2.5 |
| F30 | 1.4, 4.2, 8.4, the vault compatibility gate, WS15 follow-ups |

## Decision log

2026-11-21, Jonathan: "Go with the recommended." Every decision is option **A**.

| ID | Decision | Consequence for the plan |
|---|---|---|
| D1 | Clean slugs `<base>`, same in both languages, redirects from every old URL | WS4 (#77) runs, with its jts-skills and vault counterparts and the coordinated landing in Task 4.5 |
| D2 | Fallback pages kept with a notice, `noindex, follow`, out of the sitemap | Tasks 3.2–3.4 as written |
| D3 | Stay on TypeScript 5.x until `@astrojs/check` supports 7 | Task 5.1 re-checks |
| D4 | Repo-owned E2E fixtures under `/test-fixtures/`, stripped from `dist/` | WS11 (#84) as written |
| D5 | Remove the `pull_request` trigger from `pipeline.yml` | Task 16.1; `AGENTS.md` "pipeline.yml stays as it is" is updated in the same PR |
| D6 | Delete `.github/agents/*.agent.md` if no Copilot agent uses them | WS15 (#86) |
| D7 | WebKit mobile project for smoke, header and theme specs | Task 12.3 |
| D8 | Dependabot auto-merge for patch and minor once `ci` passes | Task 17.3; Jonathan enables "Allow auto-merge" |
| D9 | Book covers stay https URLs, served through Astro's build-time image pipeline | Task 9.2; no jts-skills change |

Issues: #73 (WS0) and one per workstream in the workstream map. WS13 reuses #40 and WS14 reuses #34.

## Progress

Updated 2026-11-22. Every workstream is merged and deployed. A final pass of 41 spot checks (code and live site) found at least one passing check for each of F01–F30.

| WS | Issue | PR | jts-skills |
|---|---|---|---|
| WS0 Review and plan | #73 | #89 | |
| WS1 Dependency hygiene, vault validator | #74 | #90 | |
| WS2 Quick wins, Now sync | #75 | #91 | |
| WS3 Localized routes and SEO | #76 | #93 | |
| WS4 Clean slugs | #77 | #94 | #13 |
| WS5 Astro 7 and majors | #78 | #103 | |
| WS6 One component per page | #79 | #104 | |
| WS7 Structured data, dates, site URL | #80 | #105 | |
| WS8 Content validation, scheduling | #81 | #106 | #15 |
| WS9 Sync images, book covers | #82 | #107 | |
| WS10 Wikilinks | #83 | #108 | |
| WS11 E2E fixtures | #84 | #109 | |
| WS12 E2E hardening | #85 | #110 | |
| WS13 Contrast (#92 too) | #40 | #111 | |
| WS14 ESLint, knip | #34 | #112 | |
| WS15 Docs cleanup | #86 | #113 | |
| WS16 CI hygiene | #87 | #114 | |
| WS17 Site health automation | #88 | #115 | |

Deviations worth knowing: KaTeX stays on 0.16 (`rehype-katex` renders 0.16 markup); TypeScript stays on 5.x (D3); `image.remotePatterns` is limited to `covers.openlibrary.org` so a dead host cannot fail the deploy; the WebKit project is opt-in (`PLAYWRIGHT_WEBKIT=1`, set in `pipeline.yml`) because the shared e2e workflow installs only Chromium; visual tests store a rejected consent before loading. D5 was refined: `pipeline.yml` lost its PR trigger, and `pr-checks.yml` runs the checks only this repo has (CV PDF, WebKit, internal links, Lighthouse budgets).

Not proven when this was written: the `site-health.yml` schedules and issue handling (never run on GitHub), and Dependabot auto-merge (inert until "Allow auto-merge" is on). Open: three dead links the link check found (`forgenv` and `Dimfot` in `src/content/portfolio/projects.ts`, `exemplo.com` in the vault's `note-cheatsheet.pt-br.md`).

### Final review, 2026-11-23

A full review of `main` at `db4f1fe` (after #127) checked every finding against the code, the built site and the live site.

| Check | Result |
|---|---|
| `pnpm run typecheck`, `pnpm lint`, `pnpm deadcode` | 0 errors, 0 warnings, 0 hints |
| `pnpm test:unit` | 49 files, 525 tests, all pass |
| `pnpm lint:content`, and with `--vault ~/Projects/jts-brain` | pass |
| `pnpm build` | 45 pages |
| `pnpm audit --prod` | 1 low (KaTeX, held on 0.16) |
| `pnpm outdated` | TypeScript 7 (D3) and KaTeX 0.19 held back; knip patch |
| E2E | not run locally; the last `main` pipeline run passed the full suite including WebKit |
| Live site | clean URLs, old-URL redirects, OG images, `security.txt`, manifest and CV answer 200; `/test-fixtures/` answers 404 |

- F01–F30 are fixed, except one item of F19 the plan never scheduled (`og:locale:alternate`).
- The open points above are closed: `site-health.yml` has run on its schedule and opened and closed an issue (#118); "Allow auto-merge" is on and the `main` ruleset requires `ci`, `unique-checks` and `lighthouse-budgets` (the first Dependabot PR to use auto-merge is still to come); the portfolio links were fixed in #120 and the link-rot job passes.
- The vault follow-ups from WS15 are done: the `publish` rule lists the book keys, and both vault workflows pin actions by SHA.

New, fixed for issue #132 (`pnpm deadcode` also failed on an export added with the table-scroll fix, #131): one slug shared by two `translationKey`s in different languages built two posts on the same URLs without a validation error; search results were built with `innerHTML`, so a title with `<` or `&` rendered as markup; the comment in `dependabot-auto-merge.yml` described the old ruleset and setting; and the missing `og:locale:alternate`. The leftover `chore-hook` worktree was pruned.

KaTeX, issue #134: the `pnpm.overrides` pin and the direct dependency moved from 0.16.44 to 0.19.1 together, which closes GHSA-238p-pmpm-9mq7 (the last two Dependabot alerts). Every math block of the markdown cheatsheet renders pixel-identical to 0.16 in both themes. The earlier reason for holding KaTeX back ("rehype-katex renders 0.16 markup") was most likely Astro's content cache: a local build after a KaTeX bump reuses the rendered markdown in `node_modules/.astro` and ships it with the new CSS, which breaks fractions and roots. Clear `node_modules/.astro` after changing a markdown plugin. CI always builds fresh.
