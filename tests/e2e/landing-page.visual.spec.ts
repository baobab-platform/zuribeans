import { expect, test } from "@playwright/test"

const viewports = [
  { name: "320", width: 320, height: 640 },
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 900 },
  { name: "1440", width: 1440, height: 1000 },
] as const

test.describe("landing page visual regression", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-desktop",
      "Visual baselines run in Chromium desktop",
    )
  })

  for (const viewport of viewports) {
    test(`matches the ${viewport.name}px landing-page baseline`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto("/", { waitUntil: "networkidle" })
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
      await page.evaluate(() => document.fonts?.ready)
      await expect(page).toHaveScreenshot(`landing-page-${viewport.name}.png`, {
        animations: "disabled",
        caret: "hide",
        fullPage: true,
        maxDiffPixelRatio: 0.01,
        scale: "css",
      })
    })
  }
})
