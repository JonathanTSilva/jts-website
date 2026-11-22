import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  {
    ignores: [
      'dist',
      '.astro',
      'node_modules',
      'public',
      'coverage',
      'playwright-report',
      'test-results',
      'src/content',
      'tests/fixtures/content',
      '.claude',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  {
    // Default: everything runs on Node (scripts, tests, config files, build-time code).
    languageOptions: { globals: { ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Client scripts inside .astro files run in the browser.
    files: ['src/**/*.astro'],
    languageOptions: { globals: { ...globals.browser } },
  },
);
