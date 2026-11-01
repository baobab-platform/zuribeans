import { expect, test } from "@playwright/test"

test.describe("Figma Make home hero convergence", () => {
  test("renders the editorial heading and navigates through existing public routes", async ({
    page,
  }) => {
    await page.goto("/")
    const hero = page.locator('section[aria-labelledby="zuribeans-home-title"]')
    await expect(hero.getByRole("heading", { level: 1 })).toContainText("African origin.")
    await expect(hero.getByRole("heading", { level: 1 })).toContainText("International")
    await expect(hero.getByRole("heading", { level: 1 })).toContainText("trade discipline.")
    await expect(hero.getByRole("link", { name: /view catalogue/i })).toHaveAttribute(
      "href",
      "/products",
    )
    await expect(hero.getByRole("link", { name: /how we trade/i })).toHaveAttribute(
      "href",
      "/trade",
    )
    await expect(hero.locator("img")).toHaveAttribute("alt", "")
  })

  test("shows the Figma metric rail with prototype copy on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    const metrics = page.getByRole("complementary", { name: "Trade at a glance" })
    await expect(metrics).toBeVisible()
    await expect(metrics).toContainText("12+")
    await expect(metrics).toContainText("98%")
    await expect(metrics).toContainText("7")
    await expect(metrics).toContainText("Export markets")
    await expect(metrics).toContainText("Documentation rate")
    await expect(metrics).toContainText("Years trading")
    await expect(metrics).not.toContainText("pending verification")
    await expect(metrics).not.toContainText("Design examples only")
  })

  test("keeps hero content usable at narrow mobile width without showing unverified KPIs", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto("/")
    const hero = page.locator('section[aria-labelledby="zuribeans-home-title"]')
    await expect(hero.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(hero.getByRole("link", { name: /view catalogue/i })).toBeVisible()
    await expect(hero.getByRole("link", { name: /how we trade/i })).toBeVisible()
    await expect(hero).not.toContainText(/ISO 22000|EUDR ready/)
    await expect(hero.locator('aside[aria-label="Trade at a glance"]')).toBeHidden()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(overflow).toBe(false)
  })
})
