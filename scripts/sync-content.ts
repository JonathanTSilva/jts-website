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
 *    Files removed from the vault are removed here too (true mirror), but a
 *    run that would remove more than MAX_DELETIONS files, or more than
 *    MAX_DELETION_RATIO of one folder, fails before changing anything unless
 *    SYNC_ALLOW_MASS_DELETE=true.  A vault folder that is missing entirely is
 *    skipped, never emptied.
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

/** One markdown file the sync adds, changes or removes, relative to src/content. */
export interface ContentChange {
  /** For example `blog/2026-11-my-post.en.md`. */
  file: string;
  /** The frontmatter `title`, when there is one. */
  title?: string | undefined;
}

/** What one mirrored folder will do, worked out before any file is touched. */
export interface DirPlan {
  label: string;
  srcPath: string;
  destPath: string;
  /** Markdown files in the destination before the sync. */
  destCount: number;
  added: ContentChange[];
  changed: ContentChange[];
  removed: ContentChange[];
}

const isMarkdown = (f: string) => f.endsWith('.md') || f.endsWith('.mdx');

const byName = (a: string, b: string) => a.localeCompare(b);

/** Reads the frontmatter `title` of a markdown file, or undefined. */
export function readTitle(markdown: string): string | undefined {
  const lines = markdown.split('\n').map(l => l.trimEnd());
  if (lines[0] !== '---') return undefined;
  for (const line of lines.slice(1)) {
    if (line === '---') return undefined; // end of frontmatter, no title
    if (!line.startsWith('title:')) continue;
    const value = line.slice('title:'.length).trim();
    const quote = value[0];
    const quoted = value.length > 1 && (quote === '"' || quote === "'") && value.endsWith(quote);
    return (quoted ? value.slice(1, -1) : value) || undefined;
  }
  return undefined;
}

/**
 * Compares a vault folder with its website folder.  Returns null when the
 * vault folder does not exist at all: a missing folder is skipped, never
 * treated as "delete everything".
 */
export async function planDirMirror(
  srcPath: string,
  destPath: string,
  label: string,
): Promise<DirPlan | null> {
  if (!fs.existsSync(srcPath)) return null;

  const srcFiles = (await fs.readdir(srcPath)).filter(isMarkdown).sort(byName);
  const destFiles = fs.existsSync(destPath)
    ? (await fs.readdir(destPath)).filter(isMarkdown).sort(byName)
    : [];
  const destSet = new Set(destFiles);
  const srcSet = new Set(srcFiles);

  const plan: DirPlan = {
    label, srcPath, destPath, destCount: destFiles.length, added: [], changed: [], removed: [],
  };

  for (const file of srcFiles) {
    const body = await fs.readFile(path.join(srcPath, file), 'utf-8');
    const change = { file: `${label}/${file}`, title: readTitle(body) };
    if (!destSet.has(file)) plan.added.push(change);
    else if (body !== (await fs.readFile(path.join(destPath, file), 'utf-8'))) plan.changed.push(change);
  }
  for (const file of destFiles) {
    if (srcSet.has(file)) continue;
    const body = await fs.readFile(path.join(destPath, file), 'utf-8');
    plan.removed.push({ file: `${label}/${file}`, title: readTitle(body) });
  }
  return plan;
}

async function applyDirPlan(plan: DirPlan): Promise<void> {
  await fs.ensureDir(plan.destPath);
  for (const { file } of [...plan.added, ...plan.changed]) {
    const name = path.basename(file);
    await fs.copy(path.join(plan.srcPath, name), path.join(plan.destPath, name), { overwrite: true });
  }
  for (const { file } of plan.removed) {
    await fs.remove(path.join(plan.destPath, path.basename(file)));
    console.log(`  removed: ${file}`);
  }
  console.log(
    `[${plan.label.padEnd(6)}] ${plan.added.length} added, ${plan.changed.length} changed, ${plan.removed.length} removed`,
  );
}

