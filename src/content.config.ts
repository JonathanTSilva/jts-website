import { defineCollection } from "astro:content";
import { glob } from 'astro/loaders';
import { globEntryId } from "./lib/content/slug";
import { blogSchema, notesSchema, nowSchema, portfolioAboutSchema } from "./lib/content/schemas";

// Entry ids are filename stems: the frontmatter slug is shared by both languages.
const blog = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: "./src/content/blog",
    generateId: globEntryId,
  }),
  schema: blogSchema,
});

const notes = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: "./src/content/notes",
    generateId: globEntryId,
  }),
  schema: notesSchema,
});

// Repo-owned fixtures for the E2E suite. Same schemas and ids as the real
// collections, but a separate folder so they never depend on (or leak into) the
// vault-synced content. Served under /test-fixtures/ and removed from the deploy.
const fixtureBlog = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: "./tests/fixtures/content/blog",
    generateId: globEntryId,
  }),
  schema: blogSchema,
});

const fixtureNotes = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: "./tests/fixtures/content/notes",
    generateId: globEntryId,
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
  fixtureBlog,
  fixtureNotes,
  now,
  portfolio,
};
