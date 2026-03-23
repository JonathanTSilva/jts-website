export const themeInlineScript = `
  (function() {
    const storageKey = 'theme-preference';
    const theme = (function() {
      if (typeof localStorage !== 'undefined' && localStorage.getItem(storageKey)) {
        return localStorage.getItem(storageKey);
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    })();

    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Ensure the initial theme is persisted if it was derived from system preference
    if (typeof localStorage !== 'undefined' && !localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, theme);
    }
  })();
`.trim();
