import { expect, test } from "@playwright/test"

test("insights index lists published articles and excludes drafts", async ({ page }) => {
  await page.goto("/insights")

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  await expect(page.getByRole("link", { name: /Introducing ZuriBeans Insights/i })).toBeVisible()
  // Seed drafts (see src/lib/content/insights.ts) must never render publicly.
  await expect(page.getByText(/Reading a Uganda harvest report/i)).toHaveCount(0)
  await expect(page.getByText(/SARS import VAT/i)).toHaveCount(0)
})

test("insight article detail page renders with breadcrumbs and structured data", async ({
  page,
}) => {
  await page.goto("/insights/introducing-zuribeans-insights")

  await expect(page.getByRole("heading", { name: "Introducing ZuriBeans Insights" })).toBeVisible()
  await expect(page.locator('nav[aria-label="Breadcrumb"]')).toContainText("Insights")

  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href")
  expect(new URL(canonical!).pathname).toBe("/insights/introducing-zuribeans-insights")

  const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents()
  const records = structuredData.map((record) => JSON.parse(record) as Record<string, unknown>)
  expect(records).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        "@type": "BlogPosting",
        headline: "Introducing ZuriBeans Insights",
      }),
    ]),
  )
})

test("a draft article slug resolves to not-found, never leaking draft content", async ({
  page,
}) => {
  const response = await page.goto("/insights/reading-a-uganda-harvest-report-as-a-buyer")
  expect(response?.status()).toBe(404)
  await expect(page.getByText(/isn't published for your current market/i)).toBeVisible()
})

test("an unknown slug resolves to not-found", async ({ page }) => {
  const response = await page.goto("/insights/not-a-real-article")
  expect(response?.status()).toBe(404)
})

test("sitemap includes only published insight slugs", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml")
  const body = await sitemap.text()

  expect(sitemap.ok()).toBe(true)
  expect(body).toContain("/insights")
  expect(body).toContain("/insights/introducing-zuribeans-insights")
  expect(body).not.toContain("/insights/reading-a-uganda-harvest-report-as-a-buyer")
})
