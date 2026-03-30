import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { syncContent } from '../../scripts/sync-content.ts';

const TEST_ROOT = path.join(__dirname, 'sync-test-tmp');
const SOURCE_DIR = path.join(TEST_ROOT, 'source');
const DEST_DIR = path.join(TEST_ROOT, 'dest');

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
    await syncContent(SOURCE_DIR, DEST_DIR);

    // Verify
    expect(fs.existsSync(path.join(DEST_DIR, 'blog/post1.md'))).toBe(true);
    expect(fs.readFileSync(path.join(DEST_DIR, 'blog/post1.md'), 'utf8')).toBe('Content of post 1');
    expect(fs.existsSync(path.join(DEST_DIR, 'notes/note1.md'))).toBe(true);
    expect(fs.existsSync(path.join(DEST_DIR, 'now/index.en.md'))).toBe(true);
    expect(fs.existsSync(path.join(DEST_DIR, 'now/index.pt-br.md'))).toBe(true);
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
    await syncContent(SOURCE_DIR, DEST_DIR);

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
    await syncContent(SOURCE_DIR, DEST_DIR);
    
    // We wait a bit to ensure mtime would change if copied again (though copySync overwrites)
    // Actually, fs.copySync overwrites by default.
    
    await syncContent(SOURCE_DIR, DEST_DIR);
    
    expect(fs.existsSync(path.join(DEST_DIR, 'blog/stable.md'))).toBe(true);
    expect(fs.readFileSync(path.join(DEST_DIR, 'blog/stable.md'), 'utf8')).toBe('Stable content');
  });

  it('should handle missing source directories gracefully', async () => {
    // Run sync with empty source
    await syncContent(SOURCE_DIR, DEST_DIR);
    
    // Should not crash and should not create empty destination directories if they don't exist in source
    // Actually our script does skip mappings if srcPath doesn't exist.
    expect(fs.readdirSync(DEST_DIR).length).toBe(0);
  });
});
