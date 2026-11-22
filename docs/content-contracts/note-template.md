# Note Template

This contract defines the required structure and metadata for short-form notes.

## Frontmatter Requirements

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `slug` | string | URL-friendly identifier, derived from the filename (see Slug rule). Same in both languages. | Yes |
| `title` | string | Short, direct title. | Yes |
| `language` | "en" \| "pt-br" | The content language. | Yes |
| `translationKey` | string | Unique key to link translations of the same note. | Yes |
| `publishedAt` | date (YYYY-MM-DD) | Date of creation/publication. A future `publishedAt` goes live with the first nightly build on or after that date (04:17 UTC), as long as the sync PR is merged before. | Yes |
| `category` | string | Primary classification. | No |
| `tags` | string[] | List of relevant tags. | No (default: []) |
| `colorToken` | string | Design token for accent color. | No |

## Slug rule

The `slug` is derived from the filename, never chosen freely (a note keeps a date if its filename has one, only blog posts lose the leading `YYYY-MM-`):

- Take the filename without `.md`.
- Remove the `.en` / `.pt-br` suffix.

Both languages of a note share the slug. `debugging-tip-1.en.md` and `debugging-tip-1.pt-br.md` both use `slug: "debugging-tip-1"`, and the URLs are `/notes/debugging-tip-1/` and `/pt-br/notes/debugging-tip-1/`. Filenames keep the language suffix (and the date, if any), so vault wikilinks by filename stem (`[[debugging-tip-1.en]]`) keep working and resolve to the clean URL. `pnpm lint:content` rejects a slug that does not match the filename.

Old URLs of the form `/notes/debugging-tip-1.en/` redirect to the clean ones (`src/data/legacy-slugs.ts`, generated once on 2026-11-21, keep entries forever).

## Heading Structure

**H2-first rule**: Never use `#` (H1) in note prose. Start any sections with `##` (H2). This is enforced by the Obsidian Linter.

## Content Sections

Notes are informal and do not require fixed sections.

## Example

```markdown
---
slug: "debugging-tip-1"
title: "Always Use a Systematic Approach"
language: "en"
translationKey: "systematic-debugging"
publishedAt: "2026-03-25"
category: "Engineering"
tags: ["Debugging"]
---

Start by defining the exact symptom and work backwards to the cause.
```
