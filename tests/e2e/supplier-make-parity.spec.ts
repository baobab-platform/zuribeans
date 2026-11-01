import { expect, test } from "@playwright/test"

test("supplier entry links to real onboarding", async ({ page }) => {
  await page.goto("/sourcing/become-a-supplier")
  await expect(
    page.getByRole("heading", { level: 1, name: /Become a ZuriBeans supplier/i }),
  ).toBeVisible()
  const begin = page.getByRole("link", { name: "Create supplier login" })
  await expect(begin).toHaveAttribute("href", "/supplier/register")
  await expect(page.getByRole("link", { name: /Existing supplier.*Sign in/i })).toHaveAttribute(
    "href",
    "/supplier/login",
  )
  await expect(
    page.getByText(/application review does not create supplier approval/i),
  ).toBeVisible()
})

test("supplier entry fits mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto("/sourcing/become-a-supplier")
  const extent = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }))
  expect(extent.documentWidth).toBeLessThanOrEqual(extent.viewport + 1)
  await expect(page.getByRole("link", { name: "Create supplier login" })).toBeVisible()
})

test("supplier preview is absent in production", async ({ page }) => {
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

test("supplier wizard preview cannot submit", async ({ page }) => {
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
