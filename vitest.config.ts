/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  // @ts-expect-error -- getViteConfig's types do not include Vitest's `test` key
  test: {
    environment: 'node',
    exclude: ['tests/e2e/**', 'node_modules/**', '.worktrees/**', 'dist/**'],
  },
});
