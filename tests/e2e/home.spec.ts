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

  const section = page.getByRole("region", { name: "Featured commodities" })
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

test("trade process presents the four accountable stages in order", async ({ page }) => {
  await page.goto("/")

  const process = page.getByRole("region", { name: "How ZuriBeans trades" })
  const steps = process.getByRole("listitem")
  await expect(steps).toHaveCount(4)
  await expect(steps.nth(0)).toContainText("Define the requirement")
  await expect(steps.nth(1)).toContainText("Confirm the commercial basis")
  await expect(steps.nth(2)).toContainText("Prepare and move the goods")
  await expect(steps.nth(3)).toContainText("Preserve the record")
})
