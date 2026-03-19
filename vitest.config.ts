/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  // @ts-ignore
  test: {
    environment: 'node',
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
});
