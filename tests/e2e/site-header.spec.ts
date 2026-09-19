import { expect, test } from "@playwright/test"

test.describe("two-tier trade-desk header", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "Desktop header runs once in Chromium")
  })

  test("desktop initial state exposes brand, utility tier and commercial CTA", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 })
    await page.goto("/")
    const header = page.getByRole("banner")

    await expect(header.getByRole("link", { name: "ZuriBeans home" })).toBeVisible()
    await expect(
      header.getByText("Trusted trade. Sustainable growth. A stronger Africa."),
    ).toBeVisible()

    await expect(header.getByRole("link", { name: "Become a Supplier" })).toHaveAttribute(
      "href",
      "/sourcing/become-a-supplier",
    )
    await expect(header.getByRole("link", { name: "Help" })).toHaveAttribute("href", "/help")
    await expect(header.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login")

    await expect(header.getByRole("navigation", { name: "Primary navigation" })).toBeVisible()
    await expect(header.getByRole("link", { name: "Request a Quote" })).toHaveAttribute(
      "href",
      "/contact",
    )
  })

  test("primary navigation discloses by click and closes on Escape", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 })
    await page.goto("/")

    const trigger = page.getByRole("button", { name: "Commodities" })
    await expect(trigger).toHaveAttribute("aria-expanded", "false")

    await trigger.click()
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
    const viewAll = page.getByRole("link", { name: "View all commodities" })
    await expect(viewAll).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await expect(trigger).toBeFocused()
  })

  test("session presence swaps sign-in for account without granting approval", async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width: 1600, height: 1000 })
    await context.addCookies([
      { name: "zb_session", value: "test-session", domain: "127.0.0.1", path: "/" },
    ])
    await page.goto("/")
    const header = page.getByRole("banner")

    await expect(header.getByRole("link", { name: "Account" })).toHaveAttribute("href", "/account")
    await expect(header.getByRole("link", { name: "Sign in" })).toHaveCount(0)
  })

  test("utility tier collapses on scroll while navigation and CTA remain usable", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 1000 })
    await page.goto("/")
    const header = page.getByRole("banner")

    const utilityBar = page.getByTestId("utility-bar")
    // Let the scroll-state island hydrate and run its first observer
    // callback before asserting the pre-scroll state, otherwise a transient
    // pre-hydration read could pass even if the observer collapses the
    // header immediately (the exact bug this test guards against).
    await page.waitForTimeout(300)
    await expect(utilityBar).toHaveJSProperty("offsetHeight", 32)

    await page.mouse.wheel(0, 400)
    await expect(async () => {
      expect(await utilityBar.evaluate((el) => el.getBoundingClientRect().height)).toBe(0)
    }).toPass()

    await expect(header.getByRole("navigation", { name: "Primary navigation" })).toBeVisible()
    await expect(header.getByRole("link", { name: "Request a Quote" })).toHaveAttribute(
      "href",
      "/contact",
    )
  })
})
