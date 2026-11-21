# Obsidian → jts-website Content Pipeline

This document describes the full automated pipeline that keeps `jts-website` in sync with content written in the `jts-brain` Obsidian vault.

---

## End-to-end flow

```
jts-brain (private repo)
  └─ push to 08-Publish/ or 99-Meta/Attachments/
       │
       ▼
  .github/workflows/sync-website.yml  (inside jts-brain)
  └─ repository_dispatch → jts-website (sync_content event)
       │
       ▼
  .github/workflows/sync-content.yml  (inside jts-website)
  ├─ checkout jts-brain
  ├─ checkout jts-website
  └─ pnpm sync:content
       │
       │  Copies markdown files (mirror)
       │  Extracts image refs from markdown
       │  Copies only referenced images from 99-Meta/Attachments/
       │
       ▼
  Creates a Pull Request: "chore: sync content from vault"
       │
       ▼  (PR merged → triggers pipeline.yml)
  pnpm build
  ├─ remarkObsidianWikilinks  ← converts [[links]] and ![[images]] in AST
  └─ astro build              ← static HTML output
       │
       ▼
  Deploy to GitHub Pages
```

There are two phases of transformation:

| Phase | What happens | Where |
|---|---|---|
| **Sync** | Raw files copied verbatim from vault | `scripts/sync-content.ts` |
| **Build** | Obsidian syntax converted to HTML | `src/lib/remark/obsidian-wikilinks.ts` |

The sync script never rewrites your markdown — it only moves files. The remark plugin does all the syntax translation at build time.

---

## Vault structure expected by the pipeline

```
jts-brain/
  08-Publish/
    Blog/
      2026-11-my-post.en.md
      2026-11-my-post.pt-br.md
    Notes/
      my-note.en.md
    Now.en.md           ← legacy Now.md is still accepted as a fallback
    Now.pt-br.md

  99-Meta/
    Attachments/
      att-20260410143022123.png   ← auto-named by Obsidian plugin
      att-20260411090512456.png
```

Only `08-Publish/` and the referenced files from `99-Meta/Attachments/` are ever touched. Nothing else in the vault is read or copied.

---

## The sync script (`scripts/sync-content.ts`)

### What it does

**Step 1 — Mirror markdown**

| Vault source | Website destination |
|---|---|
| `08-Publish/Blog/*.md` | `src/content/blog/` |
| `08-Publish/Notes/*.md` | `src/content/notes/` |
| `08-Publish/Now.en.md` (fallback: legacy `08-Publish/Now.md`) | `src/content/now/index.en.md` |
| `08-Publish/Now.pt-br.md` | `src/content/now/index.pt-br.md` |

Files are overwritten on every sync. Files that exist in the destination but were removed from the vault are deleted — it is a true mirror.

**Step 2 — Find referenced images**

