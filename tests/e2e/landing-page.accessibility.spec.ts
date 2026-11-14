import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

async function expectNoAxeViolations(page: Page, include?: string) {
  // The homepage receives a full-document audit above. When the mobile dialog
  // is open, audit its complete interactive subtree without repeatedly
  // traversing the background page in Firefox's axe frame evaluation.
  const builder = new AxeBuilder({ page }).exclude('[aria-hidden="true"]')
  // The mobile navigation contains no frames. Prevent axe from traversing\n  // unrelated embedded frames while auditing this isolated dialog.\n  if (include) {\n    expect(await page.locator(`${include} iframe, ${include} frame`).count()).toBe(0)\n  }\n  const results = await (include ? builder.include(include).disableFrames() : builder).analyze()
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
    await expectNoAxeViolations(page, '[role="dialog"]')
  })
})
