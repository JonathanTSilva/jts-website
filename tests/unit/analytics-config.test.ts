import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAnalyticsConfig } from '../../src/lib/analytics/config';
import { SITE_HOST } from '../../src/lib/site';
import { parseConsentState } from '../../src/lib/analytics/consent';

describe('getAnalyticsConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('falls back to Plausible defaults and the site host', () => {
    vi.stubEnv('PUBLIC_PLAUSIBLE_API_HOST', '');
    vi.stubEnv('PUBLIC_PLAUSIBLE_SCRIPT_SRC', '');
    vi.stubEnv('PUBLIC_PLAUSIBLE_DOMAIN', '');
    expect(getAnalyticsConfig()).toEqual({
      provider: 'plausible',
      domain: SITE_HOST,
      apiHost: 'https://plausible.io',
      scriptSrc: 'https://plausible.io/js/script.js',
      enabled: true,
    });
  });

  it('uses the environment overrides when they are set', () => {
    vi.stubEnv('PUBLIC_PLAUSIBLE_API_HOST', 'https://stats.example.com');
    vi.stubEnv('PUBLIC_PLAUSIBLE_SCRIPT_SRC', 'https://cdn.example.com/p.js');
    vi.stubEnv('PUBLIC_PLAUSIBLE_DOMAIN', 'example.com');
    expect(getAnalyticsConfig()).toMatchObject({
      domain: 'example.com',
      apiHost: 'https://stats.example.com',
      scriptSrc: 'https://cdn.example.com/p.js',
    });
  });

  it('builds the script URL from a custom API host', () => {
    vi.stubEnv('PUBLIC_PLAUSIBLE_API_HOST', 'https://stats.example.com');
    vi.stubEnv('PUBLIC_PLAUSIBLE_SCRIPT_SRC', '');
    expect(getAnalyticsConfig().scriptSrc).toBe('https://stats.example.com/js/script.js');
  });
});

describe('parseConsentState edge cases', () => {
  it('returns the denied default for missing, malformed or mistyped input', () => {
    const denied = { analytics: false, updatedAt: '' };
    expect(parseConsentState(null)).toEqual(denied);
    expect(parseConsentState(undefined)).toEqual(denied);
    expect(parseConsentState('')).toEqual(denied);
    expect(parseConsentState('{not json')).toEqual(denied);
    expect(parseConsentState('{"analytics":"yes","updatedAt":"x"}')).toEqual(denied);
    expect(parseConsentState('{"analytics":true,"updatedAt":5}')).toEqual(denied);
  });

  it('keeps a valid stored state', () => {
    expect(parseConsentState('{"analytics":true,"updatedAt":"2026-01-01"}')).toEqual({
      analytics: true,
      updatedAt: '2026-01-01',
    });
  });
});
