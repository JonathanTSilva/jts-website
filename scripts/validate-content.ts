import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { validateContent } from '../src/lib/content/validation';
import {
  listRepoFiles,
  listVaultFiles,
  withExtraFiles,
  type SourceFile,
} from '../src/lib/content/vaultSource';

const CONTENT_ROOT = 'src/content';

const USAGE = 'usage: validate-content.ts [--vault <dir>] [extra files...]';

function validateFile(file: SourceFile) {
  const fileContent = fs.readFileSync(file.path, 'utf8');
  const { data, content } = matter(fileContent);

  const result = validateContent(file.collection, data, content);
  return { errors: result.errors, warnings: result.warnings };
}

function parseArgs(argv: string[]): { vault: string | null; extra: string[] } {
  let vault: string | null = null;
  const extra: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === '--vault') {
      const value = argv[++i];
      if (!value) {
        console.error(`--vault needs a directory\n${USAGE}`);
        process.exit(2);
      }
      vault = value;
    } else if (arg.startsWith('--vault=')) {
      vault = arg.slice('--vault='.length);
    } else if (arg.startsWith('--')) {
      console.error(`unknown option: ${arg}\n${USAGE}`);
      process.exit(2);
    } else {
      extra.push(arg);
    }
  }
  return { vault, extra };
}

function main() {
  const { vault, extra } = parseArgs(process.argv.slice(2));

  // Repo files report paths relative to cwd; vault files relative to the vault root.
  const reportBase = vault ? path.resolve(vault) : process.cwd();
  let files: SourceFile[];
  if (vault) {
    if (!fs.existsSync(reportBase) || !fs.statSync(reportBase).isDirectory()) {
      console.error(`vault directory not found: ${vault}`);
      process.exit(2);
    }
    files = listVaultFiles(reportBase);
  } else {
    files = listRepoFiles(path.join(process.cwd(), CONTENT_ROOT));
  }
  if (extra.length > 0) {
    files = withExtraFiles(
      files,
      extra.map((p) => path.resolve(p)),
    );
  }

  let hasErrors = false;
  const report: Record<string, string[]> = {};

  for (const file of files) {
    const { errors, warnings } = validateFile(file);
    // Extra files can live outside the report base; show those as given.
    const rel = path.relative(reportBase, file.path);
    const relativePath = rel.startsWith('..') ? file.path : rel;

    warnings.forEach((warn) => console.log(`⚠️  ${relativePath}: ${warn}`));

    if (errors.length > 0) {
      hasErrors = true;
      report[relativePath] = errors;
    }
  }

  if (hasErrors) {
    console.error('❌ Content validation failed!\n');
    for (const [filePath, errors] of Object.entries(report)) {
      console.error(`File: ${filePath}`);
      errors.forEach((err) => console.error(`  - ${err}`));
      console.error('');
    }
    process.exit(1);
  } else {
    console.log('✅ All content validated successfully.');
  }
}

main();
