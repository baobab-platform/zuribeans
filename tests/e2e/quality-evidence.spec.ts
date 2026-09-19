import { expect, test } from "@playwright/test"

test("homepage presents the evidence chain without certification overclaim", async ({ page }) => {
  await page.goto("/")

  const section = page.getByRole("region", { name: "Quality and traceability" })
  const steps = section.getByRole("listitem")

  await expect(steps).toHaveCount(4)
  await expect(steps.nth(0)).toContainText("Lot context")
  await expect(steps.nth(1)).toContainText("Status made visible")
  await expect(steps.nth(2)).toContainText("Transaction record")
  await expect(steps.nth(3)).toContainText("Controlled disclosure")
  await expect(
    section.getByRole("link", { name: "Explore our evidence approach" }),
  ).toHaveAttribute("href", "/quality-traceability")
})
