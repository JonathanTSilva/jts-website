interface AnalyticsConfig {
  provider: 'plausible';
  domain: string;
  apiHost: string;
  scriptSrc: string;
  enabled: boolean;
}

export function getAnalyticsConfig(): AnalyticsConfig {
  const apiHost = import.meta.env.PUBLIC_PLAUSIBLE_API_HOST || 'https://plausible.io';
  const scriptSrc = import.meta.env.PUBLIC_PLAUSIBLE_SCRIPT_SRC || `${apiHost}/js/script.js`;
  const domain = import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN || 'www.jontobias.com';

  return {
    provider: 'plausible',
    domain,
    apiHost,
    scriptSrc,
    enabled: true,
  };
}
