import { defineCollection } from "astro:content";
import { glob } from 'astro/loaders';
import { entryIdFromPath } from "./lib/content/slug";
import { blogSchema, notesSchema, nowSchema, portfolioAboutSchema } from "./lib/content/schemas";

// Entry ids are filename stems: the frontmatter slug is shared by both languages.
const blog = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: "./src/content/blog",
    generateId: ({ entry }) => entryIdFromPath(entry),
  }),
  schema: blogSchema,
});

const notes = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: "./src/content/notes",
    generateId: ({ entry }) => entryIdFromPath(entry),
  }),
  schema: notesSchema,
});

const now = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/now" }),
  schema: nowSchema,
});

const portfolio = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/portfolio" }),
  schema: portfolioAboutSchema,
});

export const collections = {
  blog,
  notes,
  now,
  portfolio,
};
