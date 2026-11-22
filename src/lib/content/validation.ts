import { blogSchema, notesSchema, nowSchema, portfolioAboutSchema } from "./schemas";
import { requireSections } from "./contracts";
import { expectedSlug } from "./slug";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SafeParseSchema = { safeParse: (data: unknown) => any };

export type CollectionType = "blog" | "notes" | "now" | "portfolio";

export const COLLECTIONS: CollectionType[] = ["blog", "notes", "now", "portfolio"];

const CONTRACTS: Record<CollectionType, string[]> = {
  blog: ["Conclusion|Conclusão"],
  notes: [],
  now: [],
  portfolio: [],
};

const SCHEMAS: Record<CollectionType, SafeParseSchema> = {
  blog: blogSchema,
  notes: notesSchema,
  now: nowSchema,
  portfolio: portfolioAboutSchema,
};

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

export function validateContent(
  collection: CollectionType,
  frontmatter: Record<string, any>,
  body: string,
  filename?: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 0. Slug rule: the filename without the date and the language.
  if (filename && (collection === "blog" || collection === "notes")) {
    const slug = frontmatter.slug;
    if (typeof slug === "string" && slug.length > 0) {
      const expected = expectedSlug(filename, collection);
      if (slug !== expected) {
        errors.push(
          `slug "${slug}" must be "${expected}" (the filename without the date and the language)`
        );
      }
    }
  }

  // 1. Validate Frontmatter
  const schema = SCHEMAS[collection];
  const result = schema.safeParse(frontmatter);
  if (!result.success && result.error) {
    result.error.issues.forEach((err: { path: (string | number)[]; message: string }) => {
      errors.push(`Frontmatter: [${err.path.join(".")}] ${err.message}`);
    });
  }

  // 2. Validate Sections
  const required = CONTRACTS[collection];
  const missing = requireSections(body, required);
  missing.forEach((section) => {
    const display = section.split("|")[0];
    errors.push(`Content: Missing required section "## ${display}"`);
  });

  // 3. Type-specific validation
  if (collection === 'notes') {
    const noteType = frontmatter.noteType ?? 'note';

    if (noteType === 'mindmap') {
      const hasH1 = /^#\s+\S/m.test(body);
      if (!hasH1) {
        warnings.push('Mindmap note has no H1 — the mindmap tree needs a root node (# Root Title)');
      }
    }
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
  };
}