// ---------------------------------------------------------------------------
// Mass deletion guard
// ---------------------------------------------------------------------------

/** Most markdown files one sync may remove in total (one bilingual post is 2). */
export const MAX_DELETIONS = 3;
/** Largest share of one folder's files a single sync may remove. */
export const MAX_DELETION_RATIO = 0.25;
/** Removals per folder that are always fine, whatever the ratio: one post in both languages. */
export const ALWAYS_ALLOWED_DELETIONS = 2;

/**
 * Throws, before anything is written, when the planned deletions look like an
 * accident: more than MAX_DELETIONS files in total, or more than
 * MAX_DELETION_RATIO of any one folder (removing up to
 * ALWAYS_ALLOWED_DELETIONS files from a folder is always fine, so a small
 * folder can still lose its one post).  `allow` (SYNC_ALLOW_MASS_DELETE=true)
 * lets an intended mass deletion through.
 */
export function checkDeletionGuard(plans: DirPlan[], allow = false): void {
  const removed = plans.flatMap(p => p.removed);
  if (removed.length === 0) return;

  const reasons: string[] = [];
  if (removed.length > MAX_DELETIONS) {
    reasons.push(`${removed.length} files would be removed (limit ${MAX_DELETIONS})`);
  }
  for (const p of plans) {
    if (
      p.removed.length > ALWAYS_ALLOWED_DELETIONS &&
      p.removed.length / p.destCount > MAX_DELETION_RATIO
    ) {
      reasons.push(
        `${p.label}: ${p.removed.length} of ${p.destCount} files would be removed (limit ${MAX_DELETION_RATIO * 100}%)`,
      );
    }
  }
  if (reasons.length === 0) return;

  if (allow) {
    console.warn(`[guard] mass deletion allowed by SYNC_ALLOW_MASS_DELETE: ${reasons.join('; ')}`);
    return;
  }
  throw new Error(
    [
      'Mass deletion blocked, nothing was changed.',
      ...reasons.map(r => `  - ${r}`),
      'Files that would be removed:',
      ...removed.map(r => `  - ${r.file}${r.title ? ` (${r.title})` : ''}`),
      'If this is intended, run the Sync Content workflow by hand with "allow_mass_delete" checked',
      '(locally: SYNC_ALLOW_MASS_DELETE=true pnpm sync:content).',
    ].join('\n'),
  );
}

