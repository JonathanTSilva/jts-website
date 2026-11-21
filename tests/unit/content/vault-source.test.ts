import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { listRepoFiles, listVaultFiles, withExtraFiles } from '../../../src/lib/content/vaultSource';

let root: string;

function write(rel: string, body = '---\ntitle: x\n---\n\nbody\n'): string {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, body);
  return full;
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'vault-source-'));
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe('listVaultFiles', () => {
  it('maps 08-Publish/Blog files to the blog collection', () => {
    const p = write('08-Publish/Blog/a.en.md');
    expect(listVaultFiles(root)).toEqual([{ path: p, collection: 'blog', destName: 'a.en.md' }]);
  });

  it('maps 08-Publish/Notes files (md and mdx) to the notes collection', () => {
    write('08-Publish/Notes/n.en.md');
    write('08-Publish/Notes/m.en.mdx');
    const files = listVaultFiles(root);
    expect(files.map((f) => [f.collection, f.destName]).sort()).toEqual([
      ['notes', 'm.en.mdx'],
      ['notes', 'n.en.md'],
    ]);
  });

  it('maps Now.en.md to now/index.en.md', () => {
    const p = write('08-Publish/Now.en.md');
    expect(listVaultFiles(root)).toEqual([{ path: p, collection: 'now', destName: 'index.en.md' }]);
  });

  it('maps Now.pt-br.md to now/index.pt-br.md', () => {
    const p = write('08-Publish/Now.pt-br.md');
    expect(listVaultFiles(root)).toEqual([{ path: p, collection: 'now', destName: 'index.pt-br.md' }]);
  });

  it('falls back to legacy Now.md when Now.en.md is absent', () => {
    const p = write('08-Publish/Now.md');
    expect(listVaultFiles(root)).toEqual([{ path: p, collection: 'now', destName: 'index.en.md' }]);
  });

  it('prefers Now.en.md over legacy Now.md when both exist', () => {
    const p = write('08-Publish/Now.en.md');
    write('08-Publish/Now.md');
    expect(listVaultFiles(root)).toEqual([{ path: p, collection: 'now', destName: 'index.en.md' }]);
  });

  it('ignores folders outside 08-Publish and non-markdown files', () => {
    write('05-Fleeting/x.md');
    write('08-Publish/Blog/image.png', 'x');
    write('08-Publish/Blog/notes.txt', 'x');
    expect(listVaultFiles(root)).toEqual([]);
  });

  it('returns an empty list for a vault without 08-Publish', () => {
    expect(listVaultFiles(root)).toEqual([]);
  });
});

describe('withExtraFiles', () => {
  it('replaces a base file with the same collection and destName', () => {
    const basePath = write('vault/08-Publish/Blog/a.en.md');
    const extra = write('elsewhere/a.en.md');
    const base = [{ path: basePath, collection: 'blog' as const, destName: 'a.en.md' }];
    expect(withExtraFiles(base, [extra])).toEqual([
      { path: extra, collection: 'blog', destName: 'a.en.md' },
    ]);
  });

  it('puts a file with a noteType frontmatter key into notes', () => {
    const extra = write('n.en.md', '---\ntitle: x\nnoteType: book\n---\n\nbody\n');
    expect(withExtraFiles([], [extra])).toEqual([
      { path: extra, collection: 'notes', destName: 'n.en.md' },
    ]);
  });

  it('puts a file without noteType into blog and keeps unrelated base files', () => {
    const basePath = write('vault/08-Publish/Notes/other.en.md');
    const extra = write('b.en.md');
    const base = [{ path: basePath, collection: 'notes' as const, destName: 'other.en.md' }];
    const result = withExtraFiles(base, [extra]);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ path: extra, collection: 'blog', destName: 'b.en.md' });
    expect(result).toContainEqual(base[0]);
  });
});

describe('listRepoFiles', () => {
  it('lists blog and notes files under the content root', () => {
    const b = write('content/blog/a.en.md');
    const n = write('content/notes/n.en.mdx');
    write('content/blog/readme.txt', 'x');
    const files = listRepoFiles(path.join(root, 'content'));
    expect(files).toContainEqual({ path: b, collection: 'blog', destName: 'a.en.md' });
    expect(files).toContainEqual({ path: n, collection: 'notes', destName: 'n.en.mdx' });
    expect(files).toHaveLength(2);
  });

  it('returns an empty list when the content root is missing', () => {
    expect(listRepoFiles(path.join(root, 'nope'))).toEqual([]);
  });
});
