import { expect, test } from "@playwright/test"

test("keyboard users can bypass the global navigation", async ({ page }) => {
  await page.goto("/")

  await page.keyboard.press("Tab")
  const skipLink = page.getByRole("link", { name: "Skip to content" })
  await expect(skipLink).toBeFocused()
  await expect(skipLink).toBeVisible()

  await page.keyboard.press("Enter")
  await expect(page.locator("#main")).toBeFocused()
})

test("public pages expose a single named primary heading and main landmark", async ({ page }) => {
  const routes = [
    "/",
    "/about",
    "/contact",
    "/origins-markets",
    "/products",
    "/quality-traceability",
    "/sourcing",
    "/sourcing/become-a-supplier",
    "/trade",
    "/help",
  ]

  for (const route of routes) {
    await page.goto(route)
    await expect(page.getByRole("main")).toHaveCount(1)
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
    await expect(page.getByRole("heading", { level: 1 })).not.toBeEmpty()
  }
})

test("authentication forms expose their controls by accessible name", async ({ page }) => {
  await page.goto("/login")
  await expect(page.getByRole("textbox", { name: "Business email" })).toBeVisible()
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible()
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible()

  await page.goto("/register")
  await expect(page.getByRole("textbox", { name: "Company name" })).toBeVisible()
  await expect(page.getByRole("textbox", { name: "Business email" })).toBeVisible()
  await expect(page.getByLabel("Confirm password")).toBeVisible()
})
