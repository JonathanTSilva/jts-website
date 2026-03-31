export const CONSENT_STORAGE_KEY = 'jts-consent';

export interface ConsentState {
  analytics: boolean;
  updatedAt: string;
}

export function createDefaultConsentState(): ConsentState {
  return {
    analytics: false,
    updatedAt: '',
  };
}

export function serializeConsentState(state: ConsentState): string {
  return JSON.stringify(state);
}

export function parseConsentState(rawValue: string | null | undefined): ConsentState {
  if (!rawValue) {
    return createDefaultConsentState();
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<ConsentState>;

    if (typeof parsed.analytics !== 'boolean' || typeof parsed.updatedAt !== 'string') {
      return createDefaultConsentState();
    }

    return {
      analytics: parsed.analytics,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return createDefaultConsentState();
  }
}

export function hasAnalyticsConsent(state: ConsentState): boolean {
  return state.analytics;
}
