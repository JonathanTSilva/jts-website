---
slug: "book-cheatsheet.en"
title: "Building a Second Brain"
language: "en"
translationKey: "book-cheatsheet"
publishedAt: "2026-04-17"
noteType: book
summary: "A proven method to organise your digital life and unlock your creative potential."
category: "Productivity"
tags: [pkm, second-brain, note-taking, creativity]
colorToken: "#0ea5e9"
author:
  - Tiago Forte
cover: "https://covers.openlibrary.org/b/isbn/9781982167387-L.jpg"
pages: 272
rating: "★★★★★"
status:
  - finished
dateRead: "2025-03-10"
publishDate: "2022-06-14"
relatedTo:
  - "[[How to Take Smart Notes]]"
  - "[[A System for Writing]]"
  - "[[Getting Things Done]]"
previousBook: "[[How to Take Smart Notes]]"
nextBook: "[[A System for Writing]]"
---

## Overview

Tiago Forte's *Building a Second Brain* makes the case that our minds are for **having** ideas, not storing them. By offloading information to a trusted external system — the "Second Brain" — we free cognitive bandwidth for deeper thinking and creative work.

The book introduces two frameworks that work together: **CODE** (a four-step workflow) and **PARA** (a universal folder structure).

## Key Ideas

### CODE — The Four-Step Workflow

1. **Capture** — Save only what genuinely resonates, not everything.
2. **Organise** — Sort by *actionability* using PARA, not by topic or subject.
3. **Distil** — Progressive summarisation: highlight → bold the best → write your own summary.
4. **Express** — Every note exists to be turned into output, not kept in storage.

### PARA — Four Universal Folders

| Folder    | Definition                                   | Example                       |
|-----------|----------------------------------------------|-------------------------------|
| Projects  | Short-term goals with a clear end date       | "Write post on RTOS"          |
| Areas     | Ongoing responsibilities without an end date | "Embedded knowledge"          |
| Resources | Topics of interest for future reference      | "PKM reading list"            |
| Archives  | Inactive items from the other three          | "Finished online courses"     |

### The Archipelago of Ideas

Rather than starting from a blank page, build an "archipelago" of pre-gathered notes and quotes ahead of time, so the first draft writes itself. This reframes writing as *assembly*, not creation from nothing.

## Highlights

> "Your job is not to think about the content, but to work **with** it."

> "Every note is a stepping stone to a creative product, not a destination in itself."

The book's practical stance is its main strength. Where other PKM books philosophise, Forte focuses relentlessly on *output* at every step. It pairs well with Ahrens' *How to Take Smart Notes* for the theoretical foundation.

## Takeaways

- Don't capture everything — capture what **surprises** or contradicts your existing beliefs.
- Organise for your *future self*, who will be searching under pressure and time constraints.
- Small, atomic notes compound over time; large, monolithic notes rarely get revisited.
- The goal of the system is to reduce the activation energy needed to start creating.

## Frontmatter Reference

```yaml
slug: "my-book.en"                        # required
title: "Book Title"                       # required
noteType: book                            # required for this layout
author:                                   # optional list of strings
  - Author Name
cover: "https://…"                        # optional — cover image URL
pages: 272                                # optional — positive integer
rating: "★★★★★"                           # optional — any string
status:                                   # optional — finished | reading | abandoned
  - finished
dateRead: "2025-03-10"                    # optional — ISO date
publishDate: "2022-06-14"                 # optional — ISO date (book's pub date)
relatedTo:                                # optional — Wikilink-style references
  - "[[Another Book]]"
previousBook: "[[Previous Book Title]]"   # optional — enables prev/next navigation
nextBook: "[[Next Book Title]]"           # optional
```
