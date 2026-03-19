export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme-preference';

export function getTheme(): Theme {
  if (typeof localStorage !== 'undefined' && localStorage.getItem(THEME_STORAGE_KEY)) {
    return localStorage.getItem(THEME_STORAGE_KEY) as Theme;
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function setTheme(theme: Theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
}

export function toggleTheme(): Theme {
  const current = getTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
  return next;
}
