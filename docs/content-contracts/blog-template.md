# Blog Post Template

This contract defines the required structure and metadata for blog posts.

## Frontmatter Requirements

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `slug` | string | URL-friendly identifier, derived from the filename (see Slug rule). Same in both languages. | Yes |
| `title` | string | The post title. | Yes |
| `language` | "en" \| "pt-br" | The content language. | Yes |
| `translationKey` | string | Unique key to link translations of the same post. | Yes |
| `publishedAt` | date (YYYY-MM-DD) | Original publication date. | Yes |
| `summary` | string | Brief description for indexes and SEO. | Yes |
| `tags` | string[] | List of relevant tags. | No (default: []) |
| `updatedAt` | date (YYYY-MM-DD) | Last significant update date. | No |

## Slug rule

The `slug` is derived from the filename, never chosen freely:

- Take the filename without `.md`.
- Remove the `.en` / `.pt-br` suffix.
- Remove the leading `YYYY-MM-` (blog posts only).

Both languages of a post share the slug. `2026-11-my-awesome-post.en.md` and `2026-11-my-awesome-post.pt-br.md` both use `slug: "my-awesome-post"`, and the URLs are `/blog/my-awesome-post/` and `/pt-br/blog/my-awesome-post/`. Filenames keep the date and the language suffix, so vault wikilinks by filename stem (`[[2026-11-my-awesome-post.en]]`) keep working and resolve to the clean URL. `pnpm lint:content` rejects a slug that does not match the filename.

Old URLs of the form `/blog/2026-11-my-awesome-post.en/` redirect to the clean ones (`src/data/legacy-slugs.ts`, generated once on 2026-11-21, keep entries forever).

## Heading Structure

**H2-first rule**: Never use `#` (H1) in post prose. H1 is generated from the `title` frontmatter field. Start all sections with `##` (H2); use `###` (H3) and `####` (H4) for sub-sections. This is enforced by the Obsidian Linter.

## Content Sections

- **Lead Paragraph**: A strong opening that expands on the summary.
- **Body Content**: Structured using H2 and H3 headers.
- **Conclusion**: Summary of key takeaways.

## Example

```markdown
---
slug: "my-awesome-post"
title: "My Awesome Post"
language: "en"
translationKey: "awesome-post-1"
publishedAt: "2026-03-19"
summary: "This is a brief summary of my awesome post."
tags: ["Astro", "Web Development"]
---

This is the lead paragraph.

## First Section

Content goes here.
```
