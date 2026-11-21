/**
 * File discovery for content validation.
 *
 * Plain Node only (no astro:* imports): this runs under tsx from
 * scripts/validate-content.ts, from the sync job and from the jts-skills
 * blog-publish skill. It mirrors the mapping in scripts/sync-content.ts.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { COLLECTIONS, type CollectionType } from './validation';

export interface SourceFile {
  path: string;
  collection: CollectionType;
  /** Filename the sync would write into src/content/<collection>/. */
  destName: string;
}

const isMarkdown = (name: string): boolean => name.endsWith('.md') || name.endsWith('.mdx');

function listMarkdownIn(dir: string, collection: CollectionType): SourceFile[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(isMarkdown)
    .sort()
    .map((name) => ({ path: path.join(dir, name), collection, destName: name }));
}

export function listVaultFiles(vaultRoot: string): SourceFile[] {
  const publish = path.join(vaultRoot, '08-Publish');
  const files: SourceFile[] = [
    ...listMarkdownIn(path.join(publish, 'Blog'), 'blog'),
    ...listMarkdownIn(path.join(publish, 'Notes'), 'notes'),
  ];

  const nowEn = path.join(publish, 'Now.en.md');
  const nowLegacy = path.join(publish, 'Now.md');
  const nowPt = path.join(publish, 'Now.pt-br.md');
  const nowEnSource = fs.existsSync(nowEn) ? nowEn : fs.existsSync(nowLegacy) ? nowLegacy : null;
  if (nowEnSource) files.push({ path: nowEnSource, collection: 'now', destName: 'index.en.md' });
  if (fs.existsSync(nowPt)) files.push({ path: nowPt, collection: 'now', destName: 'index.pt-br.md' });

  return files;
}

export function listRepoFiles(contentRoot: string): SourceFile[] {
  return COLLECTIONS.flatMap((collection) =>
    listMarkdownIn(path.join(contentRoot, collection), collection),
  );
}

function collectionFor(filePath: string): CollectionType {
  const { data } = matter(fs.readFileSync(filePath, 'utf8'));
  return Object.prototype.hasOwnProperty.call(data, 'noteType') ? 'notes' : 'blog';
}

export function withExtraFiles(base: SourceFile[], extra: string[]): SourceFile[] {
  const extras: SourceFile[] = extra.map((p) => ({
    path: p,
    collection: collectionFor(p),
    destName: path.basename(p),
  }));
  const replaced = new Set(extras.map((e) => `${e.collection}/${e.destName}`));
  return [...base.filter((b) => !replaced.has(`${b.collection}/${b.destName}`)), ...extras];
}
