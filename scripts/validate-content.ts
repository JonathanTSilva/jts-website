import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { validateContent, COLLECTIONS, type CollectionType } from '../src/lib/content/validation';

const CONTENT_ROOT = 'src/content';

function validateFile(collection: CollectionType, filePath: string) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  const result = validateContent(collection, data, content);
  return result.errors;
}

function main() {
  let hasErrors = false;
  const report: Record<string, string[]> = {};

  for (const collection of COLLECTIONS) {
    const dirPath = path.join(process.cwd(), CONTENT_ROOT, collection);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const errors = validateFile(collection, filePath);

      if (errors.length > 0) {
        hasErrors = true;
        const relativePath = path.relative(process.cwd(), filePath);
        report[relativePath] = errors;
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
