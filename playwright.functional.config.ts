import { defineConfig } from "@playwright/test"
import baseConfig from "./playwright.config"

/**
 * Functional browser coverage must not absorb the independently gated visual,
 * accessibility, and throttled Lighthouse suites. Those suites have dedicated
 * CI steps with their own failure receipts and unchanged acceptance thresholds.
 */
export default defineConfig(baseConfig, {
  testIgnore: [
    "**/*.visual.spec.ts",
    "**/*.accessibility.spec.ts",
    "**/performance-budget.spec.ts",
  ],
})
