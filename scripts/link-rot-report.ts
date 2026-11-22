/**
 * link-rot-report.ts
 *
 * Turns the JSON report of `lychee` (run on the built site, external links
 * included) into a Markdown list for the "Site health: broken external links"
 * issue: each URL, its status, every built page it is found on and, for blog
 * posts, notes and the Now page, the file in the jts-brain vault to fix it in.
 *
 * Only http(s) links count. A link is "broken" when the failure is certain
 * (404, 410, DNS failure, connection refused, TLS or certificate error). Bot
 * blocks (403, 429, 999), timeouts, 5xx and every other failure are listed as
 * "unverifiable" and never fail the check, because they say nothing about the
 * link itself.
 *
 * Usage
 * ─────
 *   tsx scripts/link-rot-report.ts <lychee-report.json> [content-root] > report.md
 *
 * Prints the Markdown to stdout. When GITHUB_OUTPUT is set it also appends
 * `broken=<n>` and `unverifiable=<n>`. Exits 1 only when the report is missing
 * or unreadable, so a lychee crash is not mistaken for "no broken links".
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import matter from 'gray-matter';

export type Verdict = 'broken' | 'unverifiable';

export interface LycheeStatus {
  text?: string;
  code?: number;
  details?: string;
}

export interface LycheeEntry {
  url: string;
  status?: LycheeStatus;
}

export type LycheeMap = Record<string, LycheeEntry[]>;

export interface LycheeReport {
  error_map?: LycheeMap;
  timeout_map?: LycheeMap;
}

export interface Finding {
  url: string;
  status: string;
  verdict: Verdict;
  /** Built pages the link is found on, as lychee reports them (for example `dist/blog/welcome/index.html`). */
  pages: string[];
}

export interface PageSource {
  /** Public path of the page, for example `/pt-br/blog/welcome/`. */
  route: string;
  /** Vault file to edit, or null when the page is not generated from vault content. */
  vaultFile: string | null;
}

export type SourceIndex = Map<string, string>;

const BROKEN_CODES = new Set([404, 410]);
// Network failures that say the target is gone, not that a bot was turned away.
const BROKEN_NETWORK = /dns|resolv|lookup address|name or service not known|no such host|connection refused|certificate|\btls\b|\bssl\b/i;

const VAULT_ROOT = 'jts-brain/08-Publish';
const COLLECTION_DIRS: Record<string, string> = { blog: 'Blog', notes: 'Notes' };

export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/** Decides whether one lychee result is a certain failure or just unverifiable. */
export function classifyStatus(status: LycheeStatus | undefined, timedOut = false): Verdict {
  if (timedOut) return 'unverifiable';
  if (!status) return 'unverifiable';
  if (status.code !== undefined) return BROKEN_CODES.has(status.code) ? 'broken' : 'unverifiable';
  if (/timeout|timed out/i.test(`${status.text ?? ''} ${status.details ?? ''}`)) return 'unverifiable';
  return BROKEN_NETWORK.test(`${status.text ?? ''} ${status.details ?? ''}`) ? 'broken' : 'unverifiable';
}

function describeStatus(status: LycheeStatus | undefined, timedOut: boolean): string {
  if (timedOut) return 'timeout';
  if (!status) return 'unknown error';
  if (status.code !== undefined) {
    // Results served from lychee's cache lose the reason phrase: "Error (cached)".
    const prefix = 'rejected status code:';
    const text = status.text?.toLowerCase().startsWith(prefix) ? status.text.slice(prefix.length).trim() : '';
    return text || `HTTP ${status.code}`;
  }
  // Drop the "(error sending request for url (...))" tail, the URL is shown anyway.
  const detail = (status.details ?? status.text ?? 'unknown error').trim();
  const tail = detail.toLowerCase().lastIndexOf('(error sending request');
  return tail >= 0 && detail.endsWith(')') ? detail.slice(0, tail).trim() : detail;
}

/** Collects the external failures of a lychee JSON report, merged per URL. */
export function collectFindings(report: LycheeReport): Finding[] {
  const byUrl = new Map<string, Finding>();

  const add = (map: LycheeMap | undefined, timedOut: boolean) => {
    for (const [page, entries] of Object.entries(map ?? {})) {
      for (const entry of entries) {
        if (!isExternalUrl(entry.url)) continue;
        const verdict = classifyStatus(entry.status, timedOut);
        const existing = byUrl.get(entry.url);
        if (existing) {
          if (!existing.pages.includes(page)) existing.pages.push(page);
          // One certain failure is enough to call the URL broken.
          if (verdict === 'broken') existing.verdict = 'broken';
        } else {
          byUrl.set(entry.url, {
            url: entry.url,
            status: describeStatus(entry.status, timedOut),
            verdict,
            pages: [page],
          });
        }
      }
    }
  };

  add(report.error_map, false);
  add(report.timeout_map, true);

  return [...byUrl.values()]
    .map(f => ({ ...f, pages: [...f.pages].sort((a, b) => a.localeCompare(b)) }))
    .sort((a, b) => a.url.localeCompare(b.url));
}

