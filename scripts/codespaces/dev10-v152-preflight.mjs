#!/usr/bin/env node
/**
 * DEV-10 v1.5.2 candidate Codespaces toolchain preflight.
 * Read-only: never installs or upgrades tools inside the consumer container.
 * The baobab-dev image is the supplier of Node/npm/native pnpm/Corepack.
 * Playwright JS dependencies are project-installed; browser executables
 * belong to the frontend-e2e image or an explicitly prepared browser cache.
 */
import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(import.meta.dirname, "../..")
const manifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"))
const expectedPnpm = process.env.BAOBAB_EXPECT_PNPM || manifest.packageManager?.replace(/^pnpm@/, "")
const expectedPlaywright = process.env.BAOBAB_EXPECT_PLAYWRIGHT || manifest.devDependencies?.playwright
const expectedCorepack = process.env.BAOBAB_EXPECT_COREPACK || "0.36.0"
const expectedNodeMajor = process.env.BAOBAB_EXPECT_NODE_MAJOR || "26"
const run = (command, args = []) => spawnSync(command, args, {
  cwd: root, encoding: "utf8", timeout: 30000, env: {
    ...process.env, COREPACK_ENABLE_NETWORK: "0",
    COREPACK_DEFAULT_TO_LATEST: "0", COREPACK_ENABLE_DOWNLOAD_PROMPT: "0",
    pnpm_config_pm_on_fail: "error",
  },
})
const failures = []
function check(label, command, args, predicate, expected) {
  const result = run(command, args)
  const actual = result.stdout?.trim() || ""
  const ok = !result.error && result.status === 0 && predicate(actual)
  console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${actual || result.error?.code || "unavailable"} (expected ${expected})`)
  if (!ok) failures.push(label)
}
check("Node", "node", ["--version"], s => s.startsWith(`v${expectedNodeMajor}.`), expectedNodeMajor)
check("npm", "npm", ["--version"], s => /^\d+\.\d+\.\d+$/.test(s), "installed CLI")
check("native pnpm", "pnpm", ["--version"], s => s === expectedPnpm, expectedPnpm)
check("Corepack", "corepack", ["--version"], s => s === expectedCorepack, expectedCorepack)
check("Playwright package", "pnpm", ["exec", "playwright", "--version"],
  s => s === `Version ${expectedPlaywright}`, expectedPlaywright)
if (process.env.BAOBAB_REQUIRE_BROWSERS === "1") {
  for (const browser of ["chromium", "firefox", "webkit"]) {
    const result = run("pnpm", ["exec", "playwright", "install", "--dry-run", browser])
    const ok = result.status === 0 && !result.error
    console.log(`${ok ? "PASS" : "FAIL"} ${browser} browser resolution`)
    if (!ok) failures.push(browser)
  }
}
if (failures.length) {
  console.error("DEV-10 candidate preflight DENIED:", failures.join(", "))
  process.exitCode = 2
} else console.log("DEV-10 candidate preflight PASSED (tool versions only; not Codespaces qualification).")
