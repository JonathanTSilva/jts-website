import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import {
  syncContent,
  copyReferencedImages,
  pruneOrphanUploads,
  processImage,
} from '../../scripts/sync-content.ts';

const TEST_ROOT = path.join(__dirname, 'sync-test-tmp');
const SOURCE_DIR = path.join(TEST_ROOT, 'source');
const DEST_DIR = path.join(TEST_ROOT, 'dest');
const UPLOADS_DIR = path.join(TEST_ROOT, 'uploads');

describe('syncContent script', () => {
  beforeEach(() => {
    fs.ensureDirSync(SOURCE_DIR);
    fs.ensureDirSync(DEST_DIR);
  });

  afterEach(() => {
    fs.removeSync(TEST_ROOT);
  });

  it('should sync files from source to destination based on mappings', async () => {
    // Setup source structure
    const blogSrc = path.join(SOURCE_DIR, '08-Publish/Blog');
    fs.ensureDirSync(blogSrc);
    fs.writeFileSync(path.join(blogSrc, 'post1.md'), 'Content of post 1');

    const notesSrc = path.join(SOURCE_DIR, '08-Publish/Notes');
    fs.ensureDirSync(notesSrc);
    fs.writeFileSync(path.join(notesSrc, 'note1.md'), 'Content of note 1');

    fs.writeFileSync(path.join(SOURCE_DIR, '08-Publish/Now.md'), 'Now index EN');
    fs.writeFileSync(path.join(SOURCE_DIR, '08-Publish/Now.pt-br.md'), 'Now index PT-BR');

    // Run sync
    await syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR);

    // Verify
    expect(fs.existsSync(path.join(DEST_DIR, 'blog/post1.md'))).toBe(true);
    expect(fs.readFileSync(path.join(DEST_DIR, 'blog/post1.md'), 'utf8')).toBe('Content of post 1');
    expect(fs.existsSync(path.join(DEST_DIR, 'notes/note1.md'))).toBe(true);
    expect(fs.existsSync(path.join(DEST_DIR, 'now/index.en.md'))).toBe(true);
    expect(fs.existsSync(path.join(DEST_DIR, 'now/index.pt-br.md'))).toBe(true);
  });

  // The English Now page comes from Now.en.md; the legacy Now.md is used only without it.
  it.each([
    ['only Now.en.md', { 'Now.en.md': 'current' }, 'current'],
    ['only the legacy Now.md', { 'Now.md': 'legacy' }, 'legacy'],
    ['both, Now.en.md wins', { 'Now.md': 'legacy', 'Now.en.md': 'current' }, 'current'],
  ])('syncs the English Now page from %s', async (_case, files, expected) => {
    fs.ensureDirSync(path.join(SOURCE_DIR, '08-Publish'));
    for (const [name, body] of Object.entries(files)) {
      fs.writeFileSync(path.join(SOURCE_DIR, '08-Publish', name), body);
    }

    await syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR);

    expect(fs.readFileSync(path.join(DEST_DIR, 'now/index.en.md'), 'utf8')).toBe(expected);
  });

  it('should remove files in destination that are not in source', async () => {
    // Setup destination with an obsolete file
    const blogDest = path.join(DEST_DIR, 'blog');
    fs.ensureDirSync(blogDest);
    fs.writeFileSync(path.join(blogDest, 'obsolete.md'), 'Obsolete content');

    // Setup source with a new file
    const blogSrc = path.join(SOURCE_DIR, '08-Publish/Blog');
    fs.ensureDirSync(blogSrc);
    fs.writeFileSync(path.join(blogSrc, 'new.md'), 'New content');

    // Run sync
    await syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR);

    // Verify
    expect(fs.existsSync(path.join(blogDest, 'new.md'))).toBe(true);
    expect(fs.existsSync(path.join(blogDest, 'obsolete.md'))).toBe(false);
  });

  it('should be idempotent (multiple runs dont change state)', async () => {
    // Setup source
    const blogSrc = path.join(SOURCE_DIR, '08-Publish/Blog');
    fs.ensureDirSync(blogSrc);
    fs.writeFileSync(path.join(blogSrc, 'stable.md'), 'Stable content');

    // Run sync twice
    await syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR);
    
    // We wait a bit to ensure mtime would change if copied again (though copySync overwrites)
    // Actually, fs.copySync overwrites by default.
    
    await syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR);
    
    expect(fs.existsSync(path.join(DEST_DIR, 'blog/stable.md'))).toBe(true);
    expect(fs.readFileSync(path.join(DEST_DIR, 'blog/stable.md'), 'utf8')).toBe('Stable content');
  });

  it('should handle missing source directories gracefully', async () => {
    // Run sync with empty source
    await syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR);
    
    // Should not crash and should not create empty destination directories if they don't exist in source
    // Actually our script does skip mappings if srcPath doesn't exist.
    expect(fs.readdirSync(DEST_DIR).length).toBe(0);
  });
});

