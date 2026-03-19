import { defineCollection, z } from "astro:content";
import { glob } from 'astro/loaders';

const languageEnum = z.enum(["en", "pt-br"]);

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
  schema: z.object({
    slug: z.string().min(1),
    title: z.string(),
    language: languageEnum,
    translationKey: z.string().min(1),
    publishedAt: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    updatedAt: z.coerce.date().optional(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/notes" }),
  schema: z.object({
    slug: z.string().min(1),
    title: z.string(),
    language: languageEnum,
    translationKey: z.string().min(1),
    publishedAt: z.coerce.date(),
    summary: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    colorToken: z.string().optional(),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/now" }),
  schema: z.object({
    title: z.string(),
    language: languageEnum,
    translationKey: z.string().min(1).optional(),
    updatedAt: z.coerce.date(),
    summary: z.string().optional(),
    status: z.string().optional(),
  }),
});

export const collections = {
  blog,
  notes,
  now,
};
