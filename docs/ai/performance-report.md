## Performance Diagnosis — `feat/notes-type-system`

### HIGH Impact

**1. Mermaid.js eagerly loaded on ALL blog + note pages**
- `MermaidRenderer` is included unconditionally — Vite hoists the dynamic `import('mermaid')`, bypassing the DOM guard
- **+133 KB gzipped** on every page, even those with zero mermaid diagrams
- **+200-400ms TBT** on mid-range devices from parse/eval
- **Fix:** Conditionally render `<MermaidRenderer />` only when `post.body?.includes('```mermaid')`

**2. Mermaid build output: 2.1 MB (50% of dist/_astro/)**
- Mermaid 11.x bundles every diagram type + cytoscape (442 KB)
- **50+ chunk files** in dist for diagram types that may never be used
- **Fix:** Render mermaid to SVG at build time (`@mermaid-js/mermaid-cli`) for zero client JS, or use lazy-loading with `registerDiagram`

### MEDIUM Impact

**3. Google Fonts render-blocking on whiteboard pages**
- BaseLayout.astro loads Patrick Hand + Caveat via blocking `<link rel="stylesheet">`
- **+100-300ms FCP** depending on RTT to Google CDN
- **Fix:** Self-host via `@fontsource/patrick-hand` and `@fontsource/caveat`

### LOW Impact

**4. Redundant `getCollection('notes')` in every layout component** — each of the 4 layout files calls it independently for related/prev/next. Negligible now (~10 notes), O(n²) at scale. Fix: compute in `getStaticPaths()` and pass as props.

**5. OG image generation +1.4s** — 8 new images × ~180ms each. Acceptable, scales linearly.

### Quick Wins

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 1 | Conditional `<MermaidRenderer />` | 15 min | -133 KB/page |
| 2 | Self-host whiteboard fonts | 30 min | -100-300ms FCP |
| 3 | Centralize prev/next in `getStaticPaths` | 45 min | Cleaner, faster at scale |

Want me to implement any of these fixes?
