---
slug: "mindmap-cheatsheet.en"
title: "Note Types — Mind Map"
language: "en"
translationKey: "mindmap-cheatsheet"
publishedAt: "2026-04-17"
noteType: mindmap
summary: "A mind map of all note types supported on this site, with their key fields and use cases."
category: "Engineering"
tags: [cheatsheet, note-types, reference]
colorToken: "#065f46"
---

# Note System

## Default Note

- Use Case
    - Essays and long-form writing
    - Technical write-ups
    - Evergreen knowledge entries
- Key Fields
    - summary
    - category
    - colorToken
    - tags
- Content Features
    - Full Markdown
    - Code blocks with syntax highlight
    - Tables
    - Blockquotes
    - Mermaid diagrams
    - Horizontal dividers

## Book Note

- Use Case
    - Book reviews
    - Reading notes
    - Literature summaries
- Key Fields
    - author
    - cover
    - pages
    - rating
    - status
        - finished
        - reading
        - abandoned
    - dateRead
    - publishDate
    - relatedTo
    - previousBook
    - nextBook
- Content Features
    - Structured review prose
    - Quotes and highlights
    - Tables

## Mindmap Note

- Use Case
    - Concept mapping
    - Knowledge structures
    - Decision trees
- Syntax
    - H1 → root node
    - H2 → branch
    - Unordered list → children
        - Indentation = depth
        - Up to 4+ levels
- Content Features
    - Horizontal scroll
    - Theme-aware line colors
    - Collapsible via CSS

## Whiteboard Note

- Use Case
    - Brainstorming sessions
    - Quick diagrams
    - Sketch-style references
    - Visual checklists
- Content Features
    - Two-column CSS layout
    - Patrick Hand handwritten font
    - Bold = blue marker ink
    - Italic = red marker ink
    - Horizontal rules as dividers
    - Copy-as-image button

## Shared Fields

- slug
    - Format: slug.language
    - e.g. note-cheatsheet.en
- translationKey
    - Links EN and PT-BR versions
    - Powers language switcher
- colorToken
    - Raw CSS color value
    - Overrides category accent
- tags
    - Monospace pill display
    - Shown in card and detail
- category
    - Controls accent color fallback
    - Groups cards in filter bar
