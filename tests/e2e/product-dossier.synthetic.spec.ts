import { expect, test } from "@playwright/test"

/** Opt-in local-only journey. CI uses production builds and intentionally skips this suite. */
test.describe("Figma Make product dossier with synthetic fixture", () => {
  test.skip(
    process.env.CI === "true" || process.env.ZB_DEV_DATA_MODE !== "synthetic",
    "Synthetic PDP browser journey requires explicitly enabled local development mode",
  )

  test("renders provenance and evidence tabs with real links, no fake order", async ({ page }) => {
    await page.goto("/products/demo-arabica-aa-washed-ug")
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Arabica AA")
    await expect(page.getByRole("tab", { name: "Specifications" })).toBeVisible()
    await page.getByRole("tab", { name: "Provenance" }).click()
    await expect(page.getByRole("tabpanel", { name: "Provenance" })).toContainText("Uganda")
    await page.getByRole("tab", { name: "Evidence & Docs" }).click()
    await expect(page.getByRole("tabpanel", { name: "Evidence & Docs" })).toContainText(
      "Organic Certified",
    )
    await expect(page.getByRole("tabpanel", { name: "Evidence & Docs" })).toContainText(
      "SGS Pre-Shipment Inspection",
    )
    await expect(page.getByRole("tabpanel", { name: "Evidence & Docs" })).toContainText("ISO 22000")
    await expect(
      page.getByRole("complementary", { name: "Product procurement enquiry" }).getByRole("link", {
        name: /request a quotation/i,
      }),
    ).toHaveAttribute("href", "/contact?product=demo-arabica-aa-washed-ug")
    const procurement = page.getByRole("complementary", { name: "Product procurement enquiry" })
    await expect(procurement).toContainText("Available quantity")
    await expect(procurement).toContainText("Incoterms")
    await expect(procurement).toContainText("Shipment lead time")
    await expect(page.getByRole("button", { name: /place order|buy now/i })).toHaveCount(0)
  })
})
