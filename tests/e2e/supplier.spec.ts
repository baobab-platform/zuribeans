import { expect, test } from "@playwright/test"

test("visitor can understand and start the supplier application journey", async ({ page }) => {
  await page.goto("/sourcing/become-a-supplier")

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Become a ZuriBeans supplier.",
  )
  await expect(page.getByRole("link", { name: "Begin supplier application" })).toHaveAttribute(
    "href",
    "/supplier/apply",
  )
  await expect(page.getByText(/Submission starts a sourcing review/)).toBeVisible()
})