describe('mass deletion guard', () => {
  const blogSrc = path.join(SOURCE_DIR, '08-Publish/Blog');
  const blogDest = path.join(DEST_DIR, 'blog');
  const post = (title: string) => `---\ntitle: "${title}"\n---\n\nBody of ${title}\n`;

  /** Puts `count` posts in both the vault and the site, so the run starts in sync. */
  function seed(count: number) {
    fs.ensureDirSync(blogSrc);
    fs.ensureDirSync(blogDest);
    for (let i = 1; i <= count; i++) {
      fs.writeFileSync(path.join(blogSrc, `p${i}.md`), post(`Post ${i}`));
      fs.writeFileSync(path.join(blogDest, `p${i}.md`), post(`Post ${i}`));
    }
  }
  const removeFromVault = (...names: string[]) =>
    names.forEach(n => fs.removeSync(path.join(blogSrc, n)));

  beforeEach(() => fs.ensureDirSync(SOURCE_DIR));
  afterEach(() => fs.removeSync(TEST_ROOT));

  it('applies a small deletion (one post in both languages)', async () => {
    seed(8);
    removeFromVault('p1.md', 'p2.md');
    const summary = await syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR);
    expect(fs.existsSync(path.join(blogDest, 'p1.md'))).toBe(false);
    expect(summary.removed.map(r => r.file)).toEqual(['blog/p1.md', 'blog/p2.md']);
    expect(summary.removed[0]?.title).toBe('Post 1');
  });

  it('blocks more than MAX_DELETIONS files and changes nothing', async () => {
    seed(20);
    removeFromVault('p1.md', 'p2.md', 'p3.md', 'p4.md');
    fs.writeFileSync(path.join(blogSrc, 'p5.md'), post('Edited')); // must not be applied either
    await expect(syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR)).rejects.toThrow(/Mass deletion blocked/);
    expect(fs.readdirSync(blogDest)).toHaveLength(20);
    expect(fs.readFileSync(path.join(blogDest, 'p5.md'), 'utf8')).toBe(post('Post 5'));
  });

  it('blocks an emptied folder', async () => {
    seed(8);
    removeFromVault(...fs.readdirSync(blogSrc));
    await expect(syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR)).rejects.toThrow(/8 files would be removed/);
    expect(fs.readdirSync(blogDest)).toHaveLength(8);
  });

  it('blocks more than MAX_DELETION_RATIO of a folder', async () => {
    seed(8);
    removeFromVault('p1.md', 'p2.md', 'p3.md'); // 3 of 8 = 37.5%, under the count limit
    await expect(syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR)).rejects.toThrow(/blog: 3 of 8 files/);
  });

  it('lets a small folder lose its only post', async () => {
    seed(2);
    removeFromVault('p1.md', 'p2.md');
    await syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR);
    expect(fs.readdirSync(blogDest)).toHaveLength(0);
  });

  it('applies a mass deletion when allowMassDelete is set', async () => {
    seed(8);
    removeFromVault(...fs.readdirSync(blogSrc));
    await syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR, { allowMassDelete: true });
    expect(fs.readdirSync(blogDest)).toHaveLength(0);
  });

  it('never deletes anything when the vault folder is missing', async () => {
    seed(8);
    fs.removeSync(blogSrc);
    const summary = await syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR);
    expect(fs.readdirSync(blogDest)).toHaveLength(8);
    expect(summary.removed).toEqual([]);
  });
});

