import { fileURLToPath } from "node:url"
import path from "node:path"
import { defineConfig } from "vitest/config"
import { playwright } from "@vitest/browser-playwright"
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin"

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Browser-mode story tests via `@storybook/addon-vitest`, kept out of
 * `vitest.config.ts`/`pnpm test`: that command is today's CI unit-test gate
 * and requires no browser binary. Run this suite explicitly with
 * `pnpm test:storybook` once Playwright's Chromium browser is provisioned.
 * See https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
 */
export default defineConfig({
  plugins: [storybookTest({ configDir: path.join(dirname, ".storybook") })],
  test: {
    name: "storybook",
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
})
