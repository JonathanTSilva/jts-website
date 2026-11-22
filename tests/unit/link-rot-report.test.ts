import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildSourceIndex,
  classifyStatus,
  collectFindings,
  pageToSource,
  renderReport,
  type LycheeReport,
} from '../../scripts/link-rot-report.ts';

describe('classifyStatus', () => {
  it('treats 404 and 410 as broken', () => {
    expect(classifyStatus({ text: 'Rejected status code: 404 Not Found', code: 404 })).toBe('broken');
    expect(classifyStatus({ text: 'Rejected status code: 410 Gone', code: 410 })).toBe('broken');
  });

  it('treats bot blocks, rate limits and server errors as unverifiable', () => {
    for (const code of [401, 403, 405, 429, 500, 502, 503, 999]) {
      expect(classifyStatus({ text: `Rejected status code: ${code}`, code })).toBe('unverifiable');
    }
  });

  it('treats timeouts as unverifiable', () => {
    expect(classifyStatus({ text: 'Timeout', details: 'Request timed out' }, true)).toBe('unverifiable');
    expect(classifyStatus({ text: 'Network error: request timed out' })).toBe('unverifiable');
  });

  it('treats DNS, refused connection and TLS failures as broken', () => {
    expect(classifyStatus({ text: 'Network error: Connection refused - server may be down' })).toBe('broken');
    expect(classifyStatus({ text: 'Network error: failed to lookup address information' })).toBe('broken');
    expect(classifyStatus({ text: 'Network error: DNS resolution failed' })).toBe('broken');
    expect(classifyStatus({ text: 'Network error: SSL certificate expired.' })).toBe('broken');
    expect(classifyStatus({ text: 'Network error: TLS handshake failed. Check SSL/TLS configuration' })).toBe('broken');
  });

  it('treats other network errors and missing statuses as unverifiable', () => {
    expect(classifyStatus({ text: 'Network error: connection reset by peer' })).toBe('unverifiable');
    expect(classifyStatus(undefined)).toBe('unverifiable');
  });
});

describe('collectFindings', () => {
  const report: LycheeReport = {
    error_map: {
      'dist/blog/welcome/index.html': [
        { url: 'https://example.org/gone', status: { text: 'Rejected status code: 404 Not Found', code: 404 } },
        { url: 'https://www.linkedin.com/in/someone/', status: { text: 'Error (cached)', code: 999 } },
        { url: '/internal/not-checked', status: { text: 'Error building URL', code: 404 } },
        { url: 'mailto:someone@example.org', status: { text: 'Cannot send mail', code: 404 } },
      ],
      'dist/pt-br/blog/welcome/index.html': [
        { url: 'https://example.org/gone', status: { text: 'Rejected status code: 404 Not Found', code: 404 } },
      ],
    },
    timeout_map: {
      'dist/index.html': [{ url: 'https://slow.example.org/', status: { text: 'Timeout' } }],
    },
  };

  it('keeps only http(s) links, merges pages per URL and sorts the result', () => {
    const findings = collectFindings(report);
    expect(findings.map(f => f.url)).toEqual([
      'https://example.org/gone',
      'https://slow.example.org/',
      'https://www.linkedin.com/in/someone/',
    ]);
    expect(findings[0]).toMatchObject({
      verdict: 'broken',
      status: '404 Not Found',
      pages: ['dist/blog/welcome/index.html', 'dist/pt-br/blog/welcome/index.html'],
    });
    expect(findings[1]).toMatchObject({ verdict: 'unverifiable', status: 'timeout' });
    expect(findings[2]).toMatchObject({ verdict: 'unverifiable' });
  });

  it('describes cached results by their status code', () => {
    const [finding] = collectFindings({
      error_map: { 'dist/index.html': [{ url: 'https://example.org/x', status: { text: 'Error (cached)', code: 404 } }] },
    });
    expect(finding).toMatchObject({ verdict: 'broken', status: 'HTTP 404' });
  });

  it('returns nothing for an empty report', () => {
    expect(collectFindings({})).toEqual([]);
  });
});

