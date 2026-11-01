import { expect, test } from "@playwright/test"

test("visitor can enter the multi-product catalogue from the home page", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("African origin.")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("International")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("trade discipline.")
  await expect(
    page.locator("#main").getByRole("link", { name: "View Catalogue", exact: true }),
  ).toHaveAttribute("href", "/products")
})

test("featured commodities expose truthful catalogue routes", async ({ page }) => {
  await page.goto("/")

  // The section's accessible name comes from its editorial heading, which
  // changes with published products and the explicitly opted-in preview mode.
  // During streamed Suspense resolution, the hidden fallback and resolved
  // section can coexist briefly. Interact with the one rendered to users;
  // never bind this contract to a hidden fallback node.
  const section = page.locator("section#commodities:visible")
  await expect(section).toBeVisible()
  await expect(section.getByRole("heading", { level: 2 })).toBeVisible()
  await expect(section.locator("#featured-commodities")).toHaveClass(/lg:grid-cols-4/)

  const cards = section.locator("#featured-commodities article a[href]")
  await expect(cards.first()).toBeVisible()
  const hrefs = await cards.evaluateAll((links) =>
    links.map((link) => link.getAttribute("href") ?? ""),
  )

  if (hrefs.some((href) => href.startsWith("/products?category="))) {
    // No market-scoped publication: category discovery is the truthful fallback.
    expect(hrefs).toEqual([
      "/products?category=coffee",
      "/products?category=coffee",
      "/products?category=vanilla",
      "/products?category=sesame",
    ])
    for (const title of ["Robusta coffee", "Arabica coffee", "Vanilla pods", "Sesame seeds"]) {
      await expect(section.getByRole("heading", { name: title })).toBeVisible()
    }
  } else {
    // A market-scoped publication (or explicit local demo) links to its own
    // dossier rather than claiming that a product class is in stock.
    expect(hrefs.length).toBeGreaterThan(0)
    for (const href of hrefs) {
      expect(href).toMatch(/^\/products\/[^/?#]+$/)
    }
  }

  await expect(section.getByRole("link", { name: "Full Procurement Catalogue" })).toHaveAttribute(
    "href",
    "/products",
  )
  if (process.env.CI) {
    // CI is a production build without synthetic opt-in; no fictional claims.
    await expect(section.getByText("Sample data", { exact: true })).toHaveCount(0)
    await expect(section.getByText(/(?:Available|Limited) \(sample\)/)).toHaveCount(0)
  }
})

test("trade process presents the four accountable stages in order", async ({ page }) => {
  await page.goto("/")

  const process = page.getByRole("region", { name: "How ZuriBeans trades" })
  const steps = process.getByRole("listitem")
  await expect(steps).toHaveCount(4)
  await expect(steps.nth(0)).toContainText("Define the requirement")
  await expect(steps.nth(1)).toContainText("Confirm the commercial basis")
  await expect(steps.nth(2)).toContainText("Prepare and move the goods")
  await expect(steps.nth(3)).toContainText("Preserve the record")
})
