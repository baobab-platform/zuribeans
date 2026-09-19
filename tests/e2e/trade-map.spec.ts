import { expect, test } from "@playwright/test"

for (const route of ["/", "/origins-markets"] as const) {
  test(`${route} renders the shared evidence-led trade map`, async ({ page }) => {
    await page.goto(route)

    const map = page.getByTestId("trade-map")
    await expect(map).toHaveCount(1)
    await expect(map).toContainText("Uganda")
    await expect(map).toContainText("South Africa")
    await expect(map).toContainText("Natural Earth")
    await expect(map).not.toContainText("Interactive map")
  })
}
