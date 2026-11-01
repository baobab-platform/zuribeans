import { expect, test } from "@playwright/test"

test("visitor can understand and start the supplier application journey", async ({ page }) => {
  await page.goto("/sourcing/become-a-supplier")

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bring a clear supply picture.")
  await expect(page.getByRole("link", { name: "Begin supplier application" })).toHaveAttribute(
    "href",
    "/supplier/register",
  )
  await expect(page.getByRole("link", { name: /Existing supplier.*Sign in/i })).toHaveAttribute(
    "href",
    "/supplier/login",
  )
  await expect(page.getByText(/Submission starts review; it does not grant supplier approval/)).toBeVisible()
})
