import { mkdir, readdir, stat, writeFile } from "node:fs/promises"
import { join, relative } from "node:path"

const root = process.cwd()
const limits = {
  // Whole-build inventory includes independently split authenticated form
  // components. Public startup is separately capped at 250 KiB transferred
  // JavaScript and Lighthouse >=90 in the production-route browser profile.
  totalJavaScript: 800 * 1024,
  largestJavaScriptChunk: 250 * 1024,
  totalCss: 64 * 1024,
  largestPublicImage: 250 * 1024,
}

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      return entry.isDirectory() ? filesBelow(path) : [path]
    }),
  )
  return nested.flat()
}

async function measure(paths) {
  return Promise.all(
    paths.map(async (path) => ({
      path: relative(root, path),
      bytes: (await stat(path)).size,
    })),
  )
}

function assertWithin(label, actual, maximum) {
  const formatted = `${(actual / 1024).toFixed(1)} KiB / ${(maximum / 1024).toFixed(1)} KiB`
  if (actual > maximum) throw new Error(`${label} exceeds its budget: ${formatted}`)
  console.log(`${label}: ${formatted}`)
}

const staticFiles = await filesBelow(join(root, ".next", "static", "chunks"))
const javascript = await measure(staticFiles.filter((path) => path.endsWith(".js")))
const css = await measure(staticFiles.filter((path) => path.endsWith(".css")))
const publicImages = await measure(
  (await filesBelow(join(root, "public", "images"))).filter((path) =>
    /\.(?:avif|jpe?g|png|webp)$/i.test(path),
  ),
)

const largestJavaScript = javascript.reduce(
  (largest, file) => (file.bytes > largest.bytes ? file : largest),
  { path: "none", bytes: 0 },
)
const largestImage = publicImages.reduce(
  (largest, file) => (file.bytes > largest.bytes ? file : largest),
  { path: "none", bytes: 0 },
)

const totalEmittedJavaScript = javascript.reduce((total, file) => total + file.bytes, 0)
if (totalEmittedJavaScript > limits.totalJavaScript) {
  // Diagnostic only. Preserve the fail-closed 800 KiB gate, but report the
  // largest immutable Next.js production artifacts for actual remediation.
  console.error("Largest emitted client JavaScript chunks (production build):")
  for (const file of [...javascript].sort((a, b) => b.bytes - a.bytes).slice(0, 20)) {
    console.error(`${file.path}: ${(file.bytes / 1024).toFixed(2)} KiB`)
  }
}
assertWithin(
  "All emitted client JavaScript",
  totalEmittedJavaScript,
  limits.totalJavaScript,
)
assertWithin(
  `Largest client chunk (${largestJavaScript.path})`,
  largestJavaScript.bytes,
  limits.largestJavaScriptChunk,
)
assertWithin(
  "All emitted CSS",
  css.reduce((total, file) => total + file.bytes, 0),
  limits.totalCss,
)
assertWithin(
  `Largest public image (${largestImage.path})`,
  largestImage.bytes,
  limits.largestPublicImage,
)

// A stable bounded machine-readable receipt for the independent DEV-11 join.
// Generated from the actual emitted production assets, never from budgets
// repeated in a test fixture. The existing assertWithin calls above still
// enforce all original hard limits before this successful receipt exists.
await mkdir(join(root, "reports"), { recursive: true })
await writeFile(
  join(root, "reports", "static-budget.json"),
  JSON.stringify(
    {
      profile: "CI_PRODUCTION_BUILD",
      limits,
      measured: {
        totalJavaScript: javascript.reduce((total, file) => total + file.bytes, 0),
        largestJavaScriptChunk: largestJavaScript.bytes,
        totalCss: css.reduce((total, file) => total + file.bytes, 0),
        largestPublicImage: largestImage.bytes,
      },
      oversized: [],
    },
    null,
    2,
  ) + "\n",
)
