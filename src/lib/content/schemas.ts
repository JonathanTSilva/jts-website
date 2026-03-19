import { z } from "zod";

export const languageEnum = z.enum(["en", "pt-br"]);

export const blogSchema = z.object({
  slug: z.string().min(1),
  title: z.string(),
  language: languageEnum,
  translationKey: z.string().min(1),
  publishedAt: z.coerce.date(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  updatedAt: z.coerce.date().optional(),
});

export const notesSchema = z.object({
  slug: z.string().min(1),
  title: z.string(),
  language: languageEnum,
  translationKey: z.string().min(1),
  publishedAt: z.coerce.date(),
  summary: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  colorToken: z.string().optional(),
});

export const nowSchema = z.object({
  title: z.string(),
  language: languageEnum,
  translationKey: z.string().min(1).optional(),
  updatedAt: z.coerce.date(),
  summary: z.string().optional(),
  status: z.string().optional(),
});
