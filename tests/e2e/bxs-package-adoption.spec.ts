import { expect, test } from "@playwright/test"

test("the synthetic BXS inspection route is unavailable in production", async ({ page }) => {
  const response = await page.goto("/dev/experience/bxs")
  expect(response?.status()).toBe(404)
  await expect(page.getByRole("heading", { name: "Baobab Experience System" })).toHaveCount(0)
})
