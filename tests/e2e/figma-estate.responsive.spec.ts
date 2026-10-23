import { expect, test } from "@playwright/test"

const widths = [320, 390, 768, 1440] as const

/**
 * Complements screenshot snapshots with layout-independent assertions.
 * An intentionally horizontal chip list may scroll; the document must not.
 */
test.describe("Figma Make responsive estate contract", () => {
  for (const width of widths) {
    test(`public home at ${width}px retains navigation, CTA and no document overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto("/", { waitUntil: "domcontentloaded" })

      await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
      await expect(page.getByRole("main")).toBeVisible()
      await expect(page.getByRole("link", { name: /request a quote/i }).first()).toBeVisible()

      const documentOverflow = await page.evaluate(() => {
        const root = document.documentElement
        return root.scrollWidth > root.clientWidth + 1
      })
      expect(documentOverflow, `Document overflows at ${width}px`).toBe(false)

      if (width < 1280) {
        const menu = page.getByRole("button", { name: /menu/i })
        await expect(menu).toBeVisible()
        await menu.click()
        const dialog = page.getByRole("dialog", { name: "Explore ZuriBeans" })
        await expect(dialog).toBeVisible()
        await expect(dialog.getByRole("link", { name: /supplier portal/i })).toHaveAttribute(
          "href",
          "/supplier",
        )
        await page.keyboard.press("Escape")
        await expect(dialog).toBeHidden()
      } else {
        await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible()
      }
    })
  }

  test("public product and insights routes are real Next routes", async ({ page }) => {
    await page.goto("/products", { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()

    await page.goto("/insights", { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })
})
