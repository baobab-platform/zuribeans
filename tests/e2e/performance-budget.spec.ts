import { test, expect } from "@playwright/test"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { readFile, readdir } from "node:fs/promises"
import { join } from "node:path"

const run = promisify(execFile)
async function findChrome(directory: string): Promise<string | null> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isFile() && ["chrome", "headless_shell"].includes(entry.name)) return path
    if (entry.isDirectory()) {
      const nested = await findChrome(path)
      if (nested) return nested
    }
  }
  return null
}

test("public routes satisfy reproducible Lighthouse lab budgets", async ({ page }, testInfo) => {
  test.skip(
    !process.env.CI || testInfo.project.name !== "chromium-desktop",
    "One production-build lab profile runs in the approved CI browser image",
  )
  test.setTimeout(180_000)
  // Playwright's webServer fixture runs the actual production build. Scores
  // are lab receipts only; they are never called field P75 or production INP.
  await page.goto("/")
  const chrome = await findChrome(
    process.env.PLAYWRIGHT_BROWSERS_PATH || "/root/.cache/ms-playwright",
  )
  expect(chrome).not.toBeNull()
  for (const route of ["/", "/origins-markets"]) {
    const output = testInfo.outputPath(
      route === "/" ? "lighthouse-home.json" : "lighthouse-markets.json",
    )
    await run(
      "lighthouse",
      [
        "http://127.0.0.1:3000" + route,
        "--quiet",
        "--output=json",
        "--output-path=" + output,
        "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage",
        "--only-categories=performance,accessibility,best-practices,seo",
      ],
      { env: { ...process.env, CHROME_PATH: chrome! }, timeout: 75_000, maxBuffer: 4_000_000 },
    )
    const report = JSON.parse(await readFile(output, "utf8"))
    await testInfo.attach("lighthouse-" + (route === "/" ? "home" : "markets"), {
      path: output,
      contentType: "application/json",
    })
    const scores = Object.fromEntries(
      Object.entries(report.categories).map(([key, value]) => [
        key,
        Math.round((value as { score: number }).score * 100),
      ]),
    )
    const scriptBytes = report.audits["resource-summary"].details.items.find(
      (item: { resourceType: string }) => item.resourceType === "script",
    ).transferSize
    expect(scriptBytes, route + " transferred JavaScript").toBeLessThanOrEqual(250 * 1024)
    console.log(
      JSON.stringify({
        route,
        profile: "CI_LAB_PRODUCTION_BUILD",
        scores,
        transferredScriptBytes: scriptBytes,
        lcp: report.audits["largest-contentful-paint"].numericValue,
        cls: report.audits["cumulative-layout-shift"].numericValue,
      }),
    )
    expect(scores.performance).toBeGreaterThanOrEqual(90)
    for (const name of ["accessibility", "best-practices", "seo"])
      expect(scores[name], route + " " + name).toBeGreaterThanOrEqual(95)
    // LCP is recorded for diagnosis. ADR-SHARED-040's 2.5s requirement is
    // a field P75 target; a single throttled Lighthouse load is not P75.
    expect(report.audits["cumulative-layout-shift"].numericValue).toBeLessThanOrEqual(0.1)
  }
})
