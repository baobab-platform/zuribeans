import { expect, test } from "@playwright/test"

test("visitor can understand and start the supplier application journey", async ({ page }) => {
  await page.goto("/sourcing/become-a-supplier")

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Become a ZuriBeans supplier.")
  await expect(page.getByRole("link", { name: "Create supplier login" })).toHaveAttribute(
    "href",
    "/supplier/register",
  )
  await expect(page.getByRole("link", { name: /Existing supplier.*Sign in/i })).toHaveAttribute(
    "href",
    "/supplier/login",
  )
  await expect(page.getByText(/Submission starts a sourcing review/)).toBeVisible()
})