const indexKey = (collection: string, language: string, slug: string) => `${collection}/${language}/${slug}`;

/** Maps `collection/language/slug` to the file name in `src/content/<collection>`, read from the frontmatter. */
export function buildSourceIndex(contentRoot: string): SourceIndex {
  const index: SourceIndex = new Map();
  for (const collection of Object.keys(COLLECTION_DIRS)) {
    const dir = path.join(contentRoot, collection);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
      const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
      const slug = typeof data['slug'] === 'string' ? data['slug'] : null;
      const language = typeof data['language'] === 'string' ? data['language'] : null;
      if (slug && language) index.set(indexKey(collection, language, slug), file);
    }
  }
  return index;
}

/** Resolves a built page (`dist/pt-br/blog/welcome/index.html`) to its route and vault file. */
export function pageToSource(page: string, index: SourceIndex): PageSource {
  const normalized = page.replace(/\\/g, '/');
  const rel = /(?:^|\/)dist\/(.+)$/.exec(normalized)?.[1] ?? normalized.replace(/^\.\//, '');

  const dirRoute = rel.replace(/(^|\/)index\.html$/, '$1');
  const route = `/${dirRoute.replace(/\.html$/, '')}`;

  const post = /^(pt-br\/)?(blog|notes)\/([^/]+)\/index\.html$/.exec(rel);
  if (post) {
    const language = post[1] ? 'pt-br' : 'en';
    const collection = post[2]!;
    const file = index.get(indexKey(collection, language, post[3]!));
    return {
      route,
      vaultFile: file ? `${VAULT_ROOT}/${COLLECTION_DIRS[collection]}/${file}` : null,
    };
  }

  const now = /^(pt-br\/)?now\/index\.html$/.exec(rel);
  if (now) {
    return { route, vaultFile: `${VAULT_ROOT}/Now.${now[1] ? 'pt-br' : 'en'}.md` };
  }

  return { route, vaultFile: null };
}

function renderFinding(finding: Finding, index: SourceIndex): string {
  const lines = [`- <${finding.url}>: ${finding.status}`];
  for (const page of finding.pages) {
    const { route, vaultFile } = pageToSource(page, index);
    lines.push(
      vaultFile
        ? `  - \`${route}\`, vault file: \`${vaultFile}\``
        : `  - \`${route}\` (page generated from this repo, not a vault file)`,
    );
  }
  return lines.join('\n');
}

export interface Report {
  markdown: string;
  broken: number;
  unverifiable: number;
}

export function renderReport(findings: Finding[], index: SourceIndex): Report {
  const broken = findings.filter(f => f.verdict === 'broken');
  const unverifiable = findings.filter(f => f.verdict === 'unverifiable');

  const out: string[] = [];
  if (broken.length === 0) {
    out.push('No broken external links found.');
  } else {
    out.push(`## Broken external links (${broken.length})`, '');
    out.push('Certain failures: the page does not exist, the host is gone or the certificate is invalid.', '');
    out.push(broken.map(f => renderFinding(f, index)).join('\n'));
  }

  if (unverifiable.length > 0) {
    out.push(
      '',
      `## Unverifiable external links (${unverifiable.length})`,
      '',
      'Bot blocks, timeouts and server errors. They do not fail the check, but a link that stays here for weeks is worth a manual look.',
      '',
      unverifiable.map(f => renderFinding(f, index)).join('\n'),
    );
  }

  return { markdown: `${out.join('\n')}\n`, broken: broken.length, unverifiable: unverifiable.length };
}

function main(argv: string[]): void {
  const [reportPath, contentRoot = 'src/content'] = argv;
  if (!reportPath) {
    console.error('usage: link-rot-report.ts <lychee-report.json> [content-root]');
    process.exit(1);
  }

  let report: LycheeReport;
  try {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as LycheeReport;
  } catch (error) {
    console.error(`Cannot read the lychee report ${reportPath}: ${(error as Error).message}`);
    process.exit(1);
  }

  const { markdown, broken, unverifiable } = renderReport(
    collectFindings(report),
    buildSourceIndex(contentRoot),
  );
  process.stdout.write(markdown);

  const output = process.env['GITHUB_OUTPUT'];
  if (output) fs.appendFileSync(output, `broken=${broken}\nunverifiable=${unverifiable}\n`);
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) main(process.argv.slice(2));
