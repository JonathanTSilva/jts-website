import { blogSchema, notesSchema, nowSchema } from "./schemas";
import { requireSections } from "./contracts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SafeParseSchema = { safeParse: (data: unknown) => any };

export type CollectionType = "blog" | "notes" | "now";

export const COLLECTIONS: CollectionType[] = ["blog", "notes", "now"];

const CONTRACTS: Record<CollectionType, string[]> = {
  blog: ["Conclusion"],
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
}

export function validateContent(
  collection: CollectionType,
  frontmatter: Record<string, any>,
  body: string
): ValidationResult {
  const errors: string[] = [];

  // 1. Validate Frontmatter
  const schema = SCHEMAS[collection];
  const result = schema.safeParse(frontmatter);
  if (!result.success && result.error) {
    result.error.errors.forEach((err: { path: (string | number)[]; message: string }) => {
      errors.push(`Frontmatter: [${err.path.join(".")}] ${err.message}`);
    });
  }

  // 2. Validate Sections
  const required = CONTRACTS[collection];
  const missing = requireSections(body, required);
  missing.forEach((section) => {
    errors.push(`Content: Missing required section "## ${section}"`);
  });

  return {
    success: errors.length === 0,
    errors,
  };
}
