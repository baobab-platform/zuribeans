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

  test("shows four approved commodity filters and a result count at the right", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/products", { waitUntil: "domcontentloaded" })
    const filters = page.getByRole("navigation", { name: "Product categories" })
    for (const label of ["All products", "Coffee", "Vanilla", "Grains & Seeds", "Botanicals"]) {
      await expect(filters.getByRole("link", { name: label })).toBeVisible()
    }
    await expect(filters.getByRole("link", { name: "Sorghum" })).toHaveCount(0)
    await expect(filters.getByRole("link", { name: "Related products" })).toHaveCount(0)
    await expect(page.getByTestId("catalogue-product-count")).toBeVisible()
    await expect(filters.getByRole("link", { name: "Coffee" })).toHaveAttribute(
      "href",
      "/products?category=coffee",
    )
  })

  test("exposes only the approved four commodity categories in mobile filters", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto("/products", { waitUntil: "domcontentloaded" })
    await page.getByText("Filters", { exact: true }).click()
    const filters = page.getByRole("navigation", { name: "Mobile product categories" })
    for (const label of ["All products", "Coffee", "Vanilla", "Grains & Seeds", "Botanicals"]) {
      await expect(filters.getByRole("link", { name: label })).toBeVisible()
    }
    await expect(filters.getByRole("link", { name: "Sorghum" })).toHaveCount(0)
    await expect(filters.getByRole("link", { name: "Related products" })).toHaveCount(0)
  })

  test("keeps catalogue search usable at 320px without horizontal page overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto("/products", { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("searchbox", { name: "Search products or origins" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Search" })).toBeVisible()
    await expect(page.getByTestId("catalogue-product-count")).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      ),
    ).toBe(true)
  })
})
