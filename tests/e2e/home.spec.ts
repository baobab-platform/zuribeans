import { expect, test } from "@playwright/test"
test("visitor can enter the multi-product catalogue from the home page", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Quality products. Clear provenance. Serious trade.",
  )
  await expect(
    page.locator("#main").getByRole("link", { name: "Explore products", exact: true }),
  ).toHaveAttribute("href", "/products")
})

test("featured commodities expose truthful catalogue routes", async ({ page }) => {
  await page.goto("/")

  const section = page.getByRole("region", { name: "Specified for decisions, not dressed for a shelf." })
  await expect(section.getByRole("heading", { name: "Green coffee" })).toBeVisible()
  await expect(section.getByRole("heading", { name: "Vanilla pods" })).toBeVisible()
  await expect(section.getByRole("link", { name: "View coffee: Green coffee" })).toHaveAttribute(
    "href",
    "/products?category=coffee",
  )
  await expect(section.getByRole("link", { name: "View vanilla: Vanilla pods" })).toHaveAttribute(
    "href",
    "/products?category=vanilla",
  )
})
