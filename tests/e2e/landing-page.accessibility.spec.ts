import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).exclude('[aria-hidden="true"]').analyze()
  const violations = results.violations.flatMap(({ id, help, nodes }) =>
    nodes.map(
      ({ target, failureSummary }) =>
        `${id}: ${help}\n  target=${target.join(" ")}\n  ${failureSummary ?? "No failure summary"}`,
    ),
  )
  expect(violations, violations.join("\n")).toEqual([])
}

test.describe("landing page accessibility", () => {
  test("homepage has no automated axe violations", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test("mobile navigation has no automated axe violations when open", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")
    await page.getByRole("button", { name: "Menu" }).click()
    await expect(page.getByRole("dialog", { name: "Explore ZuriBeans" })).toBeVisible()
    await expectNoAxeViolations(page)
  })
})
