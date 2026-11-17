import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests for the screens `check:routes` cannot see.
 *
 * `check:routes` reads HTTP responses, so anything behind the login — the
 * account tabs, order details, checkout validation — is invisible to it.
 * Those are exactly the screens where English copy and broken branches shipped
 * unnoticed, so they get a real browser.
 *
 * Needs a build first (`npm run build`); the server below serves the built app,
 * the same way `check-routes` does.
 */
const PORT = Number(process.env.E2E_PORT ?? 3211);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['github']] : [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
