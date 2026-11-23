import { describe, it, expect } from 'vitest';
import { formatSyncPrTitle, formatSyncPrBody } from '../../scripts/sync-pr-message.ts';
import type { SyncSummary } from '../../scripts/sync-content.ts';

const empty = (): SyncSummary => ({
  added: [], changed: [], removed: [], images: { added: [], updated: [], removed: [] },
});

describe('sync PR title', () => {
  it('states the counts and stays a Conventional Commit', () => {
    const s = empty();
    s.added.push({ file: 'blog/a.en.md' });
    s.changed.push({ file: 'blog/b.en.md' }, { file: 'blog/b.pt-br.md' });
    s.removed.push({ file: 'notes/c.en.md' });
    expect(formatSyncPrTitle(s)).toBe('chore: sync content from vault (1 added, 2 changed, 1 removed)');
  });

  it('says when only images changed', () => {
    const s = empty();
    s.images.updated.push('x.png');
    expect(formatSyncPrTitle(s)).toBe('chore: sync content from vault (1 image only)');
  });

  it('falls back to the plain title', () => {
    expect(formatSyncPrTitle(empty())).toBe('chore: sync content from vault');
  });
});

describe('sync PR body', () => {
  it('lists files with titles, links the vault commit and warns about removals first', () => {
    const s = empty();
    s.removed.push({ file: 'blog/old.en.md', title: 'Old post' });
    s.changed.push({ file: 'blog/new.pt-br.md', title: 'Post novo' });
    s.images.removed.push('old.png');
    const body = formatSyncPrBody(s, {
      vaultSha: '07080ef97527c1c920636a6ef2b7cd6fccd6e425',
      vaultRepo: 'owner/vault',
      trigger: 'repository_dispatch',
    });

    expect(body).toContain('[`07080ef`](https://github.com/owner/vault/commit/07080ef97527c1c920636a6ef2b7cd6fccd6e425)');
    expect(body).toContain('started by `repository_dispatch`');
    expect(body).toContain('> [!WARNING]');
    expect(body).toContain('**removes 1 file**');
    expect(body).toContain('- `blog/old.en.md` (Old post)');
    expect(body).toContain('### Changed (1)\n\n- `blog/new.pt-br.md` (Post novo)');
    expect(body).toContain('- 1 removed (no longer referenced): `old.png`');
    expect(body.indexOf('### Removed')).toBeLessThan(body.indexOf('### Changed'));
    expect(body).not.toContain('### Added');
  });

  it('has no warning without removals', () => {
    const s = empty();
    s.added.push({ file: 'blog/a.en.md' });
    expect(formatSyncPrBody(s)).not.toContain('WARNING');
  });
});
