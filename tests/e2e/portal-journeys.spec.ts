import { expect, test } from "@playwright/test"

test.describe("buyer and supplier entry journeys", () => {
  test("buyer has its own registration, sign-in and governed workspace entry", async ({ page }) => {
    await page.goto("/buyer")
    await expect(
      page.getByRole("heading", { level: 1, name: /gateway to African-origin trade/i }),
    ).toBeVisible()
    await expect(page.getByRole("link", { name: "Create buyer account" })).toHaveAttribute(
      "href",
      "/buyer/register",
    )

    await page.goto("/buyer/login")
    await expect(
      page.getByRole("heading", { level: 1, name: "Sign in to your trading account." }),
    ).toBeVisible()
    await expect(page.locator('form input[name="journey"]').first()).toHaveValue("buyer")
    await expect(page.locator('form input[name="next"]').first()).toHaveValue("/account")
    await expect(
      page
        .getByRole("region", { name: "Portal credentials" })
        .getByRole("link", { name: "Supplier portal" }),
    ).toHaveAttribute("href", "/supplier/login")

    await page.goto("/buyer/register")
    await expect(
      page.getByRole("heading", { level: 1, name: "Start your buyer application." }),
    ).toBeVisible()
    await expect(page.locator('form input[name="next"]')).toHaveValue("/account/apply")
    await expect(page.locator('form input[name="journey"]')).toHaveValue("buyer")
  })

  test("supplier has an independently labelled identity and sourcing application route", async ({
    page,
  }) => {
    await page.goto("/supplier/login")
    await expect(
      page.getByRole("heading", { level: 1, name: "Sign in to your supplier account." }),
    ).toBeVisible()
    await expect(page.locator('form input[name="next"]').first()).toHaveValue("/supplier")
    await expect(
      page
        .getByRole("region", { name: "Portal credentials" })
        .getByRole("link", { name: "Buyer portal" }),
    ).toHaveAttribute("href", "/buyer/login")

    await page.goto("/supplier/register")
    await expect(
      page.getByRole("heading", { level: 1, name: "Create your supplier login." }),
    ).toBeVisible()
    await expect(page.locator('form input[name="journey"]')).toHaveValue("supplier")
    await expect(page.locator('form input[name="next"]')).toHaveValue("/supplier/apply")
  })

  test("cross-journey redirects cannot override the sign-in destination", async ({ page }) => {
    await page.goto("/buyer/login?next=%2Fsupplier%2Fapply")
    await expect(page.locator('form input[name="next"]').first()).toHaveValue("/account")
    await page.goto("/supplier/login?next=%2Faccount%2Forders")
    await expect(page.locator('form input[name="next"]').first()).toHaveValue("/supplier")
  })

  test("login and registration shells fit the visible viewport with independently scrollable forms", async ({
    page,
  }) => {
    for (const { width, height } of [
      { width: 390, height: 844 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize({ width, height })
      for (const journey of ["buyer", "supplier"] as const) {
        for (const mode of ["login", "register"] as const) {
          await page.goto(`/${journey}/${mode}`, { waitUntil: "domcontentloaded" })
          const shell = page.locator("#main > div").first()
          const credentials = page.getByRole("region", { name: "Portal credentials" })
          const bounds = await shell.boundingBox()
          expect(bounds).not.toBeNull()
          if (!bounds) throw new Error("Authentication shell is not rendered")
          expect(bounds.y + bounds.height).toBeLessThanOrEqual(height + 2)
          await expect(credentials).toBeVisible()
          const submit = credentials.getByRole("button", {
            name: mode === "login" ? /sign in to .* workspace/i : /create .* login/i,
          })
          await submit.scrollIntoViewIfNeeded()
          await expect(submit).toBeInViewport()
          expect(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
            ),
          ).toBe(true)
        }
      }
    }
  })

  test("captures desktop and mobile portal design review evidence", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "Capture once in the canonical browser")
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      for (const journey of ["buyer", "supplier"] as const) {
        await page.goto(`/${journey}/login`)
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width + 1,
        )
        await testInfo.attach(`${journey}-login-${width}`, {
          body: await page.screenshot({ fullPage: true, animations: "disabled" }),
          contentType: "image/png",
        })
      }
    }
  })
})