async function mirrorFile(
  srcPaths: string[],
  destPath: string,
  contentDest: string,
): Promise<{ status: 'added' | 'changed'; change: ContentChange } | null> {
  const srcPath = srcPaths.find(p => fs.existsSync(p));
  if (!srcPath) {
    console.log(`[skip] ${srcPaths.map(p => path.basename(p)).join(' | ')} (not found)`);
    return null;
  }
  const body = await fs.readFile(srcPath, 'utf-8');
  const existed = fs.existsSync(destPath);
  if (existed && body === (await fs.readFile(destPath, 'utf-8'))) return null;

  await fs.ensureDir(path.dirname(destPath));
  await fs.copy(srcPath, destPath, { overwrite: true });
  console.log(`[now   ] ${path.basename(srcPath)} → ${path.relative(REPO_ROOT, destPath)}`);
  const change = { file: path.relative(contentDest, destPath).split(path.sep).join('/'), title: readTitle(body) };
  return { status: existed ? 'changed' : 'added', change };
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
): Promise<{ copied: string[]; missing: string[]; added: string[]; updated: string[] }> {
  await fs.ensureDir(dest);
  const copied: string[] = [];
  const missing: string[] = [];
  const added: string[] = [];
  const updated: string[] = [];

  for (const filename of refs) {
    const src = path.join(attachmentsDir, filename);
    if (fs.existsSync(src)) {
      const target = path.join(dest, filename);
      const before = fs.existsSync(target) ? await fs.readFile(target) : null;
      await processImage(src, target);
      copied.push(filename);
      if (!before) added.push(filename);
      else if (!before.equals(await fs.readFile(target))) updated.push(filename);
    } else {
      missing.push(filename);
    }
  }

  console.log(`[images] ${copied.length}/${refs.size} referenced image(s) processed from ${ATTACHMENTS_DIR}`);

  if (missing.length > 0) {
    console.error(`\n  ✖ ${missing.length} image(s) referenced in content but not found in ${ATTACHMENTS_DIR}:`);
    for (const f of missing) console.error(`    - ${f}`);
  }

  return { copied, missing, added: added.sort(byName), updated: updated.sort(byName) };
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

/** Everything one sync changed, for the sync pull request. */
export interface SyncSummary {
  added: ContentChange[];
  changed: ContentChange[];
  removed: ContentChange[];
  images: { added: string[]; updated: string[]; removed: string[] };
}

export interface SyncOptions {
  /** Let a deletion past the guard limits through (SYNC_ALLOW_MASS_DELETE=true). */
  allowMassDelete?: boolean;
}

export async function syncContent(
  sourceDir: string,
  contentDest: string = CONTENT_DEST,
  uploadsDest: string = UPLOADS_DEST,
  options: SyncOptions = {},
): Promise<SyncSummary> {
  console.log(`\nSyncing from: ${sourceDir}\n`);

  if (!fs.existsSync(sourceDir)) {
    console.error(`Source not found: ${sourceDir}`);
    console.error('Set SYNC_SOURCE_DIR to your vault root, or create a sync-source/ symlink.');
    process.exit(1);
  }

  const summary: SyncSummary = {
    added: [], changed: [], removed: [], images: { added: [], updated: [], removed: [] },
  };

  // 1 — Plan the markdown mirror and check deletions before touching any file
  console.log('── Markdown ──────────────────────────────────');
  const plans: DirPlan[] = [];
  for (const { src, dest } of DIR_MAPPINGS) {
    const plan = await planDirMirror(path.join(sourceDir, src), path.join(contentDest, dest), dest);
    if (plan) plans.push(plan);
    else console.log(`[skip] ${dest}  (${src} not found in the vault, nothing removed)`);
  }
  checkDeletionGuard(plans, options.allowMassDelete ?? false);

  for (const plan of plans) {
    await applyDirPlan(plan);
    summary.added.push(...plan.added);
    summary.changed.push(...plan.changed);
    summary.removed.push(...plan.removed);
  }
  for (const { src, dest } of FILE_MAPPINGS) {
    const candidates = (Array.isArray(src) ? src : [src]).map(s => path.join(sourceDir, s));
    const result = await mirrorFile(candidates, path.join(contentDest, dest), contentDest);
    if (result) summary[result.status].push(result.change);
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
      const result = await copyReferencedImages(attachmentsDir, refs, uploadsDest);
      missing = result.missing;
      summary.images.added = result.added;
      summary.images.updated = result.updated;
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
    summary.images.removed = removed.sort(byName);
  }

  console.log('\n── Done ──────────────────────────────────────\n');
  return summary;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
//   SYNC_ALLOW_MASS_DELETE=true  let a deletion past the guard limits through
//   SYNC_SUMMARY_PATH=<file>     write the SyncSummary as JSON (read by sync-pr-message.ts)

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncContent(SOURCE_DIR, CONTENT_DEST, UPLOADS_DEST, {
    allowMassDelete: process.env.SYNC_ALLOW_MASS_DELETE === 'true',
  })
    .then(async summary => {
      if (process.env.SYNC_SUMMARY_PATH) {
        await fs.writeJson(process.env.SYNC_SUMMARY_PATH, summary, { spaces: 2 });
      }
    })
    .catch(async err => {
      console.error('Sync failed:', err instanceof Error ? err.message : err);
      // Show the reason on the workflow run page, not only in the log.
      if (process.env.GITHUB_STEP_SUMMARY) {
        const message = err instanceof Error ? err.message : String(err);
        await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, `## Sync failed\n\n\`\`\`\n${message}\n\`\`\`\n`);
      }
      process.exit(1);
    });
}
