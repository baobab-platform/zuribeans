import { expect, test } from "@playwright/test"

test("BXS theme and commodity trade-house identity are common across public journeys", async ({
  page,
}) => {
  for (const route of ["/about", "/trade", "/quality-traceability", "/sourcing", "/buyer"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" })
    await expect(page.locator('html[data-bx-theme="zuribeans"]')).toHaveCount(1)
    const signature = page.getByTestId("trade-house-signature")
    await expect(signature).toHaveCount(1)
    await expect(signature).toContainText("African B2B commodity trading")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  }
})

test("buyer and supplier authentication keep a distinct professional trading identity", async ({
  page,
}) => {
  for (const [route, audience] of [
    ["/buyer/login", "Buyer procurement"],
    ["/supplier/login", "Supplier sourcing"],
  ] as const) {
    await page.goto(route, { waitUntil: "domcontentloaded" })
    await expect(page.locator('html[data-bx-theme="zuribeans"]')).toHaveCount(1)
    await expect(page.getByTestId("trade-house-signature")).toContainText(audience)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  }
})

test("trade-house buyer and supplier entry points remain separately actionable", async ({ page }) => {
  await page.goto("/about")
  const routes = page.getByRole("region", { name: "Trading relationships" })
  await expect(routes.getByRole("link", { name: "Explore buyer procurement" })).toHaveAttribute(
    "href",
    "/buyer",
  )
  await expect(routes.getByRole("link", { name: "Explore supplier sourcing" })).toHaveAttribute(
    "href",
    "/sourcing/become-a-supplier",
  )
})

test("geometric Figma mark remains visible without layout overflow on a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 })
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await expect(page.getByRole("link", { name: "ZuriBeans home" })).toBeVisible()
  await expect(page.locator('html[data-bx-theme="zuribeans"]')).toHaveCount(1)
  const viewport = await page.evaluate(() => ({
    available: document.documentElement.clientWidth,
    occupied: document.documentElement.scrollWidth,
  }))
  expect(viewport.occupied).toBeLessThanOrEqual(viewport.available + 1)
})
