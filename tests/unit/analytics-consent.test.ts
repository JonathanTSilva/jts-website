import { describe, expect, test } from 'vitest';

import {
  CONSENT_STORAGE_KEY,
  createDefaultConsentState,
  hasAnalyticsConsent,
  parseConsentState,
  serializeConsentState,
  type ConsentState,
} from '../../src/lib/analytics/consent';
import {
  ANALYTICS_EVENT_NAMES,
  ANALYTICS_EVENT_TAXONOMY_VERSION,
  getAnalyticsEventCategory,
  isAnalyticsEventName,
} from '../../src/lib/analytics/events';

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

describe('analytics event taxonomy', () => {
  test('keeps the supported event names stable and ordered', () => {
    expect(ANALYTICS_EVENT_NAMES).toEqual([
      'cv_download',
      'email_click',
      'linkedin_click',
      'github_click',
    ]);
  });

  test('publishes a version string for governance documentation', () => {
    expect(ANALYTICS_EVENT_TAXONOMY_VERSION).toBe('2026-04-01');
  });

  test('classifies each supported event under the lead category', () => {
    for (const eventName of ANALYTICS_EVENT_NAMES) {
      expect(getAnalyticsEventCategory(eventName)).toBe('lead');
    }
  });

  test('rejects unsupported event names', () => {
    expect(isAnalyticsEventName('contact_section_view')).toBe(false);
    expect(isAnalyticsEventName('newsletter_signup')).toBe(false);
  });
});
