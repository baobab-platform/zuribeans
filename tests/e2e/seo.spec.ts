import { expect, test } from "@playwright/test"

test("public estate publishes canonical and social metadata", async ({ page }) => {
  await page.goto("/")

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/$/)
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    "content",
    "ZuriBeans",
  )
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  )

  const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents()
  const records = structuredData.map((record) => JSON.parse(record) as Record<string, unknown>)
  expect(records).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ "@type": "Organization", name: "ZuriBeans" }),
    ]),
  )
})

test("crawler policy excludes private application and API surfaces", async ({ request }) => {
  const robots = await request.get("/robots.txt")
  const body = await robots.text()

  expect(robots.ok()).toBe(true)
  expect(body).toContain("Disallow: /account")
  expect(body).toContain("Disallow: /api/")
  expect(body).toContain("Disallow: /supplier")
})

test("sitemap contains public routes and excludes authentication routes", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml")
  const body = await sitemap.text()

  expect(sitemap.ok()).toBe(true)
  expect(body).toContain("/products")
  expect(body).toContain("/sourcing/become-a-supplier")
  expect(body).not.toContain("/account")
  expect(body).not.toContain("/supplier/apply")
})
