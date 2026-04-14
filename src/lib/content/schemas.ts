import { z } from "zod";
import { LOCALES } from "./locale";

export const languageEnum = z.enum(LOCALES);

export const blogSchema = z.object({
  slug: z.string().min(1),
  title: z.string(),
  language: languageEnum,
  translationKey: z.string().min(1),
  publishedAt: z.coerce.date(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  updatedAt: z.coerce.date().optional(),
  category: z.string().optional(),
});

export const notesSchema = z.object({
  slug: z.string().min(1),
  title: z.string(),
  language: languageEnum,
  translationKey: z.string().min(1),
  publishedAt: z.coerce.date(),
  noteType: z.enum(["note", "book", "mindmap", "whiteboard"]).default("note"),
  summary: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  colorToken: z.string().optional(),
  // book only
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
});

export const nowSchema = z.object({
  title: z.string(),
  language: languageEnum,
  translationKey: z.string().min(1),
  updatedAt: z.coerce.date(),
  summary: z.string().optional(),
  status: z.string().optional(),
});

export const portfolioAboutSchema = z.object({
  title: z.string(),
  language: languageEnum,
  translationKey: z.string().min(1),
  summary: z.string().optional(),
});
