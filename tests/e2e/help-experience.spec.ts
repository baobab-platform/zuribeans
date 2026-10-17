import { expect, test } from "@playwright/test"

test("BXS disclosure remains keyboard-accessible and never implies approval", async ({ page }) => {
  await page.goto("/help")
  const summary = page.getByText("Does a sourcing enquiry confirm an order?")
  await expect(summary).toBeVisible()
  await summary.focus()
  await page.keyboard.press("Enter")
  await expect(page.getByText(/formal quotation, approval and purchase/)).toBeVisible()
  await expect(page.locator('[data-bx-theme="zuribeans"]')).toHaveCount(1)
  await expect(page.locator('[data-bx-theme="zuribeans"]')).toHaveCSS(
    "--bx-color-primary",
    "#c9a227",
  )
})
