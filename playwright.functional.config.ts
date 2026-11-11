import { defineConfig } from "@playwright/test"
import baseConfig from "./playwright.config"

/**
 * Functional browser coverage must not absorb the independently gated visual,
 * accessibility, and throttled Lighthouse suites. Those suites have dedicated
 * CI steps with their own failure receipts and unchanged acceptance thresholds.
 */
export default defineConfig(baseConfig, {
  // Schedule each deliberately canonical-only case in its owning browser.
  // Local synthetic previews remain a separate development profile; all
  // production absence/denial tests and five-browser journeys still run.
  projects: baseConfig.projects?.map((project) => ({
    ...project,
    grepInvert: [
      ...(process.env.CI ? [/@local-fixture/] : []),
      ...(project.name === "chromium-desktop" ? [] : [/@canonical-browser/]),
    ],
  })),
  testIgnore: [
    "**/*.visual.spec.ts",
    "**/*.accessibility.spec.ts",
    "**/performance-budget.spec.ts",
  ],
})
