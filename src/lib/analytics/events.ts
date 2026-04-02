export const ANALYTICS_EVENT_NAMES = [
  'cv_download',
  'email_click',
  'linkedin_click',
  'github_click',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];
export type AnalyticsEventCategory = 'lead';

export const ANALYTICS_EVENT_TAXONOMY_VERSION = '2026-04-01';

const ANALYTICS_EVENT_CATEGORIES: Record<AnalyticsEventName, AnalyticsEventCategory> = {
  cv_download: 'lead',
  email_click: 'lead',
  linkedin_click: 'lead',
  github_click: 'lead',
};

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return ANALYTICS_EVENT_NAMES.includes(value as AnalyticsEventName);
}

export function getAnalyticsEventCategory(eventName: AnalyticsEventName): AnalyticsEventCategory {
  return ANALYTICS_EVENT_CATEGORIES[eventName];
}
