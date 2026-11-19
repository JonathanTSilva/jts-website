# Share cards (Open Graph) redesign

## Why

Links shared on LinkedIn (main channel) show a 1200x630 card that LinkedIn shrinks to ~552px.
Today the category (14px), name (17px) and role (13px) become unreadable, the brand is a 28px logo,
the color is an off-brand purple, the kind (book, whiteboard…) is never shown, and the link text
repeats the title with "| Tobias". Pages without their own card point to `/og-image.png`, which does not exist.

## Goals

- Readable at LinkedIn feed size: kind, category, title, name and brand.
- Show what the content is: `BLOG · ENGINEERING`, `BOOK · PRODUCTIVITY`, `QUADRO · ENGENHARIA`.
- Brand: logo, domain and site accent color; per-note `colorToken` when present.
- Link text under the image is the clean title, without "| Tobias".
- Every page has a working share image.

Non-goals: WhatsApp square-crop layout, book covers on the card, changing the browser tab `<title>`.

## Approaches considered

- **A. Bold editorial** (chosen): colored top bar, large mono kind · category label, large title, large author strip with logo and domain. Clearest and simplest.
- B. Split brand panel: solid color third with logo/kind or book cover. More distinctive, less room for long titles.
- C. Summary hook instead of title: avoids repetition, but depends on summary quality.

Jonathan picked A after seeing all three at LinkedIn size.

## Design

Card (`src/lib/ogImage.ts`, satori, 1200x630, dark `#0A0A0F`):

- 14px top bar in the accent color.
- Label in Geist Mono 30px, uppercase: `<KIND> · <CATEGORY>`, in a lightened accent color.
- Title Geist Bold, 76px, stepping down to 70px (>40 chars) and 62px (>70 chars), max width 1050px.
- Bottom left: 84px avatar ringed in the accent color, "Jonathan Tobias" 34px, role 24px muted.
- Bottom right: 56px logo + `jontobias.com` in Geist Mono 28px.
- Accent color: note `colorToken` if set, else `--accent` dark value `#6272EA`. (Category colors in `categoryColors.ts` are too dark for a label; not used.)

Kind labels, localized (reusing `NotesFilters.astro` wording): blog post → Blog / Artigo;
noteType note/book/mindmap/whiteboard → Note/Nota, Book/Livro, Mindmap/Mapa mental, Whiteboard/Quadro.
The OG endpoints pass `kind`, `category`, `color` and locale from each entry.

Default card: a new static endpoint `src/pages/og-image.png.ts` renders the same layout with label
`JONTOBIAS.COM` and title "Senior Embedded Software Engineer", fixing the missing `/og-image.png`.

Metadata (`src/lib/seo/metadata.ts`):

- `og:title` and `twitter:title` for article pages (blog and notes): bare title, no suffix.
- Browser `<title>` unchanged (`Title | Tobias`), so SEO and existing e2e title tests stay as they are.
- `og:site_name`: "Jonathan Tobias".

## Tests

- Unit: label building (kind + category, both locales), color fallback, OG title has no suffix on articles, `site_name`.
- Build produces `/og-image.png` and per-entry PNGs.

## Left to the builder

Exact lightening of the label color, title line clamping for extreme lengths, and the `Mapa mental` label check against existing UI text.