describe('sync summary', () => {
  afterEach(() => fs.removeSync(TEST_ROOT));

  it('classifies added, changed and unchanged files and reads titles', async () => {
    const blogSrc = path.join(SOURCE_DIR, '08-Publish/Blog');
    const blogDest = path.join(DEST_DIR, 'blog');
    fs.ensureDirSync(blogSrc);
    fs.ensureDirSync(blogDest);
    fs.writeFileSync(path.join(blogSrc, 'same.md'), 'same');
    fs.writeFileSync(path.join(blogDest, 'same.md'), 'same');
    fs.writeFileSync(path.join(blogSrc, 'edit.md'), '---\ntitle: Edited one\n---\nnew');
    fs.writeFileSync(path.join(blogDest, 'edit.md'), '---\ntitle: Edited one\n---\nold');
    fs.writeFileSync(path.join(blogSrc, 'new.md'), "---\ntitle: 'Brand new'\n---\n");
    fs.writeFileSync(path.join(SOURCE_DIR, '08-Publish/Now.pt-br.md'), 'agora');

    const summary = await syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR);
    expect(summary.added).toEqual([
      { file: 'blog/new.md', title: 'Brand new' },
      { file: 'now/index.pt-br.md', title: undefined },
    ]);
    expect(summary.changed).toEqual([{ file: 'blog/edit.md', title: 'Edited one' }]);
    expect(summary.removed).toEqual([]);

    const again = await syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR);
    expect([...again.added, ...again.changed, ...again.removed]).toEqual([]);
  });

  it('reports images added, updated and pruned', async () => {
    const att = path.join(SOURCE_DIR, '99-Meta/Attachments');
    const blogSrc = path.join(SOURCE_DIR, '08-Publish/Blog');
    fs.ensureDirSync(att);
    fs.ensureDirSync(blogSrc);
    fs.ensureDirSync(UPLOADS_DIR);
    fs.writeFileSync(path.join(att, 'new.svg'), '<svg/>');
    fs.writeFileSync(path.join(att, 'old.svg'), '<svg id="v2"/>');
    fs.writeFileSync(path.join(UPLOADS_DIR, 'old.svg'), '<svg id="v1"/>');
    fs.writeFileSync(path.join(UPLOADS_DIR, 'gone.svg'), '<svg/>');
    fs.writeFileSync(path.join(blogSrc, 'p.md'), '![[new.svg]] ![[old.svg]]');

    const summary = await syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR);
    expect(summary.images).toEqual({ added: ['new.svg'], updated: ['old.svg'], removed: ['gone.svg'] });
  });
});

const sha = (file: string) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function makeJpeg(file: string, width: number, height: number, withExif = true) {
  let img = sharp({
    create: { width, height, channels: 3, background: { r: 200, g: 40, b: 40 } },
  }).jpeg();
  if (withExif) img = img.withMetadata({ exif: { IFD0: { Copyright: 'x' } } });
  await img.toFile(file);
}

