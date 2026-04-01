import { describe, expect, test } from 'vitest';

import {
  CONSENT_STORAGE_KEY,
  createDefaultConsentState,
  hasAnalyticsConsent,
  parseConsentState,
  serializeConsentState,
  type ConsentState,
} from '../../src/lib/analytics/consent';

describe('analytics consent helpers', () => {
  test('createDefaultConsentState returns a denied analytics state', () => {
    expect(createDefaultConsentState()).toEqual({
      analytics: false,
      updatedAt: '',
    });
  });

  test('serializeConsentState writes a stable JSON payload', () => {
    const state: ConsentState = {
      analytics: true,
      updatedAt: '2026-03-31T12:00:00.000Z',
    };

    expect(serializeConsentState(state)).toBe(
      '{"analytics":true,"updatedAt":"2026-03-31T12:00:00.000Z"}',
    );
  });

  test('parseConsentState restores a valid consent state', () => {
    expect(
      parseConsentState('{"analytics":false,"updatedAt":"2026-03-31T12:00:00.000Z"}'),
    ).toEqual({
      analytics: false,
      updatedAt: '2026-03-31T12:00:00.000Z',
    });
  });

  test('parseConsentState falls back to default state for invalid JSON', () => {
    expect(parseConsentState('not-json')).toEqual(createDefaultConsentState());
  });

  test('hasAnalyticsConsent reflects the analytics boolean', () => {
    expect(hasAnalyticsConsent(createDefaultConsentState())).toBe(false);
    expect(
      hasAnalyticsConsent({
        analytics: true,
        updatedAt: '2026-03-31T12:00:00.000Z',
      }),
    ).toBe(true);
  });

  test('CONSENT_STORAGE_KEY is stable for browser persistence', () => {
    expect(CONSENT_STORAGE_KEY).toBe('jts-consent');
  });
});
