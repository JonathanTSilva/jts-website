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
}

const MAPPINGS: SyncMapping[] = [
  { source: '08-Publish/Blog', dest: 'blog' },
  { source: '08-Publish/Notes', dest: 'notes' },
  { source: '08-Publish/Now', dest: 'now' },
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

    console.log(`Syncing ${srcPath} to ${destPath}`);

    // Ensure destination exists
    fs.ensureDirSync(destPath);

    // Get files in source and destination
    const srcFiles = fs.readdirSync(srcPath).filter(f => f.endsWith('.md'));
    const destFiles = fs.readdirSync(destPath).filter(f => f.endsWith('.md'));

    // Copy/Update files from source to destination
    for (const file of srcFiles) {
      const srcFile = path.join(srcPath, file);
      const destFile = path.join(destPath, file);
      
      console.log(`  Copying ${file}`);
      fs.copySync(srcFile, destFile, { overwrite: true });
    }

    // Remove files in destination that are no longer in source
    for (const file of destFiles) {
      if (!srcFiles.includes(file)) {
        const fileToRemove = path.join(destPath, file);
        console.log(`  Removing obsolete ${file}`);
        fs.removeSync(fileToRemove);
      }
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
