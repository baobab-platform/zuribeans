import { expect, test } from "@playwright/test"

test.describe("Figma-inspired procurement catalogue", () => {
  test("keeps server-side search and category context without exposing fake stock", async ({
    page,
  }) => {
    await page.goto("/products?q=arabica&category=coffee", {
      waitUntil: "domcontentloaded",
    })
    await expect(
      page.getByRole("heading", { level: 1, name: "African-origin commodities." }),
    ).toBeVisible()
    await expect(page.getByRole("searchbox", { name: "Search products or origins" })).toHaveValue(
      "arabica",
    )
    await expect(page.locator('form[action="/products"] input[name="category"]')).toHaveValue(
      "coffee",
    )
    await expect(page.getByRole("region", { name: "Catalogue results" })).toBeVisible()
  })

  test("keeps catalogue search usable at 320px without horizontal page overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto("/products", { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("searchbox", { name: "Search products or origins" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Search" })).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      ),
    ).toBe(true)
  })
})
