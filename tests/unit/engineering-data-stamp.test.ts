import { describe, it, expect } from 'vitest';
import { dataStamp } from '../../src/lib/engineering/dataStamp';
import type { LoadedDashboard } from '../../src/lib/engineering/dashboard';

const loaded = (source: 'live' | 'snapshot'): LoadedDashboard => ({
  source,
  data: {
    generated_at: '2026-01-01T00:00:00Z',
    summary: { total: 1, compliant: 1, percent: 100, ci_green: 0, ci_total: 0 },
    repos: [],
  },
});

describe('dataStamp', () => {
  it('carries only the timestamp and the source', () => {
    expect(dataStamp(loaded('live'))).toEqual({ generated_at: '2026-01-01T00:00:00Z', source: 'live' });
    expect(dataStamp(loaded('snapshot')).source).toBe('snapshot');
  });
});
