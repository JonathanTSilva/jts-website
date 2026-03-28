import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: !!process.env.CI,
  use: { baseURL: 'http://127.0.0.1:4321' },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
    },
  },
  snapshotPathTemplate: '{testDir}/{testFileName}-snapshots/{projectName}/{arg}{ext}',
  projects: [
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'chromium-mobile',
      use: { 
        ...devices['Pixel 5'],
        isMobile: true 
      },
    },
  ],
  webServer: {
    command: 'pnpm preview --port 4321 --host 127.0.0.1',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  }
});
