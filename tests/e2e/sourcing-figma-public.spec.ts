import { expect, test } from "@playwright/test"

test.describe("Figma Make public sourcing journeys", () => {
  test("sourcing matches the editorial layout and links to supplier requirements", async ({
    page,
  }) => {
    await page.goto("/sourcing", { waitUntil: "domcontentloaded" })

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Qualification starts with a clear supply picture.",
      }),
    ).toBeVisible()
    const requirements = page.getByRole("region", {
      name: "A serious route to a serious supply relationship.",
    })
    await expect(requirements).toBeVisible()
    await expect(requirements.locator("ol > li")).toHaveCount(4)
    await expect(
      requirements.getByRole("link", { name: "Review the application path" }),
    ).toHaveAttribute("href", "/sourcing/become-a-supplier")
  })

  test("supplier acquisition has the three Make stages and gated real registration", async ({
    page,
  }) => {
    await page.goto("/sourcing/become-a-supplier", { waitUntil: "domcontentloaded" })

    await expect(
      page.getByRole("heading", { level: 1, name: "Bring a clear supply picture." }),
    ).toBeVisible()
    const stages = page.getByRole("region", { name: "Supplier application pathway" })
    await expect(stages.locator("ol > li")).toHaveCount(3)
    for (const stage of ["Review", "Apply", "Qualification"]) {
      await expect(stages.getByRole("heading", { name: stage, exact: true })).toBeVisible()
    }
    await expect(stages.getByRole("link", { name: "Begin supplier application" })).toHaveAttribute(
      "href",
      "/supplier/register",
    )
    await expect(stages.getByRole("link", { name: "Existing supplier? Sign in" })).toHaveAttribute(
      "href",
      "/supplier/login",
    )
    await expect(
      page.getByText(/Submission starts review; it does not grant supplier approval/),
    ).toBeVisible()
  })

  test("public sourcing pages remain responsive without page-width overflow", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-desktop",
      "Canonical responsive matrix uses Chromium",
    )
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      for (const route of ["/sourcing", "/sourcing/become-a-supplier"] as const) {
        await page.goto(route, { waitUntil: "domcontentloaded" })
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
          ),
          `Unexpected horizontal overflow: ${route} at ${width}px`,
        ).toBe(true)
        if (width === 390 || width === 1440) {
          await testInfo.attach(`public-${route.split("/").filter(Boolean).join("-")}-${width}`, {
            body: await page.screenshot({ fullPage: true, animations: "disabled" }),
            contentType: "image/png",
          })
        }
      }
    }
  })
})
