import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.join(__dirname, '..');
const SOURCE_DIR = process.env.SYNC_SOURCE_DIR || path.join(REPO_ROOT, 'sync-source');
const DEST_DIR = path.join(REPO_ROOT, 'src/content');

interface SyncMapping {
  source: string;
  dest: string;
  isDir: boolean;
}

const MAPPINGS: SyncMapping[] = [
  { source: '08-Publish/Blog', dest: 'blog', isDir: true },
  { source: '08-Publish/Notes', dest: 'notes', isDir: true },
  // Mapping now.md to now/index.en.md specifically
  { source: '08-Publish/now.md', dest: 'now/index.en.md', isDir: false },
];

export async function syncContent(sourceDir: string, destDir: string) {
  console.log(`Starting content sync from ${sourceDir} to ${destDir}`);

  if (!fs.existsSync(sourceDir)) {
    console.warn(`Source directory ${sourceDir} does not exist. Skipping sync.`);
    return;
  }

  for (const mapping of MAPPINGS) {
    const srcPath = path.join(sourceDir, mapping.source);
    const destPath = path.join(destDir, mapping.dest);

    if (!fs.existsSync(srcPath)) {
      console.warn(`Source path ${srcPath} does not exist. Skipping mapping.`);
      continue;
    }

    if (mapping.isDir) {
      console.log(`Syncing directory ${srcPath} to ${destPath}`);
      fs.ensureDirSync(destPath);
      const srcFiles = fs.readdirSync(srcPath).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
      const destFiles = fs.readdirSync(destPath).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

      for (const file of srcFiles) {
        fs.copySync(path.join(srcPath, file), path.join(destPath, file), { overwrite: true });
      }

      for (const file of destFiles) {
        if (!srcFiles.includes(file)) {
          fs.removeSync(path.join(destPath, file));
        }
      }
    } else {
      console.log(`Syncing file ${srcPath} to ${destPath}`);
      fs.ensureDirSync(path.dirname(destPath));
      fs.copySync(srcPath, destPath, { overwrite: true });
    }
  }

  console.log('Content sync completed.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncContent(SOURCE_DIR, DEST_DIR).catch(err => {
    console.error('Error during content sync:', err);
    process.exit(1);
  });
}
