/**
 * Playwright Configuration
 * 
 * REASONING: This configuration sets up Playwright for E2E testing
 * of the Tauri + React desktop application.
 * 
 * For Tauri apps, we test the webview content served by Vite in dev mode,
 * or the built application in production mode.
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * REASONING: Base URL configuration
 * In development: http://localhost:5173 (Vite dev server)
 * In production: Test against built Tauri app
 */
const baseURL = process.env.TEST_URL || 'http://localhost:5173';

/**
 * REASONING: Headless mode
 * CI environments should run headless
 * Local development can show browser with HEADLESS=false
 */
const isHeadless = process.env.HEADLESS !== 'false';

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL,

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video recording
    video: 'on-first-retry',

    // Action timeout
    actionTimeout: 15000,

    // Navigation timeout
    navigationTimeout: 15000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: isHeadless,
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        headless: isHeadless,
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        headless: isHeadless,
      },
    },
  ],

  // Run local dev server before starting the tests
  webServer: {
    /**
     * REASONING: For Tauri apps, we run the Vite dev server
     * In production CI, you might test against the built Tauri app instead
     */
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
