/**
 * sync-content.ts
 *
 * Mirrors the published content from the jts-brain Obsidian vault into
 * the jts-website repository.  Run by the CI "Sync Content" workflow when
 * the private vault triggers a repository_dispatch event.
 *
 * What it does
 * ────────────
 * 1. Mirrors 08-Publish/{Blog,Notes}/ → src/content/{blog,notes}/
 *    Files removed from the vault are removed here too (true mirror).
 * 2. Mirrors 08-Publish/Now.en.md (legacy fallback: Now.md) and Now.pt-br.md
 *    → src/content/now/
 * 3. Scans every markdown file under 08-Publish (Blog, Notes, Now) for
 *    Obsidian image embeds (![[…]]) and copies only the referenced files from
 *    99-Meta/Attachments/ into public/assets/uploads/.  jpg/png/webp are
 *    re-encoded without metadata and at most 2000 px wide; the vault is never
 *    modified.
 * 4. Fails when a referenced image is missing, and removes uploads that no
 *    published content references any more (only after a successful run).
 *
 * Wikilink → URL conversion and ![[image]] → <img> conversion are NOT done
 * here; they happen at build time via the remark plugins in astro.config.mjs.
 *
 * Usage
 * ─────
 *   SYNC_SOURCE_DIR=/path/to/jts-brain pnpm sync:content
 *
 * In CI the env var is set automatically (see .github/workflows/sync-content.yml).
 * Locally you can also create a sync-source/ symlink at the repo root.
 */

import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.join(__dirname, '..');
const SOURCE_DIR = process.env.SYNC_SOURCE_DIR || path.join(REPO_ROOT, 'sync-source');
const CONTENT_DEST = path.join(REPO_ROOT, 'src/content');
const UPLOADS_DEST = path.join(REPO_ROOT, 'public', 'assets', 'uploads');

// ---------------------------------------------------------------------------
// Markdown mirror mappings  (source relative to SOURCE_DIR)
// ---------------------------------------------------------------------------

interface DirMapping {
  src: string;   // relative to SOURCE_DIR
  dest: string;  // relative to CONTENT_DEST
}
interface FileMapping {
  /** One source, or several in priority order (the first that exists wins). */
  src: string | string[];
  dest: string;
}

const DIR_MAPPINGS: DirMapping[] = [
  { src: '08-Publish/Blog',   dest: 'blog'  },
  { src: '08-Publish/Notes',  dest: 'notes' },
];

const FILE_MAPPINGS: FileMapping[] = [
  { src: ['08-Publish/Now.en.md', '08-Publish/Now.md'], dest: 'now/index.en.md' },
  { src: '08-Publish/Now.pt-br.md', dest: 'now/index.pt-br.md' },
];

/** Where Obsidian auto-saves all attachments. */
const ATTACHMENTS_DIR = '99-Meta/Attachments';

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif', '.bmp']);

// ---------------------------------------------------------------------------
// Step 1 — Mirror markdown directories
// ---------------------------------------------------------------------------

async function mirrorDir(srcPath: string, destPath: string, label: string): Promise<void> {
  if (!fs.existsSync(srcPath)) {
    console.log(`[skip] ${label}  (${srcPath} not found)`);
    return;
  }

  await fs.ensureDir(destPath);

  const srcFiles = (await fs.readdir(srcPath)).filter(
    f => f.endsWith('.md') || f.endsWith('.mdx'),
  );
  const destFiles = (await fs.readdir(destPath)).filter(
    f => f.endsWith('.md') || f.endsWith('.mdx'),
  );

  // Add / update
  for (const file of srcFiles) {
    await fs.copy(path.join(srcPath, file), path.join(destPath, file), { overwrite: true });
  }

  // Remove files that were deleted from the vault
  const srcSet = new Set(srcFiles);
  for (const file of destFiles) {
    if (!srcSet.has(file)) {
      await fs.remove(path.join(destPath, file));
      console.log(`  removed: ${label}/${file}`);
    }
  }

  console.log(`[${label.padEnd(6)}] ${srcFiles.length} file(s)`);
}

async function mirrorFile(srcPaths: string[], destPath: string): Promise<void> {
  const srcPath = srcPaths.find(p => fs.existsSync(p));
  if (!srcPath) {
    console.log(`[skip] ${srcPaths.map(p => path.basename(p)).join(' | ')} (not found)`);
    return;
  }
  await fs.ensureDir(path.dirname(destPath));
  await fs.copy(srcPath, destPath, { overwrite: true });
  console.log(`[now   ] ${path.basename(srcPath)} → ${path.relative(REPO_ROOT, destPath)}`);
}

// ---------------------------------------------------------------------------
// Step 2 — Extract image references from published markdown
// ---------------------------------------------------------------------------

/**
 * Scans all .md / .mdx files under rootDir recursively and returns every
 * image filename referenced via Obsidian embed syntax: ![[filename]].
 * Only files with a recognised image extension are included.
 */
async function extractReferencedImages(rootDir: string): Promise<Set<string>> {
  const refs = new Set<string>();
  if (!fs.existsSync(rootDir)) return refs;

  // Captures filename before optional |modifier
  const embedRe = /!\[\[([^\]|]+)/g;

  async function walk(dir: string) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        const content = await fs.readFile(full, 'utf-8');
        for (const match of content.matchAll(embedRe)) {
          const raw = (match[1] ?? '').trim();
          const filename = path.basename(raw); // strip any vault-relative path prefix
          if (IMAGE_EXTS.has(path.extname(filename).toLowerCase())) {
            refs.add(filename);
          }
        }
      }
    }
  }

  await walk(rootDir);
  return refs;
}

