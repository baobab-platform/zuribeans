import { expect, test } from "@playwright/test"

test("homepage routes buyers and suppliers through distinct next steps", async ({ page }) => {
  await page.goto("/")

  const section = page.getByRole("region", { name: "Ways to trade with ZuriBeans" })
  await expect(section.getByRole("article")).toHaveCount(2)
  await expect(section.getByRole("link", { name: "Request a quote" })).toHaveAttribute(
    "href",
    "/contact",
  )
  await expect(section.getByRole("link", { name: "Review supplier requirements" })).toHaveAttribute(
    "href",
    "/sourcing/become-a-supplier",
  )
  await expect(section).toContainText("does not create automatic approval")
})

test("trade pathway cards use a shorter mobile minimum height", async ({ page }) => {
  const section = page.getByRole("region", { name: "Ways to trade with ZuriBeans" })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  const mobileHeight = await section
    .getByRole("article")
    .first()
    .evaluate((element) => Math.round(element.getBoundingClientRect().height))
  expect(mobileHeight).toBeGreaterThanOrEqual(360)
  expect(mobileHeight).toBeLessThan(460)
})
