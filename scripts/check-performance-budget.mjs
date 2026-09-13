import { readdir, stat } from "node:fs/promises"
import { join, relative } from "node:path"

const root = process.cwd()
const limits = {
  totalJavaScript: 700 * 1024,
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

assertWithin(
  "All emitted client JavaScript",
  javascript.reduce((total, file) => total + file.bytes, 0),
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
