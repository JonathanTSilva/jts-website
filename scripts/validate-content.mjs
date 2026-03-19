import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';

const languageEnum = z.enum(["en", "pt-br"]);

const blogSchema = z.object({
  slug: z.string().min(1),
  title: z.string(),
  language: languageEnum,
  translationKey: z.string().min(1),
  publishedAt: z.coerce.date(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  updatedAt: z.coerce.date().optional(),
});

const notesSchema = z.object({
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

const nowSchema = z.object({
  title: z.string(),
  language: languageEnum,
  translationKey: z.string().min(1).optional(),
  updatedAt: z.coerce.date(),
  summary: z.string().optional(),
  status: z.string().optional(),
});

const SCHEMAS = {
  blog: blogSchema,
  notes: notesSchema,
  now: nowSchema,
};

const CONTRACTS = {
  blog: ["Conclusion"],
  notes: [],
  now: [],
};

const CONTENT_ROOT = 'src/content';
const COLLECTIONS = ['blog', 'notes', 'now'];

function requireSections(body, headings) {
  return headings.filter((heading) => !body.includes(`## ${heading}`));
}

function validateFile(collection, filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  const errors = [];

  // 1. Validate Frontmatter
  const schema = SCHEMAS[collection];
  const result = schema.safeParse(data);
  if (!result.success) {
    result.error.errors.forEach((err) => {
      errors.push(`Frontmatter: [${err.path.join(".")}] ${err.message}`);
    });
  }

  // 2. Validate Sections
  const required = CONTRACTS[collection];
  const missing = requireSections(content, required);
  missing.forEach((section) => {
    errors.push(`Content: Missing required section "## ${section}"`);
  });

  return errors;
}

function main() {
  let hasErrors = false;
  const report = {};

  for (const collection of COLLECTIONS) {
    const dirPath = path.join(CONTENT_ROOT, collection);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const errors = validateFile(collection, filePath);

      if (errors.length > 0) {
        hasErrors = true;
        report[filePath] = errors;
      }
    }
  }

  if (hasErrors) {
    console.error('❌ Content validation failed!\n');
    for (const [filePath, errors] of Object.entries(report)) {
      console.error(`File: ${filePath}`);
      errors.forEach(err => console.error(`  - ${err}`));
      console.error('');
    }
    process.exit(1);
  } else {
    console.log('✅ All content validated successfully.');
  }
}

main();
