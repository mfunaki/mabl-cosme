import { defineConfig, devices } from '@playwright/experimental-ct-react'

/**
 * Playwright Component Testing Configuration
 * @see https://playwright.dev/docs/test-components
 */
export default defineConfig({
  testDir: './src',
  testMatch: '**/__tests__/*.spec.{ts,tsx}',
  snapshotDir: './__snapshots__',
  timeout: 10 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    ctPort: 3100,
    ctViteConfig: {
      resolve: {
        alias: {
          '@': './src',
        },
      },
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
