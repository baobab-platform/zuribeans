import { expect, test } from "@playwright/test"

test.describe("site footer", () => {
  test("exposes grouped navigation, market context and legal routes", async ({ page }) => {
    await page.goto("/")

    const footer = page.getByRole("contentinfo")
    await expect(footer).toBeVisible()
    await expect(footer.getByRole("heading", { name: "Footer navigation" })).toBeAttached()

    for (const label of [
      "Products links",
      "Trade links",
      "Company links",
      "Sourcing links",
      "Partner links",
      "Legal",
    ]) {
      await expect(footer.getByRole("navigation", { name: label })).toBeVisible()
    }

    await expect(footer.getByRole("link", { name: "Green coffee" })).toHaveAttribute(
      "href",
      "/products?category=coffee",
    )
    await expect(footer.getByRole("link", { name: "Uganda", exact: true })).toHaveAttribute(
      "href",
      "/origins-markets?market=zuribeans_ug",
    )
    await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy")
    await expect(footer.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms")
    await expect(footer.getByRole("link", { name: "Cookies" })).toHaveAttribute("href", "/cookies")
    await expect(footer.getByText("A subsidiary of Nabhold Group Africa.")).toBeVisible()
  })

  test("keeps footer links usable at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")

    const footer = page.getByRole("contentinfo")
    await expect(footer).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)

    const links = footer.getByRole("link")
    const heights = await links.evaluateAll((elements) =>
      elements.map((element) => Math.round(element.getBoundingClientRect().height)),
    )
    expect(heights.every((height) => height >= 44)).toBe(true)
  })

  test("draft legal routes are reachable and clearly labeled", async ({ page }) => {
    for (const path of ["/privacy", "/terms", "/cookies"]) {
      await page.goto(path)
      await expect(page.getByText("Draft for review")).toBeVisible()
      await expect(page.getByText(/not legal advice/i)).toBeVisible()
    }
  })
})
