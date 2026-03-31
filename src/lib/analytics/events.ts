export const ANALYTICS_EVENT_NAMES = [
  'cv_download',
  'email_click',
  'linkedin_click',
  'github_click',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return ANALYTICS_EVENT_NAMES.includes(value as AnalyticsEventName);
}
