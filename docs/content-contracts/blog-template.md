# Blog Post Template

This contract defines the required structure and metadata for blog posts.

## Frontmatter Requirements

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `slug` | string | URL-friendly identifier. Should match filename (without locale). | Yes |
| `title` | string | The post title. | Yes |
| `language` | "en" \| "pt-br" | The content language. | Yes |
| `translationKey` | string | Unique key to link translations of the same post. | Yes |
| `publishedAt` | date (YYYY-MM-DD) | Original publication date. | Yes |
| `summary` | string | Brief description for indexes and SEO. | Yes |
| `tags` | string[] | List of relevant tags. | No (default: []) |
| `updatedAt` | date (YYYY-MM-DD) | Last significant update date. | No |

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