describe('vault mapping', () => {
  let root: string;

  const write = (collection: string, file: string, frontmatter: string) => {
    fs.mkdirSync(path.join(root, collection), { recursive: true });
    fs.writeFileSync(path.join(root, collection, file), `---\n${frontmatter}\n---\n\nBody\n`);
  };

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'link-rot-'));
    write('blog', '2026-04-welcome.en.md', 'slug: "welcome"\nlanguage: "en"');
    write('blog', '2026-04-welcome.pt-br.md', 'slug: "welcome"\nlanguage: "pt-br"');
    write('notes', 'book-cheatsheet.en.md', 'slug: "book-cheatsheet"\nlanguage: "en"');
    write('notes', 'no-slug.en.md', 'language: "en"');
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('indexes content by collection, language and slug from the frontmatter', () => {
    const index = buildSourceIndex(root);
    expect(index.get('blog/en/welcome')).toBe('2026-04-welcome.en.md');
    expect(index.get('blog/pt-br/welcome')).toBe('2026-04-welcome.pt-br.md');
    expect(index.get('notes/en/book-cheatsheet')).toBe('book-cheatsheet.en.md');
    expect(index.size).toBe(3);
  });

  it('maps blog and notes pages to their vault file', () => {
    const index = buildSourceIndex(root);
    expect(pageToSource('dist/blog/welcome/index.html', index)).toEqual({
      route: '/blog/welcome/',
      vaultFile: 'jts-brain/08-Publish/Blog/2026-04-welcome.en.md',
    });
    expect(pageToSource('dist/pt-br/blog/welcome/index.html', index)).toEqual({
      route: '/pt-br/blog/welcome/',
      vaultFile: 'jts-brain/08-Publish/Blog/2026-04-welcome.pt-br.md',
    });
    expect(pageToSource('dist/notes/book-cheatsheet/index.html', index).vaultFile).toBe(
      'jts-brain/08-Publish/Notes/book-cheatsheet.en.md',
    );
  });

  it('maps the Now page and leaves template pages without a vault file', () => {
    const index = buildSourceIndex(root);
    expect(pageToSource('dist/now/index.html', index).vaultFile).toBe('jts-brain/08-Publish/Now.en.md');
    expect(pageToSource('dist/pt-br/now/index.html', index).vaultFile).toBe('jts-brain/08-Publish/Now.pt-br.md');
    expect(pageToSource('dist/index.html', index)).toEqual({ route: '/', vaultFile: null });
    expect(pageToSource('dist/pt-br/portfolio/index.html', index)).toEqual({
      route: '/pt-br/portfolio/',
      vaultFile: null,
    });
    expect(pageToSource('dist/404.html', index)).toEqual({ route: '/404', vaultFile: null });
    expect(pageToSource('dist/blog/unknown/index.html', index).vaultFile).toBeNull();
  });

  it('renders broken and unverifiable sections with pages and vault files', () => {
    const index = buildSourceIndex(root);
    const findings = collectFindings({
      error_map: {
        'dist/blog/welcome/index.html': [
          { url: 'https://example.org/gone', status: { text: 'Rejected status code: 404 Not Found', code: 404 } },
          { url: 'https://blocked.example.org/', status: { text: 'Rejected status code: 403', code: 403 } },
        ],
        'dist/index.html': [
          { url: 'https://example.org/gone', status: { text: 'Rejected status code: 404 Not Found', code: 404 } },
        ],
      },
    });
    const report = renderReport(findings, index);
    expect(report.broken).toBe(1);
    expect(report.unverifiable).toBe(1);
    expect(report.markdown).toContain('## Broken external links (1)');
    expect(report.markdown).toContain('- <https://example.org/gone>: 404 Not Found');
    expect(report.markdown).toContain('`/blog/welcome/`, vault file: `jts-brain/08-Publish/Blog/2026-04-welcome.en.md`');
    expect(report.markdown).toContain('`/` (page generated from this repo, not a vault file)');
    expect(report.markdown).toContain('## Unverifiable external links (1)');
    expect(report.markdown).toContain('<https://blocked.example.org/>');
  });

  it('reports no broken links when only unverifiable ones remain', () => {
    const report = renderReport(
      collectFindings({
        timeout_map: { 'dist/index.html': [{ url: 'https://slow.example.org/', status: { text: 'Timeout' } }] },
      }),
      buildSourceIndex(root),
    );
    expect(report.broken).toBe(0);
    expect(report.markdown).toContain('No broken external links found.');
    expect(report.markdown).toContain('## Unverifiable external links (1)');
  });
});
