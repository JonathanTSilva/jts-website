/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';
import { coverageConfigDefaults } from 'vitest/config';

export default getViteConfig({
  test: {
    environment: 'node',
    exclude: ['tests/e2e/**', 'node_modules/**', '.worktrees/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: [
        ...coverageConfigDefaults.exclude,
        // Astro markup, verified by Playwright e2e and Lighthouse jobs; unit line coverage measures template text
        'src/**/*.astro',
        // Vault-synced Markdown entries are content, not code: a unit test cannot execute them
        'src/content/**/*.md',
      ],
      thresholds: { lines: 95, functions: 95, branches: 95, statements: 95 },
    },
  },
});
