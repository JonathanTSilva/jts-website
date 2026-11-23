/**
 * sync-pr-message.ts
 *
 * Turns the SyncSummary written by sync-content.ts into the title and body of
 * the "sync content from vault" pull request, so every sync PR says what it
 * adds, changes and removes.
 *
 * Usage (CI, see .github/workflows/sync-content.yml)
 *   SYNC_SUMMARY_PATH=summary.json VAULT_SHA=<sha> VAULT_REPO=owner/repo \
 *   SYNC_TRIGGER=repository_dispatch pnpm exec tsx scripts/sync-pr-message.ts
 * Writes `title` and `body` to $GITHUB_OUTPUT, or prints them without it.
 */

import fs from 'fs-extra';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import type { ContentChange, SyncSummary } from './sync-content.ts';

export interface PrContext {
  /** Vault commit the sync read. */
  vaultSha?: string | undefined;
  /** `owner/repo` of the vault, for the commit link. */
  vaultRepo?: string | undefined;
  /** What started the run, for example `repository_dispatch`. */
  trigger?: string | undefined;
}

const BASE_TITLE = 'chore: sync content from vault';

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function formatSyncPrTitle(s: SyncSummary): string {
  const parts: string[] = [];
  if (s.added.length) parts.push(`${s.added.length} added`);
  if (s.changed.length) parts.push(`${s.changed.length} changed`);
  if (s.removed.length) parts.push(`${s.removed.length} removed`);
  if (parts.length === 0) {
    const images = s.images.added.length + s.images.updated.length + s.images.removed.length;
    if (images > 0) parts.push(`${plural(images, 'image')} only`);
  }
  return parts.length ? `${BASE_TITLE} (${parts.join(', ')})` : BASE_TITLE;
}

function contentLines(changes: ContentChange[]): string[] {
  return changes.map(c => `- \`${c.file}\`${c.title ? ` (${c.title})` : ''}`);
}

export function formatSyncPrBody(s: SyncSummary, ctx: PrContext = {}): string {
  const lines: string[] = [];

  const shortSha = ctx.vaultSha?.slice(0, 7);
  const source = shortSha
    ? ctx.vaultRepo
      ? `[\`${shortSha}\`](https://github.com/${ctx.vaultRepo}/commit/${ctx.vaultSha})`
      : `\`${shortSha}\``
    : undefined;
  lines.push(
    `Automatic sync of \`08-Publish/\` from the vault${source ? ` at ${source}` : ''}` +
      `${ctx.trigger ? `, started by \`${ctx.trigger}\`` : ''}.`,
    '',
  );

  if (s.removed.length > 0) {
    lines.push(
      '> [!WARNING]',
      `> This PR **removes ${plural(s.removed.length, 'file')}** from the site. Merge only if you deleted ${s.removed.length === 1 ? 'it' : 'them'} in the vault on purpose.`,
      '',
    );
  }

  const sections: [string, ContentChange[]][] = [
    ['Removed', s.removed],
    ['Added', s.added],
    ['Changed', s.changed],
  ];
  for (const [heading, changes] of sections) {
    if (changes.length === 0) continue;
    lines.push(`### ${heading} (${changes.length})`, '', ...contentLines(changes), '');
  }

  const img = s.images;
  const imageCount = img.added.length + img.updated.length + img.removed.length;
  if (s.added.length + s.changed.length + s.removed.length + imageCount === 0) {
    lines.push('No content file or image changed in this run.', '');
  }
  if (imageCount > 0) {
    lines.push('### Images', '');
    const groups: [string, string[]][] = [
      ['added', img.added],
      ['updated', img.updated],
      ['removed (no longer referenced)', img.removed],
    ];
    for (const [label, files] of groups) {
      if (files.length) lines.push(`- ${files.length} ${label}: ${files.map(f => `\`${f}\``).join(', ')}`);
    }
    lines.push('');
  }

  lines.push(
    '---',
    '',
    'Content validation (`pnpm lint:content`) already passed in the sync run. ' +
      'Merging deploys to <https://www.jontobias.com> through `pipeline.yml`. ' +
      'Later syncs update this PR; the lists above describe the whole PR against `main`.',
  );
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const summaryPath = process.env.SYNC_SUMMARY_PATH;
  if (!summaryPath) {
    console.error('Set SYNC_SUMMARY_PATH to the summary written by sync-content.ts.');
    process.exit(1);
  }
  const summary = (await fs.readJson(summaryPath)) as SyncSummary;
  const ctx: PrContext = {
    vaultSha: process.env.VAULT_SHA || undefined,
    vaultRepo: process.env.VAULT_REPO || undefined,
    trigger: process.env.SYNC_TRIGGER || undefined,
  };
  const title = formatSyncPrTitle(summary);
  const body = formatSyncPrBody(summary, ctx);

  if (process.env.GITHUB_OUTPUT) {
    const delimiter = `EOF_${randomBytes(8).toString('hex')}`;
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      `title=${title}\nbody<<${delimiter}\n${body}\n${delimiter}\n`,
    );
  } else {
    console.log(`${title}\n\n${body}`);
  }
}
