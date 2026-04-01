# SEO Checklist

Reference for maintaining SEO correctness on jts-website. Covers metadata rules, structured data, multilingual signals, and indexing.

---

## 1. Metadata Rules by Page Type

Title and description are resolved in this priority order:

1. Explicit `title`/`description` props on `<BaseLayout>` — always win
2. `pageType` defaults from `PAGE_TYPE_DEFAULTS` in `src/lib/seo/metadata.ts`
3. Fallback: site name + profession string

| `pageType`      | EN title                                         | EN description                                                                               | PT-BR title                                          | PT-BR description                                                                     |
|-----------------|--------------------------------------------------|----------------------------------------------------------------------------------------------|------------------------------------------------------|---------------------------------------------------------------------------------------|
| `home`          | Tobias \| Senior Embedded Software Engineer      | Senior Embedded Software Engineer & M.Sc. specializing in mission-critical systems...       | Tobias \| Engenheiro Sênior de Software Embarcado    | Engenheiro Sênior de Software Embarcado & M.Sc. especializado em sistemas críticos... |
| `blog-index`    | Blog \| Tobias                                   | Articles and thoughts on embedded systems, software engineering, and technical leadership.   | Blog \| Tobias                                       | Artigos e reflexões sobre sistemas embarcados, engenharia de software...               |
| `notes-index`   | Notes \| Tobias                                  | Short-form notes, TILs, and technical observations.                                          | Notas \| Tobias                                      | Notas curtas, TILs e observações técnicas.                                            |
| `portfolio`     | Portfolio \| Tobias                              | Selected projects and open-source work in embedded systems and software engineering.         | Portfólio \| Tobias                                  | Projetos selecionados e trabalhos de código aberto em sistemas embarcados...           |
| `now`           | Now \| Tobias                                    | What I am focused on right now.                                                              | Agora \| Tobias                                      | No que estou focado agora.                                                             |
| `article`       | (fallback — always pass real title/description)  | (fallback — always pass real title/description)                                              | (fallback — always pass real title/description)      | (fallback — always pass real title/description)                                        |
| `legal`         | Legal \| Tobias                                  | Legal information, privacy policy, and terms of use.                                         | Legal \| Tobias                                      | Informações legais, política de privacidade e termos de uso.                          |
| `generic`       | Tobias \| Senior Embedded Software Engineer      | (site default description)                                                                   | Tobias \| Engenheiro Sênior de Software Embarcado    | (site default description)                                                             |

**Article pages** (blog and notes slugs) always receive the real post `title` and `description` (summary/excerpt) from the content collection — never rely on `pageType: 'article'` defaults alone.

---

## 2. Structured Data

Three schema helpers live in `src/lib/seo/schema.ts`:

| Function                  | Schema type     | Emitted on                         |
|---------------------------|-----------------|------------------------------------|
| `generatePersonSchema()`  | `Person`        | Homepage (`/`, `/pt-br/`)          |
| `generateWebSiteSchema()` | `WebSite`       | Homepage (`/`, `/pt-br/`)          |
| `generateArticleSchema()` | `BlogPosting`   | Blog and notes slug pages          |

Schema output is rendered via `<StructuredData>` (`src/components/site/StructuredData.astro`), which writes the JSON-LD `<script>` into `<head>`.

**To add structured data to a new page:**

```astro
---
import { generatePersonSchema } from '../lib/seo/schema';
---
<BaseLayout structuredData={[generatePersonSchema()]}>
  ...
</BaseLayout>
```

Pass an array — multiple schemas on one page are supported.

---

## 3. Multilingual SEO Invariants

- Every page **must** pass `locale` to `<BaseLayout>`. English pages use `locale="en"` (the default); Portuguese pages use `locale="pt-br"`.
- `hreflang="en"`, `hreflang="pt-br"`, and `hreflang="x-default"` are emitted automatically by `SeoHead` — do not add them manually in page files.
- The canonical URL is computed from `currentPath` automatically. Only pass the `canonical` prop if you need to override it (e.g., paginated pages pointing to the first page).
- Every translated page must have a corresponding file under both `src/pages/` (EN) and `src/pages/pt-br/` (PT-BR). A missing translation breaks the hreflang pair.

---

## 4. Adding a New Page Type

1. Add an entry to `PAGE_TYPE_DEFAULTS` in `src/lib/seo/metadata.ts` with both `en` and `pt-br` keys.
2. Add the new value to the `PageType` union type in the same file.
3. Create the EN page under `src/pages/` and the PT-BR page under `src/pages/pt-br/`.
4. Set `pageType="your-new-type"` on `<BaseLayout>` in both files.
5. Add an E2E test asserting the correct title and meta description for both locales (see `tests/e2e/seo.spec.ts` for patterns).

---

## 5. SEO Quality Checklist

Run through this list for every new page before merging:

- [ ] Title is distinct and meaningful (not a generic fallback)
- [ ] Meta description is present and accurately describes the page
- [ ] `pageType` is set on `<BaseLayout>`, or explicit `title`/`description` are passed
- [ ] `locale` is correct on `<BaseLayout>` (`"en"` or `"pt-br"`)
- [ ] Page exists in both `src/pages/` and `src/pages/pt-br/`
- [ ] hreflang links emit correctly (automatic — verify in browser devtools or `<head>` source)
- [ ] If article: `structuredData` prop passes `generateArticleSchema(...)` output to `<BaseLayout>`
- [ ] `robots.txt` is not blocking the page (check for overly broad `Disallow` rules)

---

## 6. Sitemap and robots.txt

- The sitemap is auto-generated by `@astrojs/sitemap` at build time — no manual maintenance needed.
- `public/robots.txt` references `https://www.jontobias.com/sitemap-index.xml`.
- To exclude a page from the sitemap, add a filter function to the `sitemap()` integration options in `astro.config.mjs`:

  ```js
  sitemap({
    filter: (page) => !page.includes('/admin/'),
  })
  ```

- `robots.txt` currently allows all crawlers on all paths. To disallow a path, edit `public/robots.txt` directly.
