/** Actual Playwright reporter regression, without browser or service fixtures.
 * A later unscoped preview/diagnostic run must preserve prior gate originals.
 * This verifies artifact custody only; it never qualifies estate or IAM UX.
 */
import assert from "node:assert/strict"
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { createRequire } from "node:module"
import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"

const require = createRequire(import.meta.url)
const cli = require.resolve("@playwright/test/cli")
const testModule = require.resolve("@playwright/test")
const source = resolve("playwright.config.ts")
const directory = mkdtempSync(join(tmpdir(), "baobab-report-custody-"))

function snapshot(path) {
  const files = {}
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const file = join(path, entry.name)
    if (entry.isDirectory()) {
      for (const [name, hash] of Object.entries(snapshot(file)))
        files[join(entry.name, name)] = hash
    } else {
      files[entry.name] = createHash("sha256").update(readFileSync(file)).digest("hex")
    }
  }
  return files
}

try {
  writeFileSync(
    join(directory, "custody.config.ts"),
    `
import base from ${JSON.stringify(source)};
export default { ...base, testDir: ${JSON.stringify(directory)},
  testMatch: "custody.spec.ts", webServer: undefined,
  projects: [{name: "report-custody"}], workers: 1, retries: 0 };
`,
  )
  writeFileSync(
    join(directory, "custody.spec.ts"),
    `
import {test, expect} from ${JSON.stringify(testModule)};
test("original reporter custody", async ({}, info) => {
  await info.attach("original", {body: Buffer.from("source-only regression"), contentType: "text/plain"});
  expect(true).toBe(true);
});
`,
  )
  function run(gate) {
    const result = spawnSync(process.execPath, [cli, "test", "--config=custody.config.ts"], {
      cwd: directory,
      env: { ...process.env, CI: "true", DEV11_EVIDENCE_GATE: gate },
      encoding: "utf8",
      timeout: 60000,
    })
    assert.equal(result.status, 0, result.stderr || result.stdout || "reporter execution failed")
  }
  run("functional")
  const html = join(directory, "playwright-report/dev11-functional")
  const results = join(directory, "test-results/dev11-functional")
  const originalHtml = snapshot(html)
  const originalResults = snapshot(results)
  const originalJson = readFileSync(join(directory, "reports/dev11-functional-playwright.json"))
  assert.ok(Object.keys(originalHtml).length > 0)
  assert.ok(Object.keys(originalResults).length > 0)
  run("")
  assert.deepEqual(snapshot(html), originalHtml)
  assert.deepEqual(snapshot(results), originalResults)
  assert.deepEqual(
    readFileSync(join(directory, "reports/dev11-functional-playwright.json")),
    originalJson,
  )
  console.log("DEV11_REPORTER_ORIGINALS_PRESERVED_SOURCE_REGRESSION")
} finally {
  rmSync(directory, { recursive: true, force: true })
}
