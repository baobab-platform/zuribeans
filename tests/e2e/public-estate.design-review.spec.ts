import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

/**
 * Wider design-acceptance evidence across the public estate.
 * Screenshots are attached to the run, rather than silently replacing
 * approved baselines. Account/supplier pages require governed identities.
 */
const routes = [
  { path: "/products", label: "products" },
  { path: "/origins-markets", label: "markets" },
  { path: "/sourcing", label: "sourcing" },
  { path: "/trade", label: "trade" },
  { path: "/quality-traceability", label: "quality" },
  { path: "/about", label: "about" },
  { path: "/contact", label: "contact" },
  { path: "/insights", label: "insights" },
  { path: "/sourcing/become-a-supplier", label: "supplier-onboarding" },
] as const

const sizes = [
  { width: 390, height: 844, label: "mobile" },
  { width: 768, height: 1024, label: "tablet" },
  { width: 1440, height: 900, label: "desktop" },
] as const

test.describe("full public estate design review", () => {
  test.setTimeout(90_000)

  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "chromium-desktop", "Evidence runs once in Chromium")
  })

  for (const route of routes) {
    for (const size of sizes) {
      test(`${route.label} at ${size.label}`, async ({ page }, testInfo) => {
        await page.setViewportSize(size)
        const response = await page.goto(route.path, { waitUntil: "domcontentloaded" })
        expect(response?.status(), `Unexpected status for ${route.path}`).toBeLessThan(400)
        await expect(page.getByRole("main")).toBeVisible()
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
        await page.evaluate(() => document.fonts.ready)

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        )
        expect(overflow, `Horizontal overflow at ${route.path} ${size.label}`).toBe(false)

        await testInfo.attach(`${route.label}-${size.label}`, {
          body: await page.screenshot({
            fullPage: true,
            animations: "disabled",
            caret: "hide",
          }),
          contentType: "image/png",
        })

        if (size.label === "desktop") {
          const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()
          expect(
            axe.violations.map((violation) => `${violation.id}: ${violation.nodes.map(n => n.target.join(" ")).join(", ")}`),
          ).toEqual([])
        }
      })
    }
  }
})

test.describe("protected portal presentation boundary", () => {
  for (const route of ["/account", "/supplier"]) {
    test(`unauthenticated ${route} is not rendered as an authenticated portal`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" })
      await expect(page).not.toHaveURL(new RegExp(`${route}/?$`))
      await expect(page.getByRole("button", { name: "Sign out" })).toHaveCount(0)
    })
  }
})
