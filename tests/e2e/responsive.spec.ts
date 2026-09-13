import { expect, test } from "@playwright/test"

test.describe("responsive shell", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Width matrix runs once in Chromium")

  test("mobile navigation exposes all essential journeys without horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")

    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeHidden()
    await page.getByRole("button", { name: "Menu" }).click()
    const menu = page.getByRole("dialog", { name: "Explore ZuriBeans" })
    await expect(menu).toBeVisible()
    await expect(menu.getByRole("link", { name: "Products", exact: true })).toBeVisible()
    await expect(menu.getByRole("link", { name: /market$/ })).toBeVisible()

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(hasOverflow).toBe(false)
  })

  test("tablet navigation and supplier call to action remain usable", async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 })
    await page.goto("/sourcing/become-a-supplier")

    await expect(page.getByRole("button", { name: "Menu" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Start a supplier application" })).toBeVisible()
  })

  test("large procurement viewport uses desktop navigation without horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto("/origins-markets")

    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Menu" })).toBeHidden()
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(hasOverflow).toBe(false)
  })
})