The script scans every `.md` / `.mdx` file under `08-Publish/` and collects all filenames referenced via Obsidian image embed syntax (`![[filename]]`). Only filenames with a recognised image extension are collected (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`, `.avif`, `.bmp`).

**Step 3 — Copy referenced images**

For each referenced filename, the script looks in `99-Meta/Attachments/` and copies it to `public/assets/uploads/`. Only files that are actually referenced in published content are ever copied — the rest of the attachments folder is ignored.

If a referenced filename is not found in `99-Meta/Attachments/`, a warning is printed. That image will produce a broken `<img>` tag on the website until the vault is corrected and a new sync runs.

### Running locally

```bash
# Point directly at your vault
SYNC_SOURCE_DIR=~/path/to/jts-brain pnpm sync:content

# Or create a symlink (do this once)
ln -s ~/path/to/jts-brain sync-source
pnpm sync:content
```

---

## The remark plugin (`src/lib/remark/obsidian-wikilinks.ts`)

Runs automatically during `pnpm build` as part of the Astro markdown pipeline. It visits every text node in the parsed markdown AST and converts Obsidian-specific syntax in a single pass.

### Wikilinks → internal links

The plugin scans `src/content/blog/` and `src/content/notes/` at build start, reads each file's frontmatter `slug` and `language`, and builds a lookup table. It then replaces `[[…]]` patterns with standard `<a>` elements pointing at the clean URL (`/<collection>/<slug>/`, with the `/pt-br` prefix for Portuguese).

```
[[debugging-habits]]                          → /notes/debugging-habits/
[[debugging-habits|My Note]]                  → /notes/debugging-habits/  (label: "My Note")
[[debugging-habits#heading]]                  → /notes/debugging-habits/#heading
[[2026-11-some-post.en|Read this]]            → /blog/some-post/          (label: "Read this")
[[2026-11-some-post.pt-br|Leia isto]]         → /pt-br/blog/some-post/    (label: "Leia isto")
```

Vault wikilinks are filename stems, and those keep working unchanged. The link resolves regardless of how precisely you write the target:

| You write | Resolves via |
|---|---|
| `[[2026-11-some-post.en]]` | filename stem (exactly one language) |
| `[[2026-11-some-post.en.md]]` | full filename |
| `[[2026-11-some-post]]` | filename without the language (both languages, linking page's language wins) |
| `[[some-post]]` | clean slug (both languages, linking page's language wins) |

Locale is inferred from the current file's name (`my-post.pt-br.md` → prefers `pt-br` translations, falls back to `en`).

If a target cannot be found, the raw `[[…]]` text is preserved verbatim in the output — no build error, but it will be visible on the page as a signal that the link is unresolved.

### Image embeds → `<img>` elements

`![[filename]]` is converted to an `<img>` pointing to `/assets/uploads/{filename}` — the exact location the sync script copies images to.

```
![[att-20260410143022123.png]]          → <img src="/assets/uploads/att-20260410143022123.png">
![[photo.png|800]]                      → <img … width="800" style="max-width:800px;width:100%">
![[photo.png|800x400]]                  → <img … width="800" height="400">
![[photo.png|A descriptive caption]]    → <img … alt="A descriptive caption">
```

The modifier after `|` is interpreted as:
- a plain integer → image width (px)
- `WxH` → width and height (px)
- any other text → alt text

`![[filename]]` where the filename has no image extension (e.g. a note transclusion) is left as plain text.

Standard markdown images (`![alt](url)`) and external links (`[text](https://…)`) are never touched by this plugin.

---

## How to write content in Obsidian

### File naming and the slug rule

Every published file follows the `{name}.{locale}.md` convention. Filenames keep the date and the language suffix:

```
2026-11-my-post.en.md       # English blog post
2026-11-my-post.pt-br.md    # Portuguese blog post
my-note.en.md               # English note
my-note.pt-br.md            # Portuguese note
```

The frontmatter `slug` is derived from the filename:

- Take the filename without `.md`.
- Remove the `.en` / `.pt-br` suffix.
- For a blog post, also remove the leading `YYYY-MM-`.

The slug is the same in both languages of a post (`2026-11-my-post.en.md` and `2026-11-my-post.pt-br.md` both have `slug: "my-post"`). The URLs are:

| Content | English | Portuguese |
|---|---|---|
| Blog post | `/blog/my-post/` | `/pt-br/blog/my-post/` |
| Note | `/notes/my-note/` | `/pt-br/notes/my-note/` |

`pnpm lint:content` fails when the slug does not match the filename, or when two files of the same collection and language end up with the same slug.

Each post's Open Graph image follows the same shape: `/og/blog/my-post.png` (English) and `/og/pt-br/blog/my-post.png` (Portuguese); notes use `/og/notes/…` and `/og/pt-br/notes/…`.

### Old URLs redirect

Before the clean slugs, URLs were the filename stem (`/blog/2026-04-welcome.en/`) and some were shared publicly. Those old URLs, including the cross-locale forms such as `/blog/2026-04-welcome.pt-br/`, redirect to the new pages through static redirect pages marked `noindex`. The list lives in `src/data/legacy-slugs.ts`, was generated once on 2026-11-21 and must keep every entry forever. New posts do not need an entry: they never had an old URL.

### Frontmatter required fields

Blog and Notes files require `slug`, `title`, `language`, `translationKey`, and `publishedAt`. See `docs/content-contracts/` for templates.

### Links and embeds cheat-sheet

```markdown
Link to another post or note (filename stem or clean slug):
  [[my-note.en]]
  [[my-note.en|Display text]]
  [[2026-11-my-post.en#some-heading]]
  [[2026-11-my-post.en#some-heading|Display text]]

External link (standard markdown — never converted):
  [label](https://example.com)

Embed an image:
  ![[att-20260410143022123.png]]
  ![[att-20260410143022123.png|600]]
  ![[att-20260410143022123.png|600x400]]
  ![[att-20260410143022123.png|Screenshot of the dashboard]]

Embed a note (NOT supported — kept as plain text):
  ![[some-note]]
```

### Image workflow

1. Paste or drag an image into Obsidian — it lands in `99-Meta/Attachments/` with the `att-YYYYMMDDHHmmssSSS` name your plugin assigns.
2. Embed it in your post: `![[att-20260410143022123.png]]`
3. Commit and push to `jts-brain`. The CI detects the change in `08-Publish/`, runs the sync, finds the image reference, pulls the file from `99-Meta/Attachments/`, and opens a PR.
4. Merge the PR — the build runs, the remark plugin turns `![[…]]` into a proper `<img>`, and the site deploys.

You never need to manually manage an assets folder.

---

## CI workflow overview

### jts-brain: `.github/workflows/sync-website.yml`

Triggers on any push that touches `08-Publish/**`. Sends a `repository_dispatch` event (`sync_content`) to `jts-website`.

> **Note:** Obsidian saves image attachments to `99-Meta/Attachments/`. In normal use you always edit the markdown file (in `08-Publish/`) when you embed a new image, so both changes land in the same commit and the single trigger is enough. If you ever commit an attachment without touching a markdown file, no sync fires — but the image will be picked up the next time any markdown file in `08-Publish/` is committed.

### jts-website: `.github/workflows/sync-content.yml`

1. Checks out both repos
2. Runs `pnpm sync:content` (mirrors markdown, copies referenced images)
3. Runs `pnpm lint:content` (validates frontmatter schemas)
4. Creates a PR `sync/content` with all changes

### jts-website: `.github/workflows/pipeline.yml`

Runs on every push / PR to `main`:
1. `pnpm check` — TypeScript
2. `pnpm lint:content` — frontmatter validation
3. `pnpm test:unit`
4. `pnpm build` — remark plugins convert Obsidian syntax; Astro emits static HTML
5. `pnpm test:e2e`
6. Deploy to GitHub Pages (main branch only)

---

## Troubleshooting

**`[[link]]` renders as literal text on the page**
The target was not found in the content map. Check that the file has been synced and that the link uses its filename stem (`2026-11-my-post.en`) or its slug (`my-post`).

**Image is broken (404 in browser)**
The file was not copied to `public/assets/uploads/`. Check the sync output for the `[images]` line — it shows how many refs were found vs. copied. Possible causes:
- The image exists in `99-Meta/Attachments/` but the embed in the markdown uses a different filename (typo, or path prefix instead of bare filename).
- The attachment and the markdown edit were committed separately and only the attachment commit was pushed (no `08-Publish/` path change → no sync trigger).

**Build error about missing slug**
The markdown file is missing required frontmatter. See `docs/content-contracts/` for the required fields per content type.

**Sync runs but no PR is created**
No files changed after the sync (the content was already up to date). `create-pull-request` only opens a PR when there are actual file differences.
