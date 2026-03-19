import { defineCollection } from "astro:content";
import { glob } from 'astro/loaders';
import { blogSchema, notesSchema, nowSchema } from "../lib/content/schemas";

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
  schema: blogSchema,
});

const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/notes" }),
  schema: notesSchema,
});

const now = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/now" }),
  schema: nowSchema,
});

export const collections = {
  blog,
  notes,
  now,
};