// ---------------------------------------------------------------------------
// Step 3 — Copy referenced images from 99-Meta/Attachments
// ---------------------------------------------------------------------------

/** Raster formats that are re-encoded (EXIF/GPS stripped, downsized). */
const PROCESSED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
/** Widest image kept on the site, in pixels. Narrower images are never enlarged. */
const MAX_IMAGE_WIDTH = 2000;

/**
 * Writes one image to dest.  jpg/jpeg/png/webp are auto-rotated from their
 * EXIF orientation, resized to at most MAX_IMAGE_WIDTH px wide (never
 * enlarged) and re-encoded in the same format WITHOUT metadata, so GPS and
 * camera data from the vault never reach the public site.  Every other type
 * (svg, gif, avif, bmp) is copied as-is.  The source file is never modified.
 */
export async function processImage(src: string, dest: string): Promise<void> {
  const ext = path.extname(src).toLowerCase();
  if (!PROCESSED_EXTS.has(ext)) {
    await fs.copy(src, dest, { overwrite: true });
    return;
  }

  // sharp drops all metadata by default; rotate() bakes the orientation into the pixels first.
  const pipeline = sharp(src)
    .rotate()
    .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true });

  let output: Buffer;
  if (ext === '.png') output = await pipeline.png({ compressionLevel: 9 }).toBuffer();
  else if (ext === '.webp') output = await pipeline.webp({ quality: 82 }).toBuffer();
  else output = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();

  await fs.ensureDir(path.dirname(dest));
  await fs.writeFile(dest, output);
}

export async function copyReferencedImages(
  attachmentsDir: string,
  refs: Set<string>,
  dest: string,
): Promise<{ copied: string[]; missing: string[] }> {
  await fs.ensureDir(dest);
  const copied: string[] = [];
  const missing: string[] = [];

  for (const filename of refs) {
    const src = path.join(attachmentsDir, filename);
    if (fs.existsSync(src)) {
      await processImage(src, path.join(dest, filename));
      copied.push(filename);
    } else {
      missing.push(filename);
    }
  }

  console.log(`[images] ${copied.length}/${refs.size} referenced image(s) processed from ${ATTACHMENTS_DIR}`);

  if (missing.length > 0) {
    console.error(`\n  ✖ ${missing.length} image(s) referenced in content but not found in ${ATTACHMENTS_DIR}:`);
    for (const f of missing) console.error(`    - ${f}`);
  }

  return { copied, missing };
}

// ---------------------------------------------------------------------------
// Step 4 — Prune uploads that no published content references any more
// ---------------------------------------------------------------------------

/**
 * Removes files directly inside dest that are not in refs.  Subfolders are
 * never touched.  Returns the removed filenames.
 */
export async function pruneOrphanUploads(dest: string, refs: Set<string>): Promise<string[]> {
  if (!fs.existsSync(dest)) return [];
  const removed: string[] = [];
  for (const entry of await fs.readdir(dest, { withFileTypes: true })) {
    if (!entry.isFile() || refs.has(entry.name)) continue;
    await fs.remove(path.join(dest, entry.name));
    removed.push(entry.name);
    console.log(`  removed: uploads/${entry.name}`);
  }
  return removed;
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export async function syncContent(
  sourceDir: string,
  contentDest: string = CONTENT_DEST,
  uploadsDest: string = UPLOADS_DEST,
): Promise<void> {
  console.log(`\nSyncing from: ${sourceDir}\n`);

  if (!fs.existsSync(sourceDir)) {
    console.error(`Source not found: ${sourceDir}`);
    console.error('Set SYNC_SOURCE_DIR to your vault root, or create a sync-source/ symlink.');
    process.exit(1);
  }

  // 1 — Mirror markdown
  console.log('── Markdown ──────────────────────────────────');
  for (const { src, dest } of DIR_MAPPINGS) {
    await mirrorDir(path.join(sourceDir, src), path.join(contentDest, dest), dest);
  }
  for (const { src, dest } of FILE_MAPPINGS) {
    const candidates = (Array.isArray(src) ? src : [src]).map(s => path.join(sourceDir, s));
    await mirrorFile(candidates, path.join(contentDest, dest));
  }

  // 2 — Find all image references in the published content (Blog, Notes and the Now pages)
  console.log('\n── Images ────────────────────────────────────');
  const publishDir = path.join(sourceDir, '08-Publish');
  const refs = await extractReferencedImages(publishDir);

  if (refs.size === 0) {
    console.log('[images] no image embeds found in published content');
  }

  // 3 — Process only the referenced files; the vault copies are never modified
  const attachmentsDir = path.join(sourceDir, ATTACHMENTS_DIR);
  let missing: string[] = [];
  if (refs.size > 0) {
    if (!fs.existsSync(attachmentsDir)) {
      console.error(`[images] ${ATTACHMENTS_DIR} not found: expected ${attachmentsDir}`);
      missing = [...refs];
    } else {
      ({ missing } = await copyReferencedImages(attachmentsDir, refs, uploadsDest));
    }
  }

  // A failed run must never delete uploads, so throw before pruning.
  if (missing.length > 0) {
    throw new Error(`Missing images referenced in content: ${missing.join(', ')}`);
  }

  // 4 — Drop uploads no published content references (only when 08-Publish exists at all)
  if (fs.existsSync(publishDir)) {
    const removed = await pruneOrphanUploads(uploadsDest, refs);
    if (removed.length > 0) console.log(`[images] pruned ${removed.length} unreferenced upload(s)`);
  }

  console.log('\n── Done ──────────────────────────────────────\n');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncContent(SOURCE_DIR).catch(err => {
    console.error('Sync failed:', err);
    process.exit(1);
  });
}
