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

test.describe("Insights accessibility", () => {
  test("index has no automated axe violations", async ({ page }) => {
    await page.goto("/insights")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test("footer exposes the Insights collection", async ({ page }) => {
    await page.goto("/")
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name: "Insights" }),
    ).toHaveAttribute("href", "/insights")
  })

  test("published article has no automated axe violations", async ({ page }) => {
    await page.goto("/insights/introducing-zuribeans-insights")
    await expect(
      page.getByRole("heading", { name: "Introducing ZuriBeans Insights" }),
    ).toBeVisible()
    await expectNoAxeViolations(page)
  })
})
