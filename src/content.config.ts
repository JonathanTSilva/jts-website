import { defineCollection } from "astro:content";
import { z } from "zod";
import { glob } from 'astro/loaders';

const language = z.enum(["en", "pt-br"]);

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
  schema: z.object({
    slug: z.string().min(1),
    title: z.string(),
    language,
    translationKey: z.string().min(1),
    publishedAt: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    updatedAt: z.coerce.date().optional(),
    category: z.string().optional(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/notes" }),
  schema: z.object({
    slug: z.string().min(1),
    title: z.string(),
    language,
    translationKey: z.string().min(1),
    publishedAt: z.coerce.date(),
    noteType: z.enum(["note", "book", "mindmap", "whiteboard"]).default("note"),
    summary: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    colorToken: z.string().optional(),
    author: z.array(z.string()).optional(),
    cover: z.string().url().optional(),
    pages: z.number().int().positive().optional(),
    rating: z.string().optional(),
    status: z.array(z.string()).optional(),
    dateRead: z.coerce.date().optional(),
    publishDate: z.coerce.date().optional(),
    relatedTo: z.array(z.string()).optional(),
    previousBook: z.string().optional(),
    nextBook: z.string().optional(),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/now" }),
  schema: z.object({
    title: z.string(),
    language,
    translationKey: z.string().min(1),
    updatedAt: z.coerce.date(),
    summary: z.string().optional(),
    status: z.string().optional(),
  }),
});

const portfolio = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/portfolio" }),
  schema: z.object({
    title: z.string(),
    language,
    translationKey: z.string().min(1),
    summary: z.string().optional(),
  }),
});

export const collections = {
  blog,
  notes,
  now,
  portfolio,
};
