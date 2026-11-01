import { expect, test } from "@playwright/test"

test("Make supplier portal entry retains real ZuriBeans onboarding navigation", async ({ page }) => {
  await page.goto("/sourcing/become-a-supplier")
  await expect(page.getByRole("heading", { level: 1, name: /Become a ZuriBeans supplier/i })).toBeVisible()
  const begin = page.getByRole("link", { name: "Begin supplier application" })
  await expect(begin).toHaveAttribute("href", "/supplier/apply")
  await expect(page.getByRole("link", { name: /Existing supplier.*workspace/i })).toHaveAttribute(
    "href",
    "/supplier",
  )
  await expect(page.getByText(/application review does not create supplier approval/i)).toBeVisible()
})

test("Make supplier entry does not widen a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto("/sourcing/become-a-supplier")
  const extent = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }))
  expect(extent.documentWidth).toBeLessThanOrEqual(extent.viewport + 1)
  await expect(page.getByRole("link", { name: "Begin supplier application" })).toBeVisible()
})

test("synthetic supplier preview is disabled in production test builds", async ({ page }) => {
  test.skip(
    process.env.NODE_ENV === "development" && process.env.ZB_DEV_DATA_MODE === "synthetic",
    "This negative is for CI's production build only",
  )
  const response = await page.goto("/dev/supplier")
  expect(response?.status()).toBe(404)
  await expect(
    page.getByRole("heading", { name: "This address is not part of the ZuriBeans estate." }),
  ).toBeVisible()
})

test("synthetic supplier preview can walk the six sections without making an application", async ({ page }) => {
  test.skip(
    process.env.CI === "true" || process.env.ZB_DEV_DATA_MODE !== "synthetic",
    "Requires explicit local development fixture gate",
  )
  await page.goto("/dev/supplier")
  await expect(page.getByRole("heading", { name: "Supplier Application" })).toBeVisible()
  for (const label of [
    "Contacts",
    "Products & Capacity",
    "Origin & Season",
    "Certifications",
    "Review & Submit",
  ]) {
    await page.getByRole("button", { name: new RegExp(`Continue: ${label}`) }).click()
  }
  await expect(page.getByRole("button", { name: /Preview only/i })).toBeDisabled()
})
