import { defineConfig, devices } from "@playwright/test"
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  use: { baseURL: "http://127.0.0.1:3000", trace: "on-first-retry" },
  webServer: {
    // CI runs the already-built app: dev/HMR rebuilds can tear down the
    // browser execution context during axe scans and make screenshots flaky.
    // Developers retain the fast dev server for local exploratory runs.
    command: process.env.CI
      ? "pnpm start --hostname 127.0.0.1"
      : "pnpm dev --hostname 127.0.0.1",
    env: {
      ...process.env,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000",
    },
    url: "http://127.0.0.1:3000/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 90_000,
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox-desktop", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"] } },
    { name: "chromium-mobile", use: { ...devices["Pixel 7"] } },
    { name: "webkit-mobile", use: { ...devices["iPhone 15"] } },
  ],
})