describe('image sync', () => {
  const ATTACH = path.join(SOURCE_DIR, '99-Meta/Attachments');

  beforeEach(() => {
    fs.ensureDirSync(ATTACH);
    fs.ensureDirSync(UPLOADS_DIR);
  });

  afterEach(() => {
    fs.removeSync(TEST_ROOT);
  });

  it('fails the sync when a referenced image is missing', async () => {
    const blog = path.join(SOURCE_DIR, '08-Publish/Blog');
    fs.ensureDirSync(blog);
    fs.writeFileSync(path.join(blog, 'p.en.md'), '![[gone.png]] ![[also-gone.jpg|300]]');

    await expect(syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR)).rejects.toThrow(
      /Missing images referenced in content: .*gone\.png/,
    );
  });

  it('never prunes uploads when the sync fails on a missing image', async () => {
    const blog = path.join(SOURCE_DIR, '08-Publish/Blog');
    fs.ensureDirSync(blog);
    fs.writeFileSync(path.join(blog, 'p.en.md'), '![[gone.png]]');
    fs.writeFileSync(path.join(UPLOADS_DIR, 'old.png'), 'x');

    await expect(syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR)).rejects.toThrow();
    expect(fs.existsSync(path.join(UPLOADS_DIR, 'old.png'))).toBe(true);
  });

  it('copyReferencedImages reports copied and missing files', async () => {
    await makeJpeg(path.join(ATTACH, 'a.jpg'), 100, 50);
    const result = await copyReferencedImages(ATTACH, new Set(['a.jpg', 'b.png']), UPLOADS_DIR);
    expect(result).toEqual({ copied: ['a.jpg'], missing: ['b.png'], added: ['a.jpg'], updated: [] });
    expect(fs.existsSync(path.join(UPLOADS_DIR, 'a.jpg'))).toBe(true);
  });

  it('prunes uploads that are not referenced and keeps referenced ones', async () => {
    fs.writeFileSync(path.join(UPLOADS_DIR, 'keep.png'), 'x');
    fs.writeFileSync(path.join(UPLOADS_DIR, 'drop.png'), 'x');
    fs.ensureDirSync(path.join(UPLOADS_DIR, 'sub'));
    fs.writeFileSync(path.join(UPLOADS_DIR, 'sub', 'nested.png'), 'x');

    const removed = await pruneOrphanUploads(UPLOADS_DIR, new Set(['keep.png']));

    expect(removed).toEqual(['drop.png']);
    expect(fs.existsSync(path.join(UPLOADS_DIR, 'keep.png'))).toBe(true);
    expect(fs.existsSync(path.join(UPLOADS_DIR, 'drop.png'))).toBe(false);
    expect(fs.existsSync(path.join(UPLOADS_DIR, 'sub', 'nested.png'))).toBe(true);
  });

  it('keeps an image referenced only from the Now page and removes true orphans', async () => {
    fs.ensureDirSync(path.join(SOURCE_DIR, '08-Publish'));
    fs.writeFileSync(path.join(SOURCE_DIR, '08-Publish/Now.en.md'), '![[now.png]]');
    await sharp({ create: { width: 10, height: 10, channels: 3, background: '#fff' } })
      .png()
      .toFile(path.join(ATTACH, 'now.png'));
    fs.writeFileSync(path.join(UPLOADS_DIR, 'orphan.png'), 'x');

    await syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR);

    expect(fs.existsSync(path.join(UPLOADS_DIR, 'now.png'))).toBe(true);
    expect(fs.existsSync(path.join(UPLOADS_DIR, 'orphan.png'))).toBe(false);
  });

  it('downsizes large JPEGs, strips EXIF and leaves the vault file untouched', async () => {
    const src = path.join(ATTACH, 'big.jpg');
    await makeJpeg(src, 3000, 1000);
    expect((await sharp(src).metadata()).exif).toBeDefined();
    const before = sha(src);

    const blog = path.join(SOURCE_DIR, '08-Publish/Blog');
    fs.ensureDirSync(blog);
    fs.writeFileSync(path.join(blog, 'p.en.md'), '![[big.jpg]]');

    await syncContent(SOURCE_DIR, DEST_DIR, UPLOADS_DIR);

    const meta = await sharp(path.join(UPLOADS_DIR, 'big.jpg')).metadata();
    expect(meta.format).toBe('jpeg');
    expect(meta.width).toBeLessThanOrEqual(2000);
    expect(meta.exif).toBeUndefined();
    expect(sha(src)).toBe(before);
  });

  it('processImage does not enlarge small images and keeps the format', async () => {
    const src = path.join(ATTACH, 'small.png');
    await sharp({ create: { width: 300, height: 200, channels: 3, background: '#0a0' } })
      .png()
      .toFile(src);
    const out = path.join(UPLOADS_DIR, 'small.png');
    await processImage(src, out);
    const meta = await sharp(out).metadata();
    expect(meta.format).toBe('png');
    expect(meta.width).toBe(300);
  });

  it('processImage applies the EXIF orientation to the pixels', async () => {
    const src = path.join(ATTACH, 'rot.jpg');
    await sharp({ create: { width: 400, height: 100, channels: 3, background: '#00f' } })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toFile(src);
    const out = path.join(UPLOADS_DIR, 'rot.jpg');
    await processImage(src, out);
    const meta = await sharp(out).metadata();
    expect(meta.width).toBe(100);
    expect(meta.height).toBe(400);
    expect(meta.orientation).toBeUndefined();
  });

  it('processImage copies other types as-is', async () => {
    const src = path.join(ATTACH, 'a.svg');
    fs.writeFileSync(src, '<svg xmlns="http://www.w3.org/2000/svg"/>');
    const out = path.join(UPLOADS_DIR, 'a.svg');
    await processImage(src, out);
    expect(sha(out)).toBe(sha(src));
  });
});
