import { blogSchema, notesSchema, nowSchema } from "./schemas";
import { requireSections } from "./contracts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SafeParseSchema = { safeParse: (data: unknown) => any };

export type CollectionType = "blog" | "notes" | "now";

export const COLLECTIONS: CollectionType[] = ["blog", "notes", "now"];

const CONTRACTS: Record<CollectionType, string[]> = {
  blog: ["Conclusion|Conclusão"],
  notes: [],
  now: [],
};

const SCHEMAS: Record<CollectionType, SafeParseSchema> = {
  blog: blogSchema,
  notes: notesSchema,
  now: nowSchema,
};

export interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

export function validateContent(
  collection: CollectionType,
  frontmatter: Record<string, any>,
  body: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

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

    if (noteType === 'book') {
      if (!frontmatter.author || (Array.isArray(frontmatter.author) && frontmatter.author.length === 0)) {
        errors.push('Book note missing required field: author');
      }
      if (!frontmatter.cover) {
        errors.push('Book note missing required field: cover');
      }
    }

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
