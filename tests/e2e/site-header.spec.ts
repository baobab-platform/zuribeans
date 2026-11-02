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
    await expect(header.getByRole("link", { name: "Supplier Portal" })).toHaveAttribute(
      "href",
      "/supplier/login",
    )
    await expect(header.getByRole("link", { name: "Sourcing", exact: true })).toHaveAttribute(
      "href",
      "/sourcing",
    )
    await expect(header.getByRole("link", { name: "Login/Register" })).toHaveAttribute(
      "href",
      "/buyer/login",
    )

    await expect(header.getByRole("navigation", { name: "Primary navigation" })).toBeVisible()
    await expect(header.getByRole("link", { name: "Request a Quote" })).toHaveAttribute(
      "href",
      "/contact",
    )
    // A readable link is more than a present DOM node: the CTA foreground
    // must contrast with the ink background in the actual rendered CSS.
    await expect(header.getByRole("link", { name: "Request a Quote" })).toHaveCSS(
      "color",
      "rgb(247, 242, 233)",
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

    await expect(header.getByRole("link", { name: "Buyer account" })).toHaveAttribute(
      "href",
      "/account",
    )
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

  test("utility links remain keyboard-reachable after the tier collapses", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 })
    await page.goto("/")

    const header = page.getByRole("banner")
    const utilityBar = page.getByTestId("utility-bar")
    await page.waitForTimeout(300)
    await page.mouse.wheel(0, 400)

    await expect(async () => {
      expect(await utilityBar.evaluate((el) => el.getBoundingClientRect().height)).toBe(0)
    }).toPass()

    const helpLink = header.getByRole("link", { name: "Help" })
    await helpLink.focus()
    await expect(async () => {
      expect(await utilityBar.evaluate((el) => el.getBoundingClientRect().height)).toBe(32)
    }).toPass()
    await expect(helpLink).toBeFocused()
  })

  test("top-left market selector matches Figma Make and keeps catalogue filters", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 1000 })
    await page.goto("/products?category=coffee&market=zuribeans_ug")

    const utility = page.getByTestId("utility-bar")
    const market = utility.getByRole("combobox", { name: "Market context" })
    await expect(utility.getByText("Market", { exact: true })).toBeVisible()
    await expect(market).toBeVisible()
    await expect(market).toHaveValue("zuribeans_ug")
    await expect(market.locator("option")).toHaveText([
      "Uganda · UGX",
      "South Africa · ZAR",
    ])
    await expect(market).toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
    await expect(utility.locator("svg.lucide-globe-2")).toHaveCount(0)

    await market.focus()
    await expect(market).toBeFocused()
    await market.selectOption("zuribeans_za")

    await expect(page).toHaveURL((url) =>
      url.pathname === "/products" &&
      url.searchParams.get("category") === "coffee" &&
      url.searchParams.get("market") === "zuribeans_za",
    )
    await expect(market).toHaveValue("zuribeans_za")
    await expect(market.locator("option:checked")).toHaveText("South Africa · ZAR")

    // The proxy persists the selected market; it is not a client-only label.
    await page.goto("/")
    await expect(page.getByTestId("utility-bar").getByRole("combobox", {
      name: "Market context",
    })).toHaveValue("zuribeans_za")
  })

  test("an explicit market query overrides a previous market cookie", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 })
    await page.goto("/?market=zuribeans_za")
    await expect(page.getByTestId("utility-bar").getByRole("combobox", {
      name: "Market context",
    })).toHaveValue("zuribeans_za")

    await page.goto("/?market=zuribeans_ug")
    await expect(page.getByTestId("utility-bar").getByRole("combobox", {
      name: "Market context",
    })).toHaveValue("zuribeans_ug")
  })
})
