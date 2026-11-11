import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { chromium, firefox, webkit } from "playwright"

const require = createRequire(import.meta.url)
const expected = require("../package.json").devDependencies.playwright
for (const name of ["@playwright/test", "playwright"]) {
  assert.equal(require(`${name}/package.json`).version, expected, name)
}
const playwrightRequire = createRequire(require.resolve("playwright/package.json"))
assert.equal(playwrightRequire("playwright-core/package.json").version, expected, "playwright-core")

// Launching proves the installed revision and its system dependencies work;
// an executable path alone cannot establish either condition.
for (const browserType of [chromium, firefox, webkit]) {
  const browser = await browserType.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.setContent("<title>Browser qualification</title><p>ready</p>")
    assert.equal(await page.title(), "Browser qualification")
    console.log(`${browserType.name()} ${browser.version()}: launch and page PASS`)
  } finally {
    await browser.close()
  }
}
