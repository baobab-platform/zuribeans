import { readFile, readdir } from "node:fs/promises"
import { join } from "node:path"

const root = process.cwd()
const adrDirectory = join(root, "docs", "adr")
const numberedAdr = /^(\d{4})-(.+)\.md$/
const headingNumber = /^# ADR[ -](\d{4}):/m

const files = await readdir(adrDirectory)
const seen = new Map()
const errors = []

for (const file of files) {
  const match = file.match(numberedAdr)
  if (!match) continue

  const [, number] = match
  const previous = seen.get(number)
  if (previous) errors.push(`ADR ${number} is duplicated by ${previous} and ${file}`)
  else seen.set(number, file)

  const content = await readFile(join(adrDirectory, file), "utf8")
  const heading = content.match(headingNumber)?.[1]
  if (heading !== number) {
    errors.push(`${file} must start with an ADR ${number} heading`)
  }
}

if (errors.length)
  throw new Error(`Architecture declaration validation failed:\n${errors.join("\n")}`)

for (const required of [
  "contracts.lock.yaml",
  "runtime/requirements.yaml",
  ".baobab/environment.yaml",
]) {
  await readFile(join(root, required))
}

console.log(`Architecture declarations valid (${seen.size} numbered ADRs, no duplicate IDs)`)
