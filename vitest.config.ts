/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';
import { coverageConfigDefaults } from 'vitest/config';

export default getViteConfig({
  test: {
    environment: 'node',
    exclude: ['tests/e2e/**', 'node_modules/**', '.worktrees/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      // Only code is measured. .astro markup is verified by the Playwright e2e and Lighthouse jobs; Markdown under src/content is content.
      include: ['src/**/*.{ts,tsx,js,mjs}'],
      exclude: [...coverageConfigDefaults.exclude],
      thresholds: { lines: 95, functions: 95, branches: 95, statements: 95 },
    },
  },
});
