# Note Template

This contract defines the required structure and metadata for short-form notes.

## Frontmatter Requirements

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `slug` | string | URL-friendly identifier. Should match filename (without locale). | Yes |
| `title` | string | Short, direct title. | Yes |
| `language` | "en" \| "pt-br" | The content language. | Yes |
| `translationKey` | string | Unique key to link translations of the same note. | Yes |
| `publishedAt` | date (YYYY-MM-DD) | Date of creation/publication. | Yes |
| `category` | string | Primary classification. | No |
| `tags` | string[] | List of relevant tags. | No (default: []) |
| `colorToken` | string | Design token for accent color. | No |

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
