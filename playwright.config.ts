import { defineConfig, devices } from "@playwright/test"
const approvedGates = new Set(["functional", "accessibility", "visual", "lighthouse"])
const evidenceGate =
  process.env.CI && approvedGates.has(process.env.DEV11_EVIDENCE_GATE ?? "")
    ? process.env.DEV11_EVIDENCE_GATE
    : undefined

export default defineConfig({
  testDir: "./tests/e2e",
  reporter: evidenceGate
    ? [
        ["list"],
        ["html", { open: "never", outputFolder: `playwright-report/dev11-${evidenceGate}` }],
        ["json", { outputFile: `reports/dev11-${evidenceGate}-playwright.json` }],
      ]
    : process.env.CI
      ? [["list"], ["html", { open: "never" }]]
      : "list",
  ...(evidenceGate ? { outputDir: `test-results/dev11-${evidenceGate}` } : {}),
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  use: { baseURL: "http://127.0.0.1:3000", trace: "on-first-retry" },
  webServer: {
    // CI runs the already-built app: dev/HMR rebuilds can tear down the
    // browser execution context during axe scans and make screenshots flaky.
    // Developers retain the fast dev server for local exploratory runs.
    command: `pnpm ${process.env.CI ? "start" : "dev"} --hostname 127.0.0.1`,
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
