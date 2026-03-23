export const themeInlineScript = `
  (function() {
    const storageKey = 'theme-preference';

    function applyTheme() {
      const theme = localStorage.getItem(storageKey) ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
      if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, theme);
      }
    }

    // Apply on initial load (before first paint)
    applyTheme();

    // Re-apply after each View Transitions swap, because Astro re-sets
    // html attributes (including data-theme="light") from the new page.
    document.addEventListener('astro:after-swap', applyTheme);
  })();
`.trim();
