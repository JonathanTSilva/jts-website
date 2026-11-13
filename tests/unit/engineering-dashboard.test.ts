import { describe, it, expect, vi } from 'vitest';
import snapshot from '../../src/data/engineering-snapshot.json';
import {
  loadDashboard,
  parseDashboard,
  listedRepos,
  archivedPublicCount,
  repoBadges,
  type Dashboard,
} from '../../src/lib/engineering/dashboard';

const sample = {
  generated_at: '2026-01-01T00:00:00Z',
  summary: { total: 3, compliant: 2, percent: 67, ci_green: 1, ci_total: 1 },
  repos: [
    { name: 'b-repo', visibility: 'public', archived: false, status: 'active', ci: 'success', compliant: true },
    { name: 'a-repo', visibility: 'public', archived: false, status: 'wip', ci: null, compliant: false },
    { name: 'old', visibility: 'public', archived: true, status: 'archived', ci: null, compliant: true },
    { name: 'secret', visibility: 'private', archived: false, status: 'active', ci: 'success', compliant: true },
  ],
};

const response = (body: unknown, ok = true) =>
  ({ ok, json: async () => body }) as unknown as Response;

describe('engineering snapshot', () => {
  it('is valid and contains public repos only', () => {
    const parsed = parseDashboard(snapshot);
    expect(parsed).not.toBeNull();
    expect(parsed!.repos.every((r) => r.visibility === 'public')).toBe(true);
  });
});

describe('loadDashboard', () => {
  it('uses the live data when the fetch succeeds', async () => {
    const result = await loadDashboard(vi.fn().mockResolvedValue(response(sample)));
    expect(result.source).toBe('live');
    expect(result.data.summary.percent).toBe(67);
  });

  it('falls back to the snapshot when the fetch rejects', async () => {
    const result = await loadDashboard(vi.fn().mockRejectedValue(new Error('offline')));
    expect(result.source).toBe('snapshot');
    expect(result.data.repos.length).toBeGreaterThan(0);
  });

  it('falls back to the snapshot on an HTTP error', async () => {
    const result = await loadDashboard(vi.fn().mockResolvedValue(response({}, false)));
    expect(result.source).toBe('snapshot');
  });

  it('falls back to the snapshot on malformed JSON or shape', async () => {
    const bad = vi.fn().mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError('x'); } });
    expect((await loadDashboard(bad)).source).toBe('snapshot');
    const shape = vi.fn().mockResolvedValue(response({ repos: 'nope' }));
    expect((await loadDashboard(shape)).source).toBe('snapshot');
  });
});

describe('listedRepos', () => {
  it('keeps public, non-archived repos sorted by name', () => {
    const data = parseDashboard(sample) as Dashboard;
    expect(listedRepos(data).map((r) => r.name)).toEqual(['a-repo', 'b-repo']);
    expect(archivedPublicCount(data)).toBe(1);
  });
});

describe('repoBadges', () => {
  it('builds shields, codecov and sonarcloud URLs for the repo', () => {
    const b = repoBadges('jts-website');
    expect(b.repo).toBe('https://github.com/JonathanTSilva/jts-website');
    expect(b.coverageImg).toBe('https://codecov.io/gh/JonathanTSilva/jts-website/graph/badge.svg');
    expect(b.qualityImg).toContain('sonarcloud.io/api/project_badges/measure?project=JonathanTSilva_jts-website');
    expect(b.scorecardImg).toContain('img.shields.io/ossf-scorecard/github.com/JonathanTSilva/jts-website');
    expect(b.releaseImg).toContain('img.shields.io/github/v/release/JonathanTSilva/jts-website');
  });
});
