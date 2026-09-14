import { expect, test } from "@playwright/test"

test("an unmatched public address returns an intentional non-indexable state", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist")

  expect(response?.status()).toBe(404)
  await expect(
    page.getByRole("heading", { level: 1, name: /not part of the ZuriBeans estate/i }),
  ).toBeVisible()
  await expect(page.getByRole("link", { name: "Return home" })).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i)
})
